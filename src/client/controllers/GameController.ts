import Matter, { Body } from 'matter-js'

import { GamePhase, IControls, EMPTY_CONTROLS } from '../../shared/types/commons'
import { TILE_SIZE, PLAYER_CONFIG } from '../../shared/constants'
import { randomBetween } from '../../shared/randomUtils'
import LevelFactory from '../factories/LevelFactory'
import MatterPlayer from '../objects/MatterPlayer'
import Diamond from '../objects/Diamond'
import Bomb from '../objects/Bomb'

export default class GameController {

    public readonly engine: Matter.Engine
    private readonly levelFactory: LevelFactory

    private width!: number

    private players: MatterPlayer[] = []
    private playerControls: IControls[] = []

    private phase: GamePhase = GamePhase.WAITING
    private gamePhaseChangedCallback: (newPhase: GamePhase, oldPhase: GamePhase) => void = () => {}
    private gameOverCountdown: number = 0

    private activeDiamonds: number = 0
    private level: number = 0

    constructor(width: number, height: number, numPlayers: number) {
        if (numPlayers < 0 || numPlayers > 2) {
            throw Error('Only 1 or 2 players are supported.')
        }

        this.engine = Matter.Engine.create()
        this.levelFactory = new LevelFactory(this.engine)

        this.width = width
        const envBodies = this.levelFactory.create(width, height)
        Matter.Composite.add(this.engine.world, envBodies)

        // We set the position slightly above the ground, because when we restart the game then we set the position manually
        // using Body.setPosition(body, pos), which however only causes a collision-end event, but no collision-start event.
        for (let i = 0; i < numPlayers; ++i) {
            const playerConfig = PLAYER_CONFIG[i]
            const player = this.addPlayer(
                playerConfig.startX,
                height - 1.75 * TILE_SIZE,
                playerConfig.facingLeft,
                playerConfig.color)
            this.players.push(player)
            this.playerControls.push(EMPTY_CONTROLS)
        }

        Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const player = this.resolveBody(MatterPlayer.TYPE, bodyA, bodyB)
                const playerFeet = this.resolveLabeledBody(MatterPlayer.TYPE, MatterPlayer.FEET_LABEL, bodyA, bodyB)
                const diamond = this.resolveBody(Diamond.TYPE, bodyA, bodyB)
                const ground = this.resolveStaticBody(bodyA, bodyB)
                const bomb = this.resolveBody(Bomb.TYPE, bodyA, bodyB)
                console.log({bodyA, bodyB, player, playerFeet, diamond, ground, bomb});
                if (player && diamond) {
                    this.onPlayerDiamondCollisionStart(player, diamond)
                }
                if (playerFeet && ground) {
                    this.onPlayerFeetGroundCollisionStart(playerFeet)
                }
                if (player && bomb) {
                    this.onPlayerBombCollisionStart(player)
                }
            });
        });

        Matter.Events.on(this.engine, 'collisionEnd', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const playerFeet = this.resolveLabeledBody(MatterPlayer.TYPE, MatterPlayer.FEET_LABEL, bodyA, bodyB)
                const ground = this.resolveStaticBody(bodyA, bodyB)
                if (playerFeet && ground) {
                    this.onPlayerFeetGroundCollisionEnd(playerFeet)
                }
            });
        });
    }

    private resolveBody(type: string, bodyA: Body, bodyB: Body): Body | null {
        if (bodyA.plugin.type === type) {
            return bodyA
        }
        if (bodyB.plugin.type === type) {
            return bodyB
        }
        return null
    }

    private resolveLabeledBody(type: string, label: string, bodyA: Body, bodyB: Body): Body | null {
        if (bodyA.plugin.type === type && bodyA.label === label) {
            return bodyA
        }
        if (bodyB.plugin.type === type && bodyB.label === label) {
            return bodyB
        }
        return null
    }

    private resolveStaticBody(bodyA: Body, bodyB: Body): Body | null {
        if (bodyA.isStatic) {
            return bodyA
        }
        if (bodyB.isStatic) {
            return bodyB
        }
        return null
    }

    private onPlayerDiamondCollisionStart(player: Matter.Body, diamond: Matter.Body): void {
        player.plugin.score += diamond.plugin.value
        this.activeDiamonds--
        diamond.plugin.markDelete = true
    }

    private onPlayerFeetGroundCollisionStart(playerFeet: Matter.Body): void {
        playerFeet.plugin.touchGround()
    }

    private onPlayerFeetGroundCollisionEnd(playerFeet: Matter.Body): void {
        playerFeet.plugin.releaseGround()
    }

    private onPlayerBombCollisionStart(player: Matter.Body): void {
        player.plugin.kill()
        this.gameOverCountdown = 3000
    }

    public ready(): void {
        this.updatePhase(GamePhase.READY)
    }

    public pause(): void {
        this.updatePhase(GamePhase.PAUSED)
    }

    public resume(): void {
        this.updatePhase(GamePhase.PLAYING)
    }

    public restart(): void {
        this.updatePhase(GamePhase.READY)

        this.level = 1
        this.gameOverCountdown = 0
        this.activeDiamonds = 0

        this.players.forEach(player => player.reset())

        // clear bombs and diamonds
        this.allBodies().forEach(body => {
            if (body.plugin.type === Diamond.TYPE || body.plugin.type === Bomb.TYPE) {
                Matter.Composite.remove(this.engine.world, body)
            }
        })

        this.startGame()
    }

    public leave(): void {
        // TODO send notification to server in case of online multiplayer?
    }

    private startGame(): void {
        for (let i = 0; i < 15; ++i) {
            this.addDiamond(32 + i * 64, 16)
        }

        this.addBomb()
    }

    public setPlayerControls(playerIdx: number, controls: IControls): void {
        this.playerControls[playerIdx] = controls
    }

    public update(delta: number): void {
        if (this.gamePhase !== GamePhase.PLAYING) {
            const allPlayersAreReady = true // TODO implement logic for N players
            if (this.gamePhase === GamePhase.READY && allPlayersAreReady) {
                this.updatePhase(GamePhase.PLAYING)
            }
            return
        }

        this.gameOverCountdown -= delta
        const allPlayersDead = this.players.every(player => player.isDead)
        if (allPlayersDead && this.gameOverCountdown < 0) {
            this.updatePhase(GamePhase.GAME_OVER)
        }

        if (this.activeDiamonds == 0) {
            this.level++
            this.startGame()
            return
        }

        if (this.players.length > 1) {
            // TODO refactor to allow N players
            // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60962
            const result = Matter.Collision.collides(this.players[0].body, this.players[1].body)
            if (result) {
                const player1 = result.bodyA.plugin
                const player2 = result.bodyB.plugin

                if (player1.attacking && !player2.dizzy) {
                    player2.takePunch()
                }
                if (player2.attacking && !player1.dizzy) {
                    player1.takePunch()
                }
            }
        }

        this.players.forEach((player, idx) => {
            player.handleControls(this.playerControls[idx])
            player.update(delta)
        })

        Matter.Engine.update(this.engine, delta)
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.plugin.markDelete) {
                Matter.Composite.remove(this.engine.world, body)
            }
        })
    }

    public dispose(): void {
        Matter.Composite.clear(this.engine.world, false)
        Matter.Engine.clear(this.engine)
    }

    private addPlayer(x: number, y: number, facingLeft: boolean, color: number): MatterPlayer {
        const player = new MatterPlayer(x, y, facingLeft, color)
        Matter.Composite.add(this.engine.world, player.body)
        return player
    }

    private addDiamond(x: number, y: number): Diamond {
        const diamond = new Diamond(x, y)
        Matter.Composite.add(this.engine.world, diamond.body)
        this.activeDiamonds++
        return diamond
    }

    private addBomb(): Bomb {
        const x = randomBetween(TILE_SIZE, this.width - TILE_SIZE)
        const bomb = new Bomb(x, TILE_SIZE / 2)
        const directionFactor = Math.random() > 0.5 ? 1 : -1;
        Matter.Body.applyForce(bomb.body, bomb.body.position, {
            x: directionFactor * 0.0033,
            y: 0.0033
        })
        this.disableGravityFor(bomb.body)
        Matter.Composite.add(this.engine.world, bomb.body)
        return bomb
    }

    private disableGravityFor(body: Matter.Body): void {
        const gravity = this.engine.world.gravity
        Matter.Events.on(this.engine, 'beforeUpdate', function() {
            Matter.Body.applyForce(body, body.position, {
                x: -gravity.x * gravity.scale * body.mass,
                y: -gravity.y * gravity.scale * body.mass
            });
        });
    }

    public allBodies(): Matter.Body[] {
        return Matter.Composite.allBodies(this.engine.world)
    }

    public onGamePhaseChanged(handler: (newPhase: GamePhase, oldPhase: GamePhase) => void): void {
        this.gamePhaseChangedCallback = handler
    }

    public updatePhase(newPhase: GamePhase): void {
        if (this.phase != newPhase) {
            const prevPhase = this.phase
            this.phase = newPhase
            if (this.gamePhaseChangedCallback) {
                this.gamePhaseChangedCallback(newPhase, prevPhase)
            }
        }
    }

    get gamePhase(): GamePhase {
        return this.phase
    }

    get allPlayers(): MatterPlayer[] {
        return this.players
    }

    get currentLevel() {
        return this.level
    }
}
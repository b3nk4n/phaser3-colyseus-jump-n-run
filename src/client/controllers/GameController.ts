import Matter, { Body } from 'matter-js'

import { GamePhase, IControls, EMPTY_CONTROLS } from '../../shared/types/commons'
import { TILE_SIZE, IPlayerConfig } from '../../shared/constants'
import { randomBetween } from '../../shared/randomUtils'
import LevelFactory from '../factories/LevelFactory'
import MatterPlayer from '../objects/MatterPlayer'
import Diamond from '../objects/Diamond'
import Bomb from '../objects/Bomb'

export default class GameController {

    public readonly engine: Matter.Engine
    private readonly levelFactory: LevelFactory

    private width: number
    private height: number

    private expectedNumPlayers: number
    private players: MatterPlayer[] = []
    private playerControls: IControls[] = []

    private phase: GamePhase = GamePhase.WAITING
    private gamePhaseChangedCallback: (newPhase: GamePhase, oldPhase: GamePhase) => void = () => {}
    private gameOverCountdown: number = 0

    private activeDiamonds: number = 0
    private level: number = 0

    constructor(width: number, height: number, expectedNumPlayers: number) {
        this.width = width
        this.height = height
        this.expectedNumPlayers = expectedNumPlayers

        this.engine = Matter.Engine.create()
        this.levelFactory = new LevelFactory(this.engine)
        const envBodies = this.levelFactory.create(width, height)
        Matter.Composite.add(this.engine.world, envBodies)

        Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const player = this.resolveBody(MatterPlayer.TYPE, bodyA, bodyB)
                const playerFeet = this.resolveLabeledBody(MatterPlayer.TYPE, MatterPlayer.FEET_LABEL, bodyA, bodyB)
                const diamond = this.resolveBody(Diamond.TYPE, bodyA, bodyB)
                const ground = this.resolveStaticBody(bodyA, bodyB)
                const bomb = this.resolveBody(Bomb.TYPE, bodyA, bodyB)

                if (player && diamond && !playerFeet) {
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

    public handleConfirmSignal(): void {
        const phase = this.phase
        if (phase === GamePhase.WAITING) {
            this.updatePhase(GamePhase.READY)
        } else if (phase === GamePhase.READY) {
            this.updatePhase(GamePhase.PLAYING)
        } else if (phase === GamePhase.PAUSED) {
            this.updatePhase(GamePhase.PLAYING)
        } else if (phase === GamePhase.GAME_OVER) {
            this.restart()
        }
    }

    public handleCancelSignal(): void {
        const phase = this.phase
        if (phase === GamePhase.WAITING ||
            phase === GamePhase.READY ||
            phase === GamePhase.PAUSED || 
            phase === GamePhase.GAME_OVER) {
            this.leave()
        } else if (phase === GamePhase.PLAYING) {
            this.updatePhase(GamePhase.PAUSED)
        }
    }

    private restart(): void {
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

    private leave(): void {
        this.updatePhase(GamePhase.TERMINATED)
    }

    private startGame(): void {
        for (let i = 0; i < 15; ++i) {
            this.addDiamond(32 + i * 64, 16)
        }

        this.addBomb()
    }

    public registerPlayer(playerConfig: IPlayerConfig): void {
        const player = this.addPlayer(
            playerConfig.startX,
            // We set the position slightly above the ground, because when we restart the game then we set the position manually
            // using Body.setPosition(body, pos), which however only causes a collision-end event, but no collision-start event.
            this.height - 1.75 * TILE_SIZE,
            playerConfig.facingLeft,
            playerConfig.color)
        this.players.push(player)
        this.playerControls.push(EMPTY_CONTROLS)

        if (this.players.length == this.expectedNumPlayers) {
            this.updatePhase(GamePhase.READY)
        }
    }

    public setPlayerControls(playerIdx: number, controls: IControls): void {
        this.playerControls[playerIdx] = controls
    }

    public update(delta: number): void {
        if (this.phase !== GamePhase.PLAYING) {
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

        this.updatePlayers(delta)

        Matter.Engine.update(this.engine, delta)
    }

    private updatePlayers(delta: number): void {
        if (this.players.length > 1) {
            for (let i = 0; i < this.players.length - 1; ++i) {
                for (let j = i + 1; j < this.players.length; ++j) {
                    // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60962
                    const result = Matter.Collision.collides(this.players[i].body, this.players[j].body)
                    if (result) {
                        const player1 = result.bodyA.plugin
                        const player2 = result.bodyB.plugin

                        if (player1.isAttacking && !player2.isDizzy) {
                            player2.takePunch()
                        }
                        if (player2.isAttacking && !player1.isDizzy) {
                            player1.takePunch()
                        }
                    }
                }
            }
        }

        this.players.forEach((player, idx) => {
            player.handleControls(this.playerControls[idx])
            player.update(delta)
        })
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.plugin.markDelete) {
                Matter.Composite.remove(this.engine.world, body)
            }
        })
    }

    public dispose(): void {
        // @ts-ignore
        Matter.Events.off(this.engine)
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

    get allPlayers(): MatterPlayer[] {
        return this.players
    }

    get currentLevel() {
        return this.level
    }
}
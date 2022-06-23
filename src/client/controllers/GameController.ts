import Matter from 'matter-js'

import { GamePhase, IControls, EMPTY_CONTROLS } from '../../shared/types/commons'
import { TILE_SIZE, PLAYER_CONFIG } from '../../shared/constants'
import { randomBetween } from '../../shared/randomUtils'
import LevelFactory from '../factories/LevelFactory'
import MatterPlayer from '../objects/MatterPlayer'
import Diamond from '../objects/Diamond'
import Bomb from '../objects/Bomb'

export default class GameController {

    private readonly _engine: Matter.Engine
    private readonly levelFactory: LevelFactory

    private width!: number

    private _players: MatterPlayer[] = []
    private playerControls: IControls[] = []

    private _phase: GamePhase = GamePhase.WAITING
    private _gamePhaseChangedCallback: (newPhase: GamePhase, oldPhase: GamePhase) => void = () => {}
    private gameOverCountdown: number = 0

    private activeDiamonds: number = 0
    //private _score: number = 0
    private _level: number = 0

    constructor() {
        this._engine = Matter.Engine.create()
        this.levelFactory = new LevelFactory(this._engine)
    }

    create(width: number, height: number, numPlayers: number): void {
        if (numPlayers < 0 || numPlayers > 2) {
            throw Error('Only 1 or 2 players are supported.')
        }

        this.width = width
        const envBodies = this.levelFactory.create(width, height)
        Matter.Composite.add(this._engine.world, envBodies)

        // We set the position slightly above the ground, because when we restart the game then we set the position manually
        // using Body.setPosition(body, pos), which however only causes a collision-end event, but no collision-start event.
        for (let i = 0; i < numPlayers; ++i) {
            const playerConfig = PLAYER_CONFIG[i]
            const player = this.addPlayer(
                playerConfig.startX,
                height - 1.75 * TILE_SIZE,
                playerConfig.facingLeft,
                playerConfig.color)
            this._players.push(player)
            this.playerControls.push(EMPTY_CONTROLS)
        }

        Matter.Events.on(this._engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const player = bodyA.isPlayer ? bodyA : bodyB
                const playerFeet = bodyA.isPlayerFeet ? bodyA : bodyB
                const diamond = bodyA.isDiamond ? bodyA : bodyB
                const ground = bodyA.isStatic ? bodyA : bodyB
                const bomb = bodyA.isBomb ? bodyA : bodyB

                if (player.isPlayer && diamond.isDiamond) {
                    this.onPlayerDiamondCollisionStart(player, diamond)
                }
                if (playerFeet.isPlayerFeet && ground.isStatic) {
                    this.onPlayerFeetGroundCollisionStart(playerFeet)
                }
                if (player.isPlayer && bomb.isBomb) {
                    this.onPlayerBombCollisionStart(player)
                }
            });
        });

        Matter.Events.on(this._engine, 'collisionEnd', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const playerFeet = bodyA.isPlayerFeet ? bodyA : bodyB
                const ground = bodyA.isStatic ? bodyA : bodyB
                if (playerFeet.isPlayerFeet && ground.isStatic) {
                    this.onPlayerFeetGroundCollisionEnd(playerFeet)
                }
            });
        });
    }

    private onPlayerDiamondCollisionStart(player: Matter.Body, diamond: Matter.Body): void {
        player.data.addScore(diamond.data.value)
        this.activeDiamonds--
        diamond.data.markDelete = true
    }

    private onPlayerFeetGroundCollisionStart(playerFeet: Matter.Body): void {
        playerFeet.data.touchGround()
    }

    private onPlayerFeetGroundCollisionEnd(playerFeet: Matter.Body): void {
        playerFeet.data.releaseGround()
    }

    private onPlayerBombCollisionStart(player: Matter.Body): void {
        player.data.kill()
        this.gameOverCountdown = 3000
    }

    public ready(): void {
        this.phase = GamePhase.READY
    }

    public pause(): void {
        this.phase = GamePhase.PAUSED
    }

    public resume(): void {
        this.phase = GamePhase.PLAYING
    }

    public restart(): void {
        this.phase = GamePhase.READY

        this._level = 1
        this.gameOverCountdown = 0
        this.activeDiamonds = 0

        this._players.forEach(player => player.reset())

        // clear bombs and diamonds
        this.allBodies().forEach(body =>{
            if (body.isDiamond || body.isBomb) {
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
        if (this.phase !== GamePhase.PLAYING) {
            const allPlayersAreReady = true // TODO implement logic for N players
            if (this.phase === GamePhase.READY && allPlayersAreReady) {
                this.phase = GamePhase.PLAYING
            }
            return
        }

        this.gameOverCountdown -= delta
        const allPlayersDead = this._players.every(player => player.dead)
        if (allPlayersDead && this.gameOverCountdown < 0) {
            this.phase = GamePhase.GAME_OVER
        }

        if (this.activeDiamonds == 0) {
            this._level++
            this.startGame()
            return
        }

        // TODO refactor to allow N players
        const result = Matter.Collision.collides(this.players[0].body, this.players[1].body)
        if (result) {
            const player1 = result.bodyA.data
            const player2 = result.bodyB.data

            if (player1.attacking && !player2.dizzy) {
                player2.takePunch()
            }
            if (player2.attacking && !player1.dizzy) {
                player1.takePunch()
            }
        }

        this._players.forEach((player, idx) => {
            player.handleControls(this.playerControls[idx])
            player.update(delta)
        })

        Matter.Engine.update(this._engine, delta)
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.data.markDelete) {
                Matter.Composite.remove(this._engine.world, body)
            }
        })
    }

    public dispose(): void {
        Matter.Composite.clear(this.engine.world)
        Matter.Engine.clear(this.engine)
    }

    private addPlayer(x: number, y: number, facingLeft: boolean, color: number): MatterPlayer {
        const player = new MatterPlayer(x, y, facingLeft, color)
        Matter.Composite.add(this._engine.world, player.body)
        return player
    }

    private addDiamond(x: number, y: number): Diamond {
        const diamond = new Diamond(x, y)
        Matter.Composite.add(this._engine.world, diamond.body)
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
        Matter.Composite.add(this._engine.world, bomb.body)
        return bomb
    }

    private disableGravityFor(body: Matter.Body): void {
        const gravity = this._engine.world.gravity
        Matter.Events.on(this._engine, 'beforeUpdate', function() {
            Matter.Body.applyForce(body, body.position, {
                x: -gravity.x * gravity.scale * body.mass,
                y: -gravity.y * gravity.scale * body.mass
            });
        });
    }

    public allBodies(): Matter.Body[] {
        return Matter.Composite.allBodies(this._engine.world)
    }

    set gamePhaseChangedCallback(handler: (newPhase: GamePhase, oldPhase: GamePhase) => void) {
        this._gamePhaseChangedCallback = handler
    }

    set phase(value: GamePhase) {
        if (this._phase != value) {
            const prevPhase = this._phase
            this._phase = value
            if (this._gamePhaseChangedCallback) {
                this._gamePhaseChangedCallback(value, prevPhase)
            }
        }
    }

    get phase(): GamePhase {
        return this._phase
    }

    get players(): MatterPlayer[] {
        return this._players
    }

    get level() {
        return this._level
    }

    get engine() {
        return this._engine
    }
}
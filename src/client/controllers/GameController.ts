import Matter from 'matter-js'

import { randomBetween } from '../../shared/randomUtils'
import { IControls } from '../../shared/types/commons'
import LevelFactory from '../factories/LevelFactory'
import MatterPlayer from '../objects/MatterPlayer'
import { TILE_SIZE } from '../../shared/constants'
import Diamond from '../objects/Diamond'
import Bomb from '../objects/Bomb'

export default class GameController {

    private readonly _engine: Matter.Engine
    private readonly levelFactory: LevelFactory

    private width!: number

    private player!: MatterPlayer

    private activeDiamonds: number = 0
    private _score: number = 0
    private _level: number = 0

    constructor() {
        this._engine = Matter.Engine.create()
        this.levelFactory = new LevelFactory(this._engine)
    }

    create(width: number, height: number): void {
        this.width = width
        const envBodies = this.levelFactory.create(width, height)
        Matter.Composite.add(this._engine.world, envBodies)

        this.player = this.addPlayer(4 * TILE_SIZE, height - 1.5 * TILE_SIZE)

        Matter.Events.on(this._engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const player = bodyA.isPlayer ? bodyA : bodyB
                const playerFeet = bodyA.isPlayerFeet ? bodyA : bodyB
                const diamond = bodyA.isDiamond ? bodyA : bodyB
                const ground = bodyA.isStatic ? bodyA : bodyB
                const bomb = bodyA.isBomb ? bodyA : bodyB

                if (player.isPlayer && diamond.isDiamond) {
                    this.onPlayerDiamondCollisionStart(diamond)
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

    private onPlayerDiamondCollisionStart(diamond: Matter.Body): void {
        this._score += diamond.data.value
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
    }

    public startGame(): void {
        for (let i = 0; i < 15; ++i) {
            this.addDiamond(32 + i * 64, 16)
        }

        this.addBomb()
    }

    public update(delta: number, controls: IControls): void {
        if (this.activeDiamonds == 0) {
            this._level++
            this.startGame()
            return
        }

        this.player.handleControls(controls)
        this.player.update(delta)

        Matter.Engine.update(this._engine, delta)
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.data.markDelete) {
                Matter.Composite.remove(this._engine.world, body)
            }
        })
    }

    public addPlayer(x: number, y: number): MatterPlayer {
        const player = new MatterPlayer(x, y)
        Matter.Composite.add(this._engine.world, player.body)
        return player
    }

    public addDiamond(x: number, y: number): Diamond {
        const diamond = new Diamond(x, y)
        Matter.Composite.add(this._engine.world, diamond.body)
        this.activeDiamonds++
        return diamond
    }

    public addBomb(): Bomb {
        const x = randomBetween(TILE_SIZE, this.width - TILE_SIZE)
        const bomb = new Bomb(x, TILE_SIZE / 2)
        const directionFactor = Math.random() > 0.5 ? 1 : -1;
        Matter.Body.applyForce(bomb.body, bomb.body.position, {
            x: directionFactor * 0.005,
            y: 0.005
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

    get score() {
        return this._score
    }

    get level() {
        return this._level
    }

    get engine() {
        return this._engine
    }
}
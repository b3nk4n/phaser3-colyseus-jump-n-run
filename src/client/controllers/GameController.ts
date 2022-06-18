import Matter from 'matter-js'

import { IControls } from '../../shared/types/commons'
import LevelFactory from '../factories/LevelFactory'
import MatterPlayer from '../objects/MatterPlayer'
import { TILE_SIZE } from '../../shared/constants'
import Diamond from '../objects/Diamond'

export default class GameController {

    private readonly engine: Matter.Engine
    private readonly levelFactory: LevelFactory

    private player!: MatterPlayer

    private activeDiamonds: number = 0
    private _score: number = 0

    constructor() {
        this.engine = Matter.Engine.create()
        this.levelFactory = new LevelFactory(this.engine)
    }

    create(width: number, height: number): void {
        const envBodies = this.levelFactory.create(width, height)
        Matter.Composite.add(this.engine.world, envBodies)

        this.player = this.addPlayer(4 * TILE_SIZE, height - 1.5 * TILE_SIZE)

        Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const p = bodyA.isPlayer ? bodyA : bodyB
                const d = bodyA.isDiamond ? bodyA : bodyB
                if (p.isPlayer && d.isDiamond) {
                    this.onDiamondPlayerCollision(d)
                }
            });
        });
    }

    private onDiamondPlayerCollision(diamond: Matter.Body): void {
        this._score += diamond.data.value
        this.activeDiamonds--
        diamond.data.markDelete = true
    }

    public startGame(): void {
        for (let i = 0; i < 15; ++i) {
            this.addDiamond(32 + i * 64, 16)
        }
    }

    public update(delta: number, controls: IControls): void {
        if (this.activeDiamonds == 0) {
            this.startGame()
            return
        }

        this.player.handleControls(controls)

        Matter.Engine.update(this.engine, delta)
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.data.markDelete) {
                Matter.Composite.remove(this.engine.world, body)
            }
        })
    }

    public addPlayer(x: number, y: number): MatterPlayer {
        const player = new MatterPlayer(x, y)
        Matter.Composite.add(this.engine.world, player.body)
        return player
    }

    public addDiamond(x: number, y: number): Diamond {
        const diamond = new Diamond(x, y)
        Matter.Composite.add(this.engine.world, diamond.body)
        this.activeDiamonds++
        return diamond
    }

    public allBodies(): Matter.Body[] {
        return Matter.Composite.allBodies(this.engine.world)
    }

    get score() {
        return this._score
    }
}
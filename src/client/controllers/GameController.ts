import Matter from 'matter-js'
import Phaser from 'phaser'

import LevelFactory from '../factories/LevelFactory'
import Diamond from '../objects/Diamond'

export default class GameController {

    private readonly engine: Matter.Engine
    private readonly _environment: LevelFactory

    private activeDiamonds: number = 0
    private _score: number = 0

    constructor() {
        this.engine = Matter.Engine.create()
        this._environment = new LevelFactory(this.engine)
    }

    create(width: number, height: number): void {
        const envBodies = this._environment.create(width, height)
        Matter.Composite.add(this.world, envBodies)

        Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const p = bodyA.isPlatform ? bodyA : bodyB
                const d = bodyA.isDiamond ? bodyA : bodyB
                if (p.isPlatform && d.isDiamond) {
                    this.onDiamondPlatformCollision(d)
                }
            });
        });
    }

    private onDiamondPlatformCollision(diamond: Matter.Body): void {
        // TODO replace with player collision
        this._score += diamond.data.value
        this.activeDiamonds--
        diamond.data.markDelete = true
    }

    public startGame(): void {
        for (let i = 0; i < 15; ++i) {
            const rnd = Phaser.Math.RND.frac()
            this.addDiamond(32 + i * 64, 16, rnd > 0.75)
        }
    }

    public update(delta: number): void {
        if (this.activeDiamonds == 0) {
            this.startGame()
            return
        }

        Matter.Engine.update(this.engine, delta)
    }

    public cleanup(): void {
        this.allBodies().forEach(body => {
            if (!body.isStatic && body.data.markDelete) {
                Matter.Composite.remove(this.world, body)
            }
        })
    }

    public addDiamond(x: number, y: number, highValue: boolean): Diamond {
        const diamond = new Diamond(x, y, highValue ? Diamond.VALUE_RED : Diamond.VALUE_GREEN)
        Matter.Composite.add(this.world, diamond.body)
        this.activeDiamonds++
        return diamond
    }

    public allBodies(): Matter.Body[] {
        return Matter.Composite.allBodies(this.world)
    }

    get world() {
        return this.engine.world
    }

    get score() {
        return this._score
    }

    get environment() {
        return this._environment
    }
}
import Matter from 'matter-js'
import Phaser from 'phaser'

import MatterEnvironment from '../objects/MatterEnvironment'
import { IPlatformDef } from '../../shared/types/commons'
import Diamonds from '../controllers/Diamonds'

export default class GameController {

    private static readonly LEVEL: IPlatformDef[] = [
        { x: 0.5, y: 0.28, isSmall: true },
        { x: 0.175, y: 0.4, isSmall: true },
        { x: 0.825, y: 0.4, isSmall: true },
        { x: 0.5, y: 0.55, isSmall: false },
        { x: 0.225, y: 0.75, isSmall: false },
        { x: 0.775, y: 0.75, isSmall: false }
    ]

    private readonly context: Phaser.Scene
    private readonly engine: Matter.Engine
    private readonly _environment: MatterEnvironment
    private readonly _diamonds: Diamonds

    private _score: number = 0

    constructor(context: Phaser.Scene) {
        this.context = context
        this.engine = Matter.Engine.create()
        this._environment = new MatterEnvironment(this.engine)
        this._diamonds = new Diamonds(this.engine)
    }

    create(): void {
        const { width, height } = this.context.scale
        this._environment.create(GameController.LEVEL, width, height)

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
        this._score += diamond.value
        this.diamonds.remove(diamond.id)
    }

    startGame(): void {
        this.diamonds.addMany(32, 16, 64, 15)
    }

    update(delta: number): void {
        if (this.diamonds.itemMap.size == 0) {
            // TODO handle victory
            return
        }

        Matter.Engine.update(this.engine, delta)
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

    get diamonds() {
        return this._diamonds
    }
}
import Matter from 'matter-js'
import Phaser from 'phaser'

import MatterEnvironment, { IPlatformDef } from '../objects/MatterEnvironment'

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
    private environment!: MatterEnvironment

    private _score: number = 0

    constructor(context: Phaser.Scene) {
        this.context = context
        this.engine = Matter.Engine.create()
    }

    create(): void {
        const { width, height } = this.context.scale
        this.environment = new MatterEnvironment(this.engine, width, height)
        this.environment.create(GameController.LEVEL)
    }

    update(delta: number): void {

    }

    get world() {
        return this.engine.world
    }

    get score() {
        return this._score
    }
}
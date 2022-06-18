import Matter from 'matter-js'
import Phaser from 'phaser'

import Diamond from '../objects/Diamond'

export default class Diamonds {

    private static readonly VALUE_RED = 25
    private static readonly VALUE_GREEN = 10

    private readonly engine: Matter.Engine
    private readonly _itemMap: Map<number, Diamond> = new Map<number, Diamond>()

    constructor(engine: Matter.Engine) {
        this.engine = engine
    }

    public addMany(xStart: number, y: number, xOffset: number, count: number): void {
        for (let i = 0; i < count; ++i) {
            const rnd = Phaser.Math.RND.frac()
            this.add(xStart + i * xOffset, y, rnd > 0.75)
        }
    }

    public add(x: number, y: number, highValue: boolean): Diamond {
        const diamond = new Diamond(x, y, highValue ? Diamonds.VALUE_RED : Diamonds.VALUE_GREEN)
        Matter.Composite.add(this.engine.world, diamond.body)
        this._itemMap.set(diamond.id, diamond)
        return diamond
    }

    public remove(id: number): void {
        const diamond = this._itemMap.get(id)
        if (diamond != null) {
            this._itemMap.delete(id)
            Matter.Composite.remove(this.engine.world, diamond.body)
        }
    }

    get itemMap() {
        return this._itemMap
    }
}
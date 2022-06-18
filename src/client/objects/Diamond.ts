import Matter from 'matter-js'
import Phaser from 'phaser'

export default class Diamond {

    public static readonly VALUE_RED = 25
    public static readonly VALUE_GREEN = 10

    private readonly _body: Matter.Body
    private readonly _value: number
    private _markDelete: boolean = false

    constructor(x: number, y: number, value: number) {
        this._value = value
        this._body = Matter.Bodies.rectangle(x, y, 16, 16, {
            inertia: Infinity,
            restitution: Phaser.Math.FloatBetween(0.8, 0.95),
            isDiamond: true,
            data: this
        })
        this._body.idString = '' + this._body.id
    }

    get body() {
        return this._body
    }

    get value() {
        return this._value
    }

    get markDelete() {
        return this._markDelete
    }

    set markDelete(value: boolean) {
        this._markDelete = value
    }
}
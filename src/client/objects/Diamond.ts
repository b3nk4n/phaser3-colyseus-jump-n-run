import Matter from 'matter-js'
import Phaser from 'phaser'

export default class Diamond {

    private readonly _body: Matter.Body
    private readonly _value: number

    constructor(x: number, y: number, value: number) {
        this._value = value
        this._body = Matter.Bodies.rectangle(x, y, 16, 16, {
            inertia: Infinity,
            restitution: Phaser.Math.FloatBetween(0.8, 0.95),
            isDiamond: true,
            value
        })
    }

    get id() {
        return this._body.id
    }

    get body() {
        return this._body
    }

    get value() {
        return this._value
    }
}
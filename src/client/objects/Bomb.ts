import Matter from 'matter-js'

export default class Bomb {

    private readonly _body: Matter.Body
    private _markDelete: boolean = false

    constructor(x: number, y: number) {
        this._body = Matter.Bodies.rectangle(x, y, 16, 16, {
            inertia: Infinity,
            restitution: 1.0,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            collisionFilter: {
                group: -2
            },
            isBomb: true,
            data: this
        })
        this._body.idString = '' + this._body.id
    }

    get body() {
        return this._body
    }

    get markDelete() {
        return this._markDelete
    }

    set markDelete(value: boolean) {
        this._markDelete = value
    }
}
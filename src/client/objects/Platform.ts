import Matter from 'matter-js'
import Phaser from 'phaser'

export default class Platform {

    private readonly _body: Matter.Body
    private readonly _isSmall: boolean
    private _markDelete: boolean = false

    constructor(x: number, y: number, isSmall: boolean) {
        this._isSmall = isSmall
        this._body = Matter.Bodies.rectangle(x, y, isSmall ? 160 : 320, 32, {
            isStatic: true,
            isPlatform: true,
            data: this
        })
        this._body.idString = '' + this._body.id
    }

    get id() {
        return this._body.id
    }

    get body() {
        return this._body
    }

    get isSmall() {
        return this._isSmall
    }

    get markDelete() {
        return this._markDelete
    }

    set markDelete(value: boolean) {
        this._markDelete = value
    }
}
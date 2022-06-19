import Matter from 'matter-js'

export default class Platform {

    private readonly surfaceBody: Matter.Body
    private readonly outerSlideBody: Matter.Body
    private readonly _isSmall: boolean
    private _markDelete: boolean = false

    constructor(x: number, y: number, isSmall: boolean) {
        this._isSmall = isSmall

        const bodyOptions = {
            isStatic: true,
            isPlatform: true,
            data: this
        }

        const padding = 4;
        const platformWidth = isSmall ? 160 : 320

        this.surfaceBody = Matter.Bodies.rectangle(x, y, platformWidth - 2 * padding, 32, bodyOptions)
        this.surfaceBody.idString = '' + this.surfaceBody.id

        this.outerSlideBody = Matter.Bodies.rectangle(x, y, platformWidth, 32, bodyOptions)
        this.outerSlideBody.friction = 0
        this.outerSlideBody.idString = '' + this.outerSlideBody.id
    }

    get bodies() {
        return [
            this.surfaceBody,
            this.outerSlideBody
        ]
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
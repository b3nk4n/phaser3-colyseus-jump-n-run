import Matter from 'matter-js'

import { IControls } from '../../shared/types/commons'

export default class MatterPlayer {

    private readonly _body: Matter.Body
    private _markDelete: boolean = false

    private _facingLeft: boolean = false
    private _attacking: boolean = false
    private _dizzyCountdown: number = 0
    private _dead: boolean = false

    constructor(x: number, y: number) {
        this._body = Matter.Bodies.rectangle(x, y, 32, 32, {
            inertia: Infinity,
             collisionFilter: {
                 group: -1
             },
            isPlayer: true,
            data: this
        })
        this._body.idString = '' + this._body.id
    }

    public handleControls(controls: IControls) {
        const { left, up, right, space } = controls
        const { x: vx, y: vy } = this.body.velocity

        let newX = vx
        let newY = vy

        if (right && !left) {
            this._facingLeft = false
            newX = 3
        }
        if (left && !right) {
            this._facingLeft = true
            newX = -3
        }

        if (up && this.canJump) {
            newY = -10
        }

        this._attacking = space

        Matter.Body.setVelocity(this.body, { x: newX, y: newY })
    }

    public punch(): void {
        if (!this.dizzy) {
            this._dizzyCountdown = 2500
        }
    }

    public kill(): void {
        this._dead = true
    }

    get facingLeft(): boolean {
        return this._facingLeft
    }

    get canJump() {
        return true
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

    get dizzy() {
        return this._dizzyCountdown > 0
    }

    get dead() {
        return this._dead
    }

    get attacking() {
        return this._attacking
    }
}
import Matter from 'matter-js'

import { IControls } from '../../shared/types/commons'

export default class MatterPlayer {

    private readonly _body: Matter.Body
    private _markDelete: boolean = false

    private _facingLeft: boolean = false
    private _attacking: boolean = false
    private _dizzyCountdown: number = 0
    private _dead: boolean = false
    private _touchingGround = false

    constructor(x: number, y: number) {
        const bodyOptions = {
            inertia: Infinity, // prevent body rotation
            collisionFilter: {
                group: -1
            },
            isPlayer: true,
            data: this
        }

        const mainBodyPart = Matter.Bodies.circle(x, y, 16, bodyOptions)
        const groundSensor = Matter.Bodies.rectangle(x, y + 16, 16, 8, {
            isPlayerFeet: true,
            isSensor: true,
            data: this
        })
        this._body = Matter.Body.create({
            ...bodyOptions,
            parts: [
                mainBodyPart,
                groundSensor
            ],
        })
        this._body.idString = '' + this._body.id
    }

    public update(delta: number): void {
        if (this._dizzyCountdown > 0) {
            this._dizzyCountdown -= delta
        }
    }

    public handleControls(controls: IControls) {
        const { left, up, right, space } = controls
        const { x: vx, y: vy } = this.body.velocity

        if (this.dead || this.dizzy) {
            this._attacking = false
            return
        }

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

    public touchGround(): void {
        this._touchingGround = true
    }

    public releaseGround(): void {
        this._touchingGround = false
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
        return this._touchingGround
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
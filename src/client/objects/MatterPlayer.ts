import Matter from 'matter-js'

import { IControls } from '../../shared/types/commons'
import BaseObject from './BaseObject'

export default class MatterPlayer extends BaseObject {
    public static readonly TYPE: string = 'player'


    public static readonly BODY_LABEL: string = 'body'
    public static readonly FEET_LABEL: string = 'feet'

    private attackingCountdown: number = 0

    private facingLeft: boolean = false
    private dizzyCountdown: number = 0
    private dead: boolean = false
    private touchingGround = false
    public score: number = 0
    public readonly color: number

    private readonly initialX: number
    private readonly initialY: number
    private readonly initialFacingLeft: boolean

    constructor(x: number, y: number, facingLeft: boolean, color: number) {
        super(MatterPlayer.TYPE, x, y)
        this.initialX = x
        this.initialY = y
        this.initialFacingLeft = facingLeft
        this.facingLeft = facingLeft
        this.color = color
    }

    protected createBody(x: number, y: number): Matter.Body {
        const bodyOptions = {
            inertia: Infinity, // prevent body rotation
            collisionFilter: {
                group: -1
            },
            label: MatterPlayer.BODY_LABEL,
            plugin: this // TODO is this needed?
        }

        const mainBodyPart = Matter.Bodies.circle(x, y, 16, bodyOptions)
        const groundSensor = Matter.Bodies.rectangle(x, y + 16, 16, 8, {
            label: MatterPlayer.FEET_LABEL,
            isSensor: true,
            plugin: this // TODO is this needed?
        })
        return Matter.Body.create({
            ...bodyOptions,
            parts: [
                mainBodyPart,
                groundSensor
            ],
        })
    }

    public reset(): void {
        this.dead = false
        this.dizzyCountdown = 0
        this.attackingCountdown = 0
        this.facingLeft = this.initialFacingLeft
        this.score = 0

        Matter.Body.setPosition(this.body, { x: this.initialX, y: this.initialY })
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 })
    }

    public update(delta: number): void {
        if (this.dizzyCountdown > 0) {
            this.dizzyCountdown -= delta
        }
        if (this.attackingCountdown > 0) {
            this.attackingCountdown -= delta
        }
    }

    public handleControls(controls: IControls) {
        const { left, up, right, actionKey } = controls
        const { x: vx, y: vy } = this.body.velocity

        if (this.isDead || this.isDizzy) {
            this.attackingCountdown = 0
            return
        }

        let newX = vx
        let newY = vy

        if (actionKey && this.canAttack) {
            this.attackingCountdown = 1500
        }
        if (!this.isAttacking) {
            if (right && !left) {
                this.facingLeft = false
                newX = 3
            }
            if (left && !right) {
                this.facingLeft = true
                newX = -3
            }
        }

        if (up && this.canJump) {
            newY = -10
        }

        Matter.Body.setVelocity(this.body, { x: newX, y: newY })
    }

    public touchGround(): void {
        this.touchingGround = true
    }

    public releaseGround(): void {
        this.touchingGround = false
    }

    public takePunch(): void {
        if (!this.isDizzy) {
            this.dizzyCountdown = 2500
        }
    }

    public kill(): void {
        this.dead = true
    }

    get isFacingLeft(): boolean {
        return this.facingLeft
    }

    get canJump() {
        return this.touchingGround
    }

    get isDizzy() {
        return this.dizzyCountdown > 0
    }

    get isDead() {
        return this.dead
    }

    get canAttack() {
        return this.attackingCountdown <= 0
    }

    get isAttacking() {
        return this.attackingCountdown > 1000
    }
}
import Phaser from 'phaser'

import { IControls } from '../../shared/types/commons'
import Assets from '../assets/Assets'

/**
 * The player game object using composition.
 */
export default class ArcadePlayer {

    private static readonly SPEED: number = 166
    private static readonly JUMP_SPEED: number = 300
    private static readonly IDLE_VELOCITY_Y = -0.8333333333333333

    private static readonly ANIM_IDLE: string = 'idle'
    private static readonly ANIM_RIGHT: string = 'right'
    private static readonly ANIM_UP: string = 'up'
    private static readonly ANIM_DOWN: string = 'down'
    private static readonly ANIM_ATTACK: string = 'attack'
    private static readonly ANIM_DIZZY: string = 'dizzy'
    private static readonly ANIM_DEAD: string = 'dead'

    private readonly context: Phaser.Scene
    private _sprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    private _attacking: boolean = false
    private _dizzyCountdown: number = 0
    private _dead: boolean = false

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public create(x: number, y: number): void {
        this._sprite = this.context.physics.add.sprite(x, y, Assets.PLAYER_IDLE)
            .setOrigin(1, 0.5)
            //.setCollideWorldBounds(true)

        const animContext = this.context.anims
        animContext.create({
            key: ArcadePlayer.ANIM_RIGHT,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_RUN_RIGHT, {
                end: 5
            }),
            frameRate: 16
        })

        animContext.create({
            key: ArcadePlayer.ANIM_IDLE,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_IDLE, {
                end: 9
            }),
            frameRate: 8
        })

        animContext.create({
            key: ArcadePlayer.ANIM_UP,
            frames: [{
                key: Assets.PLAYER_JUMP_UP,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: ArcadePlayer.ANIM_DOWN,
            frames: [{
                key: Assets.PLAYER_JUMP_DOWN,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: ArcadePlayer.ANIM_ATTACK,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_ATTACK, {
                end: 3
            }),
            frameRate: 8
        })

        animContext.create({
            key: ArcadePlayer.ANIM_DIZZY,
            frames: [{
                key: Assets.PLAYER_DIZZY,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: ArcadePlayer.ANIM_DEAD,
            frames: [{
                key: Assets.PLAYER_DEAD,
                frame: 0
            }],
            frameRate: 1
        })
    }

    public update(time: number, delta: number): void {
        this.updateAnimations()

        if (this.dizzy) {
            this._dizzyCountdown -= delta
        }
    }

    public handleInput(controls: IControls): void {
        if (this.dead || this.dizzy) {
            this._sprite.setVelocity(0, 300)
            return
        }

        const touchGround = this.isTouchingGround()

        this._attacking = controls.space;
        if (this._attacking) {
            this.applyFrictionToPlayer(touchGround)
            return
        }

        const movementFactor = touchGround ? 1.0 : 0.85

        if (controls.left) {
            this._sprite.setVelocityX(-ArcadePlayer.SPEED * movementFactor)
        } else if (controls.right) {
            this._sprite.setVelocityX(ArcadePlayer.SPEED * movementFactor)
        } else {
            this.applyFrictionToPlayer(touchGround)
        }
        if (controls.up && touchGround) {
            this._sprite.setVelocityY(-ArcadePlayer.JUMP_SPEED)
        }
    }

    private applyFrictionToPlayer(touchGround) {
        const friction = touchGround ? 0.85 : 0.95
        this._sprite.setVelocityX(this.sprite.body.velocity.x * friction)
    }

    private updateAnimations(): void {
        if (this.dead) {
            this.sprite.anims.play(ArcadePlayer.ANIM_DEAD)
            return
        }

        if (this.dizzy) {
            this.sprite.anims.play(ArcadePlayer.ANIM_DIZZY)
            return
        }

        const velocityX = this.sprite.body.velocity.x
        const velocityY = this.sprite.body.velocity.y - ArcadePlayer.IDLE_VELOCITY_Y

        const isIdle = Math.abs(velocityX) < 25 && Math.abs(velocityY) < 25
        const isLeft = Math.sign(velocityX) === -1
        const isJumpingUp = velocityY <= -25
        const isJumpingDown = velocityY >= 25

        this.sprite.flipX = isLeft

        if (this._attacking) {
            this.sprite.anims.play(ArcadePlayer.ANIM_ATTACK, true)
            return
        }

        if (isIdle) {
            this.sprite.anims.play(ArcadePlayer.ANIM_IDLE, true)
            return
        }

        if (isJumpingUp) {
            this.sprite.anims.play(ArcadePlayer.ANIM_UP)
            return
        }
        if (isJumpingDown) {
            this.sprite.anims.play(ArcadePlayer.ANIM_DOWN)
            return
        }

        if (this.isTouchingGround()) {
            this.sprite.anims.play(ArcadePlayer.ANIM_RIGHT, true)
        }
    }

    public punch(): void {
        if (!this.dizzy) {
            this._dizzyCountdown = 2500
        }
    }

    public kill(): void {
        this.sprite.setTint(0xffcccc)
        this._dead = true
    }

    public isTouchingGround() {
        return this._sprite.body.touching.down
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite
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
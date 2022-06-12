import Phaser from 'phaser'

import Assets from '../assets/Assets'

/**
 * The player game object using composition.
 */
export default class Player {

    private static readonly SPEED: number = 166
    private static readonly JUMP_SPEED: number = 300
    private static readonly IDLE_VELOCITY_Y = -0.8333333333333333

    private static readonly ANIM_IDLE: string = 'idle'
    private static readonly ANIM_RIGHT: string = 'right'
    private static readonly ANIM_UP: string = 'up'
    private static readonly ANIM_DOWN: string = 'down'
    private static readonly ANIM_DEAD: string = 'dead'

    private readonly context: Phaser.Scene
    private _sprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    private _dead: boolean = false

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public create(): void {
        this._sprite = this.context.physics.add.sprite(100, this.context.scale.height - 32 * 1.5, Assets.PLAYER_IDLE)
            .setBounce(0.1)
            .setCollideWorldBounds(true)

        const animContext = this.context.anims
        animContext.create({
            key: Player.ANIM_RIGHT,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_RUN_RIGHT, {
                start: 0,
                end: 5
            }),
            frameRate: 16
        })

        animContext.create({
            key: Player.ANIM_IDLE,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_IDLE, {
                start: 0,
                end: 9
            }),
            frameRate: 8
        })

        animContext.create({
            key: Player.ANIM_UP,
            frames: [{
                key: Assets.PLAYER_JUMP_UP,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: Player.ANIM_DOWN,
            frames: [{
                key: Assets.PLAYER_JUMP_DOWN,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: Player.ANIM_DEAD,
            frames: [{
                key: Assets.PLAYER_DEAD,
                frame: 0
            }],
            frameRate: 1
        })
    }

    public update(time: number, delta: number): void {
        this.handleInput()
        this.updateAnimations()
    }

    private handleInput(): void {
        if (this.dead) {
            this._sprite.setVelocityX(0)
            this
            return
        }

        const touchGround = this.isTouchingGround()
        const cursors = this.context.input.keyboard.createCursorKeys()
        const movementFactor = touchGround ? 1.0 : 0.85

        if (cursors.left.isDown) {
            this._sprite.setVelocityX(-Player.SPEED * movementFactor)
        } else if (cursors.right.isDown) {
            this._sprite.setVelocityX(Player.SPEED * movementFactor)
        } else {
            const friction = touchGround ? 0.85 : 0.95
            this._sprite.setVelocityX(this.sprite.body.velocity.x * friction)
        }
        if (cursors.up.isDown && touchGround) {
            this._sprite.setVelocityY(-Player.JUMP_SPEED)
        }
    }

    private updateAnimations(): void {
        if (this.dead) {
            this.sprite.anims.play(Player.ANIM_DEAD)
            return
        }

        const velocityX = this.sprite.body.velocity.x
        const velocityY = this.sprite.body.velocity.y - Player.IDLE_VELOCITY_Y

        const isIdle = Math.abs(velocityX) < 25 && Math.abs(velocityY) < 25
        const isLeft = Math.sign(velocityX) === -1
        const isJumpingUp = velocityY <= -25
        const isJumpingDown = velocityY >= 25

        this.sprite.flipX = isLeft

        if (isIdle) {
            this.sprite.anims.play(Player.ANIM_IDLE, true)
            return
        }

        if (isJumpingUp) {
            this.sprite.anims.play(Player.ANIM_UP)
            return
        }
        if (isJumpingDown) {
            this.sprite.anims.play(Player.ANIM_DOWN)
            return
        }

        if (this.isTouchingGround()) {
            this.sprite.anims.play(Player.ANIM_RIGHT, true)
        }
    }

    public kill(): void {
        this.sprite.setTint(0xffcccc)
        this._dead = true
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite
    }

    get dead() {
        return this._dead
    }

    public isTouchingGround() {
        return this._sprite.body.touching.down
    }
}
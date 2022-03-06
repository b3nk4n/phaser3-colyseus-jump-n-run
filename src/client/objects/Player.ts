import Phaser from 'phaser'

import Assets from '../assets/Assets'

/**
 * The player game object using composition.
 */
export default class Player {

    private static readonly SPEED: number = 166
    private static readonly JUMP_SPEED: number = 325

    private static readonly ANIM_LEFT: string = 'left'
    private static readonly ANIM_TURN: string = 'turn'
    private static readonly ANIM_RIGHT: string = 'right'

    private readonly context: Phaser.Scene
    private _sprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    private _dead: boolean = false

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public create(): void {
        this._sprite = this.context.physics.add.sprite(100, 450, Assets.PLAYER)
            .setBounce(0.2)
            .setCollideWorldBounds(true)

        const animContext = this.context.anims
        animContext.create({
            key: Player.ANIM_LEFT,
            frames: animContext.generateFrameNumbers(Assets.PLAYER, {
                start: 0,
                end: 3
            }),
            frameRate: 8,
            repeat: -1
        })

        animContext.create({
            key: Player.ANIM_TURN,
            frames: [{
                key: Assets.PLAYER,
                frame: 4
            }],
            frameRate: 16
        })

        animContext.create({
            key: Player.ANIM_RIGHT,
            frames: animContext.generateFrameNumbers(Assets.PLAYER, {
                start: 5,
                end: 8
            }),
            frameRate: 8,
            repeat: -1
        })
    }

    public update(time: number, delta: number): void {
        this.handleInput()
        this.updateAnimations()
    }

    private handleInput(): void {
        if (this.dead) return

        const touchGround = this._sprite.body.touching.down
        const cursors = this.context.input.keyboard.createCursorKeys()
        if (cursors.left.isDown) {
            this._sprite.setVelocityX(-Player.SPEED)
        } else if (cursors.right.isDown) {
            this._sprite.setVelocityX(Player.SPEED)
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
            this.sprite.anims.play(Player.ANIM_TURN)
            return
        }

        const velocityX = this.sprite.body.velocity.x
        if (Math.abs(velocityX) < 25) {
            this.sprite.anims.play(Player.ANIM_TURN)
            return
        }
        if (Math.sign(velocityX) === -1) {
            this.sprite.anims.play(Player.ANIM_LEFT, true)
        } else {
            this.sprite.anims.play(Player.ANIM_RIGHT, true)
        }
    }

    public kill(): void {
        this.sprite.setTint(0xff0000)
        this._dead = true
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite
    }

    get dead() {
        return this._dead
    }
}
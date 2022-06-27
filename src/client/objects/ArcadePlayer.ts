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

    public readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    private attacking: boolean = false
    private dizzyCountdown: number = 0
    private dead: boolean = false

    constructor(context: Phaser.Scene, x: number, y: number) {
        this.initAnimations(context)
        this.sprite = context.physics.add.sprite(x, y, Assets.PLAYER_IDLE)
            .setOrigin(1, 0.5)
            //.setCollideWorldBounds(true)
    }

    private initAnimations(context: Phaser.Scene): void {
        const animContext = context.anims
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

        if (this.isDizzy) {
            this.dizzyCountdown -= delta
        }
    }

    public handleInput(controls: IControls): void {
        if (this.dead || this.isDizzy) {
            this.sprite.setVelocity(0, 300)
            return
        }

        const touchGround = this.isTouchingGround

        this.attacking = controls.actionKey;
        if (this.isAttacking) {
            this.applyFrictionToPlayer(touchGround)
            return
        }

        const movementFactor = touchGround ? 1.0 : 0.85

        if (controls.left) {
            this.sprite.setVelocityX(-ArcadePlayer.SPEED * movementFactor)
        } else if (controls.right) {
            this.sprite.setVelocityX(ArcadePlayer.SPEED * movementFactor)
        } else {
            this.applyFrictionToPlayer(touchGround)
        }
        if (controls.up && touchGround) {
            this.sprite.setVelocityY(-ArcadePlayer.JUMP_SPEED)
        }
    }

    private applyFrictionToPlayer(touchGround) {
        const friction = touchGround ? 0.85 : 0.95
        this.sprite.setVelocityX(this.sprite.body.velocity.x * friction)
    }

    private updateAnimations(): void {
        if (this.dead) {
            this.sprite.anims.play(ArcadePlayer.ANIM_DEAD)
            return
        }

        if (this.isDizzy) {
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

        if (this.isAttacking) {
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

        if (this.isTouchingGround) {
            this.sprite.anims.play(ArcadePlayer.ANIM_RIGHT, true)
        }
    }

    public takePunch(): void {
        if (!this.isDizzy) {
            this.dizzyCountdown = 2500
        }
    }

    public kill(): void {
        this.sprite.setTint(0xffaaaa)
        this.dead = true
    }

    get isTouchingGround() {
        return this.sprite.body.touching.down
    }

    get isDizzy() {
        return this.dizzyCountdown > 0
    }

    get isDead() {
        return this.dead
    }

    get isAttacking() {
        return this.attacking
    }
}
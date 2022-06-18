import Matter from 'matter-js'
import Phaser from 'phaser'

import GameController from '../controllers/GameController'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class GameRenderer {

    private static readonly IDLE_VELOCITY_EPSILON = 0.001

    private static readonly ANIM_IDLE: string = 'idle'
    private static readonly ANIM_RIGHT: string = 'right'
    private static readonly ANIM_UP: string = 'up'
    private static readonly ANIM_DOWN: string = 'down'
    private static readonly ANIM_ATTACK: string = 'attack'
    private static readonly ANIM_DIZZY: string = 'dizzy'
    private static readonly ANIM_DEAD: string = 'dead'

    private readonly context: Phaser.Scene
    private readonly controller: GameController

    private hud: Hud

    constructor(context: Phaser.Scene, controller: GameController) {
        this.context = context
        this.controller = controller
        this.hud = new Hud(context)
    }

    public create(): void {
        this.context.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        this.createPlayerAnimations()

        const bodies = this.controller.allBodies()
        bodies.forEach(body => {
            if (body.isPlatform) {
                this.addPlatformSprite(body)
            }
            if (body.isPlayer) {
                this.addPlayerSprite(body)
            }
        })

        this.hud.create()
    }

    private createPlayerAnimations() {
        const animContext = this.context.anims
        animContext.create({
            key: GameRenderer.ANIM_RIGHT,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_RUN_RIGHT, {
                end: 5
            }),
            frameRate: 16
        })

        animContext.create({
            key: GameRenderer.ANIM_IDLE,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_IDLE, {
                end: 9
            }),
            frameRate: 8
        })

        animContext.create({
            key: GameRenderer.ANIM_UP,
            frames: [{
                key: Assets.PLAYER_JUMP_UP,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: GameRenderer.ANIM_DOWN,
            frames: [{
                key: Assets.PLAYER_JUMP_DOWN,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: GameRenderer.ANIM_ATTACK,
            frames: animContext.generateFrameNumbers(Assets.PLAYER_ATTACK, {
                end: 3
            }),
            frameRate: 8
        })

        animContext.create({
            key: GameRenderer.ANIM_DIZZY,
            frames: [{
                key: Assets.PLAYER_DIZZY,
                frame: 0
            }],
            frameRate: -1
        })

        animContext.create({
            key: GameRenderer.ANIM_DEAD,
            frames: [{
                key: Assets.PLAYER_DEAD,
                frame: 0
            }],
            frameRate: 1
        })
    }

    public update(): void {
        this.hud.updateScore(this.controller.score)

        this.controller.allBodies().forEach(body => {
            if (body.isStatic) {
                return
            }

            const sprite = this.context.children.getByName(body.idString) as Phaser.GameObjects.Sprite

            if (body.data.markDelete) {
                if (sprite != null) {
                    this.context.children.remove(sprite)
                }
                return
            }

            if (body.isDiamond) {
                this.updateDiamond(sprite, body)
            }
            if (body.isPlayer) {
                this.updatePlayer(sprite, body)
            }
        })
    }

    private updateDiamond(sprite: Phaser.GameObjects.Sprite | null, body: Matter.Body): void {
        if (sprite == null) {
            this.addDiamondSprite(body)
            return
        }
        sprite.setPosition(body.position.x, body.position.y)
    }

    private updatePlayer(sprite: Phaser.GameObjects.Sprite | null, body: Matter.Body): void {
        if (sprite == null) {
            this.addPlayerSprite(body)
            return
        }
        sprite.setPosition(body.position.x, body.position.y)

        const { dead, dizzy, attacking, canJump, facingLeft } = body.data
        if (dead) {
            sprite.anims.play(GameRenderer.ANIM_DEAD)
            return
        }

        if (dizzy) {
            sprite.anims.play(GameRenderer.ANIM_DIZZY)
            return
        }

        const velocityX = body.velocity.x
        const velocityY = body.velocity.y

        const isIdle = Math.abs(velocityX) < GameRenderer.IDLE_VELOCITY_EPSILON && Math.abs(velocityY) < GameRenderer.IDLE_VELOCITY_EPSILON
        const isJumpingUp = velocityY <= -GameRenderer.IDLE_VELOCITY_EPSILON
        const isJumpingDown = velocityY >= GameRenderer.IDLE_VELOCITY_EPSILON

        sprite.flipX = facingLeft

        if (attacking) {
            sprite.anims.play(GameRenderer.ANIM_ATTACK, true)
            return
        }

        if (isIdle) {
            sprite.anims.play(GameRenderer.ANIM_IDLE, true)
            return
        }

        if (isJumpingUp) {
            sprite.anims.play(GameRenderer.ANIM_UP)
            return
        }
        if (isJumpingDown) {
            sprite.anims.play(GameRenderer.ANIM_DOWN)
            return
        }

        if (canJump) {
            sprite.anims.play(GameRenderer.ANIM_RIGHT, true)
        }
    }

    private addPlatformSprite(body: Matter.Body): Phaser.GameObjects.Sprite {
        const asset = body.data.isSmall ? Assets.PLATFORM_SMALL : Assets.PLATFORM_LARGE
        return this.context.add.sprite(body.position.x, body. position.y, asset)
            .setName(body.idString)
    }

    private addDiamondSprite(body: Matter.Body) {
        const asset = body.data.value > 10 ? Assets.DIAMOND_RED : Assets.DIAMOND_GREEN
        return this.context.add.sprite(body.position.x, body. position.y, asset)
            .setName(body.idString)
    }

    private addPlayerSprite(body: Matter.Body): Phaser.GameObjects.Sprite {
        return this.context.add.sprite(body.position.x, body. position.y, Assets.PLAYER_IDLE)
            .setName(body.idString)
    }
}
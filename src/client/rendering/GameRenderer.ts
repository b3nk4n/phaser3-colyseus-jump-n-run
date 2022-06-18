import Matter from 'matter-js'
import Phaser from 'phaser'

import GameController from '../controllers/GameController'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class GameRenderer {

    private readonly context: Phaser.Scene
    private readonly controller: GameController

    private hud: Hud

    constructor(context: Phaser.Scene, controller: GameController) {
        this.context = context
        this.controller = controller
        this.hud = new Hud(context)
    }

    create(): void {
        // create static objects
        this.context.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const bodies = this.controller.allBodies()
        bodies.forEach(body => {
            if (body.isPlatform) {
                this.addPlatformSprite(body)
            }
        })

        this.hud.create()
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
        })
    }

    private updateDiamond(sprite: Phaser.GameObjects.Sprite | null, body: Matter.Body): void {
        if (sprite == null) {
            this.addDiamondSprite(body)
            return
        }
        sprite.setPosition(body.position.x, body.position.y)
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
}
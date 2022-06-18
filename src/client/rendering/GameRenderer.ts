import Matter from 'matter-js'
import Phaser from 'phaser'

import GameController from '../controllers/GameController'
import MapUtils from '../../shared/utils/MapUtils'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class GameRenderer {

    private readonly context: Phaser.Scene
    private readonly controller: GameController

    private hud: Hud

    private readonly diamondSprites: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>()

    constructor(context: Phaser.Scene, controller: GameController) {
        this.context = context
        this.controller = controller
        this.hud = new Hud(context)
    }

    create(): void {
        this.context.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const bodies = Matter.Composite.allBodies(this.controller.world)
        bodies.forEach(body => {
            if (body.isPlatform) {
                this.createPlatformSprite(body.position.x, body.position.y, body.isSmall)
            }

            if (body.isDiamond) {
                const diamondSprite = this.createDiamondSprite(body.position.x, body.position.y, body.value > 10)
                this.diamondSprites.set(body.id, diamondSprite)
            }
        })

        this.hud.create()
    }

    update(): void {
        this.hud.updateScore(this.controller.score)

        this.updateDiamonds()
    }

    private updateDiamonds() {
        for (const [key, diamond] of this.controller.diamonds.itemMap) {
            const diamondSprite = MapUtils.computeIfAbsent(this.diamondSprites, key, k => {
                return this.createDiamondSprite(0, 0, diamond.value > 10)
            })

            if (diamondSprite) {
                diamondSprite.setPosition(diamond.body.position.x, diamond.body.position.y)
            }
        }

        if (this.controller.diamonds.itemMap.size < this.diamondSprites.size) {
            this.diamondSprites.forEach((diamondSprite, key) => {
                if (this.controller.diamonds.itemMap.get(key) == null) {
                    diamondSprite.destroy()
                    this.diamondSprites.delete(key)
                }
            })
        }
    }

    private createPlatformSprite(x: number, y: number, isSmall: boolean): Phaser.GameObjects.Sprite {
        return this.context.add.sprite(x, y, isSmall ? Assets.PLATFORM_SMALL : Assets.PLATFORM_LARGE)
    }

    private createDiamondSprite(x: number, y: number, highValue: boolean) {
        return this.context.add.sprite(x, y, highValue ? Assets.DIAMOND_RED : Assets.DIAMOND_GREEN)
    }
}
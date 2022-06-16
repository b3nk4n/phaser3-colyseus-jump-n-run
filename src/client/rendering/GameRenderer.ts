import Matter from 'matter-js'
import Phaser from 'phaser'

import GameController from '../controller/GameController'
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
        this.context.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const bodies = Matter.Composite.allBodies(this.controller.world)
        bodies.forEach(body => {
            if (body.isPlatform) {
                this.context.add.sprite(
                    body.position.x, body.position.y,
                    body.isSmall ? Assets.PLATFORM_SMALL : Assets.PLATFORM_LARGE)
            }
        })

        this.hud.create()
    }

    update(): void {
        this.hud.updateScore(this.controller.score)

        // update sprite position of dynamic objects
    }
}
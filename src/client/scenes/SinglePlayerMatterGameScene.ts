import Phaser from 'phaser'

import GameController from '../controllers/GameController'
import { IControls } from '../../shared/types/commons'
import GameRenderer from '../rendering/GameRenderer'
import ArcadePlayer from '../objects/ArcadePlayer'
import { TILE_SIZE } from '../../shared/constants'

export default class SinglePlayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'single-player-matter-game'

    //private player!: ArcadePlayer
    private bombs?: Phaser.Physics.Arcade.Group

    private readonly gameController: GameController
    private readonly gameRenderer: GameRenderer

    constructor() {
        super(SinglePlayerMatterGameScene.KEY)

        this.gameController = new GameController()
        this.gameRenderer = new GameRenderer(this, this.gameController)
    }

    create(): void {
        const { width, height } = this.scale
        this.gameController.create(width, height)
        this.gameRenderer.create()

        // this.player = new ArcadePlayer(this)
        // this.player.create(100, this.scale.height - TILE_SIZE * 1.5)
    }

    update(time: number, delta: number): void {
        this.gameController.update(delta)
        this.gameRenderer.update()
        this.gameController.cleanup()

        const controls = this.keyboardControls()
        // this.player.handleInput(controls)
        // this.player.update(time, delta)
    }

    private keyboardControls(): IControls {
        const cursors = this.input.keyboard.createCursorKeys()
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        return {
            up: cursors.up.isDown,
            left: cursors.left.isDown,
            right: cursors.right.isDown,
            space: spaceKey.isDown
        }
    }
}
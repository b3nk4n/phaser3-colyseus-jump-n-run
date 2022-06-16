import Phaser from 'phaser'

import GameController from '../controller/GameController'
import { IControls } from '../../shared/types/commons'
import GameRenderer from '../rendering/GameRenderer'
import ArcadePlayer from '../objects/ArcadePlayer'
import { TILE_SIZE } from '../../shared/constants'
import Assets from '../assets/Assets'

export default class SinglePlayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'single-player-matter-game'

    private player!: ArcadePlayer
    private diamonds?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group

    private score: number = 0

    private readonly gameController: GameController
    private readonly gameRenderer: GameRenderer

    constructor() {
        super(SinglePlayerMatterGameScene.KEY)

        this.gameController = new GameController(this)
        this.gameRenderer = new GameRenderer(this, this.gameController)
    }

    create(): void {
        this.gameController.create()
        this.gameRenderer.create()

        this.player = new ArcadePlayer(this)
        this.player.create(100, this.scale.height - TILE_SIZE * 1.5)

        this.startGame()
    }

    private startGame(): void {
        this.diamonds = this.createDiamonds()

        this.bombs = this.physics.add.group()
        this.addBomb()

        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        this.physics.add.overlap(this.player.sprite, this.diamonds, this.onCollectDiamond, undefined, this)

        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        const playerBombCollider = this.physics.add.collider(this.player.sprite, this.bombs, this.onBombHit, () => {
            this.physics.world.removeCollider(playerBombCollider)
        }, this)
    }

    private createDiamonds(): Phaser.Physics.Arcade.Group {
        const diamonds = this.physics.add.group()

        for (let i = 0; i < 15; ++i) {
            const isRed = Phaser.Math.RND.frac() > 0.75
            diamonds.create(32 + i * 64, 0, isRed ? Assets.DIAMOND_RED : Assets.DIAMOND_GREEN)
                .setData({
                    value: isRed ? 15 : 10
                })
                .setBounceY(Phaser.Math.FloatBetween(0.8, 0.99))
                .setCollideWorldBounds(true)
        }

        return diamonds
    }

    update(time: number, delta: number): void {
        this.gameController.update(delta)
        this.gameRenderer.update()

        const cursors = this.input.keyboard.createCursorKeys()
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        const controls = this.keyboardControls()
        this.player.handleInput(controls)
        this.player.update(time, delta)
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

    private onCollectDiamond(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                             diamond: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        diamond.disableBody(true, true)
        const diamondValue = diamond.getData('value')
        this.score += diamondValue

        if (this.diamonds?.countActive(true) === 0) {
            this.diamonds.children.iterate((child) => {
                // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
                child.enableBody(true, child.x, 0, true, true)
            })

            this.addBomb()
        }
    }

    private onBombHit(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                      bomb: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): void {
        this.player.kill()
    }

    private addBomb(): void {
        const halfWidth = this.scale.width / 2
        const x = this.player.sprite.x < halfWidth
            ? Phaser.Math.Between(halfWidth, 2 * halfWidth)
            : Phaser.Math.Between(0, halfWidth)

        this.bombs?.create(x, 16, Assets.BOMB)
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
}
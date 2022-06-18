import Phaser from 'phaser'

import { IControls } from '../../shared/types/commons'
import ArcadePlayer from '../objects/ArcadePlayer'
import { TILE_SIZE } from '../../shared/constants'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class SinglePlayerArcadeGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'single-player-arcade-game'

    private player!: ArcadePlayer
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private diamonds?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group

    private level: number = 0
    private score: number = 0
    private hud?: Hud

    private activeControls: IControls = {
        up: false,
        left: false,
        right: false,
        space: false
    }

    constructor() {
        super(SinglePlayerArcadeGameScene.KEY)
    }

    create(): void {
        this.platforms = this.createLevel()

        this.player = new ArcadePlayer(this)
        this.player.create(100, this.scale.height - TILE_SIZE * 1.5)

        this.physics.add.collider(this.player.sprite, this.platforms)

        this.hud = new Hud(this)
        this.hud.create()

        this.startGame()
    }

    private startGame(): void {
        if (!this.platforms) return

        this.diamonds = this.createDiamonds()

        this.bombs = this.physics.add.group()
        this.addBomb()

        this.physics.add.collider(this.diamonds, this.platforms)

        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        this.physics.add.overlap(this.player.sprite, this.diamonds, this.onCollectDiamond, undefined, this)

        this.physics.add.collider(this.bombs, this.platforms)
        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        const playerBombCollider = this.physics.add.collider(this.player.sprite, this.bombs, this.onBombHit, () => {
            this.physics.world.removeCollider(playerBombCollider)
        }, this)
    }

    private createLevel(): Phaser.Physics.Arcade.StaticGroup {
        const { width, height } = this.scale

        const platformDefs = [
            { x: 0.5, y: 0.28, isSmall: true },
            { x: 0.175, y: 0.4, isSmall: true },
            { x: 0.825, y: 0.4, isSmall: true },
            { x: 0.5, y: 0.55, isSmall: false },
            { x: 0.225, y: 0.75, isSmall: false },
            { x: 0.775, y: 0.75, isSmall: false }
        ]

        this.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const platforms = this.physics.add.staticGroup()

        // fixed ground
        platforms.create(width / 2, height - 16, Assets.BACKGROUND, 0, false)
            .setScale(1.0, 32.0 / height)
            .refreshBody()

        platformDefs.forEach(platformDef =>
            platforms.create(
                width * platformDef.x,
                height * platformDef.y,
                platformDef.isSmall ? Assets.PLATFORM_SMALL : Assets.PLATFORM_LARGE
            )
        )

        return platforms
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
        const cursors = this.input.keyboard.createCursorKeys()
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.activeControls.up = cursors.up.isDown
        this.activeControls.left = cursors.left.isDown
        this.activeControls.right = cursors.right.isDown
        this.activeControls.space = spaceKey.isDown

        this.player.handleInput(this.activeControls)
        this.player.update(time, delta)
    }

    private onCollectDiamond(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                             diamond: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        diamond.disableBody(true, true)
        const diamondValue = diamond.getData('value')
        this.score += diamondValue
        this.hud?.updateScore(this.score)

        if (this.diamonds?.countActive(true) === 0) {
            this.level++
            this.hud?.updateLevel(this.level)

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
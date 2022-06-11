import Phaser from 'phaser'

import Player from '../objects/Player'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class GameScene extends Phaser.Scene {
    public static readonly KEY: string = 'game'
    public static readonly TILE_SIZE: number = 32

    private player!: Player
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private diamonds?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group
    private hud?: Hud

    constructor() {
        super(GameScene.KEY)
    }

    create(): void {
        this.platforms = this.createWorld()

        this.player = new Player(this)
        this.player.create()

        this.diamonds = this.createDiamonds()

        this.bombs = this.physics.add.group()

        this.hud = new Hud(this)
        this.hud.create()

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.physics.add.collider(this.diamonds, this.platforms)

        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        this.physics.add.overlap(this.player.sprite, this.diamonds, this.onCollectDiamond, undefined, this)

        this.physics.add.collider(this.bombs, this.platforms)
        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        this.physics.add.collider(this.player.sprite, this.bombs, this.onBombHit, null, this)
    }

    private createWorld(): Phaser.Physics.Arcade.StaticGroup {
        const { width, height } = this.scale

        this.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const platforms = this.physics.add.staticGroup()

        // fixed ground
        platforms.create(width / 2, height - 16, Assets.BACKGROUND, 0, false)
            .setScale(1.0, 32.0 / height)
            .refreshBody()

        const platformDefs = [
            { x: 0.5, y: 0.28, isSmall: true },
            { x: 0.175, y: 0.4, isSmall: true },
            { x: 0.825, y: 0.4, isSmall: true },
            { x: 0.5, y: 0.55, isSmall: false },
            { x: 0.225, y: 0.75, isSmall: false },
            { x: 0.775, y: 0.75, isSmall: false }
        ]

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
            const isRed = Phaser.Math.RND.frac() > 0.75;
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
        this.player.update(time, delta)
    }

    private onCollectDiamond(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                             diamond: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        diamond.disableBody(true, true)
        const diamondValue = diamond.getData('value');
        this.hud?.update(diamondValue)

        if (this.diamonds?.countActive(true) === 0) {
            this.diamonds.children.iterate((child) => {
                // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
                child.enableBody(true, child.x, 0, true, true)
            })

            const x = player.x < 400
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400)

            this.bombs?.create(x, 16, Assets.BOMB)
                .setBounce(1)
                .setCollideWorldBounds(true)
                .setVelocity(Phaser.Math.Between(-200, 200), 20)
        }
    }

    private onBombHit(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                      bomb: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): void {
        this.physics.pause()

        this.player.kill()
    }
}
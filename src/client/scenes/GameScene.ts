import Phaser from 'phaser'

import Assets from '../assets/Assets'
import Player from '../objects/Player'
import Hud from '../ui/Hud'

export default class GameScene extends Phaser.Scene {
    public static readonly KEY: string = 'game'

    private player!: Player
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private stars?: Phaser.Physics.Arcade.Group
    private hud?: Hud

    constructor() {
        super(GameScene.KEY)
    }

    create(): void {
        this.platforms = this.createWorld()
        this.player = new Player(this)
        this.player.create()
        this.stars = this.createStars(12)
        this.hud = new Hud(this)
        this.hud.create()

        this.physics.add.collider(this.player.sprite, this.platforms)
        this.physics.add.collider(this.stars, this.platforms)

        this.physics.add.overlap(this.player.sprite, this.stars, this.onCollectStar, undefined, this)
    }

    private createWorld(): Phaser.Physics.Arcade.StaticGroup {
        const {width, height} = this.scale

        this.add.image(0, 0, Assets.SKY)
            .setOrigin(0, 0)

        const platforms = this.physics.add.staticGroup()

        const platformWidth = 400
        const platformHeight = 32
        const floorScale = 2
        platforms.create(width / 2, height, Assets.PLATFORM)
            .setScale(floorScale)
            .refreshBody()

        platforms.create(width - platformWidth / 4, height / 2 + 4 * platformHeight, Assets.PLATFORM)
        platforms.create(platformWidth / 4, height / 2 + 4 * platformHeight, Assets.PLATFORM)
        platforms.create(width / 2, height / 2, Assets.PLATFORM)
        platforms.create(width - platformWidth / 3, height / 2 - 4 * platformHeight, Assets.PLATFORM)
        platforms.create(platformWidth / 3, height / 2 - 4 * platformHeight, Assets.PLATFORM)
        return platforms
    }

    private createStars(numStars: number): Phaser.Physics.Arcade.Group {
        const stars = this.physics.add.group({
            key: Assets.STAR,
            repeat: numStars - 1,
            setXY: {
                x: 12,
                y: 0,
                stepX: 70
            }
        })
        stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.8, 0.99))
        })
        return stars
    }

    update(time: number, delta: number): void {
        this.player.update(time, delta)
    }

    private onCollectStar(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, star: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        // FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        star.disableBody(true, true)

        this.hud?.update(10)
    }
}
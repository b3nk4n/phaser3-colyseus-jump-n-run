import Phaser from 'phaser'

import Assets from '../assets/Assets'
import Player from '../objects/Player'

export default class GameScene extends Phaser.Scene {
    public static readonly KEY: string = 'game'


    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private player!: Player

    constructor() {
        super(GameScene.KEY)
    }

    create() {
        this.platforms = this.createWorld()
        this.player = new Player(this)
        this.player.create()

        this.physics.add.collider(this.player.sprite, this.platforms)
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

    update(time: number, delta: number) {
        this.player.update(time, delta)
    }
}
import Phaser from 'phaser'

import Assets from '../assets/Assets'

export default class GameScene extends Phaser.Scene {
    public static readonly KEY = 'game'

    private assets: Assets
    private platforms?: Phaser.Physics.Arcade.StaticGroup

    constructor() {
        super(GameScene.KEY)
        this.assets = new Assets(this)
    }

    preload() {
        this.assets.load()
    }

    create() {
        const {width, height} = this.scale

        this.add.image(0, 0, Assets.SKY)
            .setOrigin(0, 0)

        this.platforms = this.physics.add.staticGroup()

        const platformWidth = 400
        const platformHeight = 32
        const floorScale = 2
        this.platforms.create(width / 2, height, Assets.PLATFORM)
            .setScale(floorScale)
            .refreshBody();

        this.platforms.create(width - platformWidth / 4, height / 2 + 4 * platformHeight, Assets.PLATFORM)
        this.platforms.create(platformWidth / 4, height / 2 + 4 * platformHeight, Assets.PLATFORM)
        this.platforms.create(width / 2, height / 2, Assets.PLATFORM)
        this.platforms.create(width - platformWidth / 3, height / 2 - 4 * platformHeight, Assets.PLATFORM)
        this.platforms.create(platformWidth / 3, height / 2 - 4 * platformHeight, Assets.PLATFORM)
    }
}
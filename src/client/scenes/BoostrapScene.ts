import Phaser from 'phaser'

import GameScene from '../../client/scenes/GameScene'
import Assets from '../assets/Assets'

export default class BoostrapScene extends Phaser.Scene {
    private static readonly KEY: string = 'bootstrap'

    private assets: Assets

    constructor() {
        super(BoostrapScene.KEY)
        this.assets = new Assets(this)
    }

    init(): void {
    }

    preload(): void {
        this.assets.load()
    }

    create(): void {
        this.scene.launch(GameScene.KEY)
    }
}
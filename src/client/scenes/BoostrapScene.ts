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

    init() {
    }

    preload() {
        this.assets.load()
    }

    create() {
        this.scene.launch(GameScene.KEY)
    }
}
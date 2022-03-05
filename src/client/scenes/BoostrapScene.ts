import Phaser from 'phaser'

import GameScene from '../../client/scenes/GameScene'

export default class BoostrapScene extends Phaser.Scene {
    private static readonly KEY = 'bootstrap'

    constructor() {
        super(BoostrapScene.KEY)
    }

    init() {
    }

    create() {
        this.scene.launch(GameScene.KEY)
    }
}
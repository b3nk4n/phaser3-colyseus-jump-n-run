import 'regenerator-runtime/runtime'
import Phaser from 'phaser'

import BootstrapScene from './scenes/BoostrapScene'
import GameScene from './scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: true
        }
    },
    scene: [BootstrapScene, GameScene]
}

export default new Phaser.Game(config)

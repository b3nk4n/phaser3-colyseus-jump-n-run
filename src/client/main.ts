import 'regenerator-runtime/runtime'
import Phaser from 'phaser'

import MatterTestScene from './scenes/MatterTestScene'
import BootstrapScene from './scenes/BoostrapScene'
import GameScene from './scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: true
        }
    },
    scene: [BootstrapScene, GameScene, MatterTestScene]
}

export default new Phaser.Game(config)

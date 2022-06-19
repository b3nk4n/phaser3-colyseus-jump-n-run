import 'regenerator-runtime/runtime'
import Phaser from 'phaser'

import SinglePlayerArcadeGameScene from './scenes/SinglePlayerArcadeGameScene'
import SinglePlayerMatterGameScene from './scenes/SinglePlayerMatterGameScene'
import MatterTestScene from './scenes/MatterTestScene'
import BootstrapScene from './scenes/BoostrapScene'
import GameScene from './scenes/GameScene'

export const DEBUG_MODE: boolean = true

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: DEBUG_MODE
        }
    },
    scene: [
        BootstrapScene,
        GameScene,
        SinglePlayerArcadeGameScene,
        SinglePlayerMatterGameScene,
        MatterTestScene]
}

export default new Phaser.Game(config)

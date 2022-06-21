import 'regenerator-runtime/runtime'
import Phaser from 'phaser'

import SinglePlayerArcadeGameScene from './scenes/SinglePlayerArcadeGameScene'
import SinglePlayerMatterGameScene from './scenes/SinglePlayerMatterGameScene'
import MatterTestScene from './scenes/MatterTestScene'
import TextOverlay from './ui/overlays/TextOverlay'
import BootstrapScene from './scenes/BoostrapScene'
import GameScene from './scenes/GameScene'
import MenuScene from './scenes/MenuScene'

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
        MenuScene,
        GameScene,
        SinglePlayerArcadeGameScene,
        SinglePlayerMatterGameScene,
        TextOverlay,
        MatterTestScene]
}

export default new Phaser.Game(config)

import Phaser from 'phaser'

import { GamePhase, IControls } from '../../shared/types/commons'
import GameController from '../controllers/GameController'
import { PLAYER_CONFIG } from '../../shared/constants'
import TextOverlay from '../ui/overlays/TextOverlay'
import GameRenderer from '../rendering/GameRenderer'
import MenuScene from '../scenes/MenuScene'

export default class SinglePlayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'single-player-matter-game'

    private gameController!: GameController
    private gameRenderer!: GameRenderer

    private keyboardKeys: any

    constructor() {
        super(SinglePlayerMatterGameScene.KEY)
    }

    init(): void {
    
        this.keyboardKeys = {
            cursors: this.input.keyboard.createCursorKeys(),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        }
    }

    create(): void {
        const { width, height } = this.scale

        this.gameController = new GameController(width, height, 1)
        
        this.gameRenderer = new GameRenderer(this, this.gameController)

        this.gameController.onGamePhaseChanged((newPhase, oldPhase) => {
            if (oldPhase === GamePhase.WAITING && newPhase == GamePhase.READY) {
                this.scene.stop(TextOverlay.KEY)
                this.scene.launch(TextOverlay.KEY, {
                    title: 'Press SPACE to start...'
                })
            } else if (oldPhase === GamePhase.READY && newPhase == GamePhase.PLAYING) {
                this.scene.stop(TextOverlay.KEY)
            } else if (oldPhase === GamePhase.PLAYING && newPhase == GamePhase.PAUSED) {
                this.scene.launch(TextOverlay.KEY, {
                    title: 'PAUSED',
                    text: 'Press SPACE to continue or ESC to quit'
                })
            } else if (oldPhase === GamePhase.PAUSED && newPhase == GamePhase.PLAYING) {
                this.scene.stop(TextOverlay.KEY)
            } else if (oldPhase === GamePhase.PLAYING && newPhase == GamePhase.GAME_OVER) {
                this.scene.launch(TextOverlay.KEY, {
                    title: 'GAME OVER',
                    text: 'Press SPACE to continue'
                })
            } else if (oldPhase === GamePhase.GAME_OVER && newPhase != GamePhase.TERMINATED) {
                this.gameRenderer.reset()
            } else if (newPhase === GamePhase.TERMINATED) {
                this.scene.stop(TextOverlay.KEY)
                this.scene.stop(SinglePlayerMatterGameScene.KEY)
                this.scene.start(MenuScene.KEY)
            }
        });

        this.input.keyboard.on('keyup-SPACE', () => {
            this.gameController.handleConfirmSignal()
        })
        this.input.keyboard.on('keyup-ESC', () => {
            this.gameController.handleCancelSignal()
        })

        // start with initial overlay
        this.scene.launch(TextOverlay.KEY, {
            title: 'Waiting for other players...',
            text: 'Press ESC to quite'
        })

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keyup-SPACE')
            this.input.keyboard.off('keyup-ESC')

            this.gameController.dispose()
            this.gameRenderer.dispose()
        });

        this.gameController.registerPlayer(PLAYER_CONFIG[0])
    }

    update(time: number, delta: number): void {
        const controls = this.keyboardControls()

        this.gameController.setPlayerControls(0, controls)
        this.gameController.update(delta)
        this.gameRenderer.update()
        this.gameController.cleanup()
    }

    private keyboardControls(): IControls {
        const { cursors, space } = this.keyboardKeys
        return {
            up: cursors.up.isDown,
            left: cursors.left.isDown,
            right: cursors.right.isDown,
            actionKey: space.isDown
        }
    }
}
import Phaser from 'phaser'

import { GamePhase, IControls } from '../../shared/types/commons'
import GameController from '../controllers/GameController'
import { PLAYER_CONFIG } from '../../shared/constants'
import TextOverlay from '../ui/overlays/TextOverlay'
import GameRenderer from '../rendering/GameRenderer'
import MenuScene from '../scenes/MenuScene'

export default class LocalMultiplayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'local-multiplayer-matter-game'

    private numPlayers!: number

    private gameController!: GameController
    private gameRenderer!: GameRenderer

    private keyboardKeys: any[] = []

    constructor() {
        super(LocalMultiplayerMatterGameScene.KEY)
    }

    init({ numPlayers }): void {
        if (numPlayers < 1 || numPlayers > PLAYER_CONFIG.length) {
            throw Error(`The requested number of ${numPlayers} players is not support.`)
        }

        this.numPlayers = numPlayers

        this.initKeyboardKeys()
    }

    private initKeyboardKeys(): void {
        this.keyboardKeys.push({
            cursors: this.input.keyboard.createCursorKeys(),
            action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        })
        if (this.numPlayers > 1) {
            this.keyboardKeys.push({
                cursors: this.input.keyboard.addKeys({ left: 'A', right: 'D', up: 'W' }),
                action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
            })
        }
        if (this.numPlayers > 2) {
            this.keyboardKeys.push({
                cursors: this.input.keyboard.addKeys({ left: 'J', right: 'L', up: 'I' }),
                action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U)
            })
        }
    }

    create(): void {
        const { width, height } = this.scale
        
        this.gameController = new GameController(width, height, this.numPlayers)
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
                this.scene.stop(LocalMultiplayerMatterGameScene.KEY)
                this.scene.start(MenuScene.KEY)
            }
        })

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
            this.keyboardKeys = []
            this.input.keyboard.off('keyup-SPACE')
            this.input.keyboard.off('keyup-ESC')

            this.gameController.dispose()
            this.gameRenderer.dispose()
        });

        for (let i = 0; i < this.numPlayers; ++i) {
            this.gameController.registerPlayer(PLAYER_CONFIG[i])
        }
    }

    update(time: number, delta: number): void {
        for (let pIdx = 0; pIdx < this.numPlayers; ++pIdx) {
            const controls = this.keyboardControls(pIdx)
            this.gameController.setPlayerControls(pIdx, controls)
        }

        this.gameController.update(delta)
        this.gameRenderer.update()
        this.gameController.cleanup()
    }

    private keyboardControls(playerIdx: number): IControls {
        const { cursors, action } = this.keyboardKeys[playerIdx]
        return {
            up: cursors.up.isDown,
            left: cursors.left.isDown,
            right: cursors.right.isDown,
            actionKey: action.isDown
        }
    }
}
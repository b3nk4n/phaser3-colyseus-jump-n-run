import Phaser from 'phaser'

import { GamePhase, IControls } from '../../shared/types/commons'
import GameController from '../controllers/GameController'
import TextOverlay from '../ui/overlays/TextOverlay'
import GameRenderer from '../rendering/GameRenderer'
import MenuScene from '../scenes/MenuScene'

export default class LocalMultiplayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'local-multiplayer-matter-game'

    private static readonly NUM_PLAYERS = 2

    private gameController!: GameController
    private gameRenderer!: GameRenderer

    private keyboardKeys: any[] = []

    constructor() {
        super(LocalMultiplayerMatterGameScene.KEY)
    }

    init(): void {
        this.keyboardKeys.push({
            cursors: this.input.keyboard.createCursorKeys(),
            action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        })
        this.keyboardKeys.push({
            cursors: this.input.keyboard.addKeys({ left: 'A', right: 'D', up: 'W' }),
            action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        })
    }

    create(): void {
        const { width, height } = this.scale

        this.gameController = new GameController(width, height, LocalMultiplayerMatterGameScene.NUM_PLAYERS)
        this.gameRenderer = new GameRenderer(this, this.gameController)

        this.gameController.onGamePhaseChanged((newPhase, oldPhase) => {
            if (oldPhase === GamePhase.WAITING && newPhase == GamePhase.READY) {
                this.scene.stop(TextOverlay.KEY)
                this.scene.launch(TextOverlay.KEY, {
                    title: 'Waiting for other players...',
                    text: 'Press ESC to quite'
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
            }
        })

        this.gameRenderer.create()

        this.input.keyboard.on('keyup-SPACE', () => {
            const phase = this.gameController.gamePhase
            if (phase === GamePhase.WAITING) {
                this.gameController.ready()
            } else if (phase === GamePhase.PAUSED) {
                this.gameController.resume()
            } else if (phase === GamePhase.GAME_OVER) {
                this.gameRenderer.reset()
                this.gameController.restart()
            }
        })
        this.input.keyboard.on('keyup-ESC', () => {
            const phase = this.gameController.gamePhase
            if (phase === GamePhase.WAITING ||
                phase === GamePhase.READY ||
                phase === GamePhase.PAUSED ||
                phase === GamePhase.GAME_OVER) {
                this.scene.stop(TextOverlay.KEY)
                this.scene.stop(LocalMultiplayerMatterGameScene.KEY)
                this.scene.start(MenuScene.KEY)
                this.gameController.leave()
            } else if (phase === GamePhase.PLAYING) {
                this.gameController.pause()
            }
        })

        // start with initial overlay
        this.scene.launch(TextOverlay.KEY, {
            title: 'Press SPACE to start...'
        })

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keyup-SPACE')
            this.input.keyboard.off('keyup-ESC')

            this.gameController.dispose()
            this.gameRenderer.dispose()
        });
    }

    update(time: number, delta: number): void {
        for (let pIdx = 0; pIdx < LocalMultiplayerMatterGameScene.NUM_PLAYERS; ++pIdx) {
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
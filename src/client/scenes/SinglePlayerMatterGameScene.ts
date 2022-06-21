import Phaser from 'phaser'

import { GamePhase, IControls } from '../../shared/types/commons'
import GameController from '../controllers/GameController'
import TextOverlay from '../ui/overlays/TextOverlay'
import GameRenderer from '../rendering/GameRenderer'
import MenuScene from '../scenes/MenuScene'

export default class SinglePlayerMatterGameScene extends Phaser.Scene {
    public static readonly KEY: string = 'single-player-matter-game'

    private gameController!: GameController
    private gameRenderer!: GameRenderer

    constructor() {
        super(SinglePlayerMatterGameScene.KEY)
    }

    init(): void {
        this.gameController = new GameController()
        this.gameRenderer = new GameRenderer(this, this.gameController)
    }

    create(): void {
        const { width, height } = this.scale

        this.gameController.create(width, height)
        this.gameController.gamePhaseChangedCallback = (newPhase, oldPhase) => {
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
                    title: 'GAME OVER'
                })
            }
        }

        this.gameRenderer.create()

        this.input.keyboard.on('keyup-SPACE', () => {
            const phase = this.gameController.phase
            if (phase === GamePhase.WAITING) {
                this.gameController.ready()
            } else if (phase === GamePhase.PAUSED) {
                this.gameController.resume()
            } else if (phase === GamePhase.GAME_OVER) {
                this.gameController.restart()
            }
        })
        this.input.keyboard.on('keyup-ESC', () => {
            const phase = this.gameController.phase
            if (phase === GamePhase.WAITING ||
                phase === GamePhase.READY ||
                phase === GamePhase.PAUSED ||
                phase === GamePhase.GAME_OVER) {
                this.scene.stop(TextOverlay.KEY)
                this.scene.stop(SinglePlayerMatterGameScene.KEY)
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
        const controls = this.keyboardControls()

        this.gameController.update(delta, controls)
        this.gameRenderer.update()
        this.gameController.cleanup()
    }

    private keyboardControls(): IControls {
        // TODO register keys in init(), and only return the values here? Does this currently create a lot of GC?
        const cursors = this.input.keyboard.createCursorKeys()
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        return {
            up: cursors.up.isDown,
            left: cursors.left.isDown,
            right: cursors.right.isDown,
            space: spaceKey.isDown
        }
    }
}
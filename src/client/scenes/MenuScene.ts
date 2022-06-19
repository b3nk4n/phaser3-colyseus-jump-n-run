import Phaser from 'phaser'

import SinglePlayerMatterGameScene from './SinglePlayerMatterGameScene'
import SinglePlayerArcadeGameScene from './SinglePlayerArcadeGameScene'
import RoomClient from '../services/GameRoomClient'
import Assets from '../assets/Assets'

export default class MenuScene extends  Phaser.Scene {
    public static readonly KEY: string = 'menu'
    private static readonly EVENT_SELECTED = 'selected';

    private keys!: any

    private buttons: Phaser.GameObjects.Image[] = []
    private selectedButtonIndex: number = 0

    constructor() {
        super(MenuScene.KEY)
    }

    public init(): void {
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER
        })
    }

    public create(): void {
        const { width, height } = this.scale

        this.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const playArcadeButton = this.add.image(width * 0.5, height * 0.45, Assets.BUTTON)
        playArcadeButton.on(MenuScene.EVENT_SELECTED, () => {
            this.scene.start(SinglePlayerArcadeGameScene.KEY)
        }, this)
        this.add.text(playArcadeButton.x, playArcadeButton.y, 'Single Player: Arcade')
            .setOrigin(0.5)

        const playMatterButton = this.add.image(playArcadeButton.x, playArcadeButton.y + playArcadeButton.displayHeight + 16, Assets.BUTTON)
        playMatterButton.on(MenuScene.EVENT_SELECTED, () => {
            this.scene.start(SinglePlayerMatterGameScene.KEY, {
                roomClient: new RoomClient()
            })
        }, this)
        this.add.text(playMatterButton.x, playMatterButton.y, 'Single Player: MatterJS')
            .setOrigin(0.5) // TODO ui/TextButton.ts

        this.buttons.push(playArcadeButton)
        this.buttons.push(playMatterButton)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            // cleanup button events
            playArcadeButton.off(MenuScene.EVENT_SELECTED)
            playMatterButton.off(MenuScene.EVENT_SELECTED)
        })

        this.refreshButtonColors()
    }

    public update(): void {
        const { up, down, w, s, space, enter } = this.keys

        const keys = Phaser.Input.Keyboard
        if (keys.JustDown(up) || keys.JustDown(w)) {
            this.selectPrevious()
        } else if (keys.JustDown(down)|| keys.JustDown(s)) {
            this.selectNext()
        } else if (keys.JustDown(space) || keys.JustDown(enter)) {
            this.submit()
        }
    }

    private refreshButtonColors(): void {
        const currentButton = this.buttons[this.selectedButtonIndex]
        this.buttons.forEach(button => button.setTint(0xffffff))
        currentButton.setTint(0x99ff99)
    }

    private selectPrevious(): void {
        this.selectedButtonIndex--
        if (this.selectedButtonIndex < 0) {
            this.selectedButtonIndex = this.buttons.length - 1
        }
        this.refreshButtonColors()
    }

    private selectNext(): void {
        this.selectedButtonIndex = (this.selectedButtonIndex + 1) % this.buttons.length
        this.refreshButtonColors()
    }

    private submit(): void {
        const button = this.buttons[this.selectedButtonIndex]
        button.emit(MenuScene.EVENT_SELECTED)
    }
}
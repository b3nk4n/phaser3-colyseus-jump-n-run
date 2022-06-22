import Phaser from 'phaser'

import LocalMultiplayerMatterGameScene from './LocalMultiplayerMatterGameScene'
import SinglePlayerMatterGameScene from './SinglePlayerMatterGameScene'
import SinglePlayerArcadeGameScene from './SinglePlayerArcadeGameScene'
import GameScene from '../scenes/GameScene'
import TextButton from '../ui/TextButton'
import Assets from '../assets/Assets'

export default class MenuScene extends Phaser.Scene {
    public static readonly KEY: string = 'menu'

    private keys!: any

    private buttons: TextButton[] = []
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

        this.add.text(width * 0.5, height * 0.2, 'Select Game Mode', {
            fontSize: '48px'
        }).setOrigin(0.5)

        this.add.text(width * 0.5, height * 0.325, 'Single-Player', {
            fontSize: '32px'
        }).setOrigin(0.5)

        this.add.text(width * 0.5, height * 0.625, 'Multiplayer', {
            fontSize: '32px'
        }).setOrigin(0.5)

        this.buttons.push(...[
            new TextButton(this, width * 0.5, height * 0.4, 'Arcade Physics')
                .onSelect(() => this.scene.start(SinglePlayerArcadeGameScene.KEY)),
            new TextButton(this, width * 0.5, height * 0.5, 'MatterJS Physics')
                .onSelect(() => this.scene.start(SinglePlayerMatterGameScene.KEY)),
            new TextButton(this, width * 0.5, height * 0.7, 'Local 2 Player Battle')
                .onSelect(() => this.scene.start(LocalMultiplayerMatterGameScene.KEY)),
            new TextButton(this, width * 0.5, height * 0.8, 'Online Battle')
                .onSelect(() => this.scene.start(GameScene.KEY)),
        ])

        // Reset index in create() method because a stopped scene is not removed but just not active.
        // Consequently, when returning to the menu, the variable values of the previous session are still present.
        this.selectedButtonIndex = 0

        this.refreshButtonColors()

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.buttons.forEach(button => button.dispose())
            this.buttons = []
        })
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
        this.buttons.forEach((button, idx) =>
            idx === this.selectedButtonIndex ? button.focus() : button.unfocus())
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
        this.buttons[this.selectedButtonIndex].select()
    }
}
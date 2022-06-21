import Phaser from 'phaser'

export default class Hud {

    private scoreValue: number = 0
    private scoreText?: Phaser.GameObjects.Text

    private levelValue: number = 1
    private levelText?: Phaser.GameObjects.Text

    private statusText?: Phaser.GameObjects.Text // TODO remove status text, and use overlay instead

    private readonly context: Phaser.Scene

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public create(): void {
        const { width, height } = this.context.scale

        this.scoreText = this.context.add.text(
            16, 16,
            this.formatScore(this.scoreValue),
            {
                fontSize: '28px',
                color: '#FFF'
            })

        this.levelText = this.context.add.text(
            width - 148, 16,
            this.formatLevel(this.levelValue),
            {
                fontSize: '28px',
                color: '#FFF'
            })

        this.statusText = this.context.add.text(width / 2, height / 2, '')
            .setColor('#FFF')
            .setFontSize(48)
            .setOrigin(0.5)
            .setVisible(false)
    }

    public dispose(): void {
        this.statusText?.destroy()
        this.levelText?.destroy()
        this.statusText?.destroy()
    }

    public updateScore(value: number): void {
        if (value != this.scoreValue) {
            this.scoreValue = value
            this.scoreText?.setText(this.formatScore(value))
        }
    }

   public updateLevel(value: number): void {
        if (value != this.levelValue) {
            this.levelValue = value
            this.levelText?.setText(this.formatLevel(value))
        }
    }

    public showMessage(statusMessage: string): void {
        this.statusText?.setText(statusMessage)
            .setVisible(true)
    }

    public clearMessage(): void {
        this.statusText?.setText('')
            .setVisible(false)
    }

    private toZeroPaddedString(value: number, places: number): string {
        return String(value).padStart(places, '0')
    }

    private formatScore(value: number): string {
        return 'SCORE ' + this.toZeroPaddedString(value, 6)
    }

    private formatLevel(value: number): string {
        return 'LEVEL ' + this.toZeroPaddedString(value, 2)
    }
}
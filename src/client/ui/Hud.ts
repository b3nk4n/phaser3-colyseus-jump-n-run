import Phaser from 'phaser'

export default class Hud {

    private score: number = 0
    private text?: Phaser.GameObjects.Text

    private statusText?: Phaser.GameObjects.Text

    private readonly context: Phaser.Scene

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    create(): void {
        this.text = this.context.add.text(
            16, 16,
            'SCORE ' + this.score,
            {
                fontSize: '28px',
                color: '#FFF'
            })

        const { width, height } = this.context.scale
        this.statusText = this.context.add.text(width / 2, height / 2, '')
            .setColor('#FFF')
            .setFontSize(48)
            .setOrigin(0.5)
            .setVisible(false)
    }

    updateScore(scoreDelta: number): void {
        this.score += scoreDelta
        this.text?.setText('SCORE ' + this.score)
    }

    updateStatus(statusMessage: string): void {
        this.statusText?.setText(statusMessage)
            .setVisible(true)
    }

    clearStatus(): void {
        this.statusText?.setText('')
            .setVisible(false)
    }
}
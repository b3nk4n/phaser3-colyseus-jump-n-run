import Phaser from 'phaser'

import { PLAYER_CONFIG } from '../../shared/constants'

export default class Hud {

    private scoreValues: number[] = []
    private scoreTexts: Phaser.GameObjects.Text[] = []

    private levelValue: number = 1
    private levelText?: Phaser.GameObjects.Text

    private statusText?: Phaser.GameObjects.Text // TODO remove status text, and use overlay instead

    private readonly context: Phaser.Scene

    constructor(context: Phaser.Scene) {
        this.context = context

        const { width, height } = this.context.scale

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

    public reset(): void {
        this.scoreValues = []
        this.scoreTexts.forEach(scoreText => scoreText.destroy())
        this.scoreTexts = []
        this.levelValue = 1
    }

    public addPlayer(): void {
        const playerIdx = this.scoreValues.length
        this.scoreValues.push(0)
        const scoreText = this.context.add.text(
            16, 16 + playerIdx * 32,
            this.formatScore(0),
            {
                fontSize: '28px',
                color: '#FFF'
            })
            .setTint(PLAYER_CONFIG[playerIdx].color)
        this.scoreTexts.push(scoreText)
    }

    public dispose(): void {
        this.scoreTexts.forEach(scoreText => scoreText.destroy())
        this.levelText?.destroy()
        this.statusText?.destroy()
    }

    public updateScore(playerIdx: number, value: number): void {
        const scoreText = this.scoreTexts[playerIdx]
        if (value != this.scoreValues[playerIdx]) {
            this.scoreValues[playerIdx] = value
            scoreText.setText(this.formatScore(value))
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
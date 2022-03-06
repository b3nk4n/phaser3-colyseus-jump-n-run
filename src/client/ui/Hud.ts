import Phaser from 'phaser'

export default class Hud {

    private score: number = 0
    private text?: Phaser.GameObjects.Text

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
    }

    update(scoreDelta: number): void {
        this.score += scoreDelta
        this.text?.setText('SCORE ' + this.score)
    }
}
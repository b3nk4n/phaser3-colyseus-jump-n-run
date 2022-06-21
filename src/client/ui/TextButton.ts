import Phaser from 'phaser'

import Assets from '../assets/Assets'

export default class TextButton {
    private static readonly EVENT_SELECTED = 'selected';

    private context: Phaser.Scene
    private buttonImage: Phaser.GameObjects.Image

    constructor(context: Phaser.Scene, x: number, y: number, text: string) {
        this.context = context
        this.buttonImage = context.add.image(x, y, Assets.BUTTON)
        context.add.text(x, y, text)
            .setOrigin(0.5)
    }

    public onSelect(handler: () => void): TextButton {
        this.buttonImage.on(TextButton.EVENT_SELECTED, handler)
        return this
    }

    public select(): void {
        this.buttonImage.emit(TextButton.EVENT_SELECTED)
    }

    public focus(): TextButton {
        this.buttonImage.setTint(0x99ff99)
        return this
    }

    public unfocus(): TextButton {
        this.buttonImage.setTint(0xffffff)
        return this
    }

    public dispose(): void {
        this.buttonImage.off(TextButton.EVENT_SELECTED)
        this.buttonImage.destroy()
    }
}
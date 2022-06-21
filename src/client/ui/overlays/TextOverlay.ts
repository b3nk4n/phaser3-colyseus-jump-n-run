import Phaser from 'phaser'

import Assets from '../../assets/Assets'

export interface IOverlayData {
    title: string
    text?: string
}

export default class TextOverlay extends Phaser.Scene {
    public static readonly KEY: string = 'text-overlay'

    constructor() {
        super(TextOverlay.KEY)
    }

    public create({ title, text }: IOverlayData): void {
        const { width, height } = this.scale
        this.add.image(0, 0, Assets.STATIC)
            .setDisplaySize(width, height)
            .setTintFill(0x000000)
            .setAlpha(0.66)
            .setOrigin(0, 0)

        this.add.text(width / 2, height * 0.5, title, {
            fontSize: '48px'
        }).setOrigin(0.5)

        if (text) {
            this.add.text(width / 2, height * 0.6, text, {
                fontSize: '32px'
            }).setOrigin(0.5)
        }
    }
}
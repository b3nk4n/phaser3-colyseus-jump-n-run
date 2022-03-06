import Phaser from 'phaser'

export default class Assets {

    public static readonly SKY = 'sky'
    public static readonly PLATFORM = 'platform'
    public static readonly STAR = 'star'
    public static readonly BOMB = 'bomb'
    public static readonly PLAYER = 'player'

    private readonly context: Phaser.Scene

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public load(): void {
        const loader = this.context.load
        loader.image(Assets.SKY, 'assets/sky.png')
        loader.image(Assets.PLATFORM, 'assets/platform.png')
        loader.image(Assets.STAR, 'assets/star.png')
        loader.image(Assets.BOMB, 'assets/bomb.png')
        loader.spritesheet(Assets.PLAYER,
            'assets/dude.png',
            {
                frameWidth: 32,
                frameHeight: 48
            }
        )
    }
}
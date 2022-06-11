import Phaser from 'phaser'

export default class Assets {

    public static readonly BACKGROUND: string = 'background'
    public static readonly PLATFORM_SMALL: string = 'platform-small'
    public static readonly PLATFORM_LARGE: string = 'platform-large'
    public static readonly DIAMOND_GREEN: string = 'diamond-green'
    public static readonly DIAMOND_RED: string = 'diamond-red'
    public static readonly BOMB: string = 'bomb'
    public static readonly PLAYER_IDLE: string = 'player-idle'
    public static readonly PLAYER_RUN_RIGHT: string = 'player-run'
    public static readonly PLAYER_JUMP_UP: string = 'player-jump-up'
    public static readonly PLAYER_JUMP_DOWN: string = 'player-jump-down'
    public static readonly PLAYER_DEAD: string = 'player-dead'

    private readonly context: Phaser.Scene

    constructor(context: Phaser.Scene) {
        this.context = context
    }

    public load(): void {
        const loader = this.context.load
        loader.image(Assets.BACKGROUND, 'assets/background.png')
        loader.image(Assets.PLATFORM_SMALL, 'assets/platform160.png')
        loader.image(Assets.PLATFORM_LARGE, 'assets/platform320.png')
        loader.image(Assets.DIAMOND_GREEN, 'assets/diamond_green.png')
        loader.image(Assets.DIAMOND_RED, 'assets/diamond_red.png')
        loader.image(Assets.BOMB, 'assets/bomb.png')
        loader.spritesheet(Assets.PLAYER_IDLE,
            'assets/player_idle_10.png',
            {
                frameWidth: 32,
                frameHeight: 32
            }
        )
        loader.spritesheet(Assets.PLAYER_RUN_RIGHT,
            'assets/player_run_right_6.png',
            {
                frameWidth: 32,
                frameHeight: 32
            }
        )
        loader.image(Assets.PLAYER_JUMP_UP, 'assets/player_jump_up.png')
        loader.image(Assets.PLAYER_JUMP_DOWN, 'assets/player_jump_down.png')
        loader.image(Assets.PLAYER_DEAD, 'assets/player_dead.png')
    }
}
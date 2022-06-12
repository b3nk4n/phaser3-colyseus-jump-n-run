import Phaser from 'phaser'

import IGameState, {GamePhase} from '../../server/schema/GameState'
import RoomClient from '../services/GameRoomClient'
import Level from '../../server/schema/Level'
import Player from '../objects/Player'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'


export interface IGameSceneData {
    roomClient: RoomClient
}

export default class GameScene extends Phaser.Scene {
    public static readonly KEY: string = 'game'
    public static readonly TILE_SIZE: number = 32

    private roomClient?: RoomClient

    private player!: Player
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private diamonds?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group
    private hud?: Hud

    constructor() {
        super(GameScene.KEY)
    }

    async create(data: IGameSceneData): Promise<void> {
        this.roomClient = data.roomClient

        if (!this.roomClient) {
            throw new Error('Server connection is not available')
        }

        await this.roomClient.join()
        this.roomClient.onStateInitialized(this.initGame, this)
    }

    private initGame(state: IGameState) {
        this.platforms = this.createLevel(state.level)

        this.player = new Player(this)
        this.player.create()

        this.physics.add.collider(this.player.sprite, this.platforms)

        this.hud = new Hud(this)
        this.hud.create()

        this.handlePhaseChanged(state.phase)
        this.roomClient?.onPhaseChanged(this.handlePhaseChanged, this)
    }

    private startGame(): void {
        if (!this.platforms) return

        this.diamonds = this.createDiamonds()

        this.bombs = this.physics.add.group()
        this.addBomb()

        this.physics.add.collider(this.diamonds, this.platforms)

        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        this.physics.add.overlap(this.player.sprite, this.diamonds, this.onCollectDiamond, undefined, this)

        this.physics.add.collider(this.bombs, this.platforms)
        // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
        const playerBombCollider = this.physics.add.collider(this.player.sprite, this.bombs, this.onBombHit, () => {
            this.physics.world.removeCollider(playerBombCollider)
        }, this)
    }

    private createLevel(level: Level): Phaser.Physics.Arcade.StaticGroup {
        const { width, height } = this.scale

        this.add.image(0, 0, Assets.BACKGROUND)
            .setOrigin(0, 0)

        const platforms = this.physics.add.staticGroup()

        // fixed ground
        platforms.create(width / 2, height - 16, Assets.BACKGROUND, 0, false)
            .setScale(1.0, 32.0 / height)
            .refreshBody()

        level.platformDefs.forEach(platformDef =>
            platforms.create(
                width * platformDef.x,
                height * platformDef.y,
                platformDef.isSmall ? Assets.PLATFORM_SMALL : Assets.PLATFORM_LARGE
            )
        )

        return platforms
    }

    private createDiamonds(): Phaser.Physics.Arcade.Group {
        const diamonds = this.physics.add.group()

        for (let i = 0; i < 15; ++i) {
            const isRed = Phaser.Math.RND.frac() > 0.75
            diamonds.create(32 + i * 64, 0, isRed ? Assets.DIAMOND_RED : Assets.DIAMOND_GREEN)
                .setData({
                    value: isRed ? 15 : 10
                })
                .setBounceY(Phaser.Math.FloatBetween(0.8, 0.99))
                .setCollideWorldBounds(true)
        }

        return diamonds
    }

    update(time: number, delta: number): void {
        if (this.roomClient?.phase !== GamePhase.PLAYING) return

        this.player?.update(time, delta)
    }

    private handlePhaseChanged(phase: GamePhase) {
        if (phase === GamePhase.WAITING_FOR_OPPONENT) {
            this.hud?.updateStatus('Waiting for opponent...')
        } else if (phase === GamePhase.PLAYING) {
            this.hud?.clearStatus()
            this.startGame()
        }
    }

    private onCollectDiamond(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                             diamond: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        diamond.disableBody(true, true)
        const diamondValue = diamond.getData('value')
        this.hud?.updateScore(diamondValue)

        if (this.diamonds?.countActive(true) === 0) {
            this.diamonds.children.iterate((child) => {
                // @ts-ignore FIXME typescript bug https://github.com/photonstorm/phaser/issues/5882
                child.enableBody(true, child.x, 0, true, true)
            })

            this.addBomb()
        }
    }

    private onBombHit(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                      bomb: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): void {
        this.player.kill()
    }

    private addBomb(): void {
        const halfWidth = this.scale.width / 2
        const x = this.player.sprite.x < halfWidth
            ? Phaser.Math.Between(halfWidth, 2 * halfWidth)
            : Phaser.Math.Between(0, halfWidth)

        this.bombs?.create(x, 16, Assets.BOMB)
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
}
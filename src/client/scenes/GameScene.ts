import Phaser from 'phaser'

import RoomClient, { IPositionUpdate } from '../services/GameRoomClient'
import { IControls, GamePhase } from '../../shared/types/commons'
import { IGameState } from '../../server/schema/GameState'
import { IPlayer } from '../../server/schema/Player'
import ArcadePlayer from '../objects/ArcadePlayer'
import Level from '../../server/schema/Level'
import Assets from '../assets/Assets'
import Hud from '../ui/Hud'

export default class GameScene extends Phaser.Scene {
    public static readonly KEY: string = 'game'

    private roomClient!: RoomClient

    private player!: ArcadePlayer
    private otherPlayers: ArcadePlayer[] = []
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private diamonds?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group

    private score: number = 0
    private hud?: Hud

    private activeControls: IControls = {
        up: false,
        left: false,
        right: false,
        space: false
    }

    constructor() {
        super(GameScene.KEY)
    }

    async create(): Promise<void> {
        this.roomClient = new RoomClient()

        if (!this.roomClient) {
            throw new Error('Server connection is not available')
        }

        await this.roomClient.join()
        this.roomClient.onStateInitialized(this.initGame, this)
        this.roomClient.onPlayerAdded(this.otherPlayerJoined, this)
        this.roomClient.onPlayerPositionUpdated(this.currentPlayerPositionUpdated, this.otherPlayerPositionUpdated, this)
    }

    private currentPlayerPositionUpdated(p: IPositionUpdate) {
        if (p.x) {
            this.player.sprite.body.position.x = p.x
        }
        if (p.y) {
            this.player.sprite.body.position.y = p.y
        }
        if (p.velocityX) {
            this.player.sprite.body.velocity.x = p.velocityX
        }
        if (p.velocityY) {
            this.player.sprite.body.velocity.y = p.velocityY
        }
    }

    private otherPlayerPositionUpdated(p: IPositionUpdate) {
        // TODO support >1 opponents
        const otherPlayer = this.otherPlayers[0]

        if (p.x) {
            otherPlayer.sprite.body.position.x = p.x
        }
        if (p.y) {
            otherPlayer.sprite.body.position.y = p.y
        }
        if (p.velocityX) {
            otherPlayer.sprite.body.velocity.x = p.velocityX
        }
        if (p.velocityY) {
            otherPlayer.sprite.body.velocity.y = p.velocityY
        }
    }

    private initGame(state: IGameState) {
        this.platforms = this.createLevel(state.level)

        const sessionId = this.roomClient?.sessionId
        this.roomClient?.players.forEach(p => {
            const player = new ArcadePlayer(this)
            player.create(p.x, p.y)
            if (p.id === sessionId) {
                this.player = player
            } else {
                this.otherPlayers.push(player)
            }
        })

        this.physics.add.collider(this.player.sprite, this.platforms)

        this.hud = new Hud(this)
        this.hud.create()

        this.handlePhaseChanged(state.phase)
        this.roomClient?.onPhaseChanged(this.handlePhaseChanged, this)

        this.input.keyboard.once('keydown-SPACE', this.onSpaceKeyDown, this) // TODO does this registered event also need to be cleaned up? Read more about events/emitters in Phaser3!
    }

    private otherPlayerJoined(player: IPlayer) {
        const p = new ArcadePlayer(this)
        p.create(player.x, player.y)
        this.otherPlayers.push(p)
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
        if (this.roomClient?.phase === GamePhase.PLAYING) {
            const cursors = this.input.keyboard.createCursorKeys()
            const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

            this.activeControls.up = cursors.up.isDown
            this.activeControls.left = cursors.left.isDown
            this.activeControls.right = cursors.right.isDown
            this.activeControls.space = spaceKey.isDown

            this.player.handleInput(this.activeControls)
            this.player.update(time, delta)

            //this.roomClient.sendPlayerControls(this.activeControls)
        }
    }

    private onSpaceKeyDown(): void {
        if (this.roomClient?.phase === GamePhase.READY) {
            this.roomClient.sendStartSignal()
        }
    }

    private handlePhaseChanged(phase: GamePhase) {
        if (phase === GamePhase.WAITING) {
            this.hud?.showMessage('Waiting for opponent...')
        } else if (phase === GamePhase.READY) {
            this.hud?.showMessage('Press SPACE to start!')
        } else if (phase === GamePhase.PLAYING) {
            this.hud?.clearMessage()
            this.startGame()
        }
    }

    private onCollectDiamond(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
                             diamond: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        diamond.disableBody(true, true)
        const diamondValue = diamond.getData('value')
        this.score += diamondValue
        this.hud?.updateScore(this.score)

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
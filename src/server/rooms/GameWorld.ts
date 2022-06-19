import { Engine, Bodies, BodyType, World, Composite } from 'matter-js'

import { TILE_SIZE } from '../../shared/constants'
import GameState from '../schema/GameState'
import { IPlayer } from '../schema/Player'
import { ILevel } from '../schema/Level'

export default class GameWorld {

    private static readonly PLATFORM_SMALL_WIDTH: number = 5 * TILE_SIZE
    private static readonly PLATFORM_LARGE_WIDTH: number = 10 * TILE_SIZE

    private readonly gameState: GameState
    private readonly engine: Engine

    private readonly _playerBodies: BodyType[] = []

    constructor(state: GameState) {
        this.gameState = state
        this.engine = Engine.create()

        this.createWorld(state.level)
    }

    private createWorld(level: ILevel): void {
        const { width, height, platformDefs } = level

        let platforms: BodyType[] = []

        const groundPlatform = Bodies.rectangle(
            0, height - TILE_SIZE, width, TILE_SIZE, { isStatic: true })
        platforms.push(groundPlatform)

        platformDefs.forEach(platformDef => {
            const w = platformDef.isSmall ? GameWorld.PLATFORM_SMALL_WIDTH : GameWorld.PLATFORM_LARGE_WIDTH
            const platform = Bodies.rectangle(
                platformDef.x - w / 2, platformDef.y - TILE_SIZE / 2,
                w, TILE_SIZE, { isStatic: true })
            platforms.push(platform)
        })
        Composite.add(this.engine.world, platforms)

        // world boundaries
        const wallSize = 20;
        World.add(this.engine.world, [
            // top
            Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // bottom
            Bodies.rectangle(width / 2, height + wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // left
            Bodies.rectangle(0 - wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            }),
            // right
            Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            })
        ]);
    }

    public addPlayer(player: IPlayer): void {
        console.log({addX: player.x, addY: player.y})
        const body = Bodies.rectangle(player.x, player.y, TILE_SIZE, TILE_SIZE, {
            inertia: Infinity // disable body rotation on collision
        })

        this._playerBodies.push(body)
        World.add(this.engine.world, body)
    }


    public update(delta: number): void {
        Engine.update(this.engine, delta)
    }

    get playerBodies(): BodyType {
        return this._playerBodies
    }
}
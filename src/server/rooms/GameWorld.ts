import Matter from 'matter-js'

import { TILE_SIZE } from '../../shared/constants'
import GameState from '../schema/GameState'
import { IPlayer } from '../schema/Player'
import { ILevel } from '../schema/Level'

export default class GameWorld {

    private static readonly PLATFORM_SMALL_WIDTH: number = 5 * TILE_SIZE
    private static readonly PLATFORM_LARGE_WIDTH: number = 10 * TILE_SIZE

    private readonly gameState: GameState
    private readonly engine: Matter.Engine

    public readonly playerBodies: Matter.Body[] = []

    constructor(state: GameState) {
        this.gameState = state
        this.engine = Matter.Engine.create()

        this.createWorld(state.level)
    }

    private createWorld(level: ILevel): void {
        const { width, height, platformDefs } = level

        let platforms: Matter.Body[] = []

        const groundPlatform = Matter.Bodies.rectangle(
            0, height - TILE_SIZE, width, TILE_SIZE, { isStatic: true })
        platforms.push(groundPlatform)

        platformDefs.forEach(platformDef => {
            const w = platformDef.isSmall ? GameWorld.PLATFORM_SMALL_WIDTH : GameWorld.PLATFORM_LARGE_WIDTH
            const platform = Matter.Bodies.rectangle(
                platformDef.x - w / 2, platformDef.y - TILE_SIZE / 2,
                w, TILE_SIZE, { isStatic: true })
            platforms.push(platform)
        })
        Matter.Composite.add(this.engine.world, platforms)

        // world boundaries
        const wallSize = 20;
        Matter.World.add(this.engine.world, [
            // top
            Matter.Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // bottom
            Matter.Bodies.rectangle(width / 2, height + wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // left
            Matter.Bodies.rectangle(0 - wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            }),
            // right
            Matter.Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            })
        ]);
    }

    public addPlayer(player: IPlayer): void {
        console.log({addX: player.x, addY: player.y})
        const body = Matter.Bodies.rectangle(player.x, player.y, TILE_SIZE, TILE_SIZE, {
            inertia: Infinity // disable body rotation on collision
        })

        this.playerBodies.push(body)
        Matter.World.add(this.engine.world, body)
    }


    public update(delta: number): void {
        Matter.Engine.update(this.engine, delta)
    }
}
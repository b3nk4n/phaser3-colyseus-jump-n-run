import Matter from 'matter-js'

import { IPlatformDef } from '../../shared/types/commons'

export default class MatterEnvironment {
    private readonly engine: Matter.Engine
    private readonly width: number
    private readonly height: number

    constructor(engine: Matter.Engine, width: number, height: number) {
        this.engine = engine
        this.width = width
        this.height = height
    }

    create(platformDefs: IPlatformDef[]): void {
        const platforms: Body[] = []
        platformDefs.forEach(platformDef =>
            platforms.push(Matter.Bodies.rectangle(
                this.width * platformDef.x, this.height * platformDef.y,
                platformDef.isSmall ? 160 : 320, 32, {
                    isStatic: true,
                    isPlatform: true,
                    isSmall: platformDef.isSmall
                })
            )
        )
        Matter.Composite.add(this.engine.world, platforms)

        const wallSize = 32;
        const worldBoundaryBodies = [
            // top
            Matter.Bodies.rectangle(this.width / 2, -wallSize / 2, this.width, wallSize, {
                isStatic: true
            }),
            // bottom
            Matter.Bodies.rectangle(this.width / 2, this.height - wallSize / 2, this.width, wallSize, {
                isStatic: true
            }),
            // left
            Matter.Bodies.rectangle(0 - wallSize / 2, this.height / 2, wallSize, this.height, {
                isStatic: true
            }),
            // right
            Matter.Bodies.rectangle(this.width + wallSize / 2, this.height / 2, wallSize, this.height, {
                isStatic: true
            })
        ]
        Matter.Composite.add(this.engine.world, worldBoundaryBodies)
    }
}
import Matter from 'matter-js'

import { IPlatformDef } from '../../shared/types/commons'

export default class MatterEnvironment {
    private readonly engine: Matter.Engine

    constructor(engine: Matter.Engine) {
        this.engine = engine
    }

    create(platformDefs: IPlatformDef[], width: number, height: number): void {
        const platforms: Body[] = []
        platformDefs.forEach(platformDef =>
            platforms.push(Matter.Bodies.rectangle(
                width * platformDef.x, height * platformDef.y,
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
            Matter.Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // bottom
            Matter.Bodies.rectangle(width / 2, height - wallSize / 2, width, wallSize, {
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
        ]
        Matter.Composite.add(this.engine.world, worldBoundaryBodies)
    }
}
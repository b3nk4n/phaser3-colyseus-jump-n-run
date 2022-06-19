import Matter from 'matter-js'

import { IPlatformDef } from '../../shared/types/commons'
import Platform from '../objects/Platform'

export default class LevelFactory {

    private static readonly LEVEL: IPlatformDef[] = [
        { x: 0.5, y: 0.28, isSmall: true },
        { x: 0.175, y: 0.4, isSmall: true },
        { x: 0.825, y: 0.4, isSmall: true },
        { x: 0.5, y: 0.55, isSmall: false },
        { x: 0.225, y: 0.75, isSmall: false },
        { x: 0.775, y: 0.75, isSmall: false }
    ]

    private readonly engine: Matter.Engine

    constructor(engine: Matter.Engine) {
        this.engine = engine
    }

    create(width: number, height: number): Body[] {
        const bodies: Body[] = []
        LevelFactory.LEVEL.forEach(platformDef => {
            const platform = new Platform(width * platformDef.x, height * platformDef.y, platformDef.isSmall)
            bodies.push(...platform.bodies)
        })

        const bodyOptions = {
            isStatic: true,
            // friction: 0 needs to be set after body creation for static bodies
        }

        const wallSize = 32;
        const worldBoundaryBodies = [
            // top
            Matter.Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, bodyOptions),
            // left
            Matter.Bodies.rectangle(0 - wallSize / 2, height / 2, wallSize, height, bodyOptions),
            // right
            Matter.Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, bodyOptions),
            // bottom
            Matter.Bodies.rectangle(width / 2, height - wallSize / 2, width, wallSize, bodyOptions)
        ]

        worldBoundaryBodies.forEach((body, idx) => {
            if (idx == worldBoundaryBodies.length -1) return;
            // As of MatterJs 0.18.0, the static body's friction needs to be set AFTER creation, because even when setting the
            // respective option, a friction of 1.0 is assumed. See: https://github.com/liabru/matter-js/issues/694
            body.friction = 0
        })

        bodies.push(...worldBoundaryBodies)
        return bodies
    }
}
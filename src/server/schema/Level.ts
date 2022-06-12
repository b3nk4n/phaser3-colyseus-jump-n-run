import { ArraySchema, Schema, type } from '@colyseus/schema'

import PlatformDef, { IPlatformDef } from '../../server/schema/PlatformDef'

export interface ILevel {
    platformDefs: ArraySchema<IPlatformDef>,
    width: number
    height: number
}

export default class Level extends Schema implements ILevel {

    @type([PlatformDef])
    platformDefs: ArraySchema<IPlatformDef>

    @type('uint16')
    width: number = 960

    @type('uint16')
    height: number = 640

    constructor() {
        super()

        this.platformDefs = new ArraySchema<IPlatformDef>(
            new PlatformDef(0.5, 0.28,  true),
            new PlatformDef(0.175, 0.4, true),
            new PlatformDef(0.825, 0.4, true),
            new PlatformDef(0.5, 0.55, false),
            new PlatformDef(0.225, 0.75, false),
            new PlatformDef(0.775, 0.75, false)
        )
    }
}

import { Schema, type } from '@colyseus/schema'

import { IPlatformDef } from '../../shared/types/commons'

export default class PlatformDef extends Schema implements IPlatformDef {
    @type('number')
    x: number

    @type('number')
    y: number

    @type('boolean')
    isSmall: boolean

    constructor(x: number, y: number, isSmall: boolean) {
        super()

        this.x = x
        this.y = y
        this.isSmall = isSmall
    }
}

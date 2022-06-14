import { Schema, type } from '@colyseus/schema'

export interface IControls {
    up: boolean
    left: boolean
    right: boolean
    space: boolean
}

export default class Controls extends Schema {
    @type('boolean')
    up: boolean = false

    @type('boolean')
    left: boolean = false

    @type('boolean')
    right: boolean = false

    @type('boolean')
    space: boolean = false

    constructor() {
        super()
    }
}

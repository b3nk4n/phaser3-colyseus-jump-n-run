import { type } from '@colyseus/schema'

import AbstractGameObjectSchema, { IGameObject } from '../../server/schema/AbstractGameObjectSchema'

export interface IDiamond extends IGameObject {
    value: number
}

export default class Player extends AbstractGameObjectSchema implements IDiamond {
    @type('uint32')
    value: number

    constructor(x: number, y: number, value: number) {
        super(x, y)

        this.value = value
    }
}

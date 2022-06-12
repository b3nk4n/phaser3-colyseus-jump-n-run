import { type } from '@colyseus/schema'

import AbstractGameObjectSchema, { IGameObject } from '../../server/schema/AbstractGameObjectSchema'

export interface IPlayer extends IGameObject{
    dead: boolean
    score: number
}

export default class Player extends AbstractGameObjectSchema implements IPlayer {
    @type('uint32')
    score: number = 0

    @type('boolean')
    dead: boolean = false

    constructor(x: number, y: number) {
        super(x, y)
    }
}

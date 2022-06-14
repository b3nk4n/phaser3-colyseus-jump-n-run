import { type } from '@colyseus/schema'

import AbstractGameObjectSchema, { IGameObject } from '../../server/schema/AbstractGameObjectSchema'
import Controls, { IControls } from '../../server/schema/Controls'

export interface IPlayer extends IGameObject {
    id: string
    dead: boolean
    score: number
    controls: IControls
}

export default class Player extends AbstractGameObjectSchema implements IPlayer {
    @type('string')
    id: string

    @type('uint32')
    score: number = 0

    @type('boolean')
    dead: boolean = false

    @type(Controls)
    controls: Controls = new Controls()

    constructor(id: string, x: number, y: number) {
        super(x, y)
        this.id = id
    }
}

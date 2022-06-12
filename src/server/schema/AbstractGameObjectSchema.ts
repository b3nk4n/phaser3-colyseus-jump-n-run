import { Schema, type } from '@colyseus/schema'

export interface IGameObject {
    x: number
    y: number
    velocityX: number
    velocityY: number
    active: boolean
}

export default abstract class AbstractGameObjectSchema extends Schema implements IGameObject {
    @type('number')
    x: number

    @type('number')
    y: number

    @type('number')
    velocityX: number = 0

    @type('number')
    velocityY: number = 0

    @type('boolean')
    active: boolean = true

    protected constructor(x: number, y: number) {
        super()

        this.x = x
        this.y = y
    }
}
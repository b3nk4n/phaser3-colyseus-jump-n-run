import AbstractGameObjectSchema, { IGameObject } from '../../server/schema/AbstractGameObjectSchema'

export interface IBomb extends IGameObject { }

export default class Bomb extends AbstractGameObjectSchema implements IBomb {
    constructor(x: number, y: number) {
        super(x, y)
    }
}
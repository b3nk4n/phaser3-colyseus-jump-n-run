import Matter from 'matter-js'

import { randomBetween } from '../../shared/randomUtils'
import BaseObject from './BaseObject'

export default class Diamond extends BaseObject {
    public static readonly TYPE = 'diamond'

    public static readonly VALUE_RED = 25
    public static readonly VALUE_GREEN = 10

    public readonly value: number

    constructor(x: number, y: number) {
        super(Diamond.TYPE, x, y)
        this.value = Math.random() > 0.75 ? Diamond.VALUE_RED : Diamond.VALUE_GREEN
    }

    protected createBody(x: number, y: number): Matter.Body {
        return Matter.Bodies.rectangle(x, y, 16, 16, {
            inertia: Infinity,
            restitution: randomBetween(0.8, 0.95),
            collisionFilter: {
                group: -2
            },
        })
    }
}
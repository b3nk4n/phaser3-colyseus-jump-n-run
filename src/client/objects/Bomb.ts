import Matter from 'matter-js'

import BaseObject from './BaseObject'

export default class Bomb extends BaseObject {
    public static readonly TYPE: string = 'bomb'

    constructor(x: number, y: number) {
        super(Bomb.TYPE, x, y)
    }
    
    createBody(x: number, y: number): Matter.Body {
        return Matter.Bodies.rectangle(x, y, 16, 16, {
            inertia: Infinity,
            restitution: 1.0,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            collisionFilter: {
                group: -2
            },
            plugin: this
        })
    }
}
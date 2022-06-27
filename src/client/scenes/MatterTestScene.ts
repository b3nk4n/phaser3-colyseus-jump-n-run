import Matter from 'matter-js'
import Phaser from 'phaser'

import Assets from '../assets/Assets'

import Sprite = Phaser.GameObjects.Sprite
import Composite = Matter.Composite
import Engine = Matter.Engine
import Bodies = Matter.Bodies
import Body = Matter.Body
import Events = Matter.Events
// @ts-ignore
import Collision = Matter.Collision

export default class MatterTestScene extends Phaser.Scene {
    public static readonly KEY: string = 'matter-test'

    private assets: Assets

    private engine!: Engine

    private platformBody!: Body

    private playerLeft!: Sprite
    private playerLeftBody!: Body

    private playerRight!: Sprite
    private playerRightBody!: Body

    private bomb!: Sprite
    private bombBody!: Body

    private ball!: Sprite
    private ballBody!: Body

    private diamond!: Sprite
    private diamondBody!: Body

    constructor() {
        super(MatterTestScene.KEY)
        this.assets = new Assets(this)
    }

    init(): void {

    }

    preload(): void {
        this.assets.load()
    }

    create(): void {
        this.engine = Engine.create();

        this.playerLeft = this.add.sprite(300, 400, Assets.PLAYER_JUMP_UP)
        this.playerLeftBody = Bodies.rectangle(this.playerLeft.x, this.playerLeft.y, 32, 32, {
            inertia: Infinity, // prevent body rotation
            collisionFilter: {
                group: -1
            },
            label: 'player',
            plugin: {
                sprite: this.playerLeft
            }
        })
        console.log({ playerLeftBody: this.playerLeftBody })

        this.playerRight = this.add.sprite(500, 400, Assets.PLAYER_JUMP_UP)
            .setFlipX(true)
        this.playerRightBody = Bodies.rectangle(this.playerRight.x, this.playerRight.y, 32, 32, {
            inertia: Infinity,
            collisionFilter: {
                group: -1
            },
            label: 'player',
            plugin: {
                sprite: this.playerRight
            }
        })

        this.bomb = this.add.sprite(450, 100, Assets.BOMB)
        this.bombBody = Bodies.rectangle(this.bomb.x, this.bomb.y, 14, 14, {
            inertia: Infinity,
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            label: 'bomb'
        })
        // give the bomb a kick
        Body.applyForce(this.bombBody, this.bombBody.position, { x: 0.005, y: 0.005 })
        this.disableGravityFor(this.bombBody)

        this.ball = this.add.sprite(350, 100, Assets.BOMB)
            .setTintFill(0xffffff)
        this.ballBody = Bodies.circle(this.ball.x, this.ball.y, 14, {
            restitution: 1
        })

        this.diamond = this.add.sprite(400, 400, Assets.DIAMOND_RED)
        this.diamondBody = Bodies.rectangle(this.diamond.x, this.diamond.y, 16, 16, {
            inertia: Infinity,
            restitution: 0.5,
        })

        const platform = this.add.sprite(400, 500, Assets.PLATFORM_LARGE)
        this.platformBody = Bodies.rectangle(platform.x, platform.y, 320, 32, {
            isStatic: true
        })

        const { width, height } = this.scale
        const wallSize = 20;
        const worldBoundaryBodies = [
            // top
            Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // bottom
            Bodies.rectangle(width / 2, height + wallSize / 2, width, wallSize, {
                isStatic: true
            }),
            // left
            Bodies.rectangle(0 - wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            }),
            // right
            Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, {
                isStatic: true
            })
        ]

        Composite.add(this.engine.world, [
            this.playerLeftBody,
            this.playerRightBody,
            this.bombBody,
            this.ballBody,
            this.diamondBody,
            this.platformBody,
            ...worldBoundaryBodies
        ])

        Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                const player = this.resolveBodyByLabel('player', bodyA, bodyB)
                const bomb = this.resolveBodyByLabel('bomb', bodyA, bodyB)
                if (player && bomb) {
                    Composite.remove(this.engine.world, bomb)
                    this.bomb.visible = false
                    player.plugin.sprite.setTint(0xff6666)
                }
            });
        });
    }

    private resolveBodyByLabel(label: string, bodyA: Body, bodyB: Body): Body | null {
        if (bodyA.label === label) {
            return bodyA
        }
        if (bodyB.label === label) {
            return bodyB
        }
        return null
    }

    disableGravityFor(body: Body): void {
        const gravity = this.engine.world.gravity
        Events.on(this.engine, 'beforeUpdate', () => {
            Body.applyForce(body, body.position, {
                x: -gravity.x * gravity.scale * body.mass,
                y: -gravity.y * gravity.scale * body.mass
            });
        });
    }

    update(time: number, delta: number): void {
        this.handleInput()

        Engine.update(this.engine, delta)

        this.playerLeft.setPosition(this.playerLeftBody.position.x, this.playerLeftBody.position.y)
        this.playerRight.setPosition(this.playerRightBody.position.x, this.playerRightBody.position.y)
        this.bomb.setPosition(this.bombBody.position.x, this.bombBody.position.y)
        this.ball.setPosition(this.ballBody.position.x, this.ballBody.position.y)
        this.diamond.setPosition(this.diamondBody.position.x, this.diamondBody.position.y)
    }

    handleInput() {
        const { left: left, right, up } = this.input.keyboard.createCursorKeys()
        // @ts-ignore
        const { a, d, w } = this.input.keyboard.addKeys({ a: 'A', d: 'D', w: 'W' });

        this.handleBodyControls(this.playerLeftBody, a.isDown, d.isDown, w.isDown)
        this.handleBodyControls(this.playerRightBody, left.isDown, right.isDown, up.isDown)
    }

    handleBodyControls(body: Body, left: boolean, right: boolean, up: boolean) {
        const { x: vx, y: vy } = body.velocity

        let newX = vx
        let newY = vy

        if (right && !left) {
            newX = 3
        }
        if (left && !right) {
            newX = -3
        }

        if (up && this.canJump(body)) {
            newY = -10
        }

        Body.setVelocity(body, { x: newX, y: newY })
    }

    canJump(body: Body): boolean {
        const result = Collision.collides(body, this.platformBody)
        return result != null
    }
}
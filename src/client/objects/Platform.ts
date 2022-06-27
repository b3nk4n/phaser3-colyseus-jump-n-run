import Matter, { IBodyDefinition } from 'matter-js'

export default class Platform {
    public static readonly TYPE: string = 'platform'

    private readonly surfaceBody: Matter.Body
    private readonly outerSlideBody: Matter.Body
    public readonly isSmall: boolean
    public readonly id: string

    constructor(x: number, y: number, isSmall: boolean) {
        this.isSmall = isSmall

        const bodyOptions: IBodyDefinition = {
            isStatic: true,
            plugin: this
        }

        const padding = 4;
        const platformWidth = isSmall ? 160 : 320

        this.surfaceBody = Matter.Bodies.rectangle(x, y, platformWidth - 2 * padding, 32, bodyOptions)

        // Use a different body at the bottom to make the sides free of friction. As of now,
        // it is unfortunately not possible in MatterJS to compose a body with different physical properties
        this.outerSlideBody = Matter.Bodies.rectangle(x, y, platformWidth, 32, bodyOptions)
        this.outerSlideBody.friction = 0

        this.id = String(this.surfaceBody.id)
    }

    get bodies(): Array<Matter.Body> {
        return [
            this.surfaceBody,
            this.outerSlideBody
        ]
    }

    get type() {
        return Platform.TYPE
    }
}
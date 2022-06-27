import Matter from 'matter-js'

export default abstract class BaseObject {
    public readonly id: string
    public readonly type: string
    public readonly body: Matter.Body
    // Following the Google TS style guide: https://google.github.io/styleguide/tsguide.html#properties-used-outside-of-class-lexical-scope
    // - Hidden property may be prefixed or suffixed with any whole word: No underscore
    // - Do not define pass-through accessors only for the purpose of hiding a property: No trivial getters
    private deleteFlag: boolean = false

    constructor(type: string, x: number, y: number) {
        this.type = type
        this.body = this.createBody(x, y)
        this.body.plugin = this
        this.id = String(this.body.id)
    }

    protected abstract createBody(x: number, y: number): Matter.Body;

    get markedForDeletion() {
        return this.deleteFlag
    }

    public markForDeletion() {
        this.deleteFlag = true
    }
}
import { Schema } from '@colyseus/schema'

export default interface IGameState extends Schema {
    activePlayer: number
}

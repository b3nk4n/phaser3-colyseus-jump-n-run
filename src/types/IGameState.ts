import {Schema} from '@colyseus/schema'

export interface IGameState extends Schema {
    activePlayer: number
}

export default IGameState
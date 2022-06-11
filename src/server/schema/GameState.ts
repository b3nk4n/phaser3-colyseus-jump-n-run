import { Schema, type } from '@colyseus/schema'
import IGameState from '~/types/IGameState'

export default class GameState extends Schema implements IGameState {
    @type('number')
    activePlayer: number = 0
}
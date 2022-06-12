import { ArraySchema, Schema, type } from '@colyseus/schema'

import Diamond from '../../server/schema/Diamond'
import Player from '../../server/schema/Player'
import Level from '../../server/schema/Level'
import Bomb from '../../server/schema/Bomb'

export enum GamePhase {
    WAITING_FOR_OPPONENT,
    PLAYING,
    GAME_OVER
}

export default interface IGameState {
    phase: GamePhase
    players: ArraySchema<Player>
    level: Level
    bombs: ArraySchema<Bomb>
    diamonds: ArraySchema<Diamond>
}

export default class GameState extends Schema implements IGameState {
    @type('uint8')
    phase: GamePhase = GamePhase.WAITING_FOR_OPPONENT

    @type([Player])
    players: ArraySchema<Player> = new ArraySchema<Player>()

    @type(Level)
    level: Level = new Level()

    @type([Bomb])
    bombs: ArraySchema<Bomb> = new ArraySchema<Bomb>()

    @type([Diamond])
    diamonds: ArraySchema<Diamond> = new ArraySchema<Diamond>()
}

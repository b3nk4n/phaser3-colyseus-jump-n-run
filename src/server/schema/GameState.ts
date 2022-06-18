import { ArraySchema, Schema, type } from '@colyseus/schema'

import Diamond from '../../server/schema/Diamond'
import Player from '../../server/schema/Player'
import Level from '../../server/schema/Level'
import Bomb from '../../server/schema/Bomb'

export enum GamePhase {
    WAITING_FOR_OPPONENT,
    READY,
    PLAYING,
    PAUSED,
    GAME_OVER
}

export interface IGameState {
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

    addPlayer(id: string, playerIdx: number): Player {
        const player = new Player(id, playerIdx * 10, 10)
        this.players.push(player)
        return player
    }

    addBomb(): Bomb {
        const bomb = new Bomb(100, 10)
        this.bombs.push(bomb)
        return bomb
    }

    addDiamond(): Diamond {
        const diamond = new Diamond(100, 10, 25)
        this.diamonds.push(diamond)
        return diamond
    }
}

import { Command } from '@colyseus/command'

import { GamePhase } from '../../../shared/types/commons'
import { GameRoom } from '../GameRoom'

export default class StartSignalCommand extends Command<GameRoom> {
    execute() {
        if (this.room.state.phase === GamePhase.READY) {
            this.room.state.phase = GamePhase.PLAYING
        }
    }
}
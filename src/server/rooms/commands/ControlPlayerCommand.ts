import { Command } from '@colyseus/command'

import { IPlayerControlsMessage } from '../../../shared/types/messages'
import { GamePhase } from '../../schema/GameState'
import { GameRoom } from '../GameRoom'

export default class ControlPlayerCommand extends Command<GameRoom> {
    execute(message: IPlayerControlsMessage) {
        if (this.room.state.phase === GamePhase.PLAYING) {
            const player = this.room.state.players[message.playerIdx]

            if (message.controls.right) {
                player.x += 2
            }
            if (message.controls.left) {
                player.x -= 2
            }
            if (message.controls.up) {
                player.y -= 2
            }
        }
    }
}
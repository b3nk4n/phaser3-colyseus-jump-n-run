import { Command } from '@colyseus/command'

import { IPlayerControlsMessage } from '../../../shared/types/messages'
import { GamePhase } from '../../schema/GameState'
import { GameRoom } from '../GameRoom'

export default class ControlPlayerCommand extends Command<GameRoom> {
    execute(message: IPlayerControlsMessage) {
        if (this.room.state.phase === GamePhase.PLAYING) {
            const player = this.room.state.players[message.playerIdx]
            player.controls.up = message.controls.up
            player.controls.left = message.controls.left
            player.controls.right = message.controls.right
            player.controls.space = message.controls.space

            if (message.controls.right) {
                player.x += 1
            }
            if (message.controls.left) {
                player.x -= 1
            }
            if (message.controls.up) {
                player.y -= 1
            }
        }
    }
}
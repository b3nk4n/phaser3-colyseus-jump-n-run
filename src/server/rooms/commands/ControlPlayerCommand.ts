import { Command } from '@colyseus/command'

import { IPlayerControlsMessage } from '../../../shared/types/messages'
import { GamePhase } from '../../../shared/types/commons'
import GameWorld from '../../rooms/GameWorld'
import { GameRoom } from '../GameRoom'
import { Body } from 'matter-js'

export default class ControlPlayerCommand extends Command<GameRoom> {
    private readonly gameWorld: GameWorld

    constructor(gameWorld: GameWorld) {
        super()
        this.gameWorld = gameWorld
    }

    execute(message: IPlayerControlsMessage) {
        if (this.room.state.phase === GamePhase.PLAYING) {
            const player = this.room.state.players[message.playerIdx]
            const playerBody = this.gameWorld.playerBodies[message.playerIdx]

            const { up, left, right } = message.controls

            if (left == right) {
                Body.setVelocity(playerBody, { x: 0, y: 0 })
            }

            if (right && !left) {
                //player.x += 2
                Body.setVelocity(playerBody, { x: 166, y: 0 })
            }

            if (left && !right) {
                //player.x -= 2
                Body.setVelocity(playerBody, { x: -166, y: 0 })
            }

            if (up) {
                // TODO only when jump when on ground! We should probably not interact with the world directly from here,
                //      but instead only set the current control flags, and do the body interaction in the game loop
                Body.setVelocity(playerBody, { x: 0, y: -300 })
            }
        }
    }
}
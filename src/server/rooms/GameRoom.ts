import {Dispatcher} from '@colyseus/command'
import {Client, Room} from 'colyseus'

import {Message} from '../../shared/types/messages'
import GameState, {GamePhase} from '../schema/GameState'

export class GameRoom extends Room<GameState> {
    private dispatcher = new Dispatcher(this)

    onCreate() {
        this.maxClients = 2
        this.setState(new GameState())

        this.onMessage(Message.SOME_COMMAND, (client: Client, message: { someData: number }) => {
            // dispatch command
        })
    }

    async onJoin(client: Client, options: any, auth: any) {
        const playerIndex = this.clients.findIndex(c => c.sessionId === client.sessionId)
        console.log(client.sessionId, `Player index ${playerIndex} with sessionId ${client.sessionId} joined.`)
        client.send(Message.PLAYER_INDEX, { playerIndex })

        if (this.clients.length >= 2) {
            this.state.phase = GamePhase.PLAYING
            await this.lock()
        }
    }

    onLeave(client: Client, consented: boolean) {
        console.log(`Player with sessionId ${client.sessionId} left.`)
    }

    onDispose() {
        this.dispatcher.stop()
    }
}
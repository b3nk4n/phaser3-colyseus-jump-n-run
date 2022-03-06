import {Client, Room} from 'colyseus'
import {Dispatcher} from '@colyseus/command'

import GameState from '../schema/GameState'
import {Message} from '../../types/messages'

export class GameRoom extends Room<GameState> {
    private dispatcher = new Dispatcher(this)

    onCreate() {
        this.maxClients = 2
        this.setState(new GameState())

        this.onMessage(Message.SomeCommand, (client: Client, message: { someData: number }) => {
            // dispatch command
        })
    }

    onJoin(client: Client, options: any, auth: any) {
        const playerIndex = this.clients.findIndex(c => c.sessionId === client.sessionId)
        console.log(client.sessionId, `Player index ${playerIndex} with sessionId ${client.sessionId} joined.`)

        if (this.clients.length >= 2) {
            this.lock()
        }
    }

    onLeave(client: Client, consented: boolean) {
        console.log(`Player with sessionId ${client.sessionId} left.`)
    }

    onDispose() {
        this.dispatcher.stop()
    }
}
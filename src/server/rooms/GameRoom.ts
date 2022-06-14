import { Dispatcher } from '@colyseus/command'
import { Client, Room } from 'colyseus'

import { Message, IPlayerMessage, IPlayerControlsMessage } from '../../shared/types/messages'
import ControlPlayerCommand from './commands/ControlPlayerCommand'
import StartSignalCommand from './commands/StartSignalCommand'
import GameState, { GamePhase } from '../schema/GameState'

export class GameRoom extends Room<GameState> {
    private dispatcher = new Dispatcher(this)

    onCreate() {
        this.maxClients = 2
        this.setState(new GameState())

        this.onMessage(Message.START_SIGNAL, (client: Client, message: IPlayerMessage) => {
            console.log(`Player ${message.playerIdx} requested start`)
            this.dispatcher.dispatch(new StartSignalCommand())
        })

        this.onMessage(Message.PLAYER_CONTROLS, (client: Client, message: IPlayerControlsMessage) => {
            console.log(`Player ${message.playerIdx} requested start`)
            this.dispatcher.dispatch(new ControlPlayerCommand(), message)
        })
    }

    async onJoin(client: Client, options: any, auth: any) {
        const playerIndex = this.clients.findIndex(c => c.sessionId === client.sessionId)
        console.log(client.sessionId, `Player index ${playerIndex} with sessionId ${client.sessionId} joined.`)
        client.send(Message.PLAYER_INDEX, { playerIndex })

        const player = this.state.addPlayer(client.sessionId, 100 + 100 * playerIndex)

        if (this.clients.length >= this.maxClients) {
            this.state.phase = GamePhase.READY
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
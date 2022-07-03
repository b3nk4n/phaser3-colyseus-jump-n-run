import { Dispatcher } from '@colyseus/command'
import { Client, Room } from 'colyseus'

import { Message, IPlayerMessage, IPlayerControlsMessage } from '../../shared/types/messages'
import ControlPlayerCommand from './commands/ControlPlayerCommand'
import StartSignalCommand from './commands/StartSignalCommand'
import { GamePhase } from '../../shared/types/commons'
import GameState from '../schema/GameState'
import GameWorld from './GameWorld'

export class GameRoom extends Room<GameState> {
    private dispatcher = new Dispatcher(this)

    private gameWorld!: GameWorld

    onCreate() {
        this.maxClients = 2

        // state update every @ 20 fps
        //this.setPatchRate(50)
        this.setPatchRate(500) // TODO remove small sample rate that is only used to test client-side physics interpolation

        this.setState(new GameState())
        this.gameWorld = new GameWorld(this.state)

        this.onMessage(Message.START_SIGNAL, (client: Client, message: IPlayerMessage) => {
            console.log(`Player ${message.playerIdx} requested start`)
            this.dispatcher.dispatch(new StartSignalCommand())
        })

        this.onMessage(Message.PLAYER_CONTROLS, (client: Client, message: IPlayerControlsMessage) => {
            this.dispatcher.dispatch(new ControlPlayerCommand(this.gameWorld), message)
        })

        // game simulation @ 20 FPS
        const updateDelta = 50
        this.setSimulationInterval(() => {
            this.gameWorld.update(updateDelta)

            this.gameWorld.playerBodies.forEach((playerBody, idx) => {
                const player = this.state.players[idx]
                player.x = playerBody.position.x
                player.y = playerBody.position.y
                player.velocityX = playerBody.velocity.x
                player.velocityY = playerBody.velocity.y
            })

        }, updateDelta)

    }

    async onJoin(client: Client, options: any, auth: any) {
        const playerIndex = this.clients.findIndex(c => c.sessionId === client.sessionId)
        console.log(client.sessionId, `Player index ${playerIndex} with sessionId ${client.sessionId} joined.`)
        client.send(Message.PLAYER_INDEX, { playerIndex })

        const player = this.state.addPlayer(client.sessionId, playerIndex)

        this.gameWorld.addPlayer(player)

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
import { Client, Room } from 'colyseus.js'
import Phaser from 'phaser'

import GameState, { IGameState, GamePhase } from '../../server/schema/GameState'
import Player, { IPlayer } from '../../server/schema/Player'
import { IControls } from '../../server/schema/Controls'
import { Message } from '../../shared/types/messages'

export interface IPositionUpdate {
    x?: number,
    y?: number
}

export default class RoomClient {
    private static readonly EVENT_STATE_INIT: string = 'state-initialized'
    private static readonly EVENT_PHASE_CHANGED: string = 'phase-changed'
    private static readonly EVENT_PLAYER_ADDED: string = 'player-added'
    private static readonly EVENT_PLAYER_POSITION_UPDATED: string = 'player-pos-updated'

    private readonly client: Client
    private readonly events: Phaser.Events.EventEmitter
    private room?: Room<GameState>

    private removePhaseListener: () => void = () => {}

    private _playerIndex: number = -1

    constructor() {
        this.client = new Client('ws://localhost:3000')
        this.events = new Phaser.Events.EventEmitter()
    }

    async join() : Promise<void> {
        this.room = await this.client.joinOrCreate('game-room')

        this.room.onMessage(Message.PLAYER_INDEX, (message: { playerIndex: number }) => {
            this._playerIndex = message.playerIndex
        })

        this.room.onStateChange.once(state => {
            this.events.emit(RoomClient.EVENT_STATE_INIT, state)
        })

        this.room.state.players.onAdd = (player: Player, idx) => {
            player.onChange = (changes) => {
                let x
                let y
                for (const change of changes) {
                    if (change.field === 'x') {
                        x = change.value
                    } else if (change.field === 'y') {
                        y = change.value
                    }
                }

                this.events.emit(RoomClient.EVENT_PLAYER_POSITION_UPDATED, {x, y}, idx)
            }

            this.events.emit(RoomClient.EVENT_PLAYER_ADDED, player)
        }

        this.removePhaseListener = this.room.state.listen('phase', (newValue, _) => {
            this.events.emit(RoomClient.EVENT_PHASE_CHANGED, newValue)
        })
    }

    leave() {
        this.room?.leave()
        this.events.removeAllListeners()
    }

    onStateInitialized(callback: (state: IGameState) => void, context?: any) {
        this.events.once(RoomClient.EVENT_STATE_INIT, callback, context)
    }

    onPlayerAdded(callback: (player: IPlayer) => void, context?: any) {
        this.events.on(RoomClient.EVENT_PLAYER_ADDED, callback, context)
    }

    onPlayerPositionUpdated(currentPlayerCallback: (IPositionUpdate) => void, otherPlayerCallback: (IPositionUpdate) => void, context?: any) {
        this.events.on(RoomClient.EVENT_PLAYER_POSITION_UPDATED, (p, idx) => {
            if (this.playerIndex === idx) {
                currentPlayerCallback.bind(context)(p)
            } else {
                otherPlayerCallback.bind(context)(p)
            }
        }, context)
    }

    onPhaseChanged(callback: (phase: GamePhase) => void, context?: any) {
        this.events.on(RoomClient.EVENT_PHASE_CHANGED, callback, context)
    }

    dispose(): void {
        this.removePhaseListener()
    }

    sendStartSignal(): void {
        this.room?.send(Message.START_SIGNAL, { playerIdx: this.playerIndex })
    }

    sendPlayerControls(controls: IControls): void {
        this.room?.send(Message.PLAYER_CONTROLS, { playerIdx: this.playerIndex, controls })
    }

    get playerIndex(): number {
        return this._playerIndex
    }

    get phase(): GamePhase {
        if (!this.room) {
            return GamePhase.WAITING_FOR_OPPONENT
        }
        return this.room.state.phase
    }

    get players(): Player[] {
        return this.room?.state.players.toArray() ?? []
    }

    get sessionId(): string | undefined {
        return this.room?.sessionId
    }
}
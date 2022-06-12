import {Client, Room} from 'colyseus.js'
import Phaser from 'phaser'

import IGameState, {GamePhase} from '../../server/schema/GameState'
import {Message} from '../../shared/types/messages'

export default class RoomClient {
    private static readonly EVENT_STATE_INIT: string = 'state-initialized'
    private static readonly EVENT_PHASE_CHANGED: string = 'phase-changed'

    private readonly client: Client
    private readonly events: Phaser.Events.EventEmitter
    private room?: Room<IGameState>

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

    onPhaseChanged(callback: (phase: GamePhase) => void, context?: any) {
        this.events.on(RoomClient.EVENT_PHASE_CHANGED, callback, context)
    }

    dispose(): void {
        this.removePhaseListener()
    }

    sendStartSignal(): void {
        this.room?.send(Message.START_SIGNAL, { playerIdx: this.playerIndex })
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
}
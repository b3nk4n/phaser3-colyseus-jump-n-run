import { IControls } from './commons'

export enum Message {
    START_SIGNAL,
    PLAYER_INDEX,
    PLAYER_CONTROLS
}

export interface IPlayerMessage {
    playerIdx: number
}

export interface IPlayerControlsMessage extends IPlayerMessage {
    controls: IControls
}

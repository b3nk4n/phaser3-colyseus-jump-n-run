
export const EMPTY_CONTROLS: IControls = {
    up: false,
    left: false,
    right: false,
    actionKey: false
}
export interface IControls {
    up: boolean
    left: boolean
    right: boolean
    actionKey: boolean
}

export interface IPlatformDef {
    x: number
    y: number
    isSmall: boolean
}

export enum GamePhase {
    WAITING,
    READY,
    PLAYING,
    PAUSED,
    GAME_OVER
}

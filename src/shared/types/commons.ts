export interface IControls {
    up: boolean
    left: boolean
    right: boolean
    space: boolean
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

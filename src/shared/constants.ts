export const TILE_SIZE = 32

export interface IPlayerConfig {
    startX: number,
    facingLeft: boolean,
    color: number
}

export const PLAYER_CONFIG: IPlayerConfig[] = [
    {
        startX: 4 * TILE_SIZE,
        facingLeft: false,
        color: 0xffffff
    },
    {
        startX: 26 * TILE_SIZE,
        facingLeft: true,
        color: 0x66ff66
    },
    {
        startX: 15 * TILE_SIZE,
        facingLeft: false,
        color: 0x6666ff
    }
]
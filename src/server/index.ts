import {Server} from 'colyseus'
import {createServer} from 'http'
import cors from 'cors'
import express from 'express'
import {monitor} from '@colyseus/monitor'

import {GameRoom} from './rooms/GameRoom'

const port = Number(process.env.port) || 3000

const app = express()

app.use(cors())
app.use(express.json())

const gameServer = new Server({
    server: createServer(app)
})

gameServer.define('game-room', GameRoom)

app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Websocket on ws://localhost:${port}`)
console.log(`Colyseus Monitor on http://localhost:${port}/colyseus/`)
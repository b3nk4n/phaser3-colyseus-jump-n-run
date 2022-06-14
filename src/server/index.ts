import { monitor } from '@colyseus/monitor'
import { createServer } from 'http'
import { Server } from 'colyseus'
import express from 'express'
import cors from 'cors'

import { GameRoom } from './rooms/GameRoom'

const port = Number(process.env.port) || 3000

const app = express()

app.use(cors())
app.use(express.json())

const gameServer = new Server({
    server: createServer(app)
})

gameServer.define('game-room', GameRoom)

app.use('/monitor', monitor())

gameServer.listen(port)
console.log(`Websocket on ws://localhost:${port}`)
console.log(`Colyseus Monitor on http://localhost:${port}/monitor`)
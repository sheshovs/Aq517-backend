import express from "express";
import cors from "cors";
import axios from "axios";
import routes from "./src/api/routes/index.js";
import http from 'http'
import { Server } from 'socket.io'

export const socketsUser = []

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(routes);

const server = http.createServer(app)
export const socketio = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

socketio.on('connection', (socket) => {
  socketsUser.push(socket.id)
})

socketio.on('disconnect', (socket) => {
  const index = socketsUser.indexOf(socket.id)
  socketsUser.splice(index, 1)
})

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});

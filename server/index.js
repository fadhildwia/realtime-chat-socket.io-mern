const express = require('express')
const cors = require('cors')
const socket = require('socket.io')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user.route')
const messageRoutes = require('./routes/messages.route')
const http = require('http');

const app = express()
require('dotenv').config()
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: ["https://realtime-chat-mern-socket-io.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  },
});

app.use(cors())
app.use(express.json())

app.use('/api/auth', userRoutes)
app.use('/api/messages', messageRoutes)

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("DB Connection Successful")
}).catch((err) => {
  console.log(err.message)
})

// const server = app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`)
// })

// const io = socket(server, {
//   cors: {
//     origin: '*',
//     creditials: true
//   }
// })

global.onlineUsers = new Map()

io.on('connection', (socket) => {
  global.chatSocket = socket
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on('send-msg', (data) => {
    console.log('data', data)
    const sendUserSocket = onlineUsers.get(data.to)
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-receive', data.message)
    }
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`)
})

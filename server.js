const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const Message = require('./models/Message');
require('dotenv').config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use('/auth', authRoutes);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('sendMessage', async (data) => {
    try {
      const { token, message } = data;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const newMessage = new Message({ userId: decoded.userId, content: message });
      await newMessage.save();

      io.emit('receiveMessage', { content: message, timestamp: new Date() });
    } catch (error) {
      console.error(error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});

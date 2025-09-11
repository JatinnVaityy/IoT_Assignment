require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const mqttWorker = require('./mqttWorker');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, { cors: { origin: '*' } });

// Pass io to mqttWorker to avoid circular dependency
mqttWorker.init(io);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/devices', deviceRoutes);

// MQTT Control APIs
app.get('/start-mqtt', (req, res) => {
  mqttWorker.start();
  res.json({ status: 'MQTT started' });
});

app.get('/stop-mqtt', (req, res) => {
  mqttWorker.stop();
  res.json({ status: 'MQTT stopped' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error', err); process.exit(1); });

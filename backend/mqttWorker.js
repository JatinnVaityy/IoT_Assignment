const mqtt = require('mqtt');
const Device = require('./models/Device');
const Telemetry = require('./models/Telemetry');

const broker = 'mqtt://broker.hivemq.com';
const client = mqtt.connect(broker);

let running = false;
let interval = null;
let io = null;

// Initialize Socket.io instance from server.js
function init(socketIo) {
  io = socketIo;
}

// Connect and subscribe to topic
client.on('connect', () => {
  console.log('MQTT connected');
  client.subscribe('/application/out/+', (err) => {
    if (err) console.log('Subscribe error:', err);
    else console.log('Subscribed to /application/out/+');
  });
});

// Handle incoming MQTT messages
client.on('message', async (topic, message) => {
  if (!running) return;

  try {
    const payload = JSON.parse(message.toString());
    const { uid, fw, tts, data } = payload;

    // --- SCALE RAW SENSOR VALUES ---
    const temp = data.temp / 10000000;   // Temperature in °C
    const hum = data.hum / 100000000;    // Humidity in %
    const pm25 = data.pm25 / 100;        // PM2.5 in µg/m³

    // Save or update device
    const device = await Device.findOneAndUpdate(
      { uid },
      { uid, fw, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    // Save telemetry
    const telemetry = await Telemetry.create({
      device: device._id,
      temp,
      hum,
      pm25,
      tts,
      serverTs: new Date()
    });

    // Emit to frontend via Socket.io
    if (io) {
      io.emit('telemetry', {
        deviceUid: uid,
        telemetry: { temp, hum, pm25, tts, serverTs: telemetry.serverTs }
      });
    }

    console.log('Telemetry saved & emitted:', { uid, temp, hum, pm25 });
  } catch (err) {
    console.error('MQTT message error:', err);
  }
});

// --- Test publisher with random variation ---
function startTestPublisher() {
  if (interval) return;

  interval = setInterval(() => {
    const DEVICE_UID = '123456';
    const baseTemp = 528857921;
    const baseHum = 1726382658;
    const basePM25 = 16449;

    // Add small random variations
    const msg = {
      uid: DEVICE_UID,
      fw: '1.0.0.0',
      tts: Math.floor(Date.now() / 1000),
      data: {
        temp: baseTemp + Math.floor(Math.random() * 50000),   // vary temp
        hum: baseHum + Math.floor(Math.random() * 100000),    // vary hum
        pm25: basePM25 + Math.floor(Math.random() * 1000)     // vary pm2.5
      }
    };

    client.publish(`/application/out/${DEVICE_UID}`, JSON.stringify(msg));
    console.log('Test MQTT message published:', msg);
  }, 5000);
}

// Start MQTT worker
function start() {
  running = true;
  console.log('MQTT worker started');
  startTestPublisher(); // sends test payload
}

// Stop MQTT worker
function stop() {
  running = false;
  if (interval) clearInterval(interval);
  interval = null;
  console.log('MQTT worker stopped');
}

module.exports = { init, start, stop };

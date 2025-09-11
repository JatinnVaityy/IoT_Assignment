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

// Decode little-endian float from integer
function decodeLEFloat(val) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(val);
  return buf.readFloatLE(0);
}

// Handle incoming MQTT messages
client.on('message', async (topic, message) => {
  if (!running) return;

  try {
    const payload = JSON.parse(message.toString());
    const { uid, fw, tts, data } = payload;

    const temp = decodeLEFloat(data.temp);
    const hum = decodeLEFloat(data.hum);
    const pm25 = decodeLEFloat(data.pm25);

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

    // Emit to frontend
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

// Publish test messages in **assignment format**
function startTestPublisher() {
  if (interval) return;

  interval = setInterval(() => {
    const DEVICE_UID = '123456';
    const msg = {
      uid: DEVICE_UID,
      fw: '1.0.0.0',
      tts: Math.floor(Date.now() / 1000),
      data: {
        temp: 528857921,       // raw little-endian integer
        hum: 1726382658,       // raw little-endian integer
        pm25: 16449            // raw little-endian integer
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
  startTestPublisher(); // sends raw assignment payload
}

// Stop MQTT worker
function stop() {
  running = false;
  if (interval) clearInterval(interval);
  interval = null;
  console.log('MQTT worker stopped');
}

module.exports = { init, start, stop };

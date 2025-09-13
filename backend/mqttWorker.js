const mqtt = require("mqtt");
const Device = require("./models/Device");
const Telemetry = require("./models/Telemetry");

const broker = "mqtt://broker.hivemq.com";
const client = mqtt.connect(broker);

let running = false;
let interval = null;
let io = null;

// Initialize Socket.io instance from server.js
function init(socketIo) {
  io = socketIo;
}

// --- Helpers to encode/decode floats ---
function encodeFloatLE(value) {
  const buf = Buffer.alloc(4);
  buf.writeFloatLE(value, 0);
  return buf.readUInt32LE(0);
}

function decodeFloatLE(intValue) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(intValue, 0);
  return buf.readFloatLE(0);
}

// Connect and subscribe to topic
client.on("connect", () => {
  console.log("MQTT connected");
  client.subscribe("/application/out/+", (err) => {
    if (err) console.log("Subscribe error:", err);
    else console.log("Subscribed to /application/out/+");
  });
});

// Handle incoming MQTT messages
client.on("message", async (topic, message) => {
  if (!running) return;

  try {
    const payload = JSON.parse(message.toString());
    const { uid, fw, tts, data } = payload;

    // --- Decode raw float values ---
    const temp = decodeFloatLE(data.temp); // °C
    const hum = decodeFloatLE(data.hum);   // %
    const pm25 = decodeFloatLE(data.pm25); // µg/m³

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
      serverTs: new Date(),
    });

    // Emit to frontend via Socket.io
    if (io) {
      io.emit("telemetry", {
        deviceUid: uid,
        telemetry: { temp, hum, pm25, tts, serverTs: telemetry.serverTs },
      });
    }

    console.log("Telemetry saved & emitted:", { uid, temp, hum, pm25 });
  } catch (err) {
    console.error("MQTT message error:", err);
  }
});

// --- Test publisher with realistic floats ---
function startTestPublisher() {
  if (interval) return;

  interval = setInterval(() => {
    const DEVICE_UID = "123456";

    // Random realistic values
    const tempVal = 20 + Math.random() * 10; // 20–30 °C
    const humVal = 40 + Math.random() * 20;  // 40–60 %
    const pm25Val = 5 + Math.random() * 50;  // 5–55 µg/m³

    const msg = {
      uid: DEVICE_UID,
      fw: "1.0.0.0",
      tts: Math.floor(Date.now() / 1000),
      data: {
        temp: encodeFloatLE(tempVal),
        hum: encodeFloatLE(humVal),
        pm25: encodeFloatLE(pm25Val),
      },
    };

    client.publish(`/application/out/${DEVICE_UID}`, JSON.stringify(msg));
    console.log("Test MQTT message published:", {
      uid: DEVICE_UID,
      temp: tempVal,
      hum: humVal,
      pm25: pm25Val,
    });
  }, 5000);
}

// Start MQTT worker
function start() {
  running = true;
  console.log("MQTT worker started");
  startTestPublisher(); // sends test payload
}

// Stop MQTT worker
function stop() {
  running = false;
  if (interval) clearInterval(interval);
  interval = null;
  console.log("MQTT worker stopped");
}

module.exports = { init, start, stop };

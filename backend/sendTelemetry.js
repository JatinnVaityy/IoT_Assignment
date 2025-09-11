const mqtt = require('mqtt');

const broker = 'mqtt://broker.hivemq.com';
const client = mqtt.connect(broker);
const DEVICE_UID = 'test123';

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  setInterval(() => {
    // Encode temp/hum/pm2.5 as little-endian
    function encodeLEFloat(val) {
      const buf = Buffer.alloc(4);
      buf.writeFloatLE(val);
      return buf.readUInt32LE(0);
    }

    const message = {
      uid: DEVICE_UID,
      fw: '1.0.0',
      tts: Math.floor(Date.now() / 1000),
      data: {
        temp: encodeLEFloat(Math.random() * 35),
        hum: encodeLEFloat(Math.random() * 100),
        pm25: encodeLEFloat(Math.random() * 200)
      }
    };

    client.publish(`/application/out/${DEVICE_UID}`, JSON.stringify(message));
    console.log('Published:', message);
  }, 5000);
});

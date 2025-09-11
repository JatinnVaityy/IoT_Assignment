const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  temp: Number,
  hum: Number,
  pm25: Number,
  tts: Number,
  serverTs: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Telemetry', telemetrySchema);

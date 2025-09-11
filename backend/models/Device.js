const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  fw: String,
  lastSeen: Date
});

module.exports = mongoose.model('Device', deviceSchema);

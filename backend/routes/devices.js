const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const Telemetry = require('../models/Telemetry');

// GET /devices -> list all devices with latest reading
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find().lean();
    const results = await Promise.all(devices.map(async d => {
      const latest = await Telemetry.findOne({ device: d._id }).sort({ serverTs: -1 }).lean();
      return { ...d, latest };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /devices/:id/data -> last 10 readings
router.get('/:id/data', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found' });

    const telemetry = await Telemetry.find({ device: device._id }).sort({ serverTs: -1 }).limit(10).lean();
    res.json(telemetry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

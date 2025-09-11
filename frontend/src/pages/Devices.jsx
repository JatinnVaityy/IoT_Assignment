import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { socket } from '../services/socket';
import DeviceModal from '../components/DeviceModal';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mqttRunning, setMqttRunning] = useState(false);

  // Load devices from backend
  async function loadDevices() {
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch (err) {
      console.error('Load devices error', err);
      alert('Failed to load devices. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  }

  // Start MQTT publisher
  async function startMqtt() {
    try {
      await api.get('/start-mqtt');
      setMqttRunning(true);
    } catch (err) {
      console.error('Failed to start MQTT', err);
      alert('Failed to start MQTT publisher');
    }
  }

  // Stop MQTT publisher
  async function stopMqtt() {
    try {
      await api.get('/stop-mqtt');
      setMqttRunning(false);
    } catch (err) {
      console.error('Failed to stop MQTT', err);
      alert('Failed to stop MQTT publisher');
    }
  }

  useEffect(() => {
    loadDevices();

    // Listen for real-time telemetry
    socket.on('telemetry', (payload) => {
      setDevices(prev => {
        const idx = prev.findIndex(d => d.uid === payload.deviceUid);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], latest: payload.telemetry };
        return copy;
      });

      // Update modal if open
      setActive(prev =>
        prev && prev.uid === payload.deviceUid
          ? { ...prev, latest: payload.telemetry }
          : prev
      );
    });

    return () => {
      socket.off('telemetry');
    };
  }, []);

  // Helper to format numbers safely
  const formatVal = (val) =>
    val != null && !isNaN(val) ? Number(val).toFixed(2) : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 sm:mb-0">Devices</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">Real-time updates enabled</div>
            <button
              onClick={mqttRunning ? stopMqtt : startMqtt}
              className={`px-4 py-2 rounded text-white ${
                mqttRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } transition`}
            >
              {mqttRunning ? 'Stop MQTT Test' : 'Start MQTT Test'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10 text-gray-500">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            No devices found. Publish one via MQTT to{' '}
            <code className="bg-gray-100 px-1 rounded">/application/out/&lt;uid&gt;</code>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(d => (
              <div
                key={d._id}
                onClick={() => setActive(d)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer p-5"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-400">UID</div>
                    <div className="font-semibold text-lg text-gray-800">{d.uid}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-400">Last Update</div>
                    <div className="text-gray-600">
                      {d.latest?.serverTs ? new Date(d.latest.serverTs).toLocaleTimeString() : '-'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-red-50 text-center shadow-inner">
                    <div className="text-xs text-gray-500">Temp</div>
                    <div className="font-bold text-red-600 text-lg">
                      {formatVal(d.latest?.temp)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-center shadow-inner">
                    <div className="text-xs text-gray-500">Hum</div>
                    <div className="font-bold text-blue-600 text-lg">
                      {formatVal(d.latest?.hum)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 text-center shadow-inner">
                    <div className="text-xs text-gray-500">PM2.5</div>
                    <div className="font-bold text-green-700 text-lg">
                      {formatVal(d.latest?.pm25)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {active && <DeviceModal device={active} onClose={() => setActive(null)} />}
      </main>
    </div>
  );
}

// DeviceHistory.jsx (full file replacement — paste this over your current file)
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { socket } from '../services/socket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DeviceHistory({ deviceId, deviceUid }) {
  const [data, setData] = useState({
    labels: [],
    temps: [],
    hums: [],
    pm25s: []
  });
  const [loading, setLoading] = useState(true);

  const formatVal = (val) =>
    val != null && !isNaN(val) ? Number(val).toFixed(2) : null;

  // Load initial last 10 readings (deviceId is the DB id used by REST)
  useEffect(() => {
    if (!deviceId) return;

    setLoading(true);
    api.get(`/devices/${deviceId}/data?limit=10`)
      .then(res => {
        const arr = res.data.slice().reverse();
        setData({
          labels: arr.map(a => new Date(a.serverTs).toLocaleTimeString()),
          temps: arr.map(a => formatVal(a.temp)),
          hums: arr.map(a => formatVal(a.hum)),
          pm25s: arr.map(a => formatVal(a.pm25))
        });
      })
      .catch(err => {
        console.error('History load error', err);
        setData({ labels: [], temps: [], hums: [], pm25s: [] });
      })
      .finally(() => setLoading(false));
  }, [deviceId]);

  // Real-time updates — use deviceUid (not deviceId) to match socket payloads
  useEffect(() => {
    if (!deviceUid) return;

    const handleTelemetry = (payload) => {
      // payload.deviceUid should be raw uid string from MQTT decoding
      if (payload.deviceUid !== deviceUid) return;

      setData(prev => {
        const updateArray = (arr, value) => [...arr.slice(-9), formatVal(value)];
        const newLabel = new Date(payload.telemetry.serverTs).toLocaleTimeString();

        return {
          labels: updateArray(prev.labels, newLabel),
          temps: updateArray(prev.temps, payload.telemetry.temp),
          hums: updateArray(prev.hums, payload.telemetry.hum),
          pm25s: updateArray(prev.pm25s, payload.telemetry.pm25)
        };
      });
    };

    socket.on('telemetry', handleTelemetry);
    return () => socket.off('telemetry', handleTelemetry);
  }, [deviceUid]);

  if (loading) return <div className="text-sm text-gray-500">Loading history...</div>;
  if (!data.labels.length) return <div className="text-sm text-gray-500">No history available</div>;

  const chartData = {
    labels: data.labels,
    datasets: [
      { label: 'Temperature (°C)', data: data.temps, tension: 0.4, pointRadius: 4 },
      { label: 'Humidity (%)', data: data.hums, tension: 0.4, pointRadius: 4 },
      { label: 'PM2.5', data: data.pm25s, tension: 0.4, pointRadius: 4 }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
      title: { display: true, text: 'Device Telemetry (Last 10 readings)' }
    },
    interaction: { mode: 'index', intersect: false },
    scales: { y: { beginAtZero: true }, x: { } }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-full h-80 sm:h-96 md:h-[500px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

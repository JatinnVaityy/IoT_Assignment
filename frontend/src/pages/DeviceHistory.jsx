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

export default function DeviceHistory({ deviceId }) {
  const [data, setData] = useState({
    labels: [],
    temps: [],
    hums: [],
    pm25s: []
  });
  const [loading, setLoading] = useState(true);

  // Helper to format floats safely
  const formatVal = (val) =>
    val != null && !isNaN(val) ? Number(val).toFixed(2) : null;

  // Load initial last 10 readings
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

  // Real-time updates
  useEffect(() => {
    const handleTelemetry = (payload) => {
      if (payload.deviceUid !== deviceId) return;

      setData(prev => {
        const updateArray = (arr, value) => [...arr.slice(-9), formatVal(value)];
        return {
          labels: updateArray(prev.labels, new Date(payload.telemetry.serverTs).toLocaleTimeString()),
          temps: updateArray(prev.temps, payload.telemetry.temp),
          hums: updateArray(prev.hums, payload.telemetry.hum),
          pm25s: updateArray(prev.pm25s, payload.telemetry.pm25)
        };
      });
    };

    socket.on('telemetry', handleTelemetry);
    return () => socket.off('telemetry', handleTelemetry);
  }, [deviceId]);

  if (loading) return <div className="text-sm text-gray-500">Loading history...</div>;
  if (!data.labels.length) return <div className="text-sm text-gray-500">No history available</div>;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.temps,
        borderColor: 'rgba(255, 99, 132, 0.9)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Humidity (%)',
        data: data.hums,
        borderColor: 'rgba(54, 162, 235, 0.9)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'PM2.5',
        data: data.pm25s,
        borderColor: 'rgba(75, 192, 192, 0.9)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14 } }
      },
      tooltip: { mode: 'index', intersect: false },
      title: { display: true, text: 'Device Telemetry (Last 10 readings)', font: { size: 16 } }
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Values', font: { size: 14 } }
      },
      x: {
        title: { display: true, text: 'Time', font: { size: 14 } }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-full h-80 sm:h-96 md:h-[500px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

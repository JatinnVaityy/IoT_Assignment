import React from 'react';
import Modal from 'react-modal';
import DeviceHistory from '../pages/DeviceHistory';

Modal.setAppElement('#root');

export default function DeviceModal({ device, onClose }) {
  if (!device) return null;

  // helper to format values up to 2 decimal places
  const formatValue = (value) => {
    return value !== undefined && value !== null ? Number(value).toFixed(2) : '-';
  };

  return (
    <Modal
      isOpen={!!device}
      onRequestClose={onClose}
      className="w-11/12 max-w-5xl mx-auto mt-6 bg-white rounded-2xl shadow-xl p-6 sm:p-8 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{device.uid}</h2>
          <p className="text-sm text-gray-500 mt-1">Firmware: {device.fw ?? '-'}</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 mt-2 sm:mt-0 text-gray-600 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
        >
          Close
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-2xl shadow text-center">
          <div className="text-sm text-gray-500">Temperature</div>
          <div className="text-3xl font-bold text-red-600 mt-1">
            {formatValue(device.latest?.temp)} °C
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl shadow text-center">
          <div className="text-sm text-gray-500">Humidity</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {formatValue(device.latest?.hum)} %
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-2xl shadow text-center">
          <div className="text-sm text-gray-500">PM2.5</div>
          <div className="text-3xl font-bold text-green-700 mt-1">
            {formatValue(device.latest?.pm25)}
          </div>
        </div>
      </div>

      {/* History Chart */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-3">History (Last 10 readings)</h3>
        <div className="bg-white rounded-2xl shadow p-4">
          <DeviceHistory deviceId={device._id} />
        </div>
      </div>
    </Modal>
  );
}

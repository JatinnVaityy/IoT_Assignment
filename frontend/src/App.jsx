import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Devices from './pages/Devices';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      {/* ToastContainer mounted once at root */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/devices"
          element={token ? <Devices /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={token ? '/devices' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

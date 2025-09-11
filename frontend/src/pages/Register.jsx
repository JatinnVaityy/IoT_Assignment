import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { username, password });
      toast.success('Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ToastContainer />
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
              required
            />
            <span
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>
          <button
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

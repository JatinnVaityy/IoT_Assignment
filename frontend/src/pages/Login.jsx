import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);

      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate('/devices') // navigate after toast disappears
      });
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid username or password', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
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
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

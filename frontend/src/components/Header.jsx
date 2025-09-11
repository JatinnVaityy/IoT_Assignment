import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi'; // optional icons

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold tracking-wide">Utopiatech</div>
        <div className="text-sm text-indigo-100">IoT Device Management</div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-3">
        {token ? (
          <button
            onClick={logout}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold shadow hover:bg-gray-100 transition-all"
          >
            <FiLogOut size={18} /> Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold shadow hover:bg-gray-100 transition-all"
            >
              <FiLogIn size={18} /> Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-200 text-indigo-900 font-semibold shadow hover:bg-indigo-100 transition-all"
            >
              <FiUserPlus size={18} /> Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

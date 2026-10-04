// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Users,
  LogOut,
  Box,
  Film,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Activity,
  Bell,
  Calendar as CalendarIcon,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


// Sample data (static for now)
const revenueData = [7500, 9200, 8100, 10500, 9800, 11200];
const recentActivities = [
  { id: 1, action: 'New user registered', time: '2 minutes ago', status: 'success' },
  { id: 2, action: 'New order #4832', time: '15 minutes ago', status: 'success' },
  { id: 3, action: 'Payment failed #4830', time: '1 hour ago', status: 'error' },
  { id: 4, action: 'New product added', time: '3 hours ago', status: 'success' }
];

// Metric Card Component
const MetricCard = ({ metric }) => {
  const { label, value, change, trend, icon: Icon, bg, iconColor, link, textColor } = metric;
  return (
    <Link to={link} className="block">
      <div className={`${bg} rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-px transform`}>
        <div className="flex justify-between items-start">
          <div className={textColor}>
            <p className="text-sm font-medium opacity-90">{label}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                <TrendingUp size={16} className="mr-1" />
                {change}
              </span>
              <span className="text-xs opacity-80 ml-1">this month</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${iconColor} bg-white bg-opacity-20`}>  
            <Icon size={24} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Revenue Chart Component
const RevenueChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="h-40 flex items-end justify-between">
      {data.map((value, i) => (
        <div key={i} className="flex flex-col items-center w-full">
          <div
            className="w-full bg-indigo-500 rounded-t-sm mx-1"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-xs mt-1 text-gray-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState('');
  const username = localStorage.getItem('userName');

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { message: 'Server health is good.' },
    { message: '5 new user signups today.' }
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showSettings, setShowSettings] = useState(false);

  // Fetch totals on mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return navigate('/login');

    // fetch total users
    fetch('/api/user/totaluser', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => typeof data === 'number' && setTotalUsers(data))
      .catch(() => navigate('/login'));

    // fetch total orders
    fetch('/api/orders/count', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(count => typeof count === 'number' && setTotalOrders(count))
      .catch(err => setError(err.message));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const getRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0');
    return `#${hex}`;
  };

  const [nameColor, setNameColor] = useState(getRandomColor());

  const metrics = [
    {
      label: 'Total Users',
      value: totalUsers,
      change: '+12%',
      trend: 'up',
      icon: Users,
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconColor: 'text-white',
      link: '/admin/manageusers',
      textColor: 'text-white'
    },
    {
      label: 'Total Products',
      value: 33600,
      change: '+5%',
      trend: 'up',
      icon: Box,
      bg: 'bg-gradient-to-br from-green-400 to-green-600',
      iconColor: 'text-white',
      link: '/admin/manageproducts',
      textColor: 'text-white'
    },
    {
      label: 'Total Movies',
      value: 1000,
      change: '+3%',
      trend: 'up',
      icon: Film,
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      iconColor: 'text-white',
      link: '/admin/managemovies',
      textColor: 'text-white'
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      change: '+8%',
      trend: 'up',
      icon: ShoppingCart,
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      iconColor: 'text-white',
      link: '/admin/manageorders',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span style={{ color: nameColor, fontWeight: 600 }}>{username}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white rounded-full"
            >
              <Bell size={20} />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3 z-10">
                <h3 className="text-sm font-semibold mb-2">Notifications</h3>
                {notifications.length
                  ? notifications.map((n, i) => (
                      <div key={i} className="text-sm text-gray-600 border-b py-1">
                        {n.message}
                      </div>
                    ))
                  : <p className="text-sm text-gray-400">No notifications</p>}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)} className="p-2 bg-white rounded-full">
              <CalendarIcon size={20} />
            </button>
            {showCalendar && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-3 z-10">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  inline
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="p-2 bg-white rounded-full">
            <Settings size={20} />
          </button>

          {/* Logout */}
          <button onClick={handleLogout} className="p-2 bg-white rounded-full">
            <LogOut size={20} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <label className="flex items-center mb-2">
              <input type="checkbox" className="mr-2" /> Dark Mode (coming soon)
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Compact Layout (coming soon)
            </label>
            <div className="mt-4 text-right">
              <button onClick={() => setShowSettings(false)} className="text-indigo-500">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 inline-flex bg-white rounded-lg p-1 shadow-sm">
        {['overview', 'analytics', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            } px-4 py-2 rounded-md text-sm font-medium transition-colors`}
          >{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((m) => (
          <Link key={m.label} to={m.link} className="block">
            <div className={`${m.bg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-transform transform hover:-translate-y-px`}>
              <div className="flex justify-between items-start">
                <div className={`${m.textColor}`}> 
                  <p className="text-sm opacity-90">{m.label}</p>
                  <p className="text-3xl font-semibold mt-1">{m.value}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp size={16} className="mr-1 text-green-300" /> {m.change}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${m.iconColor} bg-white bg-opacity-20`}>
                  <m.icon size={24} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Weekly Revenue</h2>
            <div className="flex items-center text-indigo-500 font-medium text-sm">
              <DollarSign size={16} className="mr-1" /> $46,300
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-indigo-500 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map(a => (
              <div key={a.id} className="flex items-start">
                <span className={`${a.status === 'success' ? 'bg-green-500' : 'bg-red-500'} w-2 h-2 rounded-full mt-1`} />
                <div className="ml-3">
                  <p className="text-gray-800 text-sm">{a.action}</p>
                  <p className="text-gray-500 text-xs">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              name: 'Add User',
              icon: Users,
              color: 'bg-blue-100 text-blue-600',
              onClick: () => navigate('http://localhost:5173/signup'), // ✅ navigate to signup
            },
            { name: 'Add Product', icon: Box, color: 'bg-green-100 text-green-600' },
            { name: 'New Order', icon: ShoppingCart, color: 'bg-yellow-100 text-yellow-600' },
            { name: 'View Reports', icon: Activity, color: 'bg-purple-100 text-purple-600' }
          ].map(action => (
            <button key={action.name} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`${action.color} p-3 rounded-full mb-2`}>
                <action.icon size={20} />
              </div>
              <span className="text-gray-700 text-sm font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

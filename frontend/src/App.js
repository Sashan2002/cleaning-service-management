import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Trash2, Edit, Plus, LogOut } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const api = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getBookings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  createBooking: async (token, booking) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(booking)
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  updateBooking: async (token, id, booking) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(booking)
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  deleteBooking: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return response.json();
  },

  getServices: async () => {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  }
};

// Login Component
const LoginForm = ({ onLogin, switchToRegister }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(formData);
      onLogin(result.token, result.user);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">CleanService</h1>
          <p className="text-gray-600">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={switchToRegister}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="p-4 mt-6 rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-600">Demo Credentials:</p>
          <p className="text-sm text-gray-600">Username: admin</p>
          <p className="text-sm text-gray-600">Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

// Register Component
const RegisterForm = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await api.register({
        username: formData.username,
        password: formData.password
      });
      onRegister(result.token, result.user);
    } catch (err) {
      setError('Registration failed. Username might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">CleanService</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={switchToLogin}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ booking, onSubmit, onCancel, services }) => {
  const [formData, setFormData] = useState({
    customer_name: booking?.customer_name || '',
    address: booking?.address || '',
    date_time: booking?.date_time || '',
    service_id: booking?.service_id || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Customer name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.date_time) newErrors.date_time = 'Date and time are required';
    if (!formData.service_id) newErrors.service_id = 'Service selection is required';
    
    // Check if date is in the future
    if (formData.date_time && new Date(formData.date_time) <= new Date()) {
      newErrors.date_time = 'Please select a future date and time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {booking ? 'Edit Booking' : 'New Booking'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customer_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.customer_name && (
              <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter service address"
              rows="3"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.date_time}
              onChange={(e) => setFormData({...formData, date_time: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.date_time ? 'border-red-500' : 'border-gray-300'
              }`}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.date_time && (
              <p className="mt-1 text-sm text-red-500">{errors.date_time}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Service Type *
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({...formData, service_id: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.service_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className="mt-1 text-sm text-red-500">{errors.service_id}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {booking ? 'Update' : 'Create'} Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{booking.service_name}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(booking)}
            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(booking.id)}
            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} />
          <span className="text-sm">{booking.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{booking.address}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span className="text-sm">{formatDate(booking.date_time)}</span>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Service Price</span>
          <span className="text-lg font-semibold text-green-600">${booking.service_price}</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ user, token, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, servicesData] = await Promise.all([
        api.getBookings(token),
        api.getServices()
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      const newBooking = await api.createBooking(token, bookingData);
      setBookings([newBooking, ...bookings]);
      setShowBookingForm(false);
    } catch (err) {
      setError('Failed to create booking');
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      const updatedBooking = await api.updateBooking(token, editingBooking.id, bookingData);
      setBookings(bookings.map(b => b.id === editingBooking.id ? updatedBooking : b));
      setEditingBooking(null);
      setShowBookingForm(false);
    } catch (err) {
      setError('Failed to update booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.deleteBooking(token, bookingId);
        setBookings(bookings.filter(b => b.id !== bookingId));
      } catch (err) {
        setError('Failed to delete booking');
      }
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setShowBookingForm(true);
  };

  const handleFormSubmit = (bookingData) => {
    if (editingBooking) {
      handleUpdateBooking(bookingData);
    } else {
      handleCreateBooking(bookingData);
    }
  };

  const handleFormCancel = () => {
    setShowBookingForm(false);
    setEditingBooking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CleanService</h1>
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors rounded-lg hover:text-gray-800 hover:bg-gray-100"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-blue-600 bg-blue-100 rounded-full">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-green-600 bg-green-100 rounded-full">
                <Clock size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-purple-600 bg-purple-100 rounded-full">
                <User size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Booking
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="mb-6 text-gray-600">Get started by creating your first booking</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Your First Booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
              />
            ))}
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          booking={editingBooking}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          services={services}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check for saved auth data
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (user && token) {
    return <Dashboard user={user} token={token} onLogout={handleLogout} />;
  }

  if (showRegister) {
    return (
      <RegisterForm
        onRegister={handleLogin}
        switchToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      switchToRegister={() => setShowRegister(true)}
    />
  );
};

export default App;
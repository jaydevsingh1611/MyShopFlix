// src/components/OrderSection/DeliveryAddress.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Home,
  Briefcase,
  MapPinned,
  ArrowRight,
  AlertCircle,
  Check
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const token = localStorage.getItem('jwtToken');

function useAddressForm(initial = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const validate = useCallback(() => {
    const e = {};
    if (!values.fullName?.trim()) e.fullName = 'Name is required';
    if (!/^\d{10}$/.test(values.mobile || '')) e.mobile = 'Enter valid 10-digit mobile';
    if (!/^\d{6}$/.test(values.pinCode || '')) e.pinCode = 'Enter valid 6-digit PIN';
    if (!values.address?.trim()) e.address = 'Address is required';
    if (!values.city?.trim()) e.city = 'City is required';
    if (!values.state?.trim()) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);
  return { values, setValues, errors, validate };
}

export default function DeliveryAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId') || 'guest';
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    favorites
  } = location.state ?? {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, setValues, errors, validate } = useAddressForm({
    fullName: '',
    mobile: '',
    pinCode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'HOME'
  });

  const authHeaders = useCallback(() => {
    if (!token) {
      setFeedback({ type: 'error', message: 'Please log in.' });
      throw new Error('No token');
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Navigate to review page
  const goToReview = useCallback(
    addrId => {
      navigate(`/shop/${userId}/cart/address/review`, {
        state: { items, subtotal, discount, shipping, total, appliedCoupon, favorites, addressId: addrId }
      });
    },
    [navigate, userId, items, subtotal, discount, shipping, total, appliedCoupon, favorites]
  );

  // Explicit Continue handler
  const handleContinue = useCallback(() => {
    if (selectedAddrId) goToReview(selectedAddrId);
  }, [goToReview, selectedAddrId]);

  // Fetch saved addresses
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/addresses/${userId}/all`, { headers: authHeaders() });
        setAddresses(res.data);
        if (res.data.length > 0) {
          setSelectedAddrId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', message: 'Failed to fetch addresses.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, authHeaders]);

  // Address selection
  const handleAddressSelect = useCallback(id => {
    setSelectedAddrId(id);
    setShowAddForm(false);
  }, []);

  // Show add form
  const handleNewAddress = useCallback(() => {
    setShowAddForm(true);
    setSelectedAddrId(null);
    setValues({
      fullName: '',
      mobile: '',
      pinCode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      addressType: 'HOME'
    });
  }, [setValues]);

  // Save new address
  const handleSaveAddress = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName.trim(),
        phoneNo: values.mobile.trim(),
        addressLine1: values.address.trim(),
        addressLine2: values.locality.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        postalCode: values.pinCode.trim(),
        country: 'India',
        landMark: values.landmark.trim(),
        addressType: values.addressType,
        isDefault: addresses.length === 0
      };
      const res = await axios.post(`/api/addresses/save?userId=${userId}`, payload, { headers: authHeaders() });
      const saved = { ...payload, id: res.data.id };
      setAddresses(prev => [...prev, saved]);
      setSelectedAddrId(saved.id);
      setShowAddForm(false);
      setFeedback({ type: 'success', message: 'Address saved successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Could not save address.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values, addresses.length, userId, authHeaders]);

  const getAddressIcon = type => {
    if (type === 'HOME') return <Home className="w-5 h-5" />;
    if (type === 'WORK') return <Briefcase className="w-5 h-5" />;
    return <MapPinned className="w-5 h-5" />;
  };

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow flex flex-col max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="p-5 border-b flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Delivery Address</h2>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`mx-5 mt-4 p-3 rounded-md ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {feedback.type === 'success'
                ? <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                : <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              }
              {feedback.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="ml-3 text-gray-600">Loading addresses...</span>
          </div>
        ) : (
          <>
            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Saved Addresses</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map(addr => (
                    <motion.div key={addr.id}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedAddrId === addr.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getAddressIcon(addr.addressType)}
                        <span className="font-medium text-gray-800">
                          {addr.addressType === 'HOME' ? 'Home' : addr.addressType === 'WORK' ? 'Work' : 'Other'}
                        </span>
                        {selectedAddrId === addr.id && (
                          <div className="ml-auto w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-800">{addr.fullName}</p>
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="font-medium">Mobile: {addr.phoneNo}</p>
                        {addr.landMark && <p>Landmark: {addr.landMark}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Addresses */}
            {!loading && addresses.length === 0 && token && userId !== 'guest' && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
                <p className="text-gray-600">Add your first delivery address to continue</p>
              </div>
            )}

            {/* Add New Address Button */}
            {!showAddForm && token && userId !== 'guest' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleNewAddress}
                className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add New Address
              </motion.button>
            )}
          </>
        )}

        {/* Add Address Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gray-50 p-6 rounded-xl border shadow-sm"
            >
              <h3 className="flex items-center gap-2 mb-5 font-semibold text-lg pb-3 border-b">
                <Plus className="w-5 h-5 text-blue-600" /> Add New Address
              </h3>
              {/* Address Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-gray-700">Address Type</label>
                <div className="flex gap-4">
                  {['HOME','WORK','OTHER'].map(type => (
                    <motion.button key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setValues(v => ({ ...v, addressType: type }))}
                      className={`flex flex-col items-center p-3 border rounded-lg w-24 ${
                        values.addressType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {getAddressIcon(type)}
                      <span className="mt-1 text-xs font-medium">
                        {type === 'HOME' ? 'Home' : type === 'WORK' ? 'Work' : 'Other'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { key:'fullName', label:'Full Name*', type:'text' },
                  { key:'mobile', label:'Mobile*', type:'tel', maxLength:10 },
                  { key:'pinCode', label:'PIN Code*', type:'tel', maxLength:6 },
                  { key:'city', label:'City*', type:'text' },
                  { key:'state', label:'State*', type:'text' },
                  { key:'locality', label:'Locality', type:'text' },
                  { key:'landmark', label:'Landmark', type:'text' }
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">{f.label}</label>
                    <input type={f.type} maxLength={f.maxLength}
                      value={values[f.key]}
                      onChange={e => setValues(v => ({
                        ...v,
                        [f.key]: f.type==='tel' ? e.target.value.replace(/[^0-9]/g,'') : e.target.value
                      }))}
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                        errors[f.key] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors[f.key] && <p className="text-red-500 text-xs mt-1.5">{errors[f.key]}</p>}
                  </div>
                ))}
                {/* Address textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Address*</label>
                  <textarea rows={3} placeholder="Enter your complete address"
                    value={values.address}
                    onChange={e => setValues(v => ({ ...v, address: e.target.value }))}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >Cancel</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSaveAddress} disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? (<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>)
                    : <CheckCircle2 className="w-5 h-5" />
                  }
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="px-5 pb-5 flex justify-between items-center border-t pt-5"
      >
        <button onClick={handleBack}
          className="flex items-center gap-2 px-5 py-3 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
        <button onClick={handleContinue} disabled={!selectedAddrId}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
            selectedAddrId
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Review <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

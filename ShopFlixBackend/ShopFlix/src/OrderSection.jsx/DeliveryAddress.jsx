import React, { useState, useEffect } from 'react';
import { 
  MapPin, CheckCircle2, ArrowLeft, Plus, 
  Home, Briefcase, MapPinned, ArrowRight 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const token = localStorage.getItem("jwtToken");

const DeliveryAddress = ({ selectedAddress, setSelectedAddress, proceedToPayment }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "guest";
  
  // State for all addresses fetched from backend
  const [addresses, setAddresses] = useState([]);
  
  // State for controlling whether the form is in "new/edit" mode
  const [newAddressMode, setNewAddressMode] = useState(false);
  
  // State for handling form submission and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  
  // State for the address form
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobile: '',
    pinCode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'HOME' // default selection
  });

  // Helper to return auth headers or show error if no token
  const getAuthHeaders = () => {
    if (!token) {
      setFeedback({ type: 'error', message: 'Authentication required. Please login.' });
      throw new Error('Token missing');
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Navigate back to cart review page
  const handleBackToCart = () => {
    navigate('/shop/1/cart');
  };

  // Fetch all addresses for the user on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/addresses/${userId}/all`, 
          { headers: getAuthHeaders() }
        );
        setAddresses(res.data);
        // If there is an existing HOME address, pre-select it and prefill form
        const homeAddr = res.data.find(addr => addr.addressType === 'HOME');
        if (homeAddr) {
          setSelectedAddress(homeAddr);
          setNewAddress({
            fullName: homeAddr.fullName || '',
            mobile: homeAddr.phoneNo || '',
            pinCode: homeAddr.postalCode || '',
            locality: homeAddr.addressLine2 || '',
            address: homeAddr.addressLine1 || '',
            city: homeAddr.city || '',
            state: homeAddr.state || '',
            landmark: homeAddr.landMark || '',
            addressType: homeAddr.addressType || 'HOME'
          });
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        if (error.response && error.response.status === 401) {
          setFeedback({ type: 'error', message: 'Unauthorized. Please login again.' });
        }
      }
    };
    fetchAddresses();
  }, [userId, setSelectedAddress]);

  // Reset feedback message after 5 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Validate form fields
  const validateAddress = () => {
    const errors = {};
    if (!newAddress.fullName?.trim()) errors.fullName = 'Name is required';
    if (!newAddress.mobile?.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(newAddress.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
    if (!newAddress.pinCode?.trim()) errors.pinCode = 'PIN code is required';
    else if (!/^[0-9]{6}$/.test(newAddress.pinCode)) errors.pinCode = 'Enter a valid 6-digit PIN code';
    if (!newAddress.address?.trim()) errors.address = 'Address is required';
    if (!newAddress.city?.trim()) errors.city = 'City is required';
    if (!newAddress.state?.trim()) errors.state = 'State is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle address type selection: prefill form if an address of that type exists
  const handleAddressTypeSelect = (type) => {
    setNewAddressMode(true);
    const existing = addresses.find(addr => addr.addressType === type);
    if (existing) {
      setNewAddress({
        fullName: existing.fullName || '',
        mobile: existing.phoneNo || '',
        pinCode: existing.postalCode || '',
        locality: existing.addressLine2 || '',
        address: existing.addressLine1 || '',
        city: existing.city || '',
        state: existing.state || '',
        landmark: existing.landMark || '',
        addressType: type
      });
      setSelectedAddress(existing);
    } else {
      // Clear form and set the selected type if no address exists
      setNewAddress({
        fullName: '',
        mobile: '',
        pinCode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        addressType: type
      });
      setSelectedAddress(null);
    }
  };

  // Save (or update) the address using axios.post
  const handleSaveAddress = async () => {
    if (validateAddress()) {
      setIsSubmitting(true);
      try {
        const payload = {
          fullName: newAddress.fullName.trim(),
          phoneNo: newAddress.mobile.trim(),
          addressLine1: newAddress.address.trim(),
          addressLine2: newAddress.locality?.trim() || "",
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          postalCode: newAddress.pinCode.trim(),
          country: "India",
          landMark: newAddress.landmark?.trim() || "",
          addressType: newAddress.addressType,
          isDefault: addresses.length === 0  // if no addresses exist, mark as default
        };
  
        const response = await axios.post(
          `http://localhost:8080/api/addresses/save?userId=${userId}`,
          payload,
          { headers: getAuthHeaders() }
        );
  
        if (response.status === 200) {
          // Merge the saved address into the existing addresses
          const savedAddress = { ...payload, id: response.data.id };
          const filtered = addresses.filter(addr => addr.addressType !== savedAddress.addressType);
          const updatedAddresses = [...filtered, savedAddress];
          setAddresses(updatedAddresses);
          setSelectedAddress(savedAddress);
          setFeedback({ type: 'success', message: 'Address saved successfully!' });
          proceedToPayment();
        }
      } catch (error) {
        console.error("Error saving address:", error);
        setFeedback({ 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to save address. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mx-5 mt-4 p-3 rounded-md ${
              feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {feedback.type === 'success' ? 
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> : 
                <div className="w-5 h-5 mr-2 text-red-500">⚠️</div>
              }
              {feedback.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Address Type Tabs */}
      <div className="p-5">
        <div className="flex gap-4 justify-center">
          {['HOME', 'WORK', 'OTHER'].map((type) => (
            <motion.div
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddressTypeSelect(type)}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all w-32 ${
                newAddress.addressType === type ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              {getAddressTypeIcon(type, newAddress.addressType === type)}
              <span className="mt-2 font-medium">{getAddressTypeLabel(type)}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Editable Address Form */}
      <div className="px-5 pb-5">
        <AnimatePresence>
          <motion.div
            key="new-address-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-6 rounded-xl border shadow-sm"
          >
            <h3 className="font-semibold mb-5 text-lg text-gray-800 flex items-center gap-2 border-b pb-3">
              <Plus className="w-5 h-5 text-blue-600" />
              {addresses.find(addr => addr.addressType === newAddress.addressType)
                ? 'Edit Address'
                : 'Add New Address'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name*</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                    formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.fullName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5"
                  >
                    {formErrors.fullName}
                  </motion.p>
                )}
              </div>
              
              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile*</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={newAddress.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNewAddress({ ...newAddress, mobile: value });
                  }}
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                    formErrors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.mobile && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5"
                  >
                    {formErrors.mobile}
                  </motion.p>
                )}
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address*</label>
                <textarea
                  placeholder="Enter your complete address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  rows={3}
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                    formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.address && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5"
                  >
                    {formErrors.address}
                  </motion.p>
                )}
              </div>
              
              {/* Locality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Locality</label>
                <input
                  type="text"
                  placeholder="Enter your locality"
                  value={newAddress.locality}
                  onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
              </div>
              
              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark</label>
                <input
                  type="text"
                  placeholder="Enter landmark (optional)"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
              </div>
              
              {/* PIN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code*</label>
                <input
                  type="text"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  value={newAddress.pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNewAddress({ ...newAddress, pinCode: value });
                  }}
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                    formErrors.pinCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.pinCode && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5"
                  >
                    {formErrors.pinCode}
                  </motion.p>
                )}
              </div>
              
              {/* City & State in one row */}
              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City*</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                      formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.city && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1.5"
                    >
                      {formErrors.city}
                    </motion.p>
                  )}
                </div>
                
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State*</label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
                      formErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.state && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1.5"
                    >
                      {formErrors.state}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              onClick={handleSaveAddress}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Address & Continue
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {addresses.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-5 pb-5 flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBackToCart}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: '#047857' }}
            whileTap={{ scale: 0.97 }}
            onClick={proceedToPayment}
            disabled={!selectedAddress}
            className={`px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2 ${
              selectedAddress 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Payment
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// Helper functions for address type icons and labels with color support
const getAddressTypeIcon = (type, isSelected) => {
  const iconColor = isSelected ? "text-blue-600" : "text-gray-600";
  
  switch(type) {
    case 'HOME': return <Home className={`w-6 h-6 ${iconColor}`} />;
    case 'WORK': return <Briefcase className={`w-6 h-6 ${iconColor}`} />;
    default: return <MapPinned className={`w-6 h-6 ${iconColor}`} />;
  }
};

const getAddressTypeLabel = (type) => {
  switch(type) {
    case 'HOME': return 'Home';
    case 'WORK': return 'Work';
    default: return 'Other';
  }
};

export default DeliveryAddress;
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

const Notification = ({ notification }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (notification.show) {
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);
  
  if (!notification.show) return null;
  
  return (
    <div className={`fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg transition-all duration-500 transform ${
      isVisible 
        ? 'translate-x-0 opacity-100' 
        : 'translate-x-full opacity-0'
    } ${
      notification.type === 'success' 
        ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
        : 'bg-red-100 text-red-800 border-l-4 border-red-500'
    }`}>
      <div className={`rounded-full p-2 mr-3 ${
        notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'
      }`}>
        {notification.type === 'success' ? (
          <Check className="w-5 h-5 animate-bounce" />
        ) : (
          <AlertCircle className="w-5 h-5 animate-pulse" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm">
          {notification.type === 'success' ? 'Success!' : 'Alert!'}
        </span>
        <span className="text-sm">{notification.message}</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
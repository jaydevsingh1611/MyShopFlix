import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, 
  ChevronRight, ArrowLeft, 
  ShieldCheck, AlertCircle,
  SmartphoneNfc, Landmark, ShoppingCart,
  Check, Info, Wallet
} from 'lucide-react';

// Custom icons for payment methods
const UpiIcon = () => (
  <SmartphoneNfc className="w-6 h-6 text-purple-600" />
);

const NetBankingIcon = () => (
  <Landmark className="w-6 h-6 text-blue-600" />
);

const AmazonPayIcon = () => (
  <ShoppingCart className="w-6 h-6 text-orange-600" />
);

const FlipkartPayIcon = () => (
  <ShoppingCart className="w-6 h-6 text-yellow-600" />
);

const PAYMENT_METHODS = [
  {
    id: 'credit_card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-6 h-6 text-green-600" />,
    supportedNetworks: ['Visa', 'MasterCard', 'American Express', 'RuPay'],
    description: 'Pay securely using your credit or debit card'
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: <UpiIcon />,
    supportedNetworks: ['Google Pay', 'PhonePe', 'Paytm'],
    description: 'Make instant payments with UPI apps'
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    icon: <NetBankingIcon />,
    supportedNetworks: ['HDFC', 'SBI', 'ICICI', 'Axis'],
    description: 'Pay directly from your bank account'
  },
  {
    id: 'amazon_pay',
    name: 'Amazon Pay',
    icon: <AmazonPayIcon />,
    supportedNetworks: [],
    description: 'Quick checkout with your Amazon Pay balance'
  },
  {
    id: 'flipkart_pay',
    name: 'Flipkart Pay',
    icon: <FlipkartPayIcon />,
    supportedNetworks: [],
    description: 'Use your Flipkart Pay balance'
  },
  {
    id: 'wallet',
    name: 'Digital Wallets',
    icon: <Wallet className="w-6 h-6 text-teal-600" />,
    supportedNetworks: ['PayPal', 'Mobikwik', 'FreeCharge'],
    description: 'Pay using your digital wallet balance'
  }
];

const PaymentMethod = ({ selectedPaymentMethod, setSelectedPaymentMethod, goBack, completeOrder, showNotification, orderTotal }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // UPI states
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('');
  const [upiValidated, setUpiValidated] = useState(false);
  
  // Net Banking states
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [netBankingValidated, setNetBankingValidated] = useState(false);
  
  // Credit card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const displayNotification = showNotification || ((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  });

  const handleOrderCompletion = () => {
    if (!selectedPaymentMethod) {
      displayNotification('Please select a payment method', 'warning');
      return;
    }

    // Validate Credit Card details if Credit Card is selected
    if (selectedPaymentMethod.id === 'credit_card') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
        displayNotification('Please enter a valid card number', 'warning');
        return;
      }
      if (!cardName.trim()) {
        displayNotification('Please enter cardholder name', 'warning');
        return;
      }
      if (!expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        displayNotification('Please enter a valid expiry date (MM/YY)', 'warning');
        return;
      }
      if (!cvv.trim() || cvv.length < 3) {
        displayNotification('Please enter a valid CVV', 'warning');
        return;
      }
    }

    // Validate UPI details if UPI is selected
    if (selectedPaymentMethod.id === 'upi' && !upiValidated) {
      if (!upiId.trim()) {
        displayNotification('Please enter your UPI ID', 'warning');
        return;
      }
      if (!upiApp) {
        displayNotification('Please select your UPI app', 'warning');
        return;
      }
    }
    
    // Validate Net Banking details
    if (selectedPaymentMethod.id === 'net_banking' && !netBankingValidated) {
      if (!selectedBank) {
        displayNotification('Please select your bank', 'warning');
        return;
      }
      if (!accountNumber.trim()) {
        displayNotification('Please enter your account number', 'warning');
        return;
      }
      if (!ifscCode.trim()) {
        displayNotification('Please enter IFSC code', 'warning');
        return;
      }
      if (!accountHolderName.trim()) {
        displayNotification('Please enter account holder name', 'warning');
        return;
      }
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      completeOrder();
      setIsProcessing(false);
    }, 1500);
  };

  const validateUpiId = () => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      displayNotification('Please enter a valid UPI ID (example: name@upi)', 'warning');
      return;
    }
    setUpiValidated(true);
    displayNotification('UPI ID verified successfully', 'success');
  };
  
  const validateNetBanking = () => {
    if (!selectedBank) {
      displayNotification('Please select your bank', 'warning');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 10) {
      displayNotification('Please enter a valid account number', 'warning');
      return;
    }
    if (!ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      displayNotification('Please enter a valid IFSC code (e.g., HDFC0000123)', 'warning');
      return;
    }
    if (!accountHolderName.trim()) {
      displayNotification('Please enter account holder name', 'warning');
      return;
    }
    setNetBankingValidated(true);
    displayNotification('Bank details verified successfully', 'success');
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };
  
  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-gray-800">
          <CreditCard className="w-7 h-7 text-blue-600" />
          Payment Method
        </h2>
        <p className="text-gray-500 mt-1">Choose your preferred payment option</p>
      </div>
      
      {/* Notification area */}
      {notification.message && (
        <div className={`mx-4 mt-4 p-3 rounded-md flex items-center gap-2 ${
          notification.type === 'warning'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : notification.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {(notification.type === 'warning' || notification.type === 'error') ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}
      
      <div className="overflow-y-auto flex-grow p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className={`border p-4 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod && selectedPaymentMethod.id === method.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => {
                setSelectedPaymentMethod(method);
                if (method.id !== 'upi') setUpiValidated(false);
                if (method.id !== 'net_banking') setNetBankingValidated(false);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {method.icon}
                  <div>
                    <span className="font-semibold text-gray-800">{method.name}</span>
                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  </div>
                </div>
                {selectedPaymentMethod && selectedPaymentMethod.id === method.id ? (
                  <CheckCircle2 className="text-blue-500 w-6 h-6" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              {method.supportedNetworks.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {method.supportedNetworks.map(network => (
                      <span
                        key={network}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {network}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Credit Card Details Form */}
        {selectedPaymentMethod && selectedPaymentMethod.id === 'credit_card' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-white p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Enter Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength="19"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength="5"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={saveCard}
                  onChange={() => setSaveCard(!saveCard)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                  Save card for future payments
                </label>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm">Your card information is secure and encrypted</span>
              </div>
            </div>
          </div>
        )}
        
        {/* UPI Details Form */}
        {selectedPaymentMethod && selectedPaymentMethod.id === 'upi' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-white p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Enter UPI Details</h3>
              <div className="mb-4">
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="upiId"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={validateUpiId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Verify
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: username@bankname</p>
              </div>
              <div className="mb-4">
                <label htmlFor="upiApp" className="block text-sm font-medium text-gray-700 mb-1">Select UPI App</label>
                <select
                  id="upiApp"
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select App</option>
                  <option value="gpay">Google Pay</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="paytm">Paytm</option>
                  <option value="bhim">BHIM</option>
                  <option value="amazonpay">Amazon Pay</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {upiValidated && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  UPI ID verified successfully
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm">Make secure payments with UPI</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Net Banking Details Form */}
        {selectedPaymentMethod && selectedPaymentMethod.id === 'net_banking' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-white p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Enter Net Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="bankSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                  <select
                    id="bankSelect"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Your Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="idfc">IDFC First Bank</option>
                    <option value="yes">Yes Bank</option>
                    <option value="other">Other Bank</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    id="ifscCode"
                    placeholder="e.g., HDFC0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    id="accountHolder"
                    placeholder="Enter account holder's name"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={validateNetBanking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Verify Details
                </button>
              </div>
              {netBankingValidated && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  Bank details verified successfully
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">Secure Payment</p>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 border-t flex justify-between items-center bg-gray-50">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>
        <button
          onClick={handleOrderCompletion}
          disabled={isProcessing || !selectedPaymentMethod ||
            (selectedPaymentMethod?.id === 'upi' && !upiValidated) ||
            (selectedPaymentMethod?.id === 'net_banking' && !netBankingValidated)}
          className={`px-6 py-2.5 rounded-lg transition-all font-medium flex items-center gap-2 ${
            !selectedPaymentMethod ||
            (selectedPaymentMethod?.id === 'upi' && !upiValidated) ||
            (selectedPaymentMethod?.id === 'net_banking' && !netBankingValidated)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isProcessing
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              Pay ₹{orderTotal ? orderTotal.toFixed(2) : '0.00'}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;

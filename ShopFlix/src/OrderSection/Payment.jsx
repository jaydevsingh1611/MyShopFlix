// Payment.jsx
import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CartContext } from '../component/Context/CartContext';
import { buildOrderRequest } from './OrderRequest';
import { placeOrder } from './placeOrder';

export default function Payment() {
  const navigate = useNavigate();
  const { userId = 'guest', addressId } = useParams();
  const location = useLocation();
  const { clearCart } = useContext(CartContext);

  const selectedItems = location.state?.selectedItems || [];

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  const rawTotal = selectedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const estimatedDelivery = dayjs().add(5, 'day').format('DD MMM, YYYY');

  // Razorpay script loader
  const loadRazorpay = () => new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (!termsChecked) return alert('Agree to Terms & Conditions');
    if (!selectedItems.length) return;

    const addressIdNum = Number(addressId);
    if (!addressIdNum) {
      setError('Invalid address ID');
      setStatus('error');
      return;
    }

    setStatus('pending');
    setError('');

    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded || typeof Razorpay === 'undefined') {
      setError('Payment SDK failed to load');
      setStatus('error');
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const { data: payOrder } = await axios.post(
        'http://localhost:8080/api/payment/create-order',
        { amount: Math.round(rawTotal * 100) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: 'rzp_test_GfS43M13UTOr8T', // Replace with your Razorpay test/live key
        amount: payOrder.amount,
        currency: payOrder.currency,
        order_id: payOrder.id,
        name: 'ShopFlix',
        handler: async (resp) => {
          try {
            const verifyRes = await axios.post(
              'http://localhost:8080/api/payment/verify',
              {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const paymentMethod = verifyRes.data.method?.toUpperCase() || 'UNKNOWN';

            const itemsDTO = selectedItems.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice
            }));

            const orderReq = buildOrderRequest(
              userId,
              addressIdNum,
              'SHIPPED',
              itemsDTO,
              paymentMethod,
              'COMPLETED',
              null
            );

            await placeOrder(orderReq);
            clearCart();
            setStatus('success');

            setTimeout(() => {
              navigate(`/shop/${userId}/thankyou`);
            }, 1200);
          } catch (verifyError) {
            console.error(verifyError);
            setError('Payment verification failed');
            setStatus('error');
          }
        },
        theme: { color: '#1a56db' }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (e) {
      console.error(e);
      setError(e.response?.status === 401 ? 'Unauthorized' : e.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 flex items-center">
        <ArrowLeft className="mr-1" /> Back
      </button>

      <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

      {selectedItems.map(item => (
        <div key={item.productId} className="flex justify-between py-2 border-b">
          <span>#{item.productId} × {item.quantity}</span>
          <span>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
        </div>
      ))}

      <div className="py-2 font-bold text-lg border-b">
        Total: <span className="float-right">₹{rawTotal.toFixed(2)}</span>
      </div>

      <div className="py-2 text-gray-600">Est. Delivery: {estimatedDelivery}</div>

      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={() => setTermsChecked(prev => !prev)}
            className="form-checkbox"
          />
          <span>I agree to the Terms & Conditions</span>
        </label>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={status === 'pending' || !termsChecked}
        className={`mt-6 w-full py-3 rounded-lg text-white ${
          status === 'pending' || !termsChecked
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {status === 'pending' ? 'Processing…' : 'Pay Now'}
      </button>

      {status === 'error' && <p className="mt-4 text-red-600">{error}</p>}

      {status === 'success' && (
        <p className="mt-4 text-green-600 flex items-center">
          <CheckCircle2 className="mr-1" /> Payment & Order Successful!
        </p>
      )}
    </div>
  );
}

// src/components/OrderSection/ReviewOrder.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../component/Context/CartContext';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import StepIndicator from './StepIndicator';

export default function ReviewOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, reloadCart, userId } = useContext(CartContext);

  // 1) Pull everything from location.state
  const {
    items: passedItems,
    subtotal: passedSubtotal,
    discount: passedDiscount,
    shipping: passedShipping,
    total: passedTotal,
    appliedCoupon,
    favorites = [],
    addressId
  } = location.state || {};

  const fromBuyNow = Array.isArray(passedItems) && passedItems.length > 0;

  // 2) Local state & loading
  const [items, setItems] = useState(fromBuyNow ? passedItems : []);
  const [loading, setLoading] = useState(true);

  // 3) On mount: either use passed items or reload cart
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (fromBuyNow) {
      setLoading(false);
    } else {
      reloadCart()
        .then(() => setItems(cartItems))
        .finally(() => setLoading(false));
    }
  }, [userId, fromBuyNow, reloadCart, cartItems]);

  // 4) Loading & empty states
  if (loading) {
    return <div className="p-8 text-center">Loading review…</div>;
  }
  if (!items.length) {
    return (
      <div className="p-8 text-center">
        No items to review.{' '}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 underline"
        >
          Back
        </button>
      </div>
    );
  }

  // 5) Compute totals (use passed if available)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal =
    typeof passedSubtotal === 'number'
      ? passedSubtotal
      : items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const discount =
    typeof passedDiscount === 'number'
      ? passedDiscount
      : items.reduce((sum, i) => sum + (i.actualPrice - i.unitPrice) * i.quantity, 0);

  const shipping =
    typeof passedShipping === 'number'
      ? passedShipping
      : subtotal >= 499
      ? 0
      : 40;

  const total =
    typeof passedTotal === 'number'
      ? passedTotal
      : subtotal - discount + shipping;

  // 6) Render
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <StepIndicator currentStep={2} />

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 mt-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
          <ShoppingBag className="text-blue-600" />
          Review Your Order
        </h2>

        {/* Items */}
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="fill-yellow-400" /> {item.ratings} ({item.noOfRatings})
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    Qty: {item.quantity}
                    {favorites.includes(item.productId) && (
                      <Heart className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  ₹{(item.unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>
              Subtotal ({totalItems} {totalItems > 1 ? 'items' : 'item'})
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>You Saved</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className={shipping === 0 ? 'text-green-600' : ''}>
              {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
            </span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        {appliedCoupon && (
          <div className="mt-4 px-4 py-2 bg-green-50 text-green-800 rounded">
            Coupon <strong>{appliedCoupon.code}</strong> applied (
            {(appliedCoupon.discount * 100).toFixed(0)}% off)
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() =>
              navigate(`/shop/${userId}/cart/address/review/payment/${addressId}`, {
                state: { selectedItems: items }
              })
            }
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

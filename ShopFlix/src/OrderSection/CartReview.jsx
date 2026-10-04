// src/components/OrderSection/CartReviewDemo.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../component/Context/CartContext';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Heart,
  Star,
  Shield,
  Zap,
  Clock,
  Gift,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function CartReviewDemo() {
  const navigate = useNavigate();
  const { items: cartItems, removeFromCart, clearCart, updateQuantity, userId } = useContext(CartContext);

  // State management
  const [localItems, setLocalItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Available coupons for validation
  const availableCoupons = {
    'save10': { code: 'SAVE10', discount: 0.1, minAmount: 0 },
    'premium20': { code: 'PREMIUM20', discount: 0.2, minAmount: 200 },
    'welcome15': { code: 'WELCOME15', discount: 0.15, minAmount: 100 }
  };

  // Initialize local items when cart items change
  useEffect(() => {
    setLocalItems(cartItems.map(item => ({
      ...item,
      // Ensure all required fields have default values
      actualPrice: item.actualPrice || item.unitPrice,
      ratings: item.ratings || 4.5,
      noOfRatings: item.noOfRatings || Math.floor(Math.random() * 1000) + 100,
      image: item.image || '/api/placeholder/150/150'
    })));
  }, [cartItems]);

  // Quantity change handler with validation and context sync
  const handleQuantityChange = useCallback((productId, newQty) => {
    if (newQty < 1 || newQty > 99) return; // Reasonable limits
    
    setAnimatingItems(prev => new Set(prev).add(productId));
    
    // Update local state immediately for smooth UX
    setLocalItems(items =>
      items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQty }
          : item
      )
    );

    // Sync with context if updateQuantity method exists
    if (updateQuantity) {
      updateQuantity(productId, newQty);
    }

    // Clear animation after delay
    setTimeout(() => {
      setAnimatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 300);
  }, [updateQuantity]);

  // Remove item handler with proper cleanup
  const handleRemove = useCallback((productId) => {
    setAnimatingItems(prev => new Set(prev).add(productId));
    
    setTimeout(() => {
      // Remove from context
      removeFromCart(productId);
      
      // Clean up local state
      setLocalItems(items => items.filter(item => item.productId !== productId));
      setSelectedItems(selected => {
        const next = new Set(selected);
        next.delete(productId);
        return next;
      });
      setFavorites(favs => {
        const next = new Set(favs);
        next.delete(productId);
        return next;
      });
      
      setAnimatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 200);
  }, [removeFromCart]);

  // Toggle favorite status
  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  // Toggle item selection for checkout
  const toggleSelect = useCallback((productId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  // Select all items
  const selectAllItems = useCallback(() => {
    setSelectedItems(new Set(localItems.map(item => item.productId)));
  }, [localItems]);

  // Deselect all items
  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Apply coupon with validation
  const applyCoupon = useCallback(() => {
    const code = couponCode.trim().toLowerCase();
    setCouponError('');
    
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const coupon = availableCoupons[code];
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }

    const selectedSubtotal = localItems
      .filter(item => selectedItems.has(item.productId))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    if (selectedSubtotal < coupon.minAmount) {
      setCouponError(`Minimum order amount ₹${coupon.minAmount} required for this coupon`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
    setCouponError('');
  }, [couponCode, availableCoupons, localItems, selectedItems]);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError('');
  }, []);

  // Clear cart with confirmation
  const handleClearCart = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      clearCart();
      setSelectedItems(new Set());
      setFavorites(new Set());
      setAppliedCoupon(null);
      setShowClearConfirm(false);
      setIsLoading(false);
    }, 500);
  }, [clearCart]);

  // Calculate pricing for selected items
  const selectedArray = localItems.filter(item => selectedItems.has(item.productId));
  const selectedSubtotal = selectedArray.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const selectedDiscount = appliedCoupon ? selectedSubtotal * appliedCoupon.discount : 0;
  const selectedShipping = selectedSubtotal > 500 ? 0 : 50;
  const selectedTotal = selectedSubtotal - selectedDiscount + selectedShipping;
  const totalQuantity = selectedArray.reduce((sum, item) => sum + item.quantity, 0);

  // Navigate to checkout
  const proceedToCheckout = useCallback(() => {
    if (selectedArray.length === 0) return;

    const reviewItems = selectedArray.map(item => ({
      ...item,
      actualPrice: item.actualPrice || item.unitPrice,
      ratings: item.ratings || 4.5,
      noOfRatings: item.noOfRatings || '—'
    }));

    navigate(`/shop/${userId || 'guest'}/cart/address`, {
      state: {
        items: reviewItems,
        subtotal: selectedSubtotal.toFixed(2),
        discount: selectedDiscount.toFixed(2),
        shipping: selectedShipping.toFixed(2),
        total: selectedTotal.toFixed(2),
        appliedCoupon,
        favorites: Array.from(favorites)
      }
    });

  }, [selectedArray, selectedSubtotal, selectedDiscount, selectedShipping, selectedTotal, appliedCoupon, favorites, navigate, userId]);

  // Empty cart state
  if (!localItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-md">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Your cart is empty</h3>
          <p className="text-gray-600">Start shopping to discover amazing products!</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
            >
              Start Shopping
            </button>
            <button 
              onClick={clearCart} 
              className="block mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear Cart History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                  <p className="text-gray-600">
                    {localItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Shield className="w-4 h-4" /> Secure Checkout
              </div>
            </div>

            {/* Select All Controls */}
            <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedItems.size === localItems.length && localItems.length > 0}
                  onChange={(e) => e.target.checked ? selectAllItems() : deselectAllItems()}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                  Select All Items
                </label>
              </div>
              <span className="text-sm text-gray-600">
                {selectedItems.size} of {localItems.length} selected
              </span>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {localItems.map((item, idx) => {
                const isSelected = selectedItems.has(item.productId);
                const isAnimating = animatingItems.has(item.productId);
                const isFavorited = favorites.has(item.productId);

                return (
                  <div
                    key={item.productId}
                    className={`
                      bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border p-6
                      transition-all duration-300 ease-in-out
                      ${isAnimating ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'}
                      ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                    style={{ 
                      animationDelay: `${idx * 100}ms`,
                      opacity: isAnimating ? 0.8 : 1
                    }}
                  >
                    <div className="flex gap-6 items-center">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.productId)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />

                      {/* Product Image & Favorite */}
                      <div className="relative group">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/150/150';
                          }}
                        />
                        <button
                          onClick={() => toggleFavorite(item.productId)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${
                              isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
                            }`} 
                          />
                        </button>
                      </div>

                      {/* Product Info & Controls */}
                      <div className="flex-1 space-y-3">
                        {/* Product Name & Remove Button */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span>{item.ratings}</span>
                                <span className="text-gray-400">({item.noOfRatings})</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <Zap className="w-3 h-3" />
                                <span>Fast Delivery</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(item.productId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 rounded-xl p-1">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 99}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {item.actualPrice && item.actualPrice > item.unitPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                ₹{(item.actualPrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                            <div className="text-2xl font-bold text-blue-600">
                              ₹{(item.unitPrice * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Delivery by tomorrow</span>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {item.quantity > 1 && `₹${item.unitPrice.toFixed(2)} each`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon Section */}
        <div className="space-y-6">
          {/* Coupon Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-500" /> Apply Coupon
            </h3>
            
            {!appliedCoupon ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                
                {couponError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{couponError}</span>
                  </div>
                )}
                
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode.trim()}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  Apply Coupon
                </button>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Available coupons:</p>
                  <p>• SAVE10 (10% off)</p>
                  <p>• PREMIUM20 (20% off, min ₹200)</p>
                  <p>• WELCOME15 (15% off, min ₹100)</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        {(appliedCoupon.discount * 100).toFixed(0)}% discount applied
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={removeCoupon} 
                    className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition-colors"
                    title="Remove coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            
            <div className="space-y-4 text-sm">
              {selectedArray.length > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-semibold">₹{selectedSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && selectedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{selectedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={selectedShipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {selectedShipping === 0 ? 'FREE' : `₹${selectedShipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {selectedShipping > 0 && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>
                          Add ₹{(500 - selectedSubtotal).toFixed(2)} more for free shipping!
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">₹{selectedTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select items to see pricing</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={proceedToCheckout}
                disabled={selectedArray.length === 0 || isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                {selectedArray.length === 0
                  ? 'Select Items to Proceed'
                  : `Proceed to Checkout (${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'})`}
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isLoading}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Clearing...' : 'Clear All Items'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Clear Cart?</h3>
              <p className="text-gray-600 mb-6">
                This will remove all {localItems.length} items from your cart. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                disabled={isLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
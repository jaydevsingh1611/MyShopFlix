import React, { useState } from 'react';
import { ShoppingCart, Tag, Loader2, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';

const ProductListing = ({ 
  userId,
  products = [], 
  isLoading, 
  error, 
  setCart, 
  setCurrentStep 
}) => {
  const [cartItems, setCartItems] = useState({});

  const handleBuyNow = (productId) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: prev[productId] ? prev[productId] + 1 : 1,
    }));
  };

  const updateQuantity = (productId, change) => {
    setCartItems(prev => {
      const newQty = Math.max(0, (prev[productId] || 0) + change);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handleRemoveFromDb = async (productId) => {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch(`http://localhost:8080/user_items/items_id/${userId}?items_id=${productId}`,{
        
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setCartItems(prev => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      alert('Item removed from your cart.');
    } catch (err) {
      console.error(err);
      alert('Failed to remove item: ' + err.message);
    }
  };

  const totalPrice = Object.entries(cartItems).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === +id);
    return sum + (p ? (p.discountPrice || p.actualPrice) * qty : 0);
  }, 0);

  const handleProceedToBuy = () => {
    const finalCart = products
      .filter(p => cartItems[p.id])
      .map(p => ({ ...p, quantity: cartItems[p.id] }));
    setCart(finalCart);
    setCurrentStep(2);
  };

  const cartItemsCount = Object.values(cartItems).reduce((total, qty) => total + qty, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-800">Browse Products</h2>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-600">{cartItemsCount} items</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 flex-grow">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 flex-grow">
          <div className="text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-semibold text-lg">{error}</p>
            <p className="text-red-500 mt-2">Please try again later</p>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow p-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map(product => {
              const qty = cartItems[product.id] || 0;
              const isDiscounted = product.discountPrice && product.discountPrice < product.actualPrice;
              
              return (
                <div 
                  key={product.id} 
                  className="relative border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden group"
                >
                  {/* Discount badge */}
                  {isDiscounted && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {Math.round((1 - product.discountPrice / product.actualPrice) * 100)}% OFF
                    </div>
                  )}
                  
                  {/* Delete button - always visible */}
                  <button
                    onClick={() => handleRemoveFromDb(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white shadow-md rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all duration-200"
                    title="Remove from Cart"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center">
                    <div className="mb-4 sm:mb-0 sm:mr-6">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-contain rounded-lg bg-gray-50 p-2"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                          <Tag className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                      <div className="flex items-center mt-3 justify-center sm:justify-start">
                        <span className="text-green-600 font-bold text-xl mr-3">
                          ₹{product.discountPrice || product.actualPrice}
                        </span>
                        {isDiscounted && (
                          <span className="line-through text-gray-400 text-sm">
                            ₹{product.actualPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-4 space-x-3 justify-center sm:justify-start">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleBuyNow(product.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all shadow-sm"
                          >
                            Buy Now
                          </button>
                        ) : (
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-semibold px-4 text-gray-800">{qty}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="p-2 bg-white text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors shadow-sm"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Fixed total amount section at bottom */}
      {Object.keys(cartItems).length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 shadow-lg z-10">
          <div className="flex justify-between font-bold text-xl text-gray-800">
            <span>Total Price:</span>
            <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={handleProceedToBuy}
            className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium text-lg shadow-sm transition-all ml-auto"
          >
            Proceed to Checkout
          </button>

        </div>
      )}
    </div>
  );
};

export default ProductListing;
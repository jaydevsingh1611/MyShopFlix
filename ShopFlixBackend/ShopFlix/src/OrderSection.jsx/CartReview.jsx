import React from 'react';
import { ShoppingCart, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartReview = ({ cart, proceedToDelivery }) => {
  const navigate = useNavigate();



  // Calculate total items in the cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total discount and total price after discount
  const { totalPrice, totalDiscount } = cart.reduce(
    (totals, item) => {
      const actualTotal = item.actualPrice * item.quantity;
      const discountedTotal = (item.discountPrice || item.actualPrice) * item.quantity;
      return {
        totalPrice: totals.totalPrice + discountedTotal,
        totalDiscount: totals.totalDiscount + (actualTotal - discountedTotal),
      };
    },
    { totalPrice: 0, totalDiscount: 0 }
  );

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 sm:p-6 border-b flex items-center justify-between">

        <h2 className="text-xl sm:text-2xl font-bold flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h2>
      </div>

      {/* Cart Items & Summary */}
      {cart.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-gray-600">
          <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl font-medium mb-2">Your cart is empty</p>
          <p className="text-gray-500 mb-4">
            Add some products to proceed with your purchase
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow p-4 sm:p-6">
          {cart.map((item) => {
            const actualTotal = item.actualPrice * item.quantity;
            const discountedTotal = (item.discountPrice || item.actualPrice) * item.quantity;
            const discountAmount = actualTotal - discountedTotal;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center border rounded-lg p-4 mb-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center mb-4 sm:mb-0 sm:mr-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded mr-4"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded mr-4">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="flex items-center">
                      <p className="text-green-700 font-bold">
                        ₹{(item.discountPrice || item.actualPrice).toFixed(2)}
                      </p>
                      {item.discountPrice && (
                        <span className="ml-2 line-through text-gray-500 text-sm">
                          ₹{item.actualPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                  <span className="font-semibold text-green-700">
                    ₹{discountedTotal.toFixed(2)}
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-red-600 text-sm">
                      (You saved ₹{discountAmount.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Total Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>₹{(totalPrice + totalDiscount).toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold mt-1">
                <span>Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span className="text-green-700">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Proceed to Delivery Button */}
      {cart.length > 0 && (
        <div className="p-4 sm:p-6 border-t mt-auto">
          <button
            onClick={proceedToDelivery}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Proceed to Delivery
          </button>
        </div>
      )}
    </div>
  );
};

export default CartReview;

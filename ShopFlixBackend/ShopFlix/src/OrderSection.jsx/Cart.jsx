import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductListing from './ProductListing';
import CartReview from './CartReview';
import DeliveryAddress from './DeliveryAddress';
import PaymentMethod from './PaymentMethod';
import Notification from './Notification';
import StepIndicator from './StepIndicator';

const Cart = () => {
  const token = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId");

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Helper function: Calculate order total based on cart items.
  const calculateOrderTotal = () => {
    return cart.reduce((acc, item) => {
      // Use discountPrice if available; otherwise use actualPrice.
      const itemPrice = item.discountPrice || item.actualPrice;
      return acc + (itemPrice * item.quantity);
    }, 0);
  };

  // Fetch products for step 1
  useEffect(() => {
    if (!userId) return;
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/user_items/cart/${userId}?category=CART`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProducts(res.data || []);
      } catch (err) {
        setProductsError("Failed to fetch products. Please try again later.");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [token, userId]);

  // Fetch addresses for step 3
  useEffect(() => {
    if (!userId) return;
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/addresses/${userId}/all`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const fetched = res.data || [];
        setAddresses(fetched);
        // Auto‑select the default address if one is marked isDefault
        const defaultAddr = fetched.find(a => a.isDefault);
        setSelectedAddress(defaultAddr || null);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };
    fetchAddresses();
  }, [token, userId]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Step navigation
  const proceedToCart = () => setCurrentStep(2);
  const proceedToDelivery = () => setCurrentStep(3);
  const goToPayment = () => setCurrentStep(4);

  const completeOrder = () => {
    // Use the payment method's name rather than the whole object.
    showNotification(`Order completed using ${selectedPaymentMethod ? selectedPaymentMethod.name : ''}`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <ProductListing
          products={products}
          isLoading={isLoadingProducts}
          error={productsError}
          setCart={setCart}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === 2 && (
        <CartReview
          cart={cart}
          proceedToDelivery={proceedToDelivery}
        />
      )}

      {currentStep === 3 && (
        <DeliveryAddress
          addresses={addresses}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
          proceedToPayment={goToPayment}
          backToCart={proceedToCart}
        />
      )}

      {currentStep === 4 && (
        <PaymentMethod
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          completeOrder={completeOrder}
          orderTotal={calculateOrderTotal()}  // Passing the calculated total here
        />
      )}

      <Notification notification={notification} />
    </div>
  );
};

export default Cart;

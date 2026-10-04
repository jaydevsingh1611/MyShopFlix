// src/components/OrderSection/context/OrderContext.jsx
import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [items, setItems] = useState([]);          // Array<{ productId, quantity, unitPrice }>
  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  return (
    <OrderContext.Provider value={{
      items, setItems,
      addressId, setAddressId,
      paymentMethod, setPaymentMethod
    }}>
      {children}
    </OrderContext.Provider>
  );
}

// custom hook for easier consumption
export function useOrder() {
  return useContext(OrderContext);
}

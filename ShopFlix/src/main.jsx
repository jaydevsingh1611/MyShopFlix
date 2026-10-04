import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import store from './store';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './component/Context/CartContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <CartProvider>
        <App />
        <Toaster />
      </CartProvider>
    </Provider>
  </StrictMode>
);


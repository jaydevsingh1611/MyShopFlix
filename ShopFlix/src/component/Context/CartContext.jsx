import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const CartContext = createContext({
  items: [],
  cartCount: 0,
  reloadCart: async () => {},
  reloadCartCount: async () => {},
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  userId: null,
  addressId: null,
  setAddressId: () => {}
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [addressId, setAddressId] = useState(null);
  const [userId, setUserId] = useState(() => {
    const raw = localStorage.getItem('userId');
    return raw != null ? Number(raw) : null;
  });

  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'userId') {
        setUserId(e.newValue != null ? Number(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const api = useMemo(() => {
    const inst = axios.create({ baseURL: 'http://localhost:8080/user_items' });
    inst.interceptors.request.use(cfg => {
      const token = localStorage.getItem('jwtToken');
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      else delete cfg.headers.Authorization;
      return cfg;
    });
    return inst;
  }, []);

  const reloadCart = useCallback(async () => {
    try {
      if (userId == null) {
        setItems([]);
        return;
      }
      const resp = await api.get(`/cart/${userId}`, { params: { category: 'CART' } });
      const products = Array.isArray(resp.data) ? resp.data : [];
      const mapped = products.map(p => ({
        id: p.id,
        productId: p.id,
        name: p.name,
        image: p.image,
        link: p.link,
        mainCategory: p.mainCategory,
        subCategory: p.subCategory,
        actualPrice: p.actualPrice,
        discountPrice: p.discountPrice,
        unitPrice: p.discountPrice > 0 ? p.discountPrice : p.actualPrice,
        quantity: p.quantity ?? 1,
        ratings: p.ratings,
        noOfRatings: p.noOfRatings
      }));
      setItems(mapped);
    } catch (err) {
      console.error('[CartContext.reloadCart] Failed to load cart:', err);
      setItems([]);
    }
  }, [api, userId]);

  const reloadCartCount = useCallback(async () => {
    try {
      if (userId == null) {
        setCartCount(0);
        return;
      }
      const resp = await api.get(`/cart/items/${userId}`);
      setCartCount(resp.data);
    } catch (err) {
      console.error('[CartContext.reloadCartCount] Failed to load cart count:', err);
      setCartCount(0);
    }
  }, [api, userId]);

  const addToCart = useCallback(
    async itemId => {
      try {
        if (userId == null) {
          toast.error('Please log in to add to cart.');
          return;
        }
        await api.post('/add', null, { params: { userId, itemId, category: 'CART' } });
        await reloadCart();
        await reloadCartCount();
        toast.success('Product added to cart.');
      } catch (err) {
        console.error('[CartContext.addToCart] Failed to add item:', err);
        toast.error('Could not add product to cart.');
      }
    },
    [api, userId, reloadCart, reloadCartCount]
  );

  const removeFromCart = useCallback(
    async itemId => {
      if (!userId) {
        toast.error("Please log in to modify your Cart.");
        return;
      }
      const category = "CART";
      try {
        await api.delete(`/items_id/${userId}`, {
          params: { items_id: itemId, category },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            "Content-Type": "application/json"
          }
        });
        setItems(prev => prev.filter(m => m.id !== itemId));
        setCartCount(prev => (typeof prev === "number" ? prev - 1 : prev));
        toast.success("Product removed from Cart.");
      } catch (error) {
        console.error("Error removing product:", error);
        toast.error("Could not remove from Cart. Try again.");
      }
    },
    [api, userId]
  );

  const clearCart = useCallback(
    async () => {
      try {
        if (userId == null) {
          setItems([]);
          setCartCount(0);
          return;
        }
        await Promise.all(
          items.map(i =>
            api.delete(`/items_id/${userId}`, {
              params: { items_id: i.productId, category: 'CART' },
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                "Content-Type": "application/json"
              }
            })
          )
        );
        setItems([]);
        setCartCount(0);
      } catch (err) {
        console.error('[CartContext.clearCart] Failed to clear cart:', err);
      }
    },
    [api, userId, items]
  );

  useEffect(() => {
    reloadCart();
    reloadCartCount();
  }, [userId, reloadCart, reloadCartCount]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        reloadCart,
        reloadCartCount,
        addToCart,
        removeFromCart,
        clearCart,
        userId,
        setUserId,
        addressId,
        setAddressId
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

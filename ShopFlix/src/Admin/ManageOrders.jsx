import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// Enum values for order statuses
const ORDER_STATUSES = [
  'PLACED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURN_REQUESTED',
  'RETURNED',
  'CANCELLED'
];

export default function ManageOrders() {
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');

  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);

  const [orderError, setOrderError] = useState('');
  const [productError, setProductError] = useState('');

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const token = localStorage.getItem('jwtToken');
  const API_BASE = 'http://localhost:8080';

  // Fetch total orders on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const count = res.ok ? await res.json() : 0;
        setTotalOrders(Number(count));
      } catch {
        setOrderError('Failed to fetch order count.');
      }
    })();
  }, [token]);

  const fetchOrder = async (id) => {
    setLoadingOrder(true);
    setOrderError('');
    setOrder(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
      setOrderId(String(id));
    } catch (e) {
      setOrderError(e.message);
    } finally {
      setLoadingOrder(false);
    }
  };

  const fetchProduct = async (id) => {
    setLoadingProduct(true);
    setProductError('');
    setProduct(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
    } catch (e) {
      setProductError(e.message);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleOrderSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setOrderError('Enter a valid Order ID');
      return;
    }
    fetchOrder(orderId);
  };

  const handleProductSearch = (e) => {
    e.preventDefault();
    if (!productId.trim()) {
      setProductError('Enter a valid Product ID');
      return;
    }
    fetchProduct(productId);
  };

  const handleOrderNav = (dir) => {
    const next = Number(orderId) + dir;
    if (next > 0 && next <= totalOrders) fetchOrder(next);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'DELIVERED') return 'text-green-600';
    if (status === 'CANCELLED') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getPaymentColor = (payment) => {
    if (payment === 'COMPLETED') return 'text-green-600';
    if (payment === 'PENDING') return 'text-yellow-600';
    return 'text-red-600';
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/status/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Update failed');
      setOrder((prev) => ({ ...prev, status: newStatus }));
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      alert('Status update failed');
    }
  };

  const canChangeStatus = (current, next) => {
    if (current === 'DELIVERED') return ['RETURN_REQUESTED', 'RETURNED'].includes(next);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="bg-white shadow border-b mb-6">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders & Products</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 grid gap-8 md:grid-cols-2">

        {/* Order Search & Manage */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Search Order</h2>
          <form onSubmit={handleOrderSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                placeholder="Order ID"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="pl-10 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingOrder}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {loadingOrder ? <RefreshCw className="animate-spin mr-2" /> : <Search className="mr-2" />}Go
            </button>
          </form>
          {orderError && <div className="flex items-center bg-red-100 text-red-700 p-2 rounded mb-4"><AlertCircle className="mr-2" />{orderError}</div>}
          {order && (
            <div className="space-y-4">

              {/* Dates */}
              <div className="flex justify-between text-sm">
                <div><span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleString()}</div>
                <div><span className="font-medium">Delivery Date:</span> {new Date(order.deliveryDate).toLocaleDateString()}</div>
              </div>

              {/* Status & Payment */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <select
                    value={order.status}
                    onChange={e => {
                      const newStatus = e.target.value;
                      if (!canChangeStatus(order.status, newStatus)) {
                        alert('Cannot change status from DELIVERED');
                        return;
                      }
                      // confirm change
                      if (window.confirm(`Confirm change status from ${order.status} to ${newStatus}?`)) {
                        updateOrderStatus(newStatus);
                      }
                    }}
                    className={`border px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div className={`font-medium ${getPaymentColor(order.paymentStatus)}`}>Payment: {order.paymentStatus}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mt-2">
                <thead><tr className="bg-gray-100"><th className="p-2 text-left">Product ID</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Subtotal</th></tr></thead>
                <tbody>{order.items.map((it,i)=>(<tr key={i} className={i%2?'bg-gray-50':'bg-white'}><td className="p-2">{it.productId}</td><td className="p-2 text-center">{it.quantity}</td><td className="p-2 text-right">₹{it.unitPrice.toFixed(2)}</td><td className="p-2 text-right">₹{(it.unitPrice*it.quantity).toFixed(2)}</td></tr>))}</tbody>
              </table>

              {/* Navigation */}
              <div className="flex justify-between mt-4">
                <button onClick={()=>handleOrderNav(-1)} disabled={Number(orderId)<=1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center"><ChevronLeft className="mr-1"/>Prev</button>
                <button onClick={()=>handleOrderNav(1)} disabled={Number(orderId)>=totalOrders} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center">Next<ChevronRight className="ml-1"/></button>
              </div>
            </div>
          )}
        </section>

        {/* Product Search Card */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Search Product</h2>
          <form onSubmit={handleProductSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                placeholder="Product ID"
                value={productId}
                onChange={e=>setProductId(e.target.value)}
                className="pl-10 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" disabled={loadingProduct} className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center">{loadingProduct?<RefreshCw className="animate-spin mr-2"/>:<Search className="mr-2"/>}Go</button>
          </form>
          {productError && <div className="flex items-center bg-red-100 text-red-700 p-2 rounded mb-4"><AlertCircle className="mr-2"/>{productError}</div>}
          {product && (
            <div className="space-y-4 text-gray-800">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p><span className="font-medium">Category:</span> {product.mainCategory} → {product.subCategory}</p>
              <p><span className="font-medium">Price:</span> ₹{product.actualPrice.toFixed(2)}</p>
              <p><span className="font-medium">Ratings:</span> {product.ratings} ({product.noOfRatings})</p>
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >View on Amazon</a>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

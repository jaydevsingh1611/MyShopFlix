import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersOrder() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');

  const [orders, setOrders] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        let ordersData = Array.isArray(response.data) ? response.data : [];
        ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(ordersData);
        setLoading(false);

        const uniqueIds = new Set();
        ordersData.forEach(o => o.items.forEach(i => uniqueIds.add(i.productId)));

        const cache = {};
        await Promise.all([...uniqueIds].map(async (id) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/api/orders/product/image/${id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            cache[id] = res.data;
          } catch {
            cache[id] = null;
          }
        }));
        setImageCache(cache);
      })
      .catch((err) => {
        setError(err.response?.statusText || err.message);
        setLoading(false);
      });
  }, [userId, token]);

  if (loading) return <div>Loading orders…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  // Map order status to badge colors
  const statusColors = {
    PLACED:            '#007bff', // blue
    PROCESSING:        '#17a2b8', // cyan
    SHIPPED:           '#6f42c1', // purple
    OUT_FOR_DELIVERY:  '#ffc107', // yellow
    DELIVERED:         '#28a745', // green
    RETURN_REQUESTED:  '#fd7e14', // orange
    RETURNED:          '#6c757d', // gray
    CANCELLED:         '#dc3545'  // red
  };

  // Map payment status to badge colors
  const paymentColors = {
    PENDING:   '#ffc107', // yellow
    COMPLETED: '#28a745', // green
    FAILED:    '#dc3545', // red
    REFUNDED:  '#17a2b8', // cyan
    CANCELLED: '#6c757d'  // gray
  };

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>🧾 Your Orders</h2>
      {orders.length === 0 && <p>No orders found for this user.</p>}

      {orders.map((order, index) => {
        const isLatest = index === 0;
        const statusKey = order.status?.toUpperCase();
        const payKey = order.paymentStatus?.toUpperCase();

        return (
          <div key={order.id} style={{
            ...orderStyle,
            borderLeft: `5px solid ${statusColors[statusKey] || '#007bff'}`,
          }}>
            {isLatest && <div style={latestBadgeStyle}>🆕 Latest Order</div>}

            <div style={headerStyle}>
              <div><strong>Order ID:</strong> #{order.id}</div>
              <div><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-GB')}</div>
              <div><strong>Delivery:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB') : 'N/A'}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{
                  ...badgeStyle,
                  backgroundColor: statusColors[statusKey] || '#007bff',
                  color: 'white'
                }}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <strong>Payment:</strong> {order.paymentMethod}{' '}
                <span style={{
                  ...badgeStyle,
                  backgroundColor: paymentColors[payKey] || '#6c757d',
                  color: 'white'
                }}>
                  {order.paymentStatus}
                </span>
              </div>
              <div><strong>Total:</strong> ₹{order.totalAmount}</div>
            </div>

            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Image</th>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const imgUrl = imageCache[item.productId];
                    return (
                      <tr key={idx}>
                        <td style={tdStyle}>
                          {imgUrl
                            ? <img src={imgUrl} alt="" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover' }} />
                            : <div style={{ fontSize: '0.8rem', color: '#888' }}>No image</div>}
                        </td>
                        <td style={tdStyle}>#{item.productId}</td>
                        <td style={tdStyle}>{item.quantity}</td>
                        <td style={tdStyle}>₹{item.unitPrice.toFixed(2)}</td>
                        <td style={tdStyle}>₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Styles ---
const pageStyle = {
  padding: '1rem',
  backgroundColor: '#f7f9fc',
  minHeight: '100vh'
};

const headingStyle = {
  marginBottom: '2rem',
  fontSize: '1.6rem',
  color: '#222'
};

const orderStyle = {
  marginBottom: '2.5rem',
  padding: '1.5rem 1rem',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  position: 'relative'
};

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '0.5rem',
  fontSize: '0.95rem',
  marginBottom: '1rem',
  color: '#333'
};

const badgeStyle = {
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '0.8rem',
  display: 'inline-block'
};

const latestBadgeStyle = {
  position: 'absolute',
  top: '-12px',
  right: '10px',
  backgroundColor: '#17a2b8',
  color: 'white',
  padding: '0.3rem 0.6rem',
  fontSize: '0.8rem',
  borderRadius: '6px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
};

const tableWrapperStyle = {
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '600px',
  fontSize: '0.9rem'
};

const thStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #ccc',
  backgroundColor: '#f0f0f0',
  textAlign: 'center'
};

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
  textAlign: 'center'
};

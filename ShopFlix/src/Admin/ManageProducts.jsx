import React, { useState } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function ManageProducts() {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token    = localStorage.getItem('jwtToken');
  const API_BASE = 'http://localhost:8080';

  const fetchProduct = async (id) => {
    setLoading(true);
    setError('');
    setProduct(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!productId.trim()) {
      setError('Enter a valid Product ID');
      return;
    }
    fetchProduct(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <section className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Search Product by ID</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="pl-10 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {loading ? <RefreshCw className="animate-spin mr-2" /> : <Search className="mr-2" />} Go
            </button>
          </form>

          {error && (
            <div className="flex items-center bg-red-100 text-red-700 p-2 rounded mb-4">
              <AlertCircle className="mr-2" /> {error}
            </div>
          )}

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
              <p>
                <span className="font-medium">Category:</span> {product.mainCategory} → {product.subCategory}
              </p>
              <p>
                <span className="font-medium">Price:</span> ₹{product.actualPrice.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Ratings:</span> {product.ratings} ({product.noOfRatings})
              </p>
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  View on Amazon
                </a>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

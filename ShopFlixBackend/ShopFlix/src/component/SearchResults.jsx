import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const formatPrice = (price) => (price == null ? "N/A" : Number(price).toFixed(2));
const calculateDiscount = (orig, sale) => (orig > sale ? Math.round(((orig - sale) / orig) * 100) : null);
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) - fullStars >= 0.5;
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < fullStars || (i === fullStars && hasHalf)
              ? "text-yellow-400"
              : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating?.toFixed(1) || "N/A"})</span>
    </div>
  );
};

// Axios instances
const axiosAuth = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});
axiosAuth.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("jwtToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
// Public instance without auth
const axiosPublic = axios.create({ baseURL: "http://localhost:8080" });

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("query") || "").trim();
  const sortBy = searchParams.get("sort") || "relevance";
  const minRating = searchParams.get("rating") || "";

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Infinite scroll observer
  const observer = useRef();
  const lastRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Reset on filters
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, [query, sortBy, minRating, priceRange.min, priceRange.max]);

  // Fetch search results
  useEffect(() => {
    if (!query) return;
    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { query, page, size, sort: sortBy };
        if (minRating) params.minRating = minRating;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        const { data } = await axiosPublic.get('/api/search', { params });
        const items = Array.isArray(data) ? data : data.content || [];
        const enhanced = items.map((item) => ({
          ...item,
          url: item.link || `/product/${item.id}`,
          rating: item.rating ?? Math.random() * 3 + 2,
        }));

        setResults((prev) => (page === 0 ? enhanced : [...prev, ...enhanced]));
        setHasMore(enhanced.length === size);
      } catch (err) {
        if (err.response?.status === 401) {
          // stop infinite scroll silently
          setHasMore(false);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query, sortBy, minRating, priceRange.min, priceRange.max, page]);

  const handleAddToCart = async (item, e) => {
    e.stopPropagation();
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw { response: { status: 401 } };
      await axiosAuth.post('/user_items/add', null, {
        params: { userId, itemId: item.id, category: 'CART' },
      });
      toast.success('Added to cart!');
    } catch (err) {
      if (err.response?.status === 401) toast.error('Please log in to add items.');
      else toast.error('Could not add to cart.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((item, idx) => (
          <div
            key={item.id}
            ref={idx === results.length - 1 ? lastRef : null}
            className="bg-white border p-4 rounded shadow hover:shadow-md transition"
          >
            <img
              src={item.image || '/placeholder.jpg'}
              alt={item.productName}
              className="h-40 w-full object-contain mb-2"
            />
            <h2 className="text-lg font-semibold truncate">{item.productName}</h2>
            <StarRating rating={item.rating} />
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">{item.description}</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">₹{formatPrice(item.discountPrice)}</span>
              {item.actualPrice > item.discountPrice && (
                <>
                  <span className="line-through text-gray-500 text-sm">₹{formatPrice(item.actualPrice)}</span>
                  <span className="text-green-600 text-sm font-medium">(
                    {calculateDiscount(item.actualPrice, item.discountPrice)}% off
                  )</span>
                </>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={(e) => handleAddToCart(item, e)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 px-4 rounded-md text-sm font-medium"
              >
                Add to Cart
              </button>
              <button
                onClick={() => window.open(item.url, '_blank')}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className="mt-4 text-center text-sm text-gray-500">Loading...</p>}
      {!loading && !results.length && <p className="mt-4 text-center text-sm text-gray-500">No items found.</p>}
    </div>
  );
};

export default SearchResults;

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
      <span className="ml-1 text-sm text-gray-600">({(rating ?? 0).toFixed(1)})</span>
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

  // Reset on filters or query change
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, [query, sortBy, minRating, priceRange.min, priceRange.max]);

  // Fetch search results
  useEffect(() => {
    // don't fetch when empty query
    if (!query) {
      setResults([]);
      return;
    }
    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { query, page, size, sort: sortBy };
        if (minRating) params.minRating = minRating;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        const resp = await axiosPublic.get('/api/search', { params });
        // Expecting a Page<ProductSearch> with `content` and `totalElements`
        const pageData = resp.data;
        const items = pageData.content || [];
        const enhanced = items.map((item) => ({
          ...item,
          url: item.link || `/product/${item.id}`,
          rating: item.ratings ?? 0,
        }));

        setResults((prev) => (page === 0 ? enhanced : [...prev, ...enhanced]));
        setHasMore(enhanced.length === size && prev.length + enhanced.length < pageData.totalElements);
      } catch (err) {
        if (err.response?.status === 401) {
          setHasMore(false);
        } else {
          setError(err.message || 'Search failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query, sortBy, minRating, priceRange.min, priceRange.max, page]);

  
  /** Function to add product to cart **/
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
  
    if (!userId || !token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
  
    try {
      await axios.post("http://localhost:8080/user_items/add", null, {
        params: {
          userId: userId,  // ✅ Ensure it matches backend params
          itemId: product.id,  // ✅ Ensure it matches backend params
          category: "CART",
        },
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Proper Bearer token format
          "Content-Type": "application/json",
        },
      });
  
      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else {
        toast.error("Error adding to cart. Try again.");
      }
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
            {/* No description in ES; optionally display subCategory */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
              {item.subCategory || 'No description'}
            </p>
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

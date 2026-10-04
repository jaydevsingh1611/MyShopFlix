import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, LogOut, ShoppingCart, Clock } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId");
  const isAuthenticated = Boolean(token);

  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [watchLaterCount, setWatchLaterCount] = useState(0);

  // Determine if current page is shop/category/search or movies
  const isShopOrCategoryPage =
    location.pathname.includes("/shop") ||
    location.pathname.includes("/category") ||
    location.pathname.includes("/search") ||
    location.pathname === "/";
  const isMoviePage = location.pathname.includes("/movies");

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  // Handle search on pressing Enter.
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (isMoviePage) {
        navigate(`/movies/search?query=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const navigateToCart = () => {
    if (userId) navigate(`/shop/${userId}/cart`);
    else navigate("/login");
  };

  const navigateToWatchLater = () => {
    if (isAuthenticated) navigate("/watchlist");
    else navigate("/login");
  };

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!userId) return;
      try {
        const { data } = await axios.get(
          `http://localhost:8080/user_items/cart/items/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartCount(Number(data) || 0);
      } catch (err) {
        console.error("Error fetching cart count:", err);
      }
    };
    fetchCartCount();
  }, [userId, token]);

  // Fetch watch later count
  useEffect(() => {
    const fetchWatchLaterCount = async () => {
      if (!userId) return;
      try {
        const { data } = await axios.get(
          `http://localhost:8080/user_items/watchlater/items/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWatchLaterCount(Number(data) || 0);
      } catch (err) {
        console.error("Error fetching watch later count:", err);
      }
    };
    fetchWatchLaterCount();
  }, [userId, token]);

  return (
    isAuthenticated && (
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 shadow-lg flex items-center justify-between md:px-8 border-b border-gray-700">
        {/* Logo */}
        <Link to="/shop" className="text-xl font-bold relative overflow-hidden">
          <span className="inline-block animate-pulse bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Shop
          </span>
          <span className="inline-block animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400 bg-clip-text text-transparent">
            Flix
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={isMoviePage ? "Search movies..." : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full py-2 pl-10 pr-4 bg-gray-700 text-white placeholder-gray-400 rounded-full outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 hover:border-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          {isShopOrCategoryPage && (
            <button onClick={navigateToCart} className="relative text-gray-300 hover:text-white">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          )}

          {isMoviePage && (
            <button onClick={navigateToWatchLater} className="relative text-gray-300 hover:text-white">
              <Clock size={24} />
              {watchLaterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {watchLaterCount > 9 ? "9+" : watchLaterCount}
                </span>
              )}
            </button>
          )}

          <button onClick={() => navigate("/profile")} className="text-gray-300 hover:text-white">
            <User size={24} />
          </button>
          <button onClick={handleLogout} className="text-gray-300 hover:text-white">
            <LogOut size={24} />
          </button>
        </div>
      </nav>
    )
  );
};

export default Navbar;

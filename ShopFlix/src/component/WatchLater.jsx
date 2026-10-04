import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Film, Clock, Plus, Heart, Share2, Trash2, Search, Filter, 
  Star, Calendar, User, Play, Grid, List, SortAsc, Eye,
  BookmarkPlus, Sparkles, TrendingUp, X
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Retrieve JWT token from localStorage
const token = localStorage.getItem("jwtToken");

// Create axios instance with baseURL and Authorization header
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { Authorization: `Bearer ${token}` },
});

const WatchLater = () => {
  // Static list of genres (including "all" as default)
  const genres = [
    "all",
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
  ];

  const [watchLaterMovies, setWatchLaterMovies] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [filterGenre, setFilterGenre] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [selectedMovies, setSelectedMovies] = useState(new Set());

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Fetch Watch Later movies list
  useEffect(() => {
    if (!userId || !token) {
      toast.error("Please log in to see your Watch Later list.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    api
      .get(`/user_items/watchlater/${userId}`, {
        params: { category: "WATCHLATER" },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setWatchLaterMovies(Array.isArray(response.data) ? response.data : []);
        setTotalCount(
          typeof response.data?.length === "number" ? response.data.length : null
        );
        setIsLoading(false);
        setIsCountLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching watch later movies:", error);
        toast.error("Failed to load your Watch Later list.");
        setIsLoading(false);
        setIsCountLoading(false);
      });
  }, [userId]);

  // Filter and sort movies list
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = watchLaterMovies.filter((movie) => {
      const matchesSearch =
        movie.seriesTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === "all" || movie.genre === filterGenre;
      return matchesSearch && matchesGenre;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.seriesTitle.localeCompare(b.seriesTitle);
        case "year":
          return parseInt(b.releasedYear) - parseInt(a.releasedYear);
        case "rating":
          return parseFloat(b.imdbRating) - parseFloat(a.imdbRating);
        case "popularity":
          return (b.popularity || 0) - (a.popularity || 0);
        case "dateAdded":
        default:
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      }
    });
  }, [watchLaterMovies, searchTerm, filterGenre, sortBy]);

  // Remove one movie from Watch Later via API
  const handleRemoveFromWatchLater = useCallback(
    async (movieId) => {
      if (!userId || !token) {
        toast.error("Please log in to modify your Watch Later list.");
        return;
      }
      const category = "WATCHLATER";

      try {
        await api.delete(`/user_items/items_id/${userId}`, {
          params: { items_id: movieId, category },
          headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        });
        setWatchLaterMovies((prev) => prev.filter((m) => m.id !== movieId));
        setSelectedMovies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          return newSet;
        });
        setTotalCount((prev) => (typeof prev === "number" ? prev - 1 : prev));
        toast.success("Movie removed from Watch Later.");
      } catch (error) {
        console.error("Error removing movie:", error);
        toast.error("Could not remove from Watch Later. Try again.");
      }
    },
    [userId]
  );

  // Bulk remove selected movies
  const handleBulkRemove = useCallback(async () => {
    if (!userId || !token) {
      toast.error("Please log in to modify your Watch Later list.");
      return;
    }

    const idsToRemove = Array.from(selectedMovies);
    const category = "WATCHLATER";

    try {
      await Promise.all(
        idsToRemove.map((movieId) =>
          api.delete(`/user_items/items_id/watchlater/${userId}`, {
            params: { itemId: movieId, category },
          })
        )
      );
      setWatchLaterMovies((prev) => prev.filter((m) => !selectedMovies.has(m.id)));
      setSelectedMovies(new Set());
      setTotalCount((prev) =>
        typeof prev === "number" ? prev - idsToRemove.length : prev
      );
      toast.success("Selected movies removed.");
    } catch (error) {
      console.error("Bulk remove error:", error);
      toast.error("Could not remove selected movies.");
    }
  }, [userId, selectedMovies]);

  // Toggle checkbox for selecting movies
  const toggleMovieSelection = useCallback((movieId) => {
    setSelectedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.has(movieId) ? newSet.delete(movieId) : newSet.add(movieId);
      return newSet;
    });
  }, []);

  // Navigate to watch movie page
  const handleWatchNow = useCallback(
    (movie) => {
      navigate(`/watch/${movie.id}`);
    },
    [navigate]
  );

  // Movie card component
  const MovieCard = ({ movie }) => (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        viewMode === "list" ? "flex items-center p-4" : ""
      }`}
      onMouseEnter={() => setHoveredMovie(movie.id)}
      onMouseLeave={() => setHoveredMovie(null)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={selectedMovies.has(movie.id)}
          onChange={() => toggleMovieSelection(movie.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Movie poster */}
      <div
        className={`relative overflow-hidden ${
          viewMode === "list" ? "w-20 h-28 flex-shrink-0 mr-4" : "h-72"
        }`}
      >
        <img
          src={movie.posterLink}
          alt={movie.seriesTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1489599763473-9519973bb479?w=400&h=600&fit=crop";
          }}
        />

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300 ${
            hoveredMovie === movie.id ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => handleWatchNow(movie)}
            className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transform transition-transform hover:scale-105"
          >
            <Play size={16} />
            Watch Now
          </button>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          {movie.imdbRating || "N/A"}
        </div>

        {/* Trending indicator */}
        {movie.popularity > 90 && (
          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={10} />
            Hot
          </div>
        )}
      </div>

      {/* Movie details */}
      <div className={`p-4 ${viewMode === "list" ? "flex-grow" : ""}`}>
        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
          {movie.seriesTitle}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <User size={14} />
          <span className="text-sm truncate">{movie.director}</span>
          <span className="text-gray-300">•</span>
          <Calendar size={14} />
          <span className="text-sm">{movie.releasedYear}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span className="text-sm">{movie.runtime}</span>
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {movie.genre}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleWatchNow(movie)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Play size={16} />
            Watch
          </button>

          <button className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group">
            <Heart size={18} className="text-red-500 group-hover:fill-current transition-all" />
          </button>

          <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Share2 size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => handleRemoveFromWatchLater(movie.id)}
            className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors group"
            title="Remove from Watch Later"
          >
            <Trash2
              size={18}
              className="text-gray-600 group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookmarkPlus size={48} className="text-yellow-400" />
                <div>
                  <h1 className="text-5xl font-bold mb-2">Watch Later</h1>
                  <p className="text-xl opacity-90 flex items-center gap-2">
                    <Sparkles size={20} />
                    Your curated collection awaits
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold">
                  {isCountLoading ? "..." : totalCount || watchLaterMovies.length}
                </div>
                <div className="text-sm opacity-90">Movies Saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters and Sort */}
            <div className="flex gap-3 items-center flex-wrap">
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="rating">Rating</option>
                <option value="popularity">Popularity</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "hover:bg-gray-200"
                  }`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "hover:bg-gray-200"
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMovies.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedMovies.size} movie
                {selectedMovies.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMovies(new Set())}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded font-medium transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Loading your Watch Later collection...
            </p>
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Film size={48} className="text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-3">
              {searchTerm || filterGenre !== "all"
                ? "No matches found"
                : "Your watch later list is empty"}
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm || filterGenre !== "all"
                ? "Try adjusting your search or filters to find what you’re looking for"
                : "Discover amazing movies and save them for the perfect moment"}
            </p>
            {searchTerm || filterGenre !== "all" ? (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setFilterGenre("all")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Show All
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/movies")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Explore Movies
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredAndSortedMovies.length} of{" "}
                {watchLaterMovies.length} movies
                {(searchTerm || filterGenre !== "all") && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (filtered)
                  </span>
                )}
              </p>
            </div>

            {/* Movies Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-4"
              }
            >
              {filteredAndSortedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WatchLater;

import React, { useState } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function ManageMovies() {
  const [movieId, setMovieId] = useState('');
  const [movie, setMovie] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  const token    = localStorage.getItem('jwtToken');
  const API_BASE = 'http://localhost:8080';

  const fetchMovieDetail = async (id) => {
    setLoadingDetail(true);
    setDetailError('');
    setMovie(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Movie not found');
      const data = await res.json();
      setMovie(data);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDetailSearch = (e) => {
    e.preventDefault();
    if (!movieId.trim()) {
      setDetailError('Enter a valid Movie ID');
      return;
    }
    fetchMovieDetail(movieId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white shadow border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Movies</h1>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-6 py-8">
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Search Movie by ID</h2>
          <form onSubmit={handleDetailSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                placeholder="Movie ID"
                value={movieId}
                onChange={e => setMovieId(e.target.value)}
                className="pl-10 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingDetail}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {loadingDetail
                ? <RefreshCw className="animate-spin mr-2" />
                : <RefreshCw className="mr-2 hidden" />}
              <Search className="mr-2" /> Go
            </button>
          </form>

          {detailError && (
            <div className="flex items-center bg-red-100 text-red-700 p-2 rounded mb-4">
              <AlertCircle className="mr-2" /> {detailError}
            </div>
          )}

          {movie && (
            <div className="space-y-4 text-gray-800">
              <h3 className="text-lg font-semibold">{movie.seriesTitle}</h3>
              <div className="w-full h-64 overflow-hidden rounded-lg">
                <img
                  src={movie.posterLink}
                  alt={movie.seriesTitle}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Year:</span> {movie.releasedYear}</p>
                <p><span className="font-medium">Certificate:</span> {movie.certificate}</p>
                <p><span className="font-medium">Runtime:</span> {movie.runtime}</p>
                <p><span className="font-medium">Genre:</span> {movie.genre}</p>
              </div>
              <p><span className="font-medium">IMDB Rating:</span> {movie.imdbRating}</p>
              <p><span className="font-medium">MetaScore:</span> {movie.metaScore}</p>
              <p><span className="font-medium">Director:</span> {movie.director}</p>
              <p className="mt-2 text-sm text-gray-700"><span className="font-medium">Overview:</span> {movie.overview}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

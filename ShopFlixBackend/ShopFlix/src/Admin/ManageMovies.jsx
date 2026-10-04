
// src/admin/ManageMovies.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await axios.get('/api/admin/movies');
        setMovies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) return <div>Loading movies...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Manage Movies</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Release Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie.id} className="border-t">
              <td className="px-4 py-2">{movie.id}</td>
              <td className="px-4 py-2">{movie.title}</td>
              <td className="px-4 py-2">{movie.releaseDate}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm">Edit</button>
                <button className="px-3 py-1 rounded bg-red-500 text-white text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

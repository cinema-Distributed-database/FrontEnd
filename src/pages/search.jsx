'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMovies, handleApiError } from '../lib/api';
import MovieCard from '../components/movie-card';
import { Button } from '../components/ui/button';
import { Film } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchMovies({ q: query });
        setResults(searchResults || []);
      } catch (apiError) {
        const err = handleApiError(apiError);
        setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="h-8 w-3/4 bg-gray-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lỗi Tìm Kiếm</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link to="/">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">
        Kết quả tìm kiếm cho: <span className="text-yellow-400">"{query}"</span>
      </h1>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <Film size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Không tìm thấy phim nào phù hợp.</p>
          <p className="text-sm text-gray-500">Vui lòng thử với từ khóa khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
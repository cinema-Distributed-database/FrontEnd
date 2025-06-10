'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import MovieCard from '../components/movie-card';
import {
  fetchNowShowingMovies,
  fetchComingSoonMovies,
  fetchTheater,
  handleApiError,
} from '../lib/api';

export default function CinemaMoviesPage() {
  const [searchParams] = useSearchParams();
  const cinemaId = searchParams.get('cinema');
  const city = searchParams.get('city');

  const [cinemaInfo, setCinemaInfo] = useState(null);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nowShowingPage, setNowShowingPage] = useState(0);
  const [comingSoonPage, setComingSoonPage] = useState(0);
  const MOVIES_PER_PAGE = 4;

  useEffect(() => {
    if (!cinemaId) {
      setError('Không có thông tin rạp được chọn.');
      setLoading(false);
      return;
    }

    const loadCinemaMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cinemaDetails, nowShowingRes, comingSoonRes] = await Promise.all([
          fetchTheater(cinemaId),
          fetchNowShowingMovies({ cinemaId, size: 100 }),
          fetchComingSoonMovies({ cinemaId, size: 50 }),
        ]);

        setCinemaInfo(cinemaDetails);
        // SỬA LỖI: Chỉ lấy mảng phim từ thuộc tính 'content'
        setNowShowingMovies(nowShowingRes.content || []);
        setComingSoonMovies(comingSoonRes.content || []);
      } catch (apiError) {
        console.error('Lỗi khi tải dữ liệu phim của rạp:', apiError);
        const err = handleApiError(apiError);
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadCinemaMovieData();
  }, [cinemaId]);

  const totalNowShowingPages = Math.ceil(nowShowingMovies.length / MOVIES_PER_PAGE);
  const handleNextNowShowing = () => setNowShowingPage((prev) => (prev + 1) % totalNowShowingPages);
  const handlePrevNowShowing = () =>
    setNowShowingPage((prev) => (prev - 1 + totalNowShowingPages) % totalNowShowingPages);
  const currentNowShowingMovies = nowShowingMovies.slice(
    nowShowingPage * MOVIES_PER_PAGE,
    (nowShowingPage + 1) * MOVIES_PER_PAGE
  );

  const totalComingSoonPages = Math.ceil(comingSoonMovies.length / MOVIES_PER_PAGE);
  const handleNextComingSoon = () => setComingSoonPage((prev) => (prev + 1) % totalComingSoonPages);
  const handlePrevComingSoon = () =>
    setComingSoonPage((prev) => (prev - 1 + totalComingSoonPages) % totalComingSoonPages);
  const currentComingSoonMovies = comingSoonMovies.slice(
    comingSoonPage * MOVIES_PER_PAGE,
    (comingSoonPage + 1) * MOVIES_PER_PAGE
  );

  if (loading) {
    return (
      <div className="bg-[#0a1426] text-white min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-16 w-16 text-yellow-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-semibold">Đang tải lịch chiếu, vui lòng chờ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-red-500 mb-6">Đã có lỗi xảy ra!</h2>
        <p className="text-gray-300 mb-8 text-lg">{error}</p>
        <Link to="/theaters">
          <Button
            variant="outline"
            className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            Quay lại trang chọn rạp
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#100C2A] text-white">
      <div className="container mx-auto my-8 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
          {cinemaInfo?.name || 'Lịch chiếu phim'}
        </h1>
        <p className="text-gray-300 mt-2">{cinemaInfo?.address}</p>
      </div>

      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Đang Chiếu</h2>
        </div>

        {nowShowingMovies.length > 0 ? (
          <div className="relative">
            {totalNowShowingPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevNowShowing}
                className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentNowShowingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} city={city} cinemaId={cinemaId} />
              ))}
            </div>

            {totalNowShowingPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextNowShowing}
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            Rạp này hiện không có phim nào đang chiếu.
          </p>
        )}
      </div>

      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Sắp Chiếu</h2>
        </div>

        {comingSoonMovies.length > 0 ? (
          <div className="relative">
            {totalComingSoonPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevComingSoon}
                className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentComingSoonMovies.map((movie) => (
                <MovieCard
                  key={`coming-${movie.id}`}
                  movie={{ ...movie, isComingSoon: true }}
                  city={city}
                  cinemaId={cinemaId}
                />
              ))}
            </div>

            {totalComingSoonPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextComingSoon}
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            Chưa có thông tin phim sắp chiếu tại rạp này.
          </p>
        )}
      </div>
    </div>
  );
}
'use client';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import MovieCard from '../components/movie-card';
import {
  fetchMovies,
  fetchTheaters,
  fetchShowtimes,
  fetchNowShowingMovies,
  fetchComingSoonMovies,
} from '../lib/api';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [allMoviesForFilter, setAllMoviesForFilter] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showtimesForFilter, setShowtimesForFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const navigate = useNavigate();

  const MOVIES_PER_PAGE_CLIENT = 4; // Số phim hiển thị trên UI mỗi trang
  const MOVIES_PER_PAGE_SERVER = 150; // Số phim tải về từ server mỗi lần gọi

  const [nowShowingClientPage, setNowShowingClientPage] = useState(0);
  const nowShowingBackendPage = useRef(0);
  const [nowShowingTotalPages, setNowShowingTotalPages] = useState(0);

  const [comingSoonClientPage, setComingSoonClientPage] = useState(0);
  const comingSoonBackendPage = useRef(0);
  const [comingSoonTotalPages, setComingSoonTotalPages] = useState(0);
  
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const banners = [
    {
      id: 1,
      image:
        'https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139242/Screenshot_2025-06-05_222948_b28dbm.png',
      alt: 'Banner ưu đãi hấp dẫn',
      link: '/promotions/1',
    },
    {
      id: 2,
      image:
        'https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139763/Screenshot_2025-06-05_222822_gj7tdt.png',
      alt: 'Banner phim mới hằng tuần',
      link: '/movies',
    },
    {
      id: 3,
      image:
        'https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139341/Screenshot_2025-06-05_222429_xbq5tb.png',
      alt: 'Banner combo các loại bắp nước snacks, ăn vặt',
      link: '/concessions',
    },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [nowShowingRes, comingSoonRes, theatersPage, allMoviesRes] = await Promise.all([
          fetchNowShowingMovies({ page: 0, size: MOVIES_PER_PAGE_SERVER }),
          fetchComingSoonMovies({ page: 0, size: MOVIES_PER_PAGE_SERVER }),
          fetchTheaters({ page: 0, size: 100 }),
          fetchMovies({ page: 0, size: 100 }),
        ]);

        setNowShowingMovies(nowShowingRes.content || []);
        setNowShowingTotalPages(nowShowingRes.totalPages || 0);

        setComingSoonMovies(comingSoonRes.content || []);
        setComingSoonTotalPages(comingSoonRes.totalPages || 0);

        setTheaters(theatersPage.content || []);
        setAllMoviesForFilter(allMoviesRes.content || []);

        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      } catch (apiError) {
        console.error('Error loading initial data:', apiError);
        setError('Không thể tải dữ liệu trang chủ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset suat chieu
    setSelectedTime('');
    setShowtimesForFilter([]);

    if (selectedMovie && selectedTheater && selectedDate) {
      const loadShowtimesForFilter = async () => {
        try {
          const showtimesData = await fetchShowtimes({
            movieId: selectedMovie,
            cinemaId: selectedTheater,
            date: selectedDate,
          });
          setShowtimesForFilter(showtimesData || []);
        } catch (apiError) {
          console.error('Error loading showtimes for filter:', apiError);
          setShowtimesForFilter([]);
        }
      };
      loadShowtimesForFilter();
    }
  }, [selectedMovie, selectedTheater, selectedDate]);

  const handleNextNowShowing = async () => {
    const newClientPage = nowShowingClientPage + 1;
    const totalClientPages = Math.ceil(nowShowingMovies.length / MOVIES_PER_PAGE_CLIENT);
    
    if (newClientPage >= totalClientPages) return; // Đã ở trang cuối của dữ liệu hiện có

    setNowShowingClientPage(newClientPage);

    // Kiểm tra xem có cần tải thêm dữ liệu không
    const moviesNeeded = (newClientPage + 1) * MOVIES_PER_PAGE_CLIENT;
    const hasEnoughData = moviesNeeded <= nowShowingMovies.length;
    const hasMoreOnServer = nowShowingBackendPage.current < nowShowingTotalPages - 1;

    if (!hasEnoughData && hasMoreOnServer && !isFetchingMore) {
      setIsFetchingMore(true);
      try {
        nowShowingBackendPage.current += 1;
        const moreMovies = await fetchNowShowingMovies({ page: nowShowingBackendPage.current, size: MOVIES_PER_PAGE_SERVER });
        setNowShowingMovies(prev => [...prev, ...(moreMovies.content || [])]);
      } catch (error) {
        console.error('Error fetching more now showing movies:', error);
      } finally {
        setIsFetchingMore(false);
      }
    }
  };

  const handlePrevNowShowing = () => setNowShowingClientPage((prev) => Math.max(prev - 1, 0));

  const handleNextComingSoon = async () => {
    const newClientPage = comingSoonClientPage + 1;
    const totalClientPages = Math.ceil(comingSoonMovies.length / MOVIES_PER_PAGE_CLIENT);

    if (newClientPage >= totalClientPages) return;

    setComingSoonClientPage(newClientPage);

    const moviesNeeded = (newClientPage + 1) * MOVIES_PER_PAGE_CLIENT;
    const hasEnoughData = moviesNeeded <= comingSoonMovies.length;
    const hasMoreOnServer = comingSoonBackendPage.current < comingSoonTotalPages - 1;

    if (!hasEnoughData && hasMoreOnServer && !isFetchingMore) {
      setIsFetchingMore(true);
      try {
        comingSoonBackendPage.current += 1;
        const moreMovies = await fetchComingSoonMovies({ page: comingSoonBackendPage.current, size: MOVIES_PER_PAGE_SERVER });
        setComingSoonMovies(prev => [...prev, ...(moreMovies.content || [])]);
      } catch (error) {
        console.error('Error fetching more coming soon movies:', error);
      } finally {
        setIsFetchingMore(false);
      }
    }
  };
  
  const handlePrevComingSoon = () => setComingSoonClientPage((prev) => Math.max(prev - 1, 0));

  const currentNowShowingMovies = nowShowingMovies.slice(
    nowShowingClientPage * MOVIES_PER_PAGE_CLIENT,
    (nowShowingClientPage + 1) * MOVIES_PER_PAGE_CLIENT
  );

  const currentComingSoonMovies = comingSoonMovies.slice(
    comingSoonClientPage * MOVIES_PER_PAGE_CLIENT,
    (comingSoonClientPage + 1) * MOVIES_PER_PAGE_CLIENT
  );

  // Calculate total client pages for pagination dots
  const totalNowShowingClientPages = Math.ceil(nowShowingMovies.length / MOVIES_PER_PAGE_CLIENT);
  const totalComingSoonClientPages = Math.ceil(comingSoonMovies.length / MOVIES_PER_PAGE_CLIENT);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBookTicket = () => {
    if (selectedMovie && selectedTheater && selectedDate && selectedTime) {
      // `selectedTime` giờ đã là ID của suất chiếu, chỉ cần điều hướng
      navigate(`/booking?showtime=${selectedTime}`);
    } else {
      alert('Vui lòng chọn đầy đủ các thông tin.');
    }
  };

  const getAvailableTimes = () => {
    if (!selectedMovie || !selectedTheater || !selectedDate || showtimesForFilter.length === 0)
      return [];

    return showtimesForFilter
      .map((st) => ({
        // store IDshowtime
        value: st.id,
        label: new Date(st.showDateTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
      .filter((item, index, self) => index === self.findIndex((t) => t.label === item.label))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const label =
        i === 0
          ? 'Hôm nay'
          : i === 1
            ? 'Ngày mai'
            : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      dates.push({
        value: dateString,
        label: `${label} - ${date.toLocaleDateString('vi-VN', { weekday: 'long' })}`,
      });
    }
    return dates;
  };

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
          <p className="mt-4 text-lg font-semibold">Đang tải dữ liệu, vui lòng chờ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-red-500 mb-6">Rất tiếc, đã có lỗi xảy ra!</h2>
        <p className="text-gray-300 mb-8 text-lg">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#100C2A] text-white">
      <div className="relative overflow-hidden h-[35vh] sm:h-[40vh] md:h-[45vh] max-h-[480px] w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full h-[60vh] flex-shrink-0 relative">
              <Link to={banner.link}>
                <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover" />
              </Link>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 sm:p-3 rounded-full transition-colors duration-300 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} sm={28} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 sm:p-3 rounded-full transition-colors duration-300 z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={24} sm={28} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-yellow-500 scale-125' : 'bg-white/60 hover:bg-white/90'}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ĐẶT VÉ NHANH */}
      <div className="container mx-auto my-10 px-4 relative z-20">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
          <h2 className="text-xl font-bold uppercase text-white tracking-wider whitespace-nowrap pr-4">
            Đặt vé nhanh
          </h2>

          <div className="flex-grow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Chọn Rạp */}
            <Select value={selectedTheater} onValueChange={setSelectedTheater}>
              <SelectTrigger className="w-full bg-white text-purple-900 font-semibold border-purple-300">
                <SelectValue placeholder={selectedTheater ? theaters.find(t => t.id === selectedTheater)?.name : '1. Chọn Rạp'} />
              </SelectTrigger>
              <SelectContent className="bg-white text-purple-900">
                {theaters.map((theater) => (
                  <SelectItem key={theater.id} value={theater.id} className="hover:bg-purple-100">
                    {theater.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chọn Phim */}
            <Select value={selectedMovie} onValueChange={setSelectedMovie}>
              <SelectTrigger className="w-full bg-white text-purple-900 font-semibold border-purple-300">
                <SelectValue placeholder={selectedMovie ? allMoviesForFilter.find(m => m.id === selectedMovie)?.title : '2. Chọn Phim'} />
              </SelectTrigger>
              <SelectContent className="bg-white text-purple-900">
                {allMoviesForFilter.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id} className="hover:bg-purple-100">
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chọn Ngày */}
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full bg-white text-purple-900 font-semibold border-purple-300">
                <SelectValue placeholder={selectedDate ? getDateOptions().find(d => d.value === selectedDate)?.label : '3. Chọn Ngày'} />
              </SelectTrigger>
              <SelectContent className="bg-white text-purple-900">
                {getDateOptions().map((date) => (
                  <SelectItem key={date.value} value={date.value} className="hover:bg-purple-100">
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chọn Suất */}
            <Select
              value={selectedTime}
              onValueChange={setSelectedTime}
              disabled={getAvailableTimes().length === 0}
            >
              <SelectTrigger
                className="w-full bg-white text-purple-900 font-semibold border-purple-300"
                disabled={getAvailableTimes().length === 0}
              >
                <SelectValue
                  placeholder={selectedTime ? getAvailableTimes().find(t => t.value === selectedTime)?.label : '4. Chọn Suất'}
                />
              </SelectTrigger>
              <SelectContent className="bg-white text-purple-900">
                {getAvailableTimes().map((time) => (
                  <SelectItem key={time.value} value={time.value} className="hover:bg-purple-100">
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full md:w-auto px-8 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handleBookTicket}
            disabled={!selectedTheater || !selectedMovie || !selectedDate || !selectedTime}
          >
            ĐẶT NGAY
          </Button>
        </div>
      </div>

      {/* === PHẦN PHIM ĐANG CHIẾU === */}
      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Đang Chiếu</h2>
        </div>

        {nowShowingMovies.length > 0 ? (
          <div className="relative">
            {/* Nút lùi */}
            {totalNowShowingClientPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevNowShowing}
                disabled={nowShowingClientPage === 0}
                className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentNowShowingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Nút tiến */}
            {totalNowShowingClientPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextNowShowing}
                disabled={nowShowingClientPage >= totalNowShowingClientPages - 1}
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Dấu chấm phân trang */}
            {totalNowShowingClientPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalNowShowingClientPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNowShowingClientPage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${nowShowingClientPage === i ? 'bg-yellow-500 scale-125' : 'bg-white/60 hover:bg-white/90'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Hiện không có phim nào đang chiếu.</p>
        )}
      </div>

      {/* === PHẦN PHIM SẮP CHIẾU === */}
      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Sắp Chiếu</h2>
        </div>

        {comingSoonMovies.length > 0 ? (
          <div className="relative">
            {/* Nút lùi */}
            {totalComingSoonClientPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevComingSoon}
                disabled={comingSoonClientPage === 0}
                className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentComingSoonMovies.map((movie) => (
                <MovieCard key={`coming-${movie.id}`} movie={{ ...movie, isComingSoon: true }} />
              ))}
            </div>

            {/* Nút tiến */}
            {totalComingSoonClientPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextComingSoon}
                disabled={comingSoonClientPage >= totalComingSoonClientPages - 1}
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border-gray-600 hidden lg:flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Dấu chấm phân trang */}
            {totalComingSoonClientPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalComingSoonClientPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setComingSoonClientPage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${comingSoonClientPage === i ? 'bg-purple-500 scale-125' : 'bg-white/60 hover:bg-white/90'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Chưa có thông tin phim sắp chiếu.</p>
        )}
      </div>
    </div>
  );
}
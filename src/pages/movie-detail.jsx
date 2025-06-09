'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Film,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  fetchMovie,
  fetchShowtimes,
  fetchCitiesWithTheaters,
  fetchTheatersByCity,
} from '../lib/api';

function TheaterShowtimes({ showtimes, onBookTicket, city }) {
  const [isOpen, setIsOpen] = useState(true);

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!showtimes || showtimes.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1a163a] border border-gray-700 rounded-lg mb-4">
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-xl font-semibold text-yellow-400">
            {showtimes[0]?.cinemaName}
            {city && ` (${city})`}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{showtimes[0]?.cinemaAddress}</p>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm font-semibold mb-3">2D Phụ Đề</p>
          <div className="flex flex-wrap gap-3">
            {showtimes
              .sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime))
              .map((showtime) => (
                <Button
                  key={showtime.id}
                  variant="outline"
                  className="border-gray-500 hover:bg-yellow-500 hover:text-black bg-transparent text-white"
                  onClick={() => onBookTicket(showtime.id)}
                >
                  {formatTime(showtime.showDateTime)}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const getAgeRatingDescription = (ageRating) => {
  const rating = (ageRating || '').toUpperCase();

  if (rating.includes('C18') || rating.includes('T18')) {
    return 'Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+).';
  }
  if (rating.includes('C16') || rating.includes('T16')) {
    return 'Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+).';
  }
  if (rating.includes('C13') || rating.includes('T13')) {
    return 'Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+).';
  }
  if (rating === 'K') {
    return 'Phim phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ.';
  }

  return 'Phim dành cho khán giả mọi lứa tuổi.';
};

export default function MovieDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityFromQuery = searchParams.get('city');
  const cinemaIdFromQuery = searchParams.get('cinema');

  const [movie, setMovie] = useState(null);
  const [cities, setCities] = useState([]);
  const [theatersInCity, setTheatersInCity] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [dates, setDates] = useState([]);

  const getNextFiveDays = () => {
    const datesArray = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      datesArray.push(date.toISOString().split('T')[0]);
    }
    return datesArray;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const movieId = params.id;
        const [movieData, citiesData] = await Promise.all([
          fetchMovie(movieId),
          fetchCitiesWithTheaters(),
        ]);

        if (!movieData) {
          navigate('/not-found');
          return;
        }

        setMovie(movieData);
        setCities(citiesData || []);

        const nextDates = getNextFiveDays();
        setDates(nextDates);
        if (nextDates.length > 0) {
          setSelectedDate(nextDates[0]);
        }

        const initialCity =
          cityFromQuery && citiesData?.includes(cityFromQuery)
            ? cityFromQuery
            : citiesData?.[0] || '';
        setSelectedCity(initialCity);

        if (cinemaIdFromQuery) {
          setSelectedCinema(cinemaIdFromQuery);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [params.id, navigate, cityFromQuery, cinemaIdFromQuery]);

  useEffect(() => {
    if (!selectedCity) {
      setTheatersInCity([]);
      return;
    }

    const loadTheaters = async () => {
      try {
        const theatersData = await fetchTheatersByCity(selectedCity);
        setTheatersInCity(theatersData || []);
        if (selectedCinema && !theatersData.some((t) => t.id === selectedCinema)) {
          setSelectedCinema('');
        }
      } catch (error) {
        console.error(`Error fetching theaters for ${selectedCity}:`, error);
        setTheatersInCity([]);
      }
    };

    loadTheaters();
  }, [selectedCity]);

  useEffect(() => {
    if (!params.id || !selectedDate || !selectedCity) {
      return;
    }

    const loadShowtimes = async () => {
      setLoadingShowtimes(true);
      setShowtimes([]);
      try {
        const filters = {
          movieId: params.id,
          date: selectedDate,
          city: selectedCity,
        };

        if (selectedCinema) {
          filters.cinemaId = selectedCinema;
        }

        const showtimesData = await fetchShowtimes(filters);
        setShowtimes(showtimesData || []);
      } catch (error) {
        console.error('Error loading showtimes:', error);
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    loadShowtimes();
  }, [params.id, selectedCity, selectedDate, selectedCinema]);

  const handleBookTicket = (showTimeId) => {
    navigate(`/booking?showtime=${showTimeId}`);
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatWeekday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { weekday: 'long' });
  };

  const getGroupedShowtimes = () => {
    if (!showtimes || showtimes.length === 0) return [];

    const grouped = showtimes.reduce((acc, showtime) => {
      const cinemaId = showtime.cinemaId;
      if (!acc[cinemaId]) {
        acc[cinemaId] = [];
      }
      acc[cinemaId].push(showtime);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const groupedShowtimes = getGroupedShowtimes();

  // Tìm thông tin của rạp đã chọn để hiển thị tên
  const selectedCinemaInfo = theatersInCity.find((t) => t.id === selectedCinema);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold">Phim không tồn tại.</h1>
      </div>
    );
  }

  return (
    <div className="bg-[#100C2A] text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 relative">
            <div className="absolute top-1 left-1 gap-2 z-10">
              <span className="babsolute top-2 left-2 bg-red-600 text-white text-xs font-bold w-9 h-9 flex items-center justify-center rounded-md transition-opacity duration-300 group-hover:opacity-0">
                {movie.ageRating}
              </span>
            </div>
            <img
              src={movie.poster || '/placeholder.svg'}
              alt={movie.title}
              className="w-full h-auto rounded-lg shadow-xl"
              style={{ aspectRatio: '2/3' }}
            />
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-yellow-300">
              {movie.title} {movie.originalTitle && `(${movie.originalTitle})`}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Film size={18} />
                <span>{movie.genres?.join(', ') || 'Đang cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{movie.duration} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Phụ đề: {movie.subtitles || 'Tiếng Việt'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span>{movie.country}</span>
              </div>
            </div>

            <p className="text-xl mb-6">
              <span className="text-black bg-yellow-400 px-2 py-1">
                {getAgeRatingDescription(movie.ageRating)}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-yellow-400">MÔ TẢ</h3>
                <p>
                  <strong>Đạo diễn:</strong> {movie.directors?.join(', ') || 'Đang cập nhật'}
                </p>
                <p>
                  <strong>Khởi chiếu:</strong>{' '}
                  {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-yellow-400 mt-2 mb-1">NỘI DUNG PHIM</h3>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>
            </div>
            {movie.trailer && (
              <a href={movie.trailer} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="mt-6 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <PlayCircle size={20} className="mr-2" />
                  Xem Trailer
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 bg-[#0a1426] p-6 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-6 uppercase text-yellow-300 tracking-widest">
            Lịch Chiếu
          </h2>

          <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg w-24 h-20 transition-colors duration-200 border-2 ${
                  selectedDate === date
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-[#2a2658] border-transparent hover:border-yellow-400'
                }`}
              >
                <span className="font-bold text-lg">{formatDateLabel(date)}</span>
                <span className="text-xs">{formatWeekday(date)}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-t border-b border-gray-700 py-4 gap-4">
            <h2 className="text-2xl font-bold uppercase text-white tracking-wider whitespace-nowrap">
              Danh sách rạp
            </h2>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              {/* City Selector */}
              <div className="w-full sm:w-1/2 md:w-64">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full bg-transparent border-yellow-400 text-yellow-400 font-semibold focus:ring-yellow-400">
                    <MapPin size={16} className="mr-2" />
                    <SelectValue placeholder={selectedCity || 'Chọn thành phố'} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a163a] text-white border-gray-600">
                    {cities.map((city) => (
                      <SelectItem
                        key={city}
                        value={city}
                        className="hover:bg-gray-300 focus:bg-purple-700 text-black"
                      >
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cinema Selector */}
              <div className="w-full sm:w-1/2 md:w-64">
                <Select
                  value={selectedCinema}
                  onValueChange={setSelectedCinema}
                  disabled={!selectedCity || theatersInCity.length === 0}
                >
                  <SelectTrigger
                    className="w-full bg-transparent border-gray-500 text-white font-semibold focus:ring-yellow-400"
                    disabled={!selectedCity || theatersInCity.length === 0}
                  >
                    <Film size={16} className="mr-2" />
                    <SelectValue
                      placeholder={selectedCinemaInfo ? selectedCinemaInfo.name : 'Tất cả rạp'}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a163a] text-white border-gray-600">
                    <SelectItem value="" className="hover:bg-gray-300 focus:bg-purple-700 text-black">
                      Tất cả rạp
                    </SelectItem>
                    {theatersInCity.map((theater) => (
                      <SelectItem
                        key={theater.id}
                        value={theater.id}
                        className="hover:bg-gray-300 focus:bg-purple-700 text-black"
                      >
                        {theater.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {loadingShowtimes ? (
              <p className="text-center py-8">Đang cập nhật lịch chiếu...</p>
            ) : groupedShowtimes.length > 0 ? (
              groupedShowtimes.map((showtimesInTheater) => (
                <TheaterShowtimes
                  key={showtimesInTheater[0].cinemaId}
                  showtimes={showtimesInTheater}
                  onBookTicket={handleBookTicket}
                  city={selectedCity}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-[#1a163a] rounded-lg mt-4">
                <Film size={40} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Hiện chưa có lịch chiếu cho lựa chọn của bạn.</p>
                <p className="text-sm text-gray-500">Vui lòng thử chọn ngày hoặc thành phố khác.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
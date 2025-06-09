// src/pages/booking.jsx

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  fetchMovie,
  fetchShowtime,
  fetchTheater,
  fetchSeats,
  fetchRoom,
  handleApiError,
  holdSeats,
} from '../lib/api';
import { ArrowLeft } from 'lucide-react';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showTimeId = searchParams.get('showtime');

  // State for data
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [theater, setTheater] = useState(null);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);

  // State for user interaction
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!showTimeId) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const showtimeData = await fetchShowtime(showTimeId);
        if (!showtimeData) throw new Error('Showtime not found');

        setShowtime(showtimeData);

        const [movieData, theaterData, seatsData, roomData] = await Promise.all([
          fetchMovie(showtimeData.movieId),
          fetchTheater(showtimeData.cinemaId),
          fetchSeats(showtimeData.id),
          fetchRoom(showtimeData.roomId),
        ]);

        setMovie(movieData);
        setTheater(theaterData);
        setSeats(seatsData || []);
        setRoom(roomData);
      } catch (error) {
        const err = handleApiError(error);
        console.error('Error loading booking data:', err);
        alert(err.message || 'Không thể tải thông tin suất chiếu.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showTimeId, navigate]);

  // ĐÃ LOẠI BỎ LOGIC TỰ ĐỘNG HỦY GIỮ GHẾ (releaseSeats) KHI RỜI TRANG

  const handleSeatClick = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== 'available') return;

    setBookingError(null);

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      await holdSeats(showTimeId, selectedSeats, '0000000000');

      const seatsParam = selectedSeats.join(',');
      navigate(`/checkout?showtime=${showTimeId}&seats=${seatsParam}`);
    } catch (error) {
      const err = handleApiError(error);
      console.error('Error holding seats:', err);
      setBookingError(
        err.message || 'Một hoặc nhiều ghế bạn chọn đã có người khác đặt. Vui lòng chọn lại.'
      );

      // Tải lại sơ đồ ghế để cập nhật trạng thái mới nhất
      try {
        const freshSeatsData = await fetchSeats(showTimeId);
        setSeats(freshSeatsData || []);

        // ĐÃ BỎ LOGIC TỰ ĐỘNG BỎ CHỌN GHẾ LỖI KHỎI GIAO DIỆN
      } catch (fetchError) {
        console.error('Failed to refresh seat map after hold error:', fetchError);
        alert('Đã có lỗi khi cập nhật lại sơ đồ ghế. Vui lòng tải lại trang.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSeats = () => {
    if (seats.length === 0) {
      return <div className="text-center py-10 text-gray-400">Đang tải sơ đồ ghế...</div>;
    }

    const seatsByRow = seats.reduce((acc, seat) => {
      (acc[seat.row] = acc[seat.row] || []).push(seat);
      return acc;
    }, {});

    const sortedRows = Object.entries(seatsByRow).sort(([a], [b]) => a.localeCompare(b));

    return (
      <div className="mt-6">
        <div className="w-full bg-black py-4 text-center mb-10 rounded-lg shadow-lg shadow-yellow-500/10">
          <div
            className="w-2/3 h-1 bg-white/50 mx-auto rounded-full"
            style={{
              boxShadow: '0 0 15px 2px rgba(255, 255, 255, 0.4)',
              borderBottom: '2px solid rgba(255, 255, 255, 0.6)',
            }}
          ></div>
          <p className="text-sm tracking-widest text-gray-400 mt-3">MÀN HÌNH</p>
        </div>

        <div className="flex flex-col items-center gap-3 px-4">
          {sortedRows.map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2 md:gap-4">
              <div className="w-8 text-center font-bold text-gray-400">{row}</div>
              <div className="flex gap-1.5 md:gap-2">
                {rowSeats
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isAvailable = seat.status === 'available';

                    let seatClasses =
                      'w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ';

                    if (!isAvailable) {
                      seatClasses += 'bg-gray-800 text-gray-600 cursor-not-allowed';
                    } else if (isSelected) {
                      seatClasses +=
                        'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/50 cursor-pointer';
                    } else {
                      if (seat.type === 'vip') {
                        seatClasses += 'bg-purple-600 hover:bg-purple-500 cursor-pointer';
                      } else if (seat.type === 'couple') {
                        seatClasses += 'bg-pink-600 hover:bg-pink-500 cursor-pointer';
                      } else {
                        seatClasses += 'bg-gray-600 hover:bg-gray-500 cursor-pointer';
                      }
                    }

                    return (
                      <button
                        key={seat.id}
                        className={seatClasses}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={!isAvailable}
                        aria-label={`Ghế ${seat.id}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center items-center flex-wrap gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-600 rounded"></div>
            <span>Thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-600 rounded"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-pink-600 rounded"></div>
            <span>Đôi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-500 rounded"></div>
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-800 rounded"></div>
            <span>Đã đặt</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center p-10">Đang tải...</div>;
  }

  if (!movie || !showtime || !theater) {
    return <div className="text-center p-10">Không tìm thấy thông tin suất chiếu.</div>;
  }

  return (
    <div className="bg-[#0a1426] text-white min-h-screen py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#100C2A] p-6 rounded-lg shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{movie.title}</h1>
                <p className="text-sm text-gray-400">
                  {theater.name} | {room?.name}
                </p>
              </div>
            </div>
            <Separator className="bg-gray-700 mb-4" />
            {renderSeats()}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-[#100C2A] border-gray-800 sticky top-6 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Tóm tắt đặt vé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-start">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    width={100}
                    height={150}
                    className="rounded-md object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {movie.ageRating} | {movie.duration} phút
                    </p>
                    <p className="text-sm text-gray-400 mt-2">{theater.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(showtime.showDateTime).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date(showtime.showDateTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Ghế đã chọn ({selectedSeats.length}):</span>
                  </div>
                  <p className="font-bold text-lg min-h-[28px] text-yellow-400 break-words">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Vui lòng chọn ghế'}
                  </p>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>Tạm tính:</span>
                  <span className="text-yellow-400">
                    {getTotalPrice().toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                {bookingError && (
                  <div className="mt-2 text-center text-red-400 bg-red-900/50 p-3 rounded-md text-sm">
                    <p>{bookingError}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg"
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

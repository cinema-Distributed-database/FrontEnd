// src/pages/checkout.jsx

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  fetchMovie,
  fetchShowtime,
  fetchTheater,
  fetchRoom,
  fetchConcessionsByCinema,
  createBooking,
  createVNPayPaymentUrl,
  handleApiError,
  releaseSeats,
} from '../lib/api';
import { ArrowLeft, Plus, Minus } from 'lucide-react';


const ConcessionItem = ({ item, quantity, onQuantityChange }) => (
  <div className="bg-[#1a1a2e] p-4 rounded-lg flex flex-col h-full">
    <div className="flex gap-3 mb-3 flex-grow">
      <img
        src={item.image || '/api/placeholder/80/80'}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-1">
        <h4 className="font-bold text-white mb-1">{item.name}</h4>
        <p className="text-sm text-gray-400 mb-2 h-10 overflow-hidden">{item.description}</p>
        <p className="text-yellow-400 font-bold">{item.price.toLocaleString()} VND</p>
      </div>
    </div>
    <div className="flex items-center justify-center gap-3 mt-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuantityChange(item, quantity - 1)}
        className="w-8 h-8 p-0"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-8 text-center font-bold text-lg">{quantity}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuantityChange(item, quantity + 1)}
        className="w-8 h-8 p-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  </div>
);


export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showTimeId = searchParams.get('showtime');
  const seatsParam = searchParams.get('seats');
  const selectedSeats = seatsParam ? seatsParam.split(',') : [];


  const [viewState, setViewState] = useState({ loading: true, error: null, submitting: false });
  const [data, setData] = useState({
    movie: null,
    showtime: null,
    theater: null,
    room: null,
    concessions: [],
  });
  const [selectedConcessions, setSelectedConcessions] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', email: '' });
  const [agreements, setAgreements] = useState({ terms: false, policy: false });
  const [timeLeft, setTimeLeft] = useState(300); // FIX: 5 phút = 300 giây


  useEffect(() => {
    if (!showTimeId || selectedSeats.length === 0) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      setViewState({ loading: true, error: null, submitting: false });
      try {
        const showtimeData = await fetchShowtime(showTimeId);
        if (!showtimeData) throw new Error('Không tìm thấy suất chiếu.');

        const [movie, theater, room, concessions] = await Promise.all([
          fetchMovie(showtimeData.movieId),
          fetchTheater(showtimeData.cinemaId),
          fetchRoom(showtimeData.roomId),
          fetchConcessionsByCinema(showtimeData.cinemaId),
        ]);

        setData({ movie, showtime: showtimeData, theater, room, concessions: concessions || [] });
      } catch (error) {
        const err = handleApiError(error);
        console.error('Lỗi tải dữ liệu checkout:', err);
        setViewState((prev) => ({
          ...prev,
          error: err.message || 'Không thể tải thông tin đặt vé.',
        }));
      } finally {
        setViewState((prev) => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, [showTimeId, seatsParam, navigate]);


  useEffect(() => {
    if (viewState.loading || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    if (timeLeft <= 1 && !viewState.submitting) {
      alert('Thời gian giữ ghế đã hết, vui lòng đặt vé lại.');
      navigate('/');
    }

    return () => clearTimeout(timer);
  }, [timeLeft, navigate, viewState.loading, viewState.submitting]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConcessionChange = (concession, quantity) => {
    setSelectedConcessions((prev) => {
      const newSelection = prev.filter((item) => item.id !== concession.id);
      if (quantity > 0) {
        newSelection.push({ ...concession, quantity });
      }
      return newSelection.sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const getTicketPrice = () => (data.showtime?.price || 90000) * selectedSeats.length;
  const getConcessionTotal = () =>
    selectedConcessions.reduce((total, item) => total + item.price * item.quantity, 0);
  const getTotalPrice = () => getTicketPrice() + getConcessionTotal();

  const handleSubmit = async () => {
    const errors = [];
    if (!customerInfo.fullName.trim()) errors.push('Vui lòng nhập họ và tên');
    if (!/^[0-9]{10}$/.test(customerInfo.phone.replace(/\D/g, '')))
      errors.push('Số điện thoại không hợp lệ');
    if (!/\S+@\S+\.\S+/.test(customerInfo.email)) errors.push('Email không hợp lệ');
    if (!agreements.terms) errors.push('Vui lòng đồng ý với điều khoản dịch vụ');
    if (!agreements.policy) errors.push('Vui lòng đồng ý với chính sách của Cinestar');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setViewState((prev) => ({ ...prev, submitting: true }));
    try {
      const bookingPayload = {
        showTimeId,
        customerInfo,
        seats: selectedSeats,
        ticketTypes: [
          {
            type: 'Người lớn',
            quantity: selectedSeats.length,
            pricePerTicket: data.showtime?.price || 90000,
          },
        ],
        concessions: selectedConcessions,
      };

      await releaseSeats(showTimeId, selectedSeats); // Giải phóng ghế đã chọn trước khi tạo booking

      const bookingResult = await createBooking(bookingPayload);
      if (!bookingResult?.id) throw new Error('Không nhận được mã booking sau khi tạo.');

      // const returnUrl = `${window.location.origin}/payment-success?bookingId=${bookingResult.id}`;
      const paymentResult = await createVNPayPaymentUrl(bookingResult.id);

      if (paymentResult?.paymentUrl) {
        window.location.href = paymentResult.paymentUrl;
      } else {
        throw new Error('Không thể tạo được đường dẫn thanh toán.');
      }
    } catch (error) {
      const err = handleApiError(error, 'Không thể hoàn tất đặt vé. Vui lòng thử lại.');
      alert(`❌ Lỗi: ${err.message}`);
      setViewState((prev) => ({ ...prev, submitting: false }));
    }
  };

  // --- Rendering Logic ---
  const renderConcessions = () => {
    if (data.concessions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">Không có đồ ăn/thức uống cho rạp này.</div>
      );
    }

    const groupedConcessions = data.concessions.reduce((acc, item) => {
      const category = (item.category || 'Khác').toUpperCase();
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-8">
        {Object.entries(groupedConcessions).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <ConcessionItem
                  key={item.id}
                  item={item}
                  quantity={selectedConcessions.find((c) => c.id === item.id)?.quantity || 0}
                  onQuantityChange={handleConcessionChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (viewState.loading)
    return <div className="text-center p-10 text-white">Đang tải trang thanh toán...</div>;
  if (viewState.error)
    return <div className="text-center p-10 text-red-400">{viewState.error}</div>;

  const { movie, showtime, theater, room } = data;

  return (
    <div className="bg-[#0a1426] text-white min-h-screen">
      <div className="bg-[#0f1635] py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-4 md:space-x-8 text-xs md:text-base">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-gray-400">CHỌN VÉ</span>
            </div>
            <div className="w-12 h-1 md:w-16 bg-yellow-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-yellow-500 font-bold">THANH TOÁN</span>
            </div>
            <div className="w-12 h-1 md:w-16 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-gray-400">THÔNG TIN VÉ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#100C2A] border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                  </Button>
                  <CardTitle className="text-xl">Thông tin khách hàng</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                    Họ và tên *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Họ và tên"
                    value={customerInfo.fullName}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Số điện thoại"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreements.terms}
                      onChange={(e) =>
                        setAgreements((prev) => ({ ...prev, terms: e.target.checked }))
                      }
                      className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="terms" className="text-sm">
                      Đồng ý với điều khoản của dịch vụ
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="policy"
                      checked={agreements.policy}
                      onChange={(e) =>
                        setAgreements((prev) => ({ ...prev, policy: e.target.checked }))
                      }
                      className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="policy" className="text-sm">
                      Đồng ý với{' '}
                      <span className="text-blue-400 underline">điều khoản của Cinestar</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#100C2A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">CHỌN BẮP NƯỚC</CardTitle>
              </CardHeader>
              <CardContent>{renderConcessions()}</CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-purple-800 to-indigo-900 border-none sticky top-6 text-white shadow-xl shadow-purple-900/40">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{movie?.title?.toUpperCase()}</CardTitle>
                <div className="text-yellow-300 text-sm mt-2">
                  THỜI GIAN GIỮ VÉ:{' '}
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded ml-2 font-mono text-base">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-300">Rạp:</h4>
                  <p className="font-bold">{theater?.name}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300">Thời gian:</h4>
                  <p className="font-bold">
                    {new Date(showtime?.showDateTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(showtime?.showDateTime).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-300">Phòng chiếu:</h4>
                    <p className="font-bold">{room?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300">Số vé:</h4>
                    <p className="font-bold">{selectedSeats.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300">Ghế:</h4>
                  <p className="font-bold break-words">{selectedSeats.join(', ')}</p>
                </div>
                <Separator className="bg-white/20 my-3" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Vé xem phim</span>
                    <span>{getTicketPrice().toLocaleString()} VND</span>
                  </div>
                  {getConcessionTotal() > 0 && (
                    <div className="flex justify-between">
                      <span>Bắp nước</span>
                      <span>{getConcessionTotal().toLocaleString()} VND</span>
                    </div>
                  )}
                </div>
                <Separator className="bg-white/20 my-3" />
                <div className="flex justify-between items-center font-bold text-xl">
                  <span className="uppercase">Tổng cộng</span>
                  <span className="text-yellow-400">{getTotalPrice().toLocaleString()} VND</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg"
                  onClick={handleSubmit}
                  disabled={viewState.submitting || !agreements.terms || !agreements.policy}
                >
                  {viewState.submitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

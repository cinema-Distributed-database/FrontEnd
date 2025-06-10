'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { fetchTheaters, fetchNearbyTheaters } from '../lib/api';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Film, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TheatersPage() {
  const [searchParams] = useSearchParams();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // --- THAY ĐỔI STATE ---
  const THEATERS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); // State mới để lưu tổng số trang từ API

  const lng = searchParams.get('lng');
  const lat = searchParams.get('lat');

  // --- THAY ĐỔI LOGIC TẢI DỮ LIỆU ---
  useEffect(() => {
    const loadTheaters = async () => {
      setLoading(true);
      try {
        if (lat && lng) {
          // Logic tìm rạp gần đây không thay đổi và không cần phân trang
          setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
          setTotalPages(0); // Reset phân trang khi tìm rạp gần đây
          const nearbyTheaters = await fetchNearbyTheaters(parseFloat(lat), parseFloat(lng), 200);
          const theatersWithDistance = nearbyTheaters.map((theater) => {
            if (theater.location && theater.location.coordinates) {
              const [theLng, theLat] = theater.location.coordinates;
              const distance = calculateDistance(parseFloat(lat), parseFloat(lng), theLat, theLng);
              return { ...theater, distance };
            }
            return theater;
          });
          setTheaters(theatersWithDistance);
        } else {
          // Logic lấy tất cả rạp được thay bằng phân trang phía server
          setUserLocation(null);
          const page = currentPage - 1; // API Spring Boot dùng page 0-indexed
          const size = THEATERS_PER_PAGE;
          const theatersData = await fetchTheaters({ page, size });

          setTheaters(theatersData.content || []);
          setTotalPages(theatersData.totalPages || 0);
        }
      } catch (error) {
        console.error('Error loading theaters:', error);
        setTheaters([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    loadTheaters();
  }, [lat, lng, currentPage]); // Thêm currentPage vào dependency array

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // --- THAY ĐỔI LOGIC PHÂN TRANG ---
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Không cần `slice` dữ liệu ở đây nữa
  // const indexOfLastTheater = currentPage * THEATERS_PER_PAGE;
  // const indexOfFirstTheater = indexOfLastTheater - THEATERS_PER_PAGE;
  // const currentTheaters = theaters.slice(indexOfFirstTheater, indexOfLastTheater);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-8"></div>
          <div className="h-96 w-full max-w-4xl bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 px-4">
      <div className="flex justify-between items-center mb-4">
        {/* Vẫn sử dụng `totalPages` để quyết định hiển thị nút */}
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant="ghost"
          size="icon"
          className={totalPages > 1 ? 'visible text-white' : 'invisible'}
        >
          <ChevronLeft size={28} />
        </Button>

        <h1 className="text-3xl font-bold text-center">Hệ Thống Rạp Chiếu Phim</h1>

        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="ghost"
          size="icon"
          className={totalPages > 1 ? 'visible text-white' : 'invisible'}
        >
          <ChevronRight size={28} />
        </Button>
      </div>

      {totalPages > 1 && (
        <p className="text-center text-gray-400 mb-8">
          Trang {currentPage} / {totalPages}
        </p>
      )}

      {userLocation && (
        <div className="bg-gray-800 p-4 rounded-lg mb-8 text-center">
          <p className="text-lg mb-2">
            <MapPin className="inline mr-2" size={20} />
            Đang hiển thị các rạp chiếu phim gần đây..
          </p>
          <p className="text-sm text-gray-400">
            Vị trí: {lat}, {lng}
          </p>
        </div>
      )}

      {theaters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {userLocation ? 'Không có rạp nào gần đây.' : 'Không có rạp chiếu phim nào.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Render trực tiếp `theaters` state, không cần `currentTheaters` */}
            {theaters.map((theater) => (
              <Card
                key={theater.id}
                className="bg-gray-900 border-gray-800 overflow-hidden flex flex-col"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={
                      theater.image ||
                      '/placeholder.svg?height=300&width=500&text=' +
                        encodeURIComponent(theater.name)
                    }
                    alt={theater.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg text-white">{theater.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin size={16} className="flex-shrink-0 mt-1 text-white" />
                      <p className="text-gray-300 text-sm">{theater.address}</p>
                    </div>

                    {theater.roomCount && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-400">
                          <Film size={16} className="inline mr-1" />
                          {theater.roomCount} phòng chiếu
                        </p>
                      </div>
                    )}

                    {userLocation && theater.distance !== undefined && (
                      <div className="flex items-center gap-2 mb-3 bg-purple-900/50 p-2 rounded">
                        <Navigation size={16} className="text-purple-400" />
                        <p className="text-sm text-white">
                          Khoảng cách:{' '}
                          <span className="pl-2 font-bold text-white">
                            {theater.distance.toFixed(1)} km
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`/movies?cinema=${theater.id}&city=${encodeURIComponent(theater.city)}`}
                    >
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                        Xem Lịch Chiếu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
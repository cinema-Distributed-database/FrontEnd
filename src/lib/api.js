import axios from 'axios';

// url backend api
const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


apiClient.interceptors.response.use(
  (response) => {

    if (response.data && typeof response.data.data !== 'undefined') {
      return response.data.data;
    }

    if (response.data && response.data.success) {
      return response.data; // Trả về object { success, message, data, timestamp }
    }
    return response.data; // Fallback, trả về response data gốc
  },
  (error) => {
    console.error('API Error Interceptor:', error.response || error.request || error.message);
    return Promise.reject(error);
  }
);

//Movie Api

/**
 * Lấy danh sách phim có phân trang và filter theo status.
 * @param {object} params 
 * @returns {Promise<Array>} Mảng các phim.
 */
export async function fetchMovies(params = {}) {
  try {
    // API backend return Page<MovieDto> trong trường 'data'
    // nên interceptor sẽ trả về { content: [], pageable: {}, ... }
    const response = await apiClient.get('/movies', { params });
    return response.content || []; // Trả về mảng phim từ trường 'content'
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw handleApiError(error, 'Không thể tải danh sách phim.');
  }
}

/**
 * Lấy thông tin chi tiết một phim.
 * @param {string} id - ID của phim.
 * @returns {Promise<Object|null>} Movie Detail
 */
export async function fetchMovie(id) {
  try {
    return await apiClient.get(`/movies/${id}`);
  } catch (error) {
    console.error(`Error fetching movie with id ${id}:`, error);
    throw handleApiError(error, 'Không thể tải thông tin phim.');
  }
}

/**
 * Lấy danh sách phim đang chiếu, có phân trang.
 * @param {object} params - Các tham số phân trang (ví dụ: { page: 0, size: 10 })
 * @returns {Promise<Array>} Mảng các phim đang chiếu.
 */
export async function fetchNowShowingMovies(params = {}) {
  try {
    const response = await apiClient.get('/movies/now-showing', { params });
    return response.content || [];
  } catch (error) {
    console.error('Error fetching now showing movies:', error);
    throw handleApiError(error, 'Không thể tải danh sách phim đang chiếu.');
  }
}

/**
 * Lấy danh sách phim sắp chiếu, có phân trang.
 * @param {object} params - Các tham số phân trang (ví dụ: { page: 0, size: 10 })
 * @returns {Promise<Array>} Mảng các phim sắp chiếu.
 */
export async function fetchComingSoonMovies(params = {}) {
  try {
    const response = await apiClient.get('/movies/coming-soon', { params });
    return response.content || [];
  } catch (error) {
    console.error('Error fetching coming soon movies:', error);
    throw handleApiError(error, 'Không thể tải danh sách phim sắp chiếu.');
  }
}

/**
 * Tìm kiếm phim theo từ khóa, thể loại, trạng thái.
 * @param {object} params - Các tham số tìm kiếm (q, genre, status)
 * @returns {Promise<Array>} Mảng các phim phù hợp.
 */
export async function searchMovies(params = {}) {
  try {
    // API này trả về trực tiếp mảng phim trong trường 'data'
    return await apiClient.get('/movies/search', { params });
  } catch (error) {
    console.error('Error searching movies:', error);
    throw handleApiError(error, 'Không thể tìm kiếm phim.');
  }
}

/**
 * Lấy danh sách tất cả các thể loại phim.
 * @returns {Promise<Array>} Mảng các thể loại phim (string).
 */
export async function fetchMovieGenres() {
  try {
    // API return String(type) in 'data'
    return await apiClient.get('/movies/genres');
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    throw handleApiError(error, 'Không thể tải danh sách thể loại phim.');
  }
}

/**
 * Lấy danh sách phim mới nhất.
 * @param {number} limit - Số lượng phim tối đa cần lấy.
 * @returns {Promise<Array>} Mảng các phim mới nhất.
 */
export async function fetchLatestMovies(limit = 10) {
  try {

    return await apiClient.get('/movies/latest', { params: { limit } });
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    throw handleApiError(error, 'Không thể tải danh sách phim mới nhất.');
  }
}

//Cinema api

/**
 * Lấy danh sách tất cả rạp đang hoạt động, có phân trang.
 * @param {object} params - Các tham số phân trang (ví dụ: { page: 0, size: 10 })
 * @returns {Promise<Array>} Mảng các rạp.
 */
export async function fetchTheaters(params = {}) {
  try {
    const response = await apiClient.get('/cinemas', { params });
    return response.content || [];
  } catch (error) {
    console.error('Error fetching theaters:', error);
    throw handleApiError(error, 'Không thể tải danh sách rạp.');
  }
}

/**
 * Lấy thông tin chi tiết một rạp.
 * @param {string} id - ID của rạp.
 * @returns {Promise<Object|null>} Thông tin chi tiết rạp hoặc null nếu lỗi.
 */
export async function fetchTheater(id) {
  try {
    return await apiClient.get(`/cinemas/${id}`);
  } catch (error) {
    console.error(`Error fetching theater with id ${id}:`, error);
    throw handleApiError(error, 'Không thể tải thông tin rạp.');
  }
}

/**
 * Tìm rạp gần một tọa độ hiện tại.
 * @param {number} latitude - Vĩ.
 * @param {number} longitude - Kinh.
 * @param {number} radius - 
 * @returns {Promise<Array>} Mảng các rạp gần đó.
 */
export async function fetchNearbyTheaters(latitude, longitude, radius = 1000.0) {
  try {
    return await apiClient.get('/cinemas/nearby', {
      params: { lat: latitude, lng: longitude, radius },
    });
  } catch (error) {
    console.error('Error fetching nearby theaters:', error);
    throw handleApiError(error, 'Không thể tải danh sách rạp gần đây.');
  }
}

/**
 * Lấy danh sách phòng chiếu của một rạp.
 * @param {string} cinemaId - ID của rạp.
 * @returns {Promise<Array>} Mảng các phòng chiếu.
 */
export async function fetchCinemaRooms(cinemaId) {
  try {
    return await apiClient.get(`/cinemas/${cinemaId}/rooms`);
  } catch (error) {
    console.error(`Error fetching rooms for cinema ${cinemaId}:`, error);
    throw handleApiError(error, 'Không thể tải danh sách phòng chiếu.');
  }
}

/**
 * Lấy rạp theo thành phố.
 * @param {string} city
 * @param {object} params - Các tham số phân trang.
 * @returns {Promise<Array>} Mảng các rạp trong thành phố.
 */
export async function fetchTheatersByCity(city, params = {}) {
  try {
    const response = await apiClient.get(`/cinemas/by-city/${encodeURIComponent(city)}`, {
      params,
    });
    return response.content || [];
  } catch (error) {
    console.error(`Error fetching theaters in city ${city}:`, error);
    throw handleApiError(error, `Không thể tải danh sách rạp tại ${city}.`);
  }
}

/**
 * Tìm kiếm rạp theo từ khóa và/hoặc thành phố.
 * @param {object} params - Các tham số tìm kiếm (q, city).
 * @returns {Promise<Array>} Mảng các rạp phù hợp.
 */
export async function searchTheaters(params = {}) {
  try {
    // Giả sử API này cũng trả về Page<CinemaDto> hoặc mảng trực tiếp
    // Cần xác nhận cấu trúc response từ backend.
    // Nếu là Page<CinemaDto>, response.content sẽ được sử dụng.
    // Nếu là mảng trực tiếp, nó sẽ được trả về như vậy.
    const response = await apiClient.get('/cinemas/search', { params });
    return response.content || response || [];
  } catch (error) {
    console.error('Error searching theaters:', error);
    throw handleApiError(error, 'Không thể tìm kiếm rạp.');
  }
}

/**
 * Lấy danh sách các thành phố có rạp đang hoạt động.
 * @returns {Promise<Array>} Mảng các tên thành phố (string).
 */
export async function fetchCitiesWithTheaters() {
  try {
    // API này trả về trực tiếp mảng string trong trường 'data'
    return await apiClient.get('/cinemas/cities');
  } catch (error) {
    console.error('Error fetching cities with theaters:', error);
    throw handleApiError(error, 'Không thể tải danh sách thành phố.');
  }
}

//room api

/**
 * Lấy thông tin chi tiết phòng chiếu.
 * @param {string} id - ID của phòng.
 * @returns {Promise<Object|null>} Thông tin chi tiết phòng hoặc null nếu lỗi.
 */
export async function fetchRoom(id) {
  try {
    return await apiClient.get(`/rooms/${id}`);
  } catch (error) {
    console.error(`Error fetching room with id ${id}:`, error);
    throw handleApiError(error, 'Không thể tải thông tin phòng chiếu.');
  }
}

//showtime api(suat chieu)

/**
 * Lấy lịch chiếu có filter (movieId, cinemaId, city, date, status).
 * @param {object} filters - Các tham số filter.
 * @returns {Promise<Array>} Mảng các suất chiếu.
 */
export async function fetchShowtimes(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.movieId) params.append('movieId', filters.movieId);
    if (filters.cinemaId) params.append('cinemaId', filters.cinemaId);
    if (filters.city) params.append('city', filters.city);


    if (filters.date) {
      const formattedDate = formatDateForAPI(filters.date);
      params.append('startDate', formattedDate);
      params.append('endDate', formattedDate);
    }

    if (filters.status) params.append('status', filters.status);
    return await apiClient.get('/showtimes', { params });
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw handleApiError(error, 'Không thể tải lịch chiếu.');
  }
}

/**
 * Lấy thông tin chi tiết một suất chiếu.
 * @param {string} id - ID của suất chiếu.
 * @returns {Promise<Object|null>} Thông tin suất chiếu hoặc null nếu lỗi.
 */
export async function fetchShowtime(id) {
  try {
    return await apiClient.get(`/showtimes/${id}`);
  } catch (error) {
    console.error(`Error fetching showtime with id ${id}:`, error);
    throw handleApiError(error, 'Không thể tải thông tin suất chiếu.');
  }
}

//seat api

/**
 * Lấy trạng thái ghế của một suất chiếu.
 * @param {string} showTimeId - ID của suất chiếu.
 * @returns {Promise<Array>} Mảng các ghế đã được format.
 */
export async function fetchSeats(showTimeId) {
  try {

    const responseData = await apiClient.get(`/seats/showtime/${showTimeId}`);

    const seats = [];
    if (responseData && responseData.seatStatus) {
      // Kiểm tra responseData và responseData.seatStatus
      Object.entries(responseData.seatStatus).forEach(([seatId, seatData]) => {
        const [row, number] = [seatId.charAt(0), seatId.slice(1)];
        seats.push({
          id: seatId,
          row: row,
          number: parseInt(number, 10),
          type: seatData.type || 'standard', 
          status:
            seatData.status === 'available'
              ? 'available'
              : seatData.status === 'holding'
                ? 'reserved' // 'reserved' =  'holding'  in backend
                : seatData.status === 'booked'
                  ? 'reserved'
                  : 'unavailable', 
          price: seatData.price || 90000, 
        });
      });
    }
    return seats;
  } catch (error) {
    console.error(`Error fetching seats for showtime ${showTimeId}:`, error);
    throw handleApiError(error, 'Không thể tải sơ đồ ghế.');
  }
}

/**
 * Giữ ghế tạm thời.
 * @param {string} showtimeId - ID suất chiếu.
 * @param {Array<string>} seatIds - Mảng các ID ghế cần giữ.
 * @param {string} customerPhone - Số điện thoại khách hàng.
 * @returns {Promise<Object>} Response từ API.
 */
export async function holdSeats(showtimeId, seatIds, customerPhone) {
  try {
    // API return object: { success, message, data: null }
    console.log(`Holding seats for showtime ${showtimeId}:`, seatIds);
    return await apiClient.post('/seats/hold', {
      showtimeId,
      seatIds,
      customerPhone,
    });
  } catch (error) {
    console.error('Error holding seats:', error);
    throw handleApiError(error, 'Không thể giữ ghế. Vui lòng thử lại.');
  }
}

/**
 * Hủy giữ ghế.
 * @param {string} showtimeId - ID suất chiếu.
 * @param {Array<string>} seatIds - Mảng các ID ghế cần hủy giữ.
 * @returns {Promise<Object>} Response từ API.
 */
export async function releaseSeats(showtimeId, seatIds) {
  try {
    // API này trả về { success, message, data: null }
    return await apiClient.delete('/seats/release', {
      data: {
        showtimeId,
        seatIds,
      },
    });
  } catch (error) {
    console.error('Error releasing seats:', error);
    throw handleApiError(error, 'Không thể hủy giữ ghế.');
  }
}

/**
 * Gia hạn thời gian giữ ghế.
 * @param {string} showtimeId - ID suất chiếu.
 * @param {Array<string>} seatIds - Mảng các ID ghế cần gia hạn.
 * @returns {Promise<Object>} Response từ API.
 */
export async function extendHoldSeats(showtimeId, seatIds) {
  try {
    // API này trả về { success, message, data: null }
    return await apiClient.post('/seats/extend-hold', {
      showtimeId,
      seatIds,
    });
  } catch (error) {
    console.error('Error extending seat hold:', error);
    throw handleApiError(error, 'Không thể gia hạn thời gian giữ ghế.');
  }
}

//booking api

/**
 * Tạo một lượt đặt vé mới.
 * @param {Object} data - Dữ liệu đặt vé.
 * @returns {Promise<Object>} Thông tin booking đã tạo.
 */
export async function createBooking(data) {
  try {
    const bookingPayload = {
      showtimeId: data.showTimeId, // Frontend dùng showTimeId, backend có thể là showtimeId
      customerInfo: {
        fullName: data.customerInfo?.fullName || 'Guest User',
        phone: data.customerInfo?.phone || '0000000000',
        email: data.customerInfo?.email || 'guest@example.com',
      },
      seats: data.seats,
      ticketTypes: data.ticketTypes || [
        {
          type: 'Người lớn', 
          quantity: data.seats.length,
          pricePerTicket: 90000, 
        },
      ],
      concessions: data.concessions?.map((c) => ({ itemId: c.id, quantity: c.quantity })) || [], // Đảm bảo format itemId
    };
    // API này trả về BookingDto trong trường 'data'
    return await apiClient.post('/bookings', bookingPayload);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw handleApiError(error, 'Không thể tạo đặt vé.');
  }
}

/**
 * Tra cứu thông tin đặt vé bằng mã xác nhận.
 * @param {string} confirmationCode - Mã xác nhận vé.
 * @returns {Promise<Object|null>} Thông tin đặt vé hoặc null nếu lỗi.
 */
export async function fetchBookingByConfirmationCode(confirmationCode) {
  try {
    return await apiClient.get(`/bookings/${confirmationCode}`);
  } catch (error) {
    console.error(`Error fetching booking by code ${confirmationCode}:`, error);
    throw handleApiError(error, 'Không thể tra cứu thông tin đặt vé.');
  }
}

/**
 * Xác nhận thanh toán cho một booking (ví dụ sau khi VNPay callback).
 * @param {string} bookingId - ID của booking.
 * @param {string} paymentStatus - Trạng thái thanh toán (COMPLETED, FAILED).
 * @param {string} paymentMethod 
 * @returns {Promise<Object>} Thông tin booking đã cập nhật.
 */
export async function confirmBookingPayment(
  bookingId,
  paymentStatus,
  paymentMethod,
  transactionId
) {
  try {
    console.warn(
      'confirmBookingPayment: Frontend may not need to call this directly if VNPay callback handles it.'
    );
    return {
      success: true,
      message:
        'Payment confirmation handled by backend or not applicable for direct frontend call.',
    };
  } catch (error) {
    console.error(`Error confirming payment for booking ${bookingId}:`, error);
    throw handleApiError(error, 'Không thể xác nhận thanh toán.');
  }
}

//payment api

/**
 * Tạo URL thanh toán VNPay.
 * @param {string} bookingId - ID của booking.
 * @param {string} returnUrl - URL để VNPay redirect về sau khi thanh toán.
 * @returns {Promise<Object>} Object chứa paymentUrl và paymentId.
 */
export async function createVNPayPaymentUrl(bookingId, returnUrl) {
  try {
    // API này trả về { success, message, data: { paymentUrl, paymentId } }

    return await apiClient.post('/payments/vnpay/create', {
      bookingId,
      returnUrl: returnUrl || `${window.location.origin}/payment-success`,
    });
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw handleApiError(error, 'Không thể tạo URL thanh toán VNPay.');
  }
}

// VNPay callback và return URL được xử lý bởi backend và redirect của trình duyệt.
// Frontend thường không gọi trực tiếp các endpoint này.

//Concession api (bap,nuoc)

/**
 * Lấy danh sách đồ ăn thức uống.
 * @param {string} category - (Tùy chọn) Filter theo danh mục.
 * @returns {Promise<Array>} Mảng các sản phẩm.
 */
export async function fetchConcessions(category = '') {
  try {
    const params = category ? { category } : {};
    return await apiClient.get('/concessions', { params });
  } catch (error) {
    console.error('Error fetching concessions:', error);
    throw handleApiError(error, 'Không thể tải danh sách đồ ăn/thức uống.');
  }
}

/**
 * Lấy đồ ăn theo rạp.
 * @param {string} cinemaId - ID của rạp.
 * @returns {Promise<Array>} Mảng các sản phẩm có sẵn tại rạp.
 */
export async function fetchConcessionsByCinema(cinemaId) {
  try {
    // API này trả về trực tiếp mảng concessions trong trường 'data'
    return await apiClient.get(`/concessions/by-cinema/${cinemaId}`);
  } catch (error) {
    console.error(`Error fetching concessions for cinema ${cinemaId}:`, error);
    throw handleApiError(error, 'Không thể tải danh sách đồ ăn/thức uống cho rạp này.');
  }
}

/**
 * Lấy chi tiết một sản phẩm concession.
 * @param {string} id - ID của sản phẩm.
 * @returns {Promise<Object|null>} Chi tiết sản phẩm hoặc null nếu lỗi.
 */
export async function fetchConcession(id) {
  try {
    return await apiClient.get(`/concessions/${id}`);
  } catch (error) {
    console.error(`Error fetching concession with id ${id}:`, error);
    throw handleApiError(error, 'Không thể tải thông tin sản phẩm.');
  }
}

//health check api (kiem tra suc khoe he thong -> bau cu node)
/**
 * Kiểm tra "sức khỏe" của ứng dụng.
 * @returns {Promise<Object>} Trạng thái hệ thống.
 */
export async function healthCheck() {
  try {
    // API này trả về { database: "connected", status: "UP" } trong trường 'data'
    return await apiClient.get('/health');
  } catch (error) {
    console.error('Error performing health check:', error);
    throw handleApiError(error, 'Không thể kiểm tra trạng thái hệ thống.');
  }
}

/**
 * Gửi thông tin từ VNPAY return URL về backend để xác thực và hoàn tất giao dịch.
 * @param {URLSearchParams} params - Các tham số query từ URL VNPay trả về.
 * @returns {Promise<Object>} Kết quả xác nhận từ backend.
 */
export async function confirmVnPayPayment(params) {
  try {
    // Backend sẽ nhận các tham số này, kiểm tra chữ ký (secure hash) và cập nhật trạng thái booking.
    const response = await apiClient.get('/payments/vnpay/callback', { params });
    // Interceptor của chúng ta đã xử lý để trả về response.data.data
    console.log('VNPay payment confirmation response:', response);
    return response;
  } catch (error) {
    console.error('Lỗi khi xác nhận thanh toán VNPay:', error);
    throw handleApiError(error, 'Không thể xác nhận thanh toán với máy chủ.');
  }
}

//utils func(tien ich)

/**
 * Format Date object hoặc string sang 'YYYY-MM-DD' cho API.
 * @param {Date|string|null} date - Ngày cần format.
 * @returns {string|null} Chuỗi ngày đã format hoặc null.
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;
  try {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    return date; // Trả về string gốc nếu không parse được
  } catch (e) {
    console.warn('Could not format date:', date, e);
    return date; // Fallback
  }
};

/**
 * Xử lý lỗi từ API call và trả về một object lỗi chuẩn hóa.
 * @param {Error} error - Đối tượng lỗi từ axios.
 * @param {string} defaultMessage - Thông báo lỗi mặc định.
 * @returns {{isError: boolean, message: string, status: number|null, details: any}}
 */
export const handleApiError = (error, defaultMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  let status = null;
  let message = defaultMessage;
  let details = null;

  if (error.response) {
    status = error.response.status;
    message = error.response.data?.message || error.response.data?.error?.message || defaultMessage;
    details = error.response.data?.data || error.response.data?.errors || error.response.data;
    if (status === 404) {
      message = 'Không tìm thấy tài nguyên được yêu cầu.';
    } else if (status === 400 && error.response.data?.errors) {
      // Xử lý lỗi validation từ Spring Boot (BindingResult)
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        message = validationErrors
          .map((err) => `${err.field ? err.field + ': ' : ''}${err.defaultMessage}`)
          .join('\n');
      }
    } else if (typeof message !== 'string') {
      message = defaultMessage;
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  } else {
    // Lỗi xảy ra khi thiết lập request
    message = error.message || defaultMessage;
  }

  return {
    isError: true,
    message,
    status,
    details,
  };
};

// Export apiClient để có thể sử dụng trực tiếp nếu cần thiết (ví dụ: cho các request đặc thù)
export { apiClient };

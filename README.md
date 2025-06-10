# Cinestar Cinemas - Ứng dụng Đặt vé Xem phim

Đây là dự án frontend cho một hệ thống đặt vé xem phim trực tuyến, được xây dựng bằng React.js. Ứng dụng cho phép người dùng duyệt phim, xem thông tin chi tiết, tìm rạp, chọn suất chiếu và hoàn tất quá trình đặt vé một cách tiện lợi.

## Tính năng chính

  * **Trang chủ:** Hiển thị danh sách các phim đang chiếu và sắp chiếu, cùng với banner quảng cáo và chức năng đặt vé nhanh.
  * **Tìm kiếm phim:** Cho phép người dùng tìm kiếm phim theo tên.
  * **Chi tiết phim:** Hiển thị đầy đủ thông tin về một bộ phim, bao gồm poster, mô tả, trailer, thể loại, thời lượng, và lịch chiếu tại các rạp.
  * **Hệ thống rạp:**
      * Liệt kê danh sách các rạp chiếu phim trong hệ thống.
      * Hỗ trợ tìm kiếm các rạp chiếu phim gần vị trí người dùng qua định vị GPS.
  * **Đặt vé (Booking Flow):**
      * Giao diện chọn ghế ngồi trực quan, hiển thị các loại ghế và trạng thái (còn trống, đang chọn, đã đặt).
      * Trang thanh toán cho phép người dùng nhập thông tin, chọn thêm bắp/nước và xem lại tóm tắt đơn hàng.
      * Đếm ngược thời gian giữ ghế để đảm bảo tính công bằng.
  * **Thanh toán:** Tích hợp với cổng thanh toán VNPay để xử lý giao dịch. Trang thông báo kết quả thanh toán thành công hoặc thất bại.

## Công nghệ sử dụng

  * **Frontend:**
      * **Framework:** React.js
      * **Routing:** React Router
      * **Styling:** Tailwind CSS
      * **Icons:** Lucide React
      * **API Client:** Axios
  * **Backend (suy ra từ file cấu hình):**
      * Java & Spring Boot
      * MongoDB

## Yêu cầu cài đặt

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau trên máy:

  * [Node.js](https://nodejs.org/) (phiên bản 14.x trở lên)
  * npm (thường đi kèm với Node.js)
  * Git (tùy chọn, để clone repository)
  * **Backend Server:** Một instance của server backend phải đang chạy để frontend có thể gọi API.

## Hướng dẫn Cài đặt và Khởi chạy

1.  **Clone Repository**

    ```bash
    git clone <URL_REPOSITORY_CUA_BAN>
    cd <TEN_THU_MUC_REPO>/frontend
    ```

2.  **Cài đặt Dependencies**

    Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết được định nghĩa trong file `package.json`:

    ```bash
    npm install
    ```

3.  **Cấu hình API Endpoint**

    Ứng dụng frontend cần biết địa chỉ của backend server để gửi request. Mở file `src/lib/api.js` và đảm bảo biến `API_BASE_URL` trỏ đúng đến địa chỉ backend của bạn.

    ```javascript
    // src/lib/api.js
    const API_BASE_URL = 'http://localhost:8080/api'; // Mặc định là localhost:8080
    ```

4.  **Chạy ứng dụng ở chế độ Development**

    Sử dụng lệnh sau để khởi động server development.

    ```bash
    npm start
    ```

    Lệnh này sẽ chạy ứng dụng và tự động mở trình duyệt tại địa chỉ [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000). Trang sẽ tự động tải lại mỗi khi bạn thực hiện thay đổi trong mã nguồn.

## Cấu trúc thư mục

Dưới đây là cấu trúc các thư mục quan trọng trong dự án:

```
/public
  - index.html      # Template HTML chính
/src
  /components/      # Chứa các component tái sử dụng (Header, Footer, MovieCard,...)
    /ui/            # Các component UI cơ bản (Button, Card,...)
  /lib/             # Chứa logic cốt lõi
    - api.js        # Các hàm gọi API đến backend
    - utils.js      # Các hàm tiện ích
  /pages/           # Chứa các component tương ứng với mỗi trang
    - home.jsx
    - movie-detail.jsx
    - booking.jsx
    - checkout.jsx
    - ...
  - app.jsx         # Component gốc, định tuyến các trang
  - index.css       # Các file CSS global
  - index.js        # Điểm bắt đầu của ứng dụng React
package.json        # Chứa thông tin và các script của dự án
```

## Các Scripts có sẵn

Dự án này được khởi tạo bằng Create React App, bạn có thể sử dụng các script sau:

  * ### `npm start`

    Chạy ứng dụng ở chế độ development.

  * ### `npm test`

    Chạy trình test runner ở chế độ interactive watch.

  * ### `npm run build`

    Build ứng dụng cho môi trường production vào thư mục `build`. Quá trình này sẽ tối ưu hóa code để đạt hiệu năng tốt nhất.

  * ### `npm run eject`

    **Lưu ý: đây là thao tác một chiều.** Nếu bạn không hài lòng với các công cụ build mặc định, bạn có thể sử dụng lệnh này để "bung" toàn bộ cấu hình ra và tùy chỉnh sâu hơn.
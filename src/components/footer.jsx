import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060413] text-gray-300 pt-12 pb-8 border-t border-gray-800">
      {' '}
      {/* Darker background */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 ml-20">
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">CINESTAR</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-purple-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-purple-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">THÔNG TIN</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/theaters" className="hover:text-purple-400 transition-colors">
                  Hệ thống rạp
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-purple-400 transition-colors">
                  Lịch chiếu phim
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-purple-400 transition-colors">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-purple-400 transition-colors">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">LIÊN HỆ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                Hotline:{' '}
                <a href="tel:02873008881" className="hover:text-purple-400 transition-colors">
                  028 7300 8881
                </a>
              </li>
              <li>
                Email:{' '}
                <a
                  href="mailto:cskh@cinestar.com.vn"
                  className="hover:text-purple-400 transition-colors"
                >
                  cskh@cinestar.com.vn
                </a>
              </li>
              <li className="leading-relaxed">
                Địa chỉ: Tầng 5, TTTM Platinum Plaza, 634 Âu Cơ, P.10, Q.Tân Bình, TP.HCM
              </li>
            </ul>
          </div>

          <div className="ml-10">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">KẾT NỐI</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-500 transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-500 transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a
                href="http://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-500 transition-colors"
              >
                {' '}
                {/* Sửa link youtube */}
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700/50 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CINESTAR CINEMAS. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">404-Trang không tồn tại</h1>
      <p className="text-xl mb-8">Trang bạn đang tìm kiếm không tồn tại, vui lòng kiểm tra lại.</p>
      <Link to="/">
        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          Trở về trang chủ
        </Button>
      </Link>
    </div>
  );
}

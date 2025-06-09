// src/pages/payment-success.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { handleApiError, confirmVnPayPayment, fetchBookingByConfirmationCode } from '../lib/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentResult, setPaymentResult] = useState({
    loading: true,
    error: null,
    ticketInfo: null,
    transactionNo: null,
    data: null,
  });

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
    const isPaymentSuccessfulOnClient = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

    if (!isPaymentSuccessfulOnClient) {
      setPaymentResult({
        loading: false,
        error: 'Giao dịch không thành công hoặc đã bị hủy.',
        ticketInfo: null,
        transactionNo: searchParams.get('vnp_TransactionNo'),
      });
      return;
    }

    const processPaymentConfirmation = async () => {
      try {
        const confirmedBooking = await confirmVnPayPayment(searchParams);
        if (!confirmedBooking) {
          throw new Error('Xác nhận thanh toán với máy chủ thất bại.');
        }
        const dataPayment = await fetchBookingByConfirmationCode(
          confirmedBooking?.confirmationCode
        );

        console.log('dataPayment:', dataPayment);
        setPaymentResult({
          loading: false,
          error: null,
          ticketInfo: confirmedBooking,
          transactionNo: searchParams.get('vnp_TransactionNo'),
          data: dataPayment,
        });
      } catch (apiError) {
        const err = handleApiError(apiError);
        console.error('Lỗi trong quá trình xác nhận thanh toán:', err);
        setPaymentResult({
          loading: false,
          error: err.message,
          ticketInfo: null,
          transactionNo: searchParams.get('vnp_TransactionNo'),
        });
      }
    };

    processPaymentConfirmation();
  }, [searchParams]);

  const { loading, error, ticketInfo } = paymentResult;

  if (loading) {
    return <div className="text-center p-10">Đang xử lý kết quả thanh toán...</div>;
  }

  // Giao diện khi có lỗi
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Thanh toán không thành công</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  // Giao diện khi thành công (đã được làm an toàn hơn)
  if (ticketInfo) {
    return (
      <div className="container mx-auto py-12 px-4">
      <div className="bg-[#0f1635] py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-4 md:space-x-8 text-xs md:text-base">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-gray-400">CHỌN VÉ</span>
            </div>
            <div className="w-12 h-1 md:w-16 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-gray-400">THANH TOÁN</span>
            </div>
            <div className="w-12 h-1 md:w-16  bg-yellow-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-yellow-500 font-bold">THÔNG TIN VÉ</span>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
            <p className="text-gray-400 mt-2">Cảm ơn bạn đã đặt vé tại Cinestar</p>
          </div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center border-b border-gray-800 pb-4 text-white">
              <CardTitle>Thông tin vé</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="flex justify-between text-white">
                <span className="text-white mb-1 font-bold text-xl">Thông tin người đặt vé:</span>
              </p>
              <p className="flex justify-between text-gray-400">
                <span className="font-bold">Họ tên:</span>
                <span>{paymentResult?.data?.customerInfo?.fullName || 'N/A'}</span>
              </p>
              <p className="flex justify-between text-gray-400">
                <span className="font-bold">Email:</span>
                <span>{paymentResult?.data?.customerInfo?.email || 'N/A'}</span>
              </p>

              {paymentResult?.data?.customerInfo?.phone && (
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Số điện thoại:</span>
                  <span>{paymentResult?.data?.customerInfo?.phone || 'N/A'}</span>
                </p>
              )}

              <Separator />
              <div>
                <p className="flex justify-between text-white">
                  <span className="font-bold text-xl">Thông tin phim:</span>
                </p>

                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Mã đặt vé:</span>
                  <span>{ticketInfo?.confirmationCode || 'N/A'}</span>
                </p>
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Phim:</span>
                  <span>{paymentResult?.data?.movieTitle || 'N/A'}</span>
                </p>
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Rạp:</span>
                  <span>{paymentResult?.data?.cinemaName || 'N/A'}</span>
                </p>
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Phòng:</span>
                  <span>{paymentResult?.data?.roomName || 'N/A'}</span>
                </p>
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Thời gian:</span>
                  Ngày:{' '}
                  {new Date(paymentResult?.data?.showDateTime || Date.now()).toLocaleDateString(
                    'vi-VN'
                  )}
                  , Giờ:{' '}
                  {new Date(paymentResult?.data?.showDateTime || Date.now()).toLocaleTimeString(
                    'vi-VN',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
                <p className="flex justify-between text-gray-400">
                  <span className="font-bold">Ghế:</span>
                  <span>{paymentResult?.data?.seats?.join(', ') || 'N/A'}</span>
                </p>
              </div>

              {paymentResult?.data?.concessions && paymentResult.data.concessions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-white mb-1 font-bold text-xl">Bắp nước:</p>
                    {paymentResult?.data?.concessions.map((c) => (
                      <p
                        key={c?.itemId}
                        className="flex justify-between text-sm ml-2 text-gray-400"
                      >
                        <span>
                          {c?.name || 'Sản phẩm'} (x{c?.quantity || 0})
                        </span>
                        <span>
                          {((c?.price || 0) * (c?.quantity || 0)).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </p>
                    ))}
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-2xl text-yellow-500">Tổng tiền:</span>
                <span className="text-yellow-500 text-2xl">
                  {(paymentResult?.data?.totalPrice ?? 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return <div className="text-center p-10">Trạng thái không xác định.</div>;
}

import React from 'react'
interface PaymentLoadingOverlayProps {
    isVisible: boolean;
}
export default function PaymentLoadingOverlay({ isVisible }: PaymentLoadingOverlayProps) {
    return (
        <div>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
                        <div className="flex justify-center mb-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold-500"></div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Đang xử lý đặt chỗ</h3>
                        <p className="text-gray-600">Vui lòng không đóng trình duyệt hoặc tải lại trang</p>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-center items-center space-x-2">
                                <div className="h-2 w-2 bg-gold-500 rounded-full animate-pulse"></div>
                                <div className="h-2 w-2 bg-gold-500 rounded-full animate-pulse delay-150"></div>
                                <div className="h-2 w-2 bg-gold-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

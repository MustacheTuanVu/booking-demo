import React, { useState, useEffect } from "react";
import { formatDate } from "@/utils/date";
import api from "@/utils/api";

// Enum values from backend
const StatusTicket = {
  PENDING: "PENDING",
  CANCEL: "CANCEL",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  COMPLETE: "COMPLETE"
};

const TypeTicket = {
  COMPLAINTS: "COMPLAINTS",
  SERVICE_ERROR: "SERVICE_ERROR",
  SERVICE_SUPPORT: "SERVICE_SUPPORT"
};

const TicketHistoryDialog = ({ isOpen, onClose }: any) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ticket/getTicketsByCondition?page=${currentPage}&limit=10`);
      
      setTickets(response.data.tickets || []);
      setTotalTickets(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / 10));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Không thể tải lịch sử yêu cầu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: any) => {
    switch (status) {
      case StatusTicket.PENDING:
        return { color: "text-yellow-500", label: "Đang xử lý" };
      case StatusTicket.OPEN:
        return { color: "text-blue-500", label: "Đang mở" };
      case StatusTicket.CLOSED:
        return { color: "text-gray-500", label: "Đã đóng" };
      case StatusTicket.COMPLETE:
        return { color: "text-green-500", label: "Hoàn thành" };
      case StatusTicket.CANCEL:
        return { color: "text-red-500", label: "Đã hủy" };
      default:
        return { color: "text-gray-500", label: "Không xác định" };
    }
  };

  const getTypeDisplay = (type: any) => {
    switch (type) {
      case TypeTicket.COMPLAINTS:
        return "Khiếu nại";
      case TypeTicket.SERVICE_ERROR:
        return "Lỗi dịch vụ";
      case TypeTicket.SERVICE_SUPPORT:
        return "Hỗ trợ dịch vụ";
      default:
        return "Không xác định";
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg w-11/12 xl:w-2/3 lg:w-3/4 md:w-4/5 max-h-[90vh] p-4 overflow-hidden flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Lịch sử yêu cầu</h2>
            
            {loading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
                <p className="ml-2">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="flex-grow flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : tickets.length > 0 ? (
              <>
                <div className="overflow-auto flex-grow">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="py-3 px-4 text-center">STT</th>
                        <th className="py-3 px-4 text-left">Tiêu đề</th>
                        <th className="py-3 px-4 text-center">Loại yêu cầu</th>
                        <th className="py-3 px-4 text-center">Số tiền</th>
                        <th className="py-3 px-4 text-center">Ngày tạo</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket: any, index) => (
                        <tr key={ticket._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-center">
                            {(currentPage - 1) * 10 + index + 1}
                          </td>
                          <td className="py-3 px-4">{ticket.title}</td>
                          <td className="py-3 px-4 text-center">{getTypeDisplay(ticket.type)}</td>
                          <td className="py-3 px-4 text-center">
                            {Number(ticket.price).toLocaleString()} đ
                          </td>
                          <td className="py-3 px-4 text-center">
                            {formatDate(ticket.createdAt)}
                          </td>
                          <td className={`py-3 px-4 text-center ${getStatusDisplay(ticket.status).color}`}>
                            {getStatusDisplay(ticket.status).label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center justify-between mt-4 border-t pt-3">
                  <div className="text-sm text-gray-600">
                    Hiển thị {tickets.length} trên tổng số {totalTickets} yêu cầu
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gold-500 text-white hover:bg-gold-600"
                      }`}
                    >
                      ← Trước
                    </button>
                    <span className="text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gold-500 text-white hover:bg-gold-600"
                      }`}
                    >
                      Tiếp →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500">Bạn chưa có yêu cầu nào</p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketHistoryDialog;
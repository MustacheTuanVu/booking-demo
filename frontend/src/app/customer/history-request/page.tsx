"use client";

import React, { useContext, useEffect, useState } from "react";
import { formatDate } from "@/utils/date";
import api from "@/utils/api";
import { AppContext } from "@/context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import TicketHistoryDialog from "@/components/TicketHistoryDialog";
import {
  CustomerPageLayout,
  CustomerCard,
  CustomerSnackbar
} from "@/components/CustomerLayout";
import { AnimateGroup } from "@/components/ui/animate";

export default function HistoryRequestPage() {
  const [limit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const { userInfo } = useContext(AppContext);
  const [listRequests, setListRequests] = useState<any[]>([]);
  const [showTicketHistoryModal, setShowTicketHistoryModal] = useState(false);
  const [total, setTotal] = useState<number>(0);
  // New state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  const fetchHistoryRequest = async () => {
    try {
      const res = await api.get(
        `ticket/getTicketsByCondition?page=${page + 1}&limit=${99999999}`
      );
      setTotal(res.data.total);
      setListRequests(res.data.tickets);
    } catch (error) {
      console.error("Error fetching history request:", error);
      showSnackbar("Không thể tải dữ liệu lịch sử yêu cầu", false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchHistoryRequest();
    }
  }, [page, limit, userInfo]);


  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return { color: "bg-green-100 text-green-800", label: "Thành công" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", label: "Đang chờ xử lý" };
      case "OPEN":
        return { color: "bg-blue-100 text-blue-800", label: "Đã mở" };
      case "CLOSED":
        return { color: "bg-red-100 text-red-800", label: "Đã đóng" };
      case "CANCEL":
        return { color: "bg-gray-100 text-gray-800", label: "Thất bại" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Không xác định" };
    }
  };

  // Helper function for snackbar
  const showSnackbar = (message: string, success: boolean = true) => {
    setSnackbarMessage(message);
    setSnackbarSuccess(success);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  return (
    <CustomerPageLayout
      title="Lịch sử yêu cầu"
      subtitle="Hiển thị tất cả các yêu cầu đã được gửi cho Queen Acoustic"
      description="Trang quản lý lịch sử yêu cầu tại Queen Acoustic."
    >
      <AnimateGroup
        staggerDelay={0.1}
        childVariant="slide-up"
        className="space-y-8"
      >
        {/* Referral Code Card */}
        <CustomerCard title="Danh sách yêu cầu đã gửi" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 opacity-10">
            <FontAwesomeIcon icon={faClockRotateLeft} className="w-full h-full text-[var(--clr-bg-1)]" />
          </div>
          <div className="">
            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-3 px-4 border text-center">STT</th>
                    <th className="py-3 px-4 border text-center whitespace-nowrap">Tên Yêu cầu</th>
                    <th className="py-3 px-4 border text-center whitespace-nowrap">Giá trị</th>
                    <th className="py-3 px-4 border text-center whitespace-nowrap">Thời gian gửi</th>
                    <th className="py-3 px-4 border text-center whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {listRequests.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4">Không có yêu cầu nào</td>
                    </tr>
                  ) : (
                    listRequests?.map((res, index) => (
                      <tr key={res._id} className={`border-b}`}>
                        <td className="py-3 px-4 text-center">{page * limit + index + 1}</td>
                        <td className="py-3 px-4 font-medium">{res.title}</td>
                        <td className="py-3 px-4 font-medium text-center">
                          {res.price === 0 ? "-" : (res.price).toLocaleString("vi")}
                        </td>
                        <td className="py-3 px-4 text-center"> {formatDate(res.createdAt)}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(res?.status || "").color}`}>
                            {getStatusDisplay(res?.status || "").label}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {listRequests.length > 0 && (
              <div className="flex justify-between items-center my-4">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="px-4 py-2">
                  Trang {page + 1} / {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((prev) => (listRequests.length < limit ? prev : prev + 1))}
                  disabled={listRequests.length < limit}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </CustomerCard>
      </AnimateGroup>

      {/* Ticket History Dialog */}
      <TicketHistoryDialog
        open={showTicketHistoryModal}
        onClose={() => setShowTicketHistoryModal(false)}
        referralCode={userInfo?.referral_code || ""}
      />

      {/* Snackbar for notifications */}
      <CustomerSnackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={closeSnackbar}
        isSuccess={snackbarSuccess}
      />
    </CustomerPageLayout>
  );
}
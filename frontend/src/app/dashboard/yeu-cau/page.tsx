"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCheck,
  faSpinner,
  faFilter,
  faFileExcel,
  faTicket,
  faUser,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

// Định nghĩa enum cho trạng thái ticket
enum StatusTicket {
  PENDING = "PENDING",
  CANCEL = "CANCEL",
  COMPLETE = "COMPLETE"
}

// Định nghĩa enum cho loại ticket
enum TypeTicket {
  COMPLAINTS = "COMPLAINTS",
}

// Interface cho Ticket
interface Ticket {
  _id: string;
  uid: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  type: TypeTicket;
  title: string;
  price: number;
  status: StatusTicket;
  handler_id?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface cho response khi fetch tickets
interface TicketResponse {
  tickets: Ticket[];
  total: number;
  condition: number;
  limit: number;
}

// Interface cho điều kiện tìm kiếm
interface TicketCondition {
  page: number;
  limit: number;
  type?: string;
  status?: StatusTicket;
  query?: string;
  time_from?: string;
  time_to?: string;
  orderBy?: string;
}

const TicketManagementPage: React.FC = () => {
  // Data state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [updatingTicket, setUpdatingTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<StatusTicket>(StatusTicket.PENDING);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(0); // Changed to 0-based for PaginationControls
  const [limit, setLimit] = useState<number>(10);

  // Dialog state
  const [updateStatusModal, setUpdateStatusModal] = useState<boolean>(false);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => {});
  const [confirmDialogMessage, setConfirmDialogMessage] = useState<string>("");

  // Notification state
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusTicket | "">("");
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");

  // Detect mobile view and set appropriate view mode
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (isMobile) {
        setViewMode("card");
      }
    };

    // Check on mount
    checkIfMobile();

    // Add resize listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Force card view on mobile devices whenever screen size changes
  useEffect(() => {
    if (isMobileView && viewMode === "table") {
      setViewMode("card");
    }
  }, [isMobileView, viewMode]);

  // Fetch tickets với điều kiện
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const condition: TicketCondition = {
        page: page + 1, // Convert to 1-based for API
        limit,
        type: "COMPLAINTS",
      };

      if (statusFilter) {
        condition.status = statusFilter as StatusTicket;
      }

      if (searchQuery) {
        condition.query = searchQuery;
      }

      if (timeFrom && timeTo) {
        condition.time_from = timeFrom;
        condition.time_to = timeTo;
      }

      const res = await api.get("ticket/getTicketsByCondition", { params: condition });
      const data: TicketResponse = res.data;
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching tickets", error);
      setSnackbarMsg("Có lỗi xảy ra khi tải danh sách yêu cầu!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery, timeFrom, timeTo]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Hàm mở modal cập nhật trạng thái
  const handleOpenUpdateStatus = (ticket: Ticket) => {
    setUpdatingTicket(ticket);
    setNewStatus(ticket.status);
    setUpdateStatusModal(true);
  };

  // Hàm cập nhật trạng thái ticket
  const handleUpdateStatus = async () => {
    if (!updatingTicket) return;

    setIsLoading(true);
    try {
      await api.put(`ticket/updateStatusTicker?id=${updatingTicket._id}`, {
        status: newStatus
      });

      setSnackbarMsg("Cập nhật trạng thái yêu cầu thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setUpdateStatusModal(false);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status", error);
      setSnackbarMsg("Có lỗi xảy ra khi cập nhật trạng thái yêu cầu!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };



  // Hàm reset bộ lọc
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTimeFrom("");
    setTimeTo("");
    setPage(0);
    fetchTickets();
  };
  const handleExportExcel = async () => {
    try {
      setIsLoading(true);
      // Prepare query parameters for filtering
      let queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (timeFrom) queryParams.append("time_from", timeFrom);
      if (timeTo) queryParams.append("time_to", timeTo);

      const response = await api.post(
        `tool-excel/downloadExcelTicket?page=1&limit=99999&type=COMPLAINTS&${queryParams.toString()}`,
        {},
        { responseType: "blob" }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `danh-sach-yeu-cau-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbarMsg("Xuất file Excel thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error exporting Excel file", error);
      setSnackbarMsg("Xuất file Excel thất bại!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy màu và tên trạng thái dựa trên enum
  const getStatusInfo = (status: StatusTicket) => {
    switch (status) {
      case StatusTicket.PENDING:
        return { text: "Đang chờ xử lý", color: "text-yellow-500 bg-yellow-100" };
      case StatusTicket.COMPLETE:
        return { text: "Đã xử lý", color: "text-green-500 bg-green-100" };
      case StatusTicket.CANCEL:
        return { text: "Đã hủy", color: "text-red-500 bg-red-100" };
      default:
        return { text: status, color: "text-gray-500 bg-gray-100" };
    }
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="container mx-auto mt-4 px-3 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý yêu cầu quy đổi | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý yêu cầu quy đổi hỗ trợ tại Queen Acoustic." />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4 mb-4 md:mb-0">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Header */}
          <div className="mb-6">
            <DashboardHeader
              title="Quản lý yêu cầu quy đổi"
              searchEnabled={true}
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(0);
                fetchTickets();
              }}
              onSearchClear={() => {
                setSearchQuery("");
                setPage(0);
                fetchTickets();
              }}
              filterEnabled={true}
              onFilterClick={() => setIsFilterExpanded(!isFilterExpanded)}
              filterIcon={faFilter}
              extraButtons={
                <Button
                  onClick={handleExportExcel}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faFileExcel} className="h-4 w-4" />
                  <span>Xuất Excel</span>
                </Button>
              }
            />

            {/* Filter Panel */}
            {isFilterExpanded && (
              <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-100 animate-in fade-in-50 duration-300">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPage(0);
                  fetchTickets();
                }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusTicket | "")}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      >
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(StatusTicket).map((status) => (
                          <option key={status} value={status}>
                            {getStatusInfo(status).text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                      <input
                        type="date"
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                      <input
                        type="date"
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 text-white w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang tìm..." : "Áp dụng bộ lọc"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={resetFilters}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                      disabled={isLoading}
                    >
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* View Mode Switcher area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">
              {tickets.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{tickets.length}</span> trên tổng số <span className="font-medium">{total}</span> yêu cầu</p>
              ) : null}
            </div>
            <ViewSwitcher
              value={viewMode}
              onChange={(mode) => {
                // Only allow changing to table view on non-mobile devices
                if (mode === "table" && isMobileView) {
                  // Do nothing if trying to switch to table on mobile
                  return;
                }
                setViewMode(mode);
              }}
              className="self-end sm:self-auto hidden md:inline-flex"
              disabled={isMobileView} // Disable the switcher completely on mobile
            />
          </div>

          {/* Mobile swipe instruction - more prominent and easier to notice */}
          {viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 bg-red-50 p-2 rounded-md border border-red-100 animate-pulse opacity-90 mb-3">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 animate-pulse" />
              <span className="ml-1.5">Kéo sang phải để xem thêm</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tickets.length === 0 ? (
            <EmptyState
              title="Không tìm thấy yêu cầu nào"
              subtitle="Không có yêu cầu nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={searchQuery}
              icon={faTicket}
              minHeight="300px"
            />
          ) : null}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            null // EmptyState is handled above
          ) : viewMode === "table" ? (
            // Table View
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full border-collapse table-fixed md:table-auto">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">STT</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Khách hàng</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Tiêu đề</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Giá trị</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Trạng thái</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày tạo</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket, index) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-500 text-center">{page * limit + index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{ticket.uid?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{ticket.uid?.phone || "N/A"}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{ticket.uid?.email || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{ticket.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium text-center">{formatPrice(Number(ticket.price))}</td>
                        <td className="py-3 px-4 text-sm text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusInfo(ticket.status as StatusTicket).color}`}>
                            {getStatusInfo(ticket.status as StatusTicket).text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 text-center">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <ActionButtonsGroup
                            showEdit={true}
                            showView={false}
                            showDelete={false}
                            editTooltip="Cập nhật trạng thái"
                            onEdit={() => handleOpenUpdateStatus(ticket)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden ${
                    ticket.status === StatusTicket.COMPLETE ? "border-l-4 border-l-green-500" :
                    ticket.status === StatusTicket.PENDING ? "border-l-4 border-l-yellow-500" :
                    ticket.status === StatusTicket.CANCEL ? "border-l-4 border-l-red-500" : ""
                  }`}
                >
                  {/* Card Header with Status */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800 text-lg truncate">{ticket.title}</h3>
                      <span className={`ml-2 px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusInfo(ticket.status as StatusTicket).color}`}>
                        {getStatusInfo(ticket.status as StatusTicket).text}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-grow">
                    <div className="space-y-4">
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4 mr-2" />
                          <span className="text-gray-700 font-medium">{ticket.uid?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="text-gray-700">{ticket.uid?.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span className="text-gray-700 truncate max-w-[200px]">{ticket.uid?.email || "N/A"}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Giá trị</p>
                          <p className="font-medium text-gray-800 mt-1 whitespace-nowrap text-sm">{formatPrice(Number(ticket.price))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Ngày tạo</p>
                          <p className="font-medium text-gray-800 mt-1 whitespace-nowrap text-sm">{formatDate(ticket.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <Button
                      onClick={() => handleOpenUpdateStatus(ticket)}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1.5 h-3.5 w-3.5" />
                      Cập nhật trạng thái
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && tickets.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Hiển thị</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(0);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {[10, 20, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">mục</span>
              </div>

              <PaginationControls
                page={page} // Already 0-based
                limit={limit}
                total={total}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top when changing page
                }}
                pagesToShow={isMobileView ? 1 : 2} // Show fewer page numbers on mobile
                className="rounded-lg shadow-sm text-xs sm:text-sm" // Enhanced styling for better touch
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Update Dialog */}
      {updatingTicket && (
        <StandardDialog
          open={updateStatusModal}
          onClose={() => setUpdateStatusModal(false)}
          title="Cập nhật trạng thái yêu cầu"
          maxWidth="md"
          actions={
            <>
              <DialogActionButton
                onClick={() => setUpdateStatusModal(false)}
                variant="secondary"
                disabled={isLoading}
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={handleUpdateStatus}
                variant="primary"
                disabled={isLoading || (updatingTicket && newStatus === updatingTicket.status)}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
                    Cập nhật
                  </>
                )}
              </DialogActionButton>
            </>
          }
        >
          <div className="space-y-5">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-medium mb-2 text-gray-900">Yêu cầu: {updatingTicket.title}</div>
              <div className="text-sm text-gray-600">
                Khách hàng: <span className="font-medium">{updatingTicket.uid?.name || "N/A"}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Giá trị: <span className="font-medium">{formatPrice(Number(updatingTicket.price))}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Trạng thái hiện tại:
                <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusInfo(updatingTicket.status as StatusTicket).color}`}>
                  {getStatusInfo(updatingTicket.status as StatusTicket).text}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Chọn trạng thái mới:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as StatusTicket)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all"
              >
                {Object.values(StatusTicket).map((status) => (
                  <option key={status} value={status} disabled={status === updatingTicket.status}>
                    {getStatusInfo(status).text} {status === updatingTicket.status ? "(Hiện tại)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </StandardDialog>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => {
          confirmDialogAction();
          setConfirmDialogOpen(false);
        }}
        title="Xác nhận"
        message={confirmDialogMessage}
        confirmButtonText="Xác nhận"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMsg}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default TicketManagementPage;
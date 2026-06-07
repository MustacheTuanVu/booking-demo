"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { formatDate } from "@/utils/date";
import Image from "next/image";
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
  faFilter,
  faUser,
  faArrowRight,
  faFileExcel
} from "@fortawesome/free-solid-svg-icons";

interface GuestInfo {
  is_guest: boolean;
  expiry: string | null;
  _id: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  role: string;
  referral_code?: string;
  customer_type?: string;
  customer_type_expiry?: string;
  isDelete?: string;
  createdAt?: string;
  updatedAt?: string;
  idWebSocket?: string[];
  state?: string;
  incom_id?: string;
  guest?: GuestInfo;
}
interface Ticket {
  _id: string;
  uid: Customer;
  type: string;
  for: string;
  title: string;
  price: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
interface CustomerResponse {
  tickets: Ticket[];
  total: number;
  condition: number;
  limit: number;
}

interface Order {
  _id: string;
  code: string;
  total_price: number;
  createdAt: string;
  status: string;
  InfoUser?: {
    name: string;
    email: string;
    phone: string;
  };
  eventDetail?: {
    title: string;
  };
  InfoOrderPayment?: {
    status: string;
  };
  referred_by?: string;
}
enum StatusTicket {
  PENDING = "PENDING",
  CANCEL = "CANCEL",
  COMPLETE = "COMPLETE"
}
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
export default function CongTacVienPage() {
  // Data state
  const [customers, setCustomers] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusTicket | "">("");
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");

  // Dialog state
  const [openIncomeDialog, setOpenIncomeDialog] = useState<boolean>(false);
  const [openAffiliateDialog, setOpenAffiliateDialog] = useState<boolean>(false);
  const [affiliateOrders, setAffiliateOrders] = useState<Order[]>([]);
  const [totalAffiliatePrice, setTotalAffiliatePrice] = useState<number>(0);
  const [loadingAffiliateOrders, setLoadingAffiliateOrders] = useState<boolean>(false);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => {});
  const [confirmDialogMessage, setConfirmDialogMessage] = useState<string>("");

  // Notification state
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

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

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      let searchPage = 0;
      if (searchQuery.length > 0) {
        searchPage = 0;
      } else {
        searchPage = page;
      }
      const condition: TicketCondition = {
        page: searchPage + 1,
        limit,
        type: "COLLABORATOR",
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
      const data: CustomerResponse = res.data;
      setCustomers(data.tickets);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Error fetching customers", error);
      setSnackbarMsg("Không thể tải danh sách cộng tác viên");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, timeFrom, timeTo]);
  const fetchIncomes = async (customerIncomeId?: string) => {
    try {
      const res = await api.get("income/getIncomesByCondition?page=1&limit=9999999");
      setIncomes(res.data.income || []);

      // Nếu khách hàng đã có chính sách, chọn nó làm mặc định
      if (customerIncomeId) {
        setSelectedIncomeId(customerIncomeId);
      }

      // Nếu không, chọn chính sách đầu tiên trong danh sách (nếu có)
      else if (res.data.income && res.data.income.length > 0) {
        setSelectedIncomeId(res.data.income[0]._id);
      } else {
        setSelectedIncomeId("");
      }
    } catch (error) {
      console.error("Error fetching incomes", error);
    }
  };

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchCustomers();
    fetchIncomes();
  }, [page, limit, searchQuery, statusFilter, timeFrom, timeTo, fetchCustomers]);

  const getIncomeNameById = (id: string) => {
    const income = incomes.find(item => item._id === id);
    return income ? income.name : "-";
  };

  const handleAssignIncome = (customerId: string, customerIncomeId?: string, customerTicketId?: any) => {
    setSelectedCustomerId(customerId);
    setSelectedTicketId(customerTicketId || "");
    // Trước khi mở dialog, fetch danh sách chính sách
    fetchIncomes(customerIncomeId);
    setOpenIncomeDialog(true);
  };
  const handleSubmitAssignIncome = async () => {
    try {
      await api.put(`income/updateIncomeForUser/${selectedIncomeId}`, [selectedCustomerId]);
      setOpenIncomeDialog(false);
      handleEdit(selectedTicketId);
      setSnackbarMsg("Cập nhật thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchCustomers(); // Tải lại danh sách khách hàng
    } catch (error) {
      console.error("Error assigning income", error);
      setSnackbarMsg("Có lỗi xảy ra khi cập nhật!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleEdit = async (ticket: any) => {
    try {
      if (ticket.status === "COMPLETE") {
        return;
      }
      await api.put(`ticket/updateStatusTicker?id=${ticket._id}`, {
        status: "COMPLETE"
      });
      fetchCustomers();
    } catch (error) {
      console.error("Cập nhật chính sách CTV và trạng thái thất bại!", error);
    }
  };

  const handleDelete = async (customerId: any[]) => {
    setConfirmDialogMessage("Bạn có chắc chắn muốn xóa loại CTV của khách hàng này không?");
    setConfirmDialogAction(() => async () => {
      try {
        await api.delete(`income/deleteIncome`, {
          data: customerId
        });
        setSnackbarMsg("Xóa loại CTV thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchCustomers();
      } catch (error) {
        setSnackbarMsg("Xóa loại CTV thất bại!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    });
    setConfirmDialogOpen(true);
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
        `tool-excel/downloadExcelCollaborator?page=1&limit=99999&${queryParams.toString()}`,
        {},
        { responseType: "blob" }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `danh-sach-CTV-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
  // Hàm lấy danh sách order từ tiếp thị liên kết
  const handleViewAffiliateOrders = async (referralCode: string, customer: Customer) => {
    if (!referralCode) {
      setSnackbarMsg("Khách hàng này không có mã giới thiệu");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setCurrentCustomer(customer);
    setLoadingAffiliateOrders(true);
    setOpenAffiliateDialog(true);

    try {
      const res = await api.get(`orders/GetMany?query=${referralCode}&limit=9999`);

      // Lọc chỉ lấy các đơn hàng có referred_by trùng với mã giới thiệu
      const filteredOrders = res.data.orders.filter(
        (order: Order) => order.referred_by === referralCode
      );

      setAffiliateOrders(filteredOrders);

      // Tính tổng doanh thu từ đơn hàng tiếp thị liên kết
      const totalPrice = filteredOrders.reduce(
        (sum: number, order: Order) => sum + (order.total_price || 0),
        0
      );

      setTotalAffiliatePrice(totalPrice);
    } catch (error) {
      console.error("Error fetching affiliate orders for customer", error);
      setSnackbarMsg("Không thể tải danh sách đơn hàng tiếp thị liên kết");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingAffiliateOrders(false);
    }
  };

  // Hàm định dạng trạng thái đơn hàng thành văn bản tiếng Việt và màu sắc
  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return { text: "Đã thanh toán", color: "text-green-500" };
      case "PENDING":
        return { text: "Đang chờ thanh toán", color: "text-yellow-500" };
      case "CONFIRMED":
        return { text: "Đã xác nhận", color: "text-blue-500" };
      case "CANCELED":
        return { text: "Đã hủy", color: "text-red-500" };
      case "REFUNDED":
        return { text: "Đã hoàn tiền", color: "text-purple-500" };
      case "FAILED":
        return { text: "Thất bại", color: "text-gray-500" };
      default:
        return { text: status, color: "text-gray-500" };
    }
  };
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return { color: "bg-green-100 text-green-800", label: "Đã xử lý" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", label: "Đang chờ xử lý" };
      case "OPEN":
        return { color: "bg-blue-100 text-blue-800", label: "Đã mở" };
      case "CLOSED":
        return { color: "bg-red-100 text-red-800", label: "Đã đóng" };
      case "CANCEL":
        return { color: "bg-gray-100 text-gray-800", label: "Đã hủy" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Không xác định" };
    }
  };

  return (
    <div className="container mx-auto mt-4 px-3 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý Cộng Tác Viên | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý cộng tác viên tại Queen Acoustic." />
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
              title="Quản lý Cộng Tác Viên"
              searchEnabled={true}
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(0);
                fetchCustomers();
              }}
              onSearchClear={() => {
                setSearchQuery("");
                setPage(0);
                fetchCustomers();
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
                  fetchCustomers();
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
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
                            {status === StatusTicket.PENDING ? "Đang chờ xử lý" :
                             status === StatusTicket.COMPLETE ? "Đã xử lý" :
                             status === StatusTicket.CANCEL ? "Đã hủy" : status}
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
                      >
                        Áp dụng bộ lọc
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* View Mode Switcher area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">
              {customers.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{customers.length}</span> trên tổng số <span className="font-medium">{total}</span> cộng tác viên</p>
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
          {!isLoading && customers.length === 0 ? (
            <EmptyState
              title="Không tìm thấy cộng tác viên nào"
              subtitle="Không có cộng tác viên nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={searchQuery}
              icon={faUser}
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
          ) : customers.length === 0 ? (
            null // EmptyState is handled above
          ) : viewMode === "table" ? (
            // Table View
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full border-collapse table-fixed md:table-auto">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">STT</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Họ tên</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">SĐT</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày Đăng ký</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Loại CTV</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Trạng thái</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers?.map((ticket: any, index) => {
                      const customer = ticket?.uid;
                      return (
                        <tr key={ticket._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-500 text-center">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{customer.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{customer.phone}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{customer.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-500 text-center">{formatDate(ticket.createdAt)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500 text-center">{getIncomeNameById(customer.incom_id)}</td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(ticket?.status || "").color}`}>
                              {getStatusDisplay(ticket?.status || "").label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <ActionButtonsGroup
                              showView={true}
                              showEdit={true}
                              showDelete={true}
                              viewTooltip="Xem tiếp thị liên kết"
                              editTooltip="Cập nhật loại CTV"
                              deleteTooltip="Xóa loại CTV"
                              onView={() => handleViewAffiliateOrders(customer.referral_code || "", customer)}
                              onEdit={() => handleAssignIncome(customer._id, customer.incom_id, ticket)}
                              onDelete={() => handleDelete([customer?._id])}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {customers.map((ticket: any) => {
                const customer = ticket?.uid;
                return (
                  <div
                    key={ticket._id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden ${
                      ticket?.status === "COMPLETE" ? "border-l-4 border-l-green-500" :
                      ticket?.status === "PENDING" ? "border-l-4 border-l-yellow-500" :
                      ticket?.status === "CANCEL" ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    {/* Card Header with Status */}
                    <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-800 text-lg truncate">{customer.name}</h3>
                        <span className={`ml-2 px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(ticket?.status || "").color}`}>
                          {getStatusDisplay(ticket?.status || "").label}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-grow">
                      <div className="space-y-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4 mr-2" />
                            <span className="text-gray-700">{customer.phone}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span className="text-gray-700 truncate max-w-[200px]">{customer.email}</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Loại CTV</p>
                            <p className="font-medium text-gray-800 mt-1">{getIncomeNameById(customer.incom_id)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Ngày đăng ký</p>
                            <p className="font-medium text-gray-800 mt-1">{formatDate(ticket.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                      <Button
                        onClick={() => handleViewAffiliateOrders(customer.referral_code || "", customer)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <FontAwesomeIcon icon={faFileExcel} className="mr-1.5 h-3.5 w-3.5" />
                        Tiếp thị
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAssignIncome(customer._id, customer.incom_id, ticket)}
                          className="bg-gold-100 hover:bg-gold-200 text-gold-700 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          Cập nhật
                        </Button>
                        <Button
                          onClick={() => handleDelete([customer?._id])}
                          className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && customers.length > 0 && (
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

      {/* Affiliate Orders Dialog */}
      <StandardDialog
        open={openAffiliateDialog}
        onClose={() => setOpenAffiliateDialog(false)}
        title={`Danh sách đơn hàng từ tiếp thị liên kết của ${currentCustomer?.name || ""}`}
        maxWidth="xl"
        actions={
          <DialogActionButton
            onClick={() => setOpenAffiliateDialog(false)}
            variant="primary"
          >
            Đóng
          </DialogActionButton>
        }
      >
        {loadingAffiliateOrders ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : affiliateOrders.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                <p className="text-2xl font-bold">{affiliateOrders.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gold-500 whitespace-nowrap">{totalAffiliatePrice.toLocaleString()} đ</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-600 text-sm">Mã giới thiệu</p>
                <p className="text-lg font-bold">{currentCustomer?.referral_code}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">STT</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Mã đơn hàng</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">Khách hàng</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Sự kiện</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Tổng tiền</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">Ngày tạo</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affiliateOrders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.code}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{order.InfoUser?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{order.eventDetail?.title || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {order.total_price.toLocaleString()} đ
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusText(order.InfoOrderPayment?.status || "").color}`}>
                          {getStatusText(order.InfoOrderPayment?.status || "").text}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">Không có đơn hàng nào từ tiếp thị liên kết</p>
            <p>Mã giới thiệu: {currentCustomer?.referral_code || "Chưa có mã giới thiệu"}</p>
          </div>
        )}
      </StandardDialog>

      {/* Income Assignment Dialog */}
      <StandardDialog
        open={openIncomeDialog}
        onClose={() => setOpenIncomeDialog(false)}
        title="Gán chính sách CTV"
        maxWidth="md"
        actions={
          <>
            <DialogActionButton
              onClick={() => setOpenIncomeDialog(false)}
              variant="secondary"
            >
              Hủy
            </DialogActionButton>
            <DialogActionButton
              onClick={handleSubmitAssignIncome}
              variant="primary"
              disabled={!selectedIncomeId || incomes.length === 0}
            >
              Gán chính sách
            </DialogActionButton>
          </>
        }
      >
        <div className="space-y-5">
          {/* Current selection summary - helps on mobile */}
          {selectedIncomeId && (
            <div className="bg-gold-50 p-3 rounded-lg border border-gold-200 mb-4">
              <p className="text-sm text-gold-800 font-medium">Chính sách đã chọn:</p>
              <p className="text-lg font-bold text-gold-900 mt-1">
                {incomes.find(inc => inc._id === selectedIncomeId)?.name || "Đang chọn..."}
              </p>
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-3">Chọn chính sách thu nhập:</label>
            <div className="grid gap-3 sm:gap-4">
              {incomes.length > 0 ? (
                incomes.map((income) => (
                  <label
                    key={income._id}
                    className={`flex flex-col sm:flex-row sm:items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all ${
                      selectedIncomeId === income._id
                        ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-200 shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-gold-500 focus:ring-gold-500"
                        name="income"
                        value={income._id}
                        checked={selectedIncomeId === income._id}
                        onChange={() => setSelectedIncomeId(income._id)}
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900 text-lg">{income.name}</div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                          <div className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-sm">
                            {income.type_price === "PERCENT" ? "Phần trăm: " : "Cố định: "}
                            <span className="font-medium text-gold-600">
                              {income.price}{income.type_price === "PERCENT" ? "%" : "đ"}
                            </span>
                          </div>
                          {income.desc && (
                            <div className="text-sm text-gray-500">
                              {income.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Không có chính sách thu nhập nào.</p>
                  <p className="text-gray-500 text-sm mt-1">Vui lòng tạo chính sách trước.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </StandardDialog>
    </div>
  );
};
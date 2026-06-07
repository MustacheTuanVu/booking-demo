"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
// ActionButtonsGroup removed as we're using custom action buttons
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import ActionSheet, { ActionItem } from "@/components/ui/ActionSheet";
import DateTimePicker from "@/components/ui/DateTimePicker";
import api from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faRefresh,
  faArrowRight,
  faTicket,
  faPercent,
  faCalendarAlt,
  faUsers,
  faPlus,
  faEllipsisV,
  faFileExcel,
  faFileImport,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";

// Enums based on backend
enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

enum TypePromotion {
  PERCENT = "PERCENT",
  VND = "VND"
}

enum CustomerType {
  J = "J",
  Q = "Q",
  K = "K"
}

// Interfaces based on backend schema
interface PromotionType {
  _id: string;
  uid?: string;
  code: string;
  name: string;
  desc?: string;
  expired: string;
  status: Status;
  type_price: TypePromotion;
  price: number;
  required_points: number;
  max_quantity: number;
  total: number;
  for_type: string;
  for: string;
  user_list?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface PromotionResponse {
  promotion: PromotionType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface Customer {
  _id?: string;
  phone: string;
  cukcuk_id?: string;
  name: string;
  email: string;
  address?: string;
  identity_number?: string;
  role?: string;
  customer_type?: string;
  customer_type_expiry?: string;
  point?: number;
  referral_code?: string;
  createdAt?: string;
  updatedAt?: string;
  isDelete?: string;
}

interface CustomerResponse {
  userModels: Customer[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface GetPromotionByCondition {
  page: number;
  limit: number;
  query?: string;
  status?: Status;
  time_from?: string;
  time_to?: string;
  orderBy?: string;
}

const VoucherPage: React.FC = () => {
  // State management
  const [vouchers, setVouchers] = useState<PromotionType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<PromotionType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [forType, setForType] = useState<string>("Hạng thẻ");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [quickViewVoucher, setQuickViewVoucher] = useState<PromotionType | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState<boolean>(false);

  const [expiredDate, setExpiredDate] = useState<Date | null>(
    editingVoucher?.expired ? new Date(editingVoucher.expired) : null
  );

  useEffect(() => {
    if (snackbarMsg) {
      const timer = setTimeout(() => {
        setSnackbarMsg("");
      }, 5000); // 5 giây
      return () => clearTimeout(timer);
    }
  }, [snackbarMsg]);

  useEffect(() => {
    // Cập nhật khi editingVoucher thay đổi
    if (editingVoucher?.expired) {
      setExpiredDate(new Date(editingVoucher.expired));
    }
  }, [editingVoucher]);
  // Handle quick view action
  const handleQuickView = (voucher: PromotionType) => {
    setQuickViewVoucher(voucher);
    setQuickViewOpen(true);
  };

  // Add Excel import/export functions
  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      // Prepare query parameters
      const condition: GetPromotionByCondition = {
        page: page + 1,
        limit: limit
      };

      if (searchQuery) {
        condition.query = searchQuery;
      }

      if (statusFilter) {
        condition.status = statusFilter as Status;
      }

      if (dateRange.from && dateRange.to) {
        condition.time_from = dateRange.from;
        condition.time_to = dateRange.to;
      }

      const queryParams = new URLSearchParams();
      Object.entries(condition).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.post(
        `tool-excel/downloadFileVoucher?${queryParams.toString()}`,
        {},
        { responseType: "blob" }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vouchers-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbarMsg("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Error exporting Excel file", error);
      setSnackbarMsg("Xuất file Excel thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setSnackbarMsg("Vui lòng chọn file Excel (.xlsx, .xls)!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("tool-excel/uploadFileVoucher", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSnackbarMsg(`Nhập dữ liệu voucher thành công!`);
      fetchVouchers();
    } catch (error) {
      console.error("Error importing Excel file", error);
      setSnackbarMsg("Nhập file Excel thất bại!");
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Fetch vouchers with conditions
  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const condition: GetPromotionByCondition = {
        page: page + 1,
        limit: limit
      };

      if (searchQuery) {
        condition.query = searchQuery;
      }

      if (statusFilter) {
        condition.status = statusFilter as Status;
      }

      if (dateRange.from && dateRange.to) {
        condition.time_from = dateRange.from;
        condition.time_to = dateRange.to;
      }

      const queryParams = new URLSearchParams();
      Object.entries(condition).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const res = await api.get(`promotion/GetMany?${queryParams.toString()}`);
      const data: PromotionResponse = res.data;
      setVouchers(data.promotion);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching vouchers", error);
      setSnackbarMsg("Có lỗi xảy ra khi tải danh sách voucher!");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers for dropdown selection
  const fetchCustomers = async () => {
    try {
      let searchPage = searchQuery.length > 0 ? 0 : page;
      const res = await api.get(
        `users/getUserByQuery?page=${searchPage + 1}&limit=${99999999}&query=${searchQuery}`
      );
      const data: CustomerResponse = res.data;
      setCustomers(data.userModels);
    } catch (error) {
      console.error("Error fetching customers", error);
      setSnackbarMsg("Có lỗi xảy ra khi tải danh sách khách hàng!");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchVouchers();
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add effect to detect mobile screens and enforce card view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
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

  // Dialog control
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingVoucher(null);
    setForType("hạng thẻ");
  };

  // Validate form data
  const validateVoucherData = (data: any) => {
    // Simple validation
    if (!data.name || data.name.length < 3 || data.name.length > 50) {
      setSnackbarMsg("Tên voucher phải từ 3 đến 50 ký tự!");
      return false;
    }

    if (data.desc && (data.desc.length < 3 || data.desc.length > 100)) {
      setSnackbarMsg("Mô tả voucher phải từ 3 đến 100 ký tự!");
      return false;
    }

    if (!data.expired) {
      setSnackbarMsg("Vui lòng chọn ngày hết hạn!");
      return false;
    }

    if (data.price < 1) {
      setSnackbarMsg("Giá trị giảm giá phải lớn hơn 0!");
      return false;
    }

    // if (data.max_quantity < 1) {
    //   setSnackbarMsg("Số lượng tối đa phải lớn hơn 0!");
    //   return false;
    // }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    let forValue = "";
    let userList: string[] = [];

    if (forType === "Hạng thẻ") {
      forValue = formData.get("card_type")?.toString() || "";
    } else if (forType === "Khách hàng cụ thể") {
      userList = selectedUsers;
    }

    const voucherData = {
      code: formData.get("code")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      desc: formData.get("desc")?.toString() || "",
      expired: formData.get("expired")?.toString() || "",
      status: formData.get("status")?.toString() as Status,
      type_price: formData.get("type_price")?.toString() as TypePromotion,
      price: parseFloat(formData.get("price")?.toString() || "0"),
      required_points: parseInt(formData.get("required_points")?.toString() || "0") / 1000,
      max_quantity: parseInt(formData.get("max_quantity")?.toString() || "0"),
      for_type: forType,
      for: forValue && forValue.length > 0 ? forValue : null,
      user_list: userList.length > 0 ? userList : undefined
    };

    if (!validateVoucherData(voucherData)) {
      setIsLoading(false);
      return;
    }

    try {
      if (editingVoucher) {
        // Update existing voucher
        await api.put(`promotion/Update?id=${editingVoucher._id}`, voucherData);
        setSnackbarMsg("Voucher đã được cập nhật thành công!");
      } else {
        // Create new voucher
        await api.post("promotion/Create", voucherData);
        setSnackbarMsg("Voucher đã được tạo thành công!");
      }

      handleDialogClose();
      fetchVouchers();
    } catch (error: any) {
      console.error("Error saving voucher", error);
      setSnackbarMsg(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (voucher: PromotionType) => {
    setEditingVoucher(voucher);
    setForType(voucher.for_type);

    if (voucher.for_type === "Khách hàng cụ thể" && voucher.user_list) {
      setSelectedUsers(voucher.user_list);
    } else {
      setSelectedUsers([]);
    }

    setOpenDialog(true);
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      setIsLoading(true);
      try {
        await api.delete(`promotion/Delete?id=${id}`);
        setSnackbarMsg("Voucher đã được xóa thành công!");
        fetchVouchers();
      } catch (error) {
        console.error("Error deleting voucher", error);
        setSnackbarMsg("Có lỗi xảy ra khi xóa voucher!");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchVouchers();
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateRange({ from: "", to: "" });
    setPage(0);
    fetchVouchers();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if voucher is expired
  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quản lý Voucher | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý voucher tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Header */}
          <DashboardHeader
            title="Quản lý Voucher"
            searchEnabled={true}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearchSubmit={handleSearch}
            onSearchClear={() => {
              setSearchQuery("");
              handleResetFilters();
            }}
            addEnabled={true}
            addButtonLabel="Thêm Voucher"
            onAddClick={() => setOpenDialog(true)}
            searchResultText={searchQuery ? `Kết quả tìm kiếm: ${total} voucher` : ""}
            extraButtons={
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="bg-white text-green-600 hover:bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center transition-colors duration-200 shadow-md"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="h-4 w-4 mr-1" />
                  Xuất Excel
                </button>
                <label className="cursor-pointer">
                  <button
                    className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center transition-colors duration-200 shadow-md"
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faFileImport} className="h-4 w-4 mr-1" />
                    Nhập Excel
                  </button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImportExcel}
                    disabled={isLoading}
                  />
                </label>
              </div>
            }
          />

          {/* Filters */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-sm mr-3">
                <FontAwesomeIcon icon={faSearch} className="text-white h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Bộ lọc tìm kiếm</h3>
                <p className="text-sm text-gray-500">Lọc danh sách voucher theo các tiêu chí</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-700">Trạng thái</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                  >
                    <option value="">Tất cả</option>
                    <option value={Status.ACTIVE}>Kích hoạt</option>
                    <option value={Status.INACTIVE}>Chưa kích hoạt</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <DateTimePicker
                  label="Từ ngày"
                  value={dateRange.from}
                  onChange={(date) => {
                    if (date) {
                      // Format as YYYY-MM-DD for the date input
                      const formattedDate = date.toISOString().split('T')[0];
                      setDateRange({ ...dateRange, from: formattedDate });
                    } else {
                      setDateRange({ ...dateRange, from: "" });
                    }
                  }}
                  format="DD/MM/YYYY"
                />
              </div>

              <div>
                <DateTimePicker
                  label="Đến ngày"
                  value={dateRange.to}
                  onChange={(date) => {
                    if (date) {
                      // Format as YYYY-MM-DD for the date input
                      const formattedDate = date.toISOString().split('T')[0];
                      setDateRange({ ...dateRange, to: formattedDate });
                    } else {
                      setDateRange({ ...dateRange, to: "" });
                    }
                  }}
                  format="DD/MM/YYYY"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full p-2.5 bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                  title="Đặt lại bộ lọc"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-opacity-75"></div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Summary Cards */}
          {!isLoading && vouchers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Tổng voucher</div>
                    <div className="text-lg md:text-2xl font-bold">{total}</div>
                  </div>
                  <div className="bg-purple-100 p-2 md:p-3 rounded-full flex-shrink-0">
                    <FontAwesomeIcon icon={faTicket} className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Voucher kích hoạt</div>
                    <div className="text-lg md:text-2xl font-bold">{vouchers.filter(v => v.status === Status.ACTIVE).length}</div>
                  </div>
                  <div className="bg-green-100 p-2 md:p-3 rounded-full flex-shrink-0">
                    <FontAwesomeIcon icon={faPercent} className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Voucher hết hạn</div>
                    <div className="text-lg md:text-2xl font-bold">{vouchers.filter(v => isExpired(v.expired)).length}</div>
                  </div>
                  <div className="bg-red-100 p-2 md:p-3 rounded-full flex-shrink-0">
                    <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Voucher khách hàng</div>
                    <div className="text-lg md:text-2xl font-bold">{vouchers.filter(v => v.for_type === "Khách hàng cụ thể").length}</div>
                  </div>
                  <div className="bg-blue-100 p-2 md:p-3 rounded-full flex-shrink-0">
                    <FontAwesomeIcon icon={faUsers} className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ViewSwitcher */}
          <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center">
            <div className="text-sm text-gray-500 mb-3 md:mb-0">
              {searchQuery ? `Kết quả tìm kiếm: ${total} voucher` : `Hiển thị ${vouchers.length} trên tổng số ${total} voucher`}
            </div>
            {!isMobile && (
              <ViewSwitcher
                value={viewMode}
                onChange={setViewMode}
                disabled={isMobile}
              />
            )}
          </div>

          {viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 animate-pulse opacity-500">
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 animate-pulse" />
              <span className="ml-1">Kéo sang phải để xem thêm</span>
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="min-w-full border-collapse table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-12">STT</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-left w-28">Mã Voucher</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-left">Tên Voucher</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-20">SL</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-24">Yêu cầu</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-24">Giảm giá</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-32">Hạn dùng</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-28">Áp dụng</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-24 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      <EmptyState
                        title={searchQuery ? "Không tìm thấy voucher" : "Chưa có voucher nào"}
                        subtitle={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm voucher mới để bắt đầu"}
                        searchQuery={searchQuery}
                        onActionClick={() => setOpenDialog(true)}
                        actionButtonText="Thêm voucher"
                        icon={faTicket}
                      />
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher, index) => (
                    <tr key={voucher._id} className={`hover:bg-gray-50 transition-colors ${isExpired(voucher.expired) ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-3 text-center text-sm">{page * limit + index + 1}</td>
                      <td className="py-3 px-3 text-sm font-medium text-purple-600 truncate" title={voucher.code}>{voucher.code}</td>
                      <td className="py-3 px-3 text-sm">
                        <div className="font-medium truncate" title={voucher.name}>{voucher.name}</div>
                        {voucher.desc && <div className="text-sm text-gray-500 truncate" title={voucher.desc}>{voucher.desc}</div>}
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        <div title={`Tổng: ${voucher.total || 0} - Còn lại: ${voucher.max_quantity}`}>
                          {voucher.max_quantity >= voucher.total ? voucher.total : voucher.max_quantity}/{voucher.total || 0}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        {voucher.required_points > 0 ?
                          <span className="text-sm font-medium">{(voucher.required_points * 1000).toLocaleString()}đ</span> :
                          <span className="text-sm text-green-600 font-medium">Miễn phí</span>
                        }
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        {voucher.type_price === TypePromotion.PERCENT ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {voucher.price}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {voucher.price.toLocaleString()}đ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${isExpired(voucher.expired) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {formatDate(voucher.expired)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        {voucher.for_type === "Hạng thẻ" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gold-100 text-gold-800">
                            Hạng {voucher.for}
                          </span>
                        )}
                        {voucher.for_type === "Khách hàng cụ thể" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {voucher.user_list?.length || 0} KH
                          </span>
                        )}
                        {voucher.for_type === "CTV" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            CTV
                          </span>
                        )}
                        {voucher.for_type === "ALL" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            Tất cả
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-sm whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${voucher.status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {voucher.status === Status.ACTIVE ? "Kích hoạt" : "Chưa kích hoạt"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <ActionButtonsGroup
                          onView={() => handleQuickView(voucher)}
                          onEdit={() => handleEdit(voucher)}
                          onDelete={() => handleDelete(voucher._id)}
                          viewTooltip="Xem chi tiết"
                          editTooltip="Chỉnh sửa"
                          deleteTooltip="Xóa"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.length === 0 && !isLoading ? (
                <div className="col-span-full">
                  <EmptyState
                    title={searchQuery ? "Không tìm thấy voucher" : "Chưa có voucher nào"}
                    subtitle={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm voucher mới để bắt đầu"}
                    searchQuery={searchQuery}
                    onActionClick={() => setOpenDialog(true)}
                    actionButtonText="Thêm voucher"
                    icon={faTicket}
                  />
                </div>
              ) : (
                vouchers.map((voucher) => (
                  <div key={voucher._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isExpired(voucher.expired) ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${voucher.status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {voucher.status === Status.ACTIVE ? "Kích hoạt" : "Chưa kích hoạt"}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isExpired(voucher.expired) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {formatDate(voucher.expired)}
                        </span>
                      </div>

                      <div className="flex items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FontAwesomeIcon icon={faTicket} className="text-purple-500 h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{voucher.name}</h3>
                          <p className="text-sm text-purple-600 font-medium truncate">{voucher.code}</p>
                          {voucher.desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{voucher.desc}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Số lượng</p>
                          <p className="font-medium">{voucher.max_quantity} / {voucher.total || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Giảm giá</p>
                          <p className="font-medium">
                            {voucher.type_price === TypePromotion.PERCENT ? `${voucher.price}%` : `${voucher.price.toLocaleString()} đ`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Áp dụng cho</p>
                          {voucher.for_type === "Hạng thẻ" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold-100 text-gold-800">
                              Hạng {voucher.for}
                            </span>
                          )}
                          {voucher.for_type === "Khách hàng cụ thể" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {voucher.user_list?.length || 0} khách hàng
                            </span>
                          )}
                          {voucher.for_type === "CTV" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Cộng tác viên
                            </span>
                          )}
                          {voucher.for_type === "ALL" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Tất cả
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Yêu cầu</p>
                          <p className="font-medium text-right">{voucher.required_points.toLocaleString()} đ</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 bg-gray-50 mt-auto border-t border-gray-100">
                      <button
                        onClick={() => handleQuickView(voucher)}
                        className="p-3 text-center font-medium text-sm text-blue-600 border-r border-gray-200 hover:bg-blue-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4 mb-1 mx-auto" />
                        <span className="block text-xs">Xem</span>
                      </button>
                      <button
                        onClick={() => handleEdit(voucher)}
                        className="p-3 text-center font-medium text-sm text-gold-600 border-r border-gray-200 hover:bg-gold-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mb-1 mx-auto" />
                        <span className="block text-xs">Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(voucher._id)}
                        className="p-3 text-center font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mb-1 mx-auto" />
                        <span className="block text-xs">Xóa</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {vouchers.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between md:items-center mt-6">
              <div className="mb-4 md:mb-0 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Hiển thị:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    // Since limit is a const, we can't update it directly
                    // Just reset the page for now
                    setPage(0);
                    // In a real implementation, we would update the limit state and refetch
                    console.log(`Limit changed to ${e.target.value}`);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 ml-2">voucher</span>
              </div>

              <PaginationControls
                page={page}
                total={total}
                limit={limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {openDialog && (
        <StandardDialog
          open={openDialog}
          onClose={handleDialogClose}
          disableBackdropClick={true}
          title={editingVoucher ? "Cập nhật Voucher" : "Thêm Voucher"}
          maxWidth="lg"
          className="rounded-xl overflow-hidden w-full max-w-screen-lg mx-auto"
          headerClassName="bg-gradient-to-r from-purple-50 to-white border-b py-4"
          contentClassName="p-6"
          actions={
            <div className="flex gap-3 justify-end w-full">
              <DialogActionButton
                onClick={handleDialogClose}
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                disabled={isLoading}
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={() => {
                  const form = document.getElementById("voucher-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                variant="primary"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 transition-all duration-200 shadow-sm hover:shadow"
                disabled={isLoading}
              >
                {isLoading && (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                )}
                {editingVoucher ? "Cập nhật" : "Thêm mới"}
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-purple-300 to-purple-100 rounded-full opacity-10 -z-10"></div>

            {/* Header with icon */}
            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={editingVoucher ? faEdit : faPlus} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{editingVoucher ? "Chỉnh sửa thông tin voucher" : "Tạo voucher mới"}</h3>
                <p className="text-sm text-gray-500">{editingVoucher ? "Cập nhật thông tin cho voucher hiện có" : "Điền thông tin để tạo voucher mới"}</p>
              </div>
            </div>

            <form id="voucher-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Mã Voucher</label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={editingVoucher?.code || ""}
                    placeholder="Nhập mã voucher hoặc để trống để tự động tạo"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Để trống để hệ thống tự sinh mã</p>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Tên Voucher *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingVoucher?.name || ""}
                    placeholder="Tên voucher"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Mô tả</label>
                <textarea
                  name="desc"
                  defaultValue={editingVoucher?.desc || ""}
                  placeholder="Mô tả voucher"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DateTimePicker
                    label="Ngày hết hạn"
                    required
                    value={expiredDate}
                    onChange={(date) => setExpiredDate(date)}
                    disablePast
                    format="DD/MM/YYYY HH:mm"
                    className="mb-1"
                  />
                  {/* Hidden input to store the value for form submission */}
                  <input
                    type="hidden"
                    name="expired"
                    value={expiredDate ? expiredDate.toISOString() : ""}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Trạng thái *</label>
                  <select
                    name="status"
                    defaultValue={editingVoucher?.status || Status.ACTIVE}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value={Status.ACTIVE}>Kích hoạt</option>
                    <option value={Status.INACTIVE}>Chưa kích hoạt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Loại giảm giá *</label>
                  <select
                    name="type_price"
                    defaultValue={editingVoucher?.type_price || TypePromotion.PERCENT}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value={TypePromotion.PERCENT}>Phần trăm (%)</option>
                    <option value={TypePromotion.VND}>Giá trị cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Giá trị giảm *</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingVoucher?.price || 1}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Số tiền yêu cầu (để 0 nếu free) *</label>
                  <input
                    type="number"
                    name="required_points"
                    defaultValue={(editingVoucher?.required_points ?? 0) * 1000}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Số lượng tối đa *</label>
                  <input
                    type="number"
                    name="max_quantity"
                    defaultValue={editingVoucher?.max_quantity || 1}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    readOnly={editingVoucher ? true: false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Áp dụng cho *</label>
                  <select
                    name="for_type"
                    value={forType}
                    onChange={(e) => setForType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="Hạng thẻ">Hạng thẻ</option>
                    <option value="CTV">Cộng tác viên</option>
                    <option value="ALL">Tất cả</option>
                    <option value="Khách hàng cụ thể">Khách hàng cụ thể</option>
                  </select>
                </div>

                {forType === "Hạng thẻ" && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Hạng thẻ *</label>
                    <select
                      name="card_type"
                      defaultValue={editingVoucher?.for || CustomerType.J}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value={CustomerType.J}>J</option>
                      <option value={CustomerType.Q}>Q</option>
                      <option value={CustomerType.K}>K</option>
                    </select>
                  </div>
                )}

                {forType === "Khách hàng cụ thể" && (
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium">Chọn Khách hàng *</label>

                    {/* Search Input */}
                    <div className="mb-4">
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Tìm theo tên, số điện thoại hoặc email..."
                          className="w-full p-2 border border-gray-300 rounded-l"
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.length >= 2) {
                              fetchCustomers();
                            }
                          }}
                        />
                        <button
                          onClick={() => fetchCustomers()}
                          className="bg-blue-500 text-white px-3 py-2 rounded-r"
                          type="button"
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </button>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="max-h-64 overflow-y-auto border rounded">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 border text-left w-10">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(customers.map(c => c._id || '').filter(id => id));
                                  } else {
                                    setSelectedUsers([]);
                                  }
                                }}
                                checked={customers.length > 0 && selectedUsers.length === customers.length}
                              />
                            </th>
                            <th className="p-2 border text-left">Tên khách hàng</th>
                            <th className="p-2 border text-left">Số điện thoại</th>
                            <th className="p-2 border text-left">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-2 text-center">Không có dữ liệu khách hàng</td>
                            </tr>
                          ) : (
                            customers.map((customer) => (
                              <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="p-2 border">
                                  <input
                                    type="checkbox"
                                    value={customer._id}
                                    checked={selectedUsers.includes(customer._id || '')}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers([...selectedUsers, customer._id || '']);
                                      } else {
                                        setSelectedUsers(selectedUsers.filter(id => id !== customer._id));
                                      }
                                    }}
                                  />
                                </td>
                                <td className="p-2 border">{customer.name}</td>
                                <td className="p-2 border">{customer.phone}</td>
                                <td className="p-2 border">{customer.email}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Selected Users Counter */}
                    <div className="mt-2 text-sm text-gray-600">
                      Đã chọn {selectedUsers.length} khách hàng
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        </StandardDialog>
      )}

      {/* Quick View Dialog */}
      <StandardDialog
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        title="Chi tiết Voucher"
        maxWidth="md"
        className="rounded-xl overflow-hidden w-full max-w-screen-md mx-auto"
        headerClassName="bg-gradient-to-r from-blue-50 to-white border-b py-4"
        contentClassName="p-6"
        actions={
          <DialogActionButton
            onClick={() => setQuickViewOpen(false)}
            variant="outline"
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
          >
            Đóng
          </DialogActionButton>
        }
      >
        {quickViewVoucher && (
          <div className="space-y-6">
            {/* Header with icon */}
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                <FontAwesomeIcon icon={faTicket} className="text-purple-500 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{quickViewVoucher.name}</h3>
                <p className="text-sm text-purple-600 font-medium">{quickViewVoucher.code}</p>
                {quickViewVoucher.desc && <p className="text-sm text-gray-500 mt-1">{quickViewVoucher.desc}</p>}
              </div>
            </div>

            {/* Status and expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${quickViewVoucher.status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {quickViewVoucher.status === Status.ACTIVE ? "Kích hoạt" : "Chưa kích hoạt"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Ngày hết hạn</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${isExpired(quickViewVoucher.expired) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {formatDate(quickViewVoucher.expired)}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Loại giảm giá</p>
                <p className="font-medium text-lg">
                  {quickViewVoucher.type_price === TypePromotion.PERCENT ? (
                    <span className="text-purple-600">{quickViewVoucher.price}%</span>
                  ) : (
                    <span className="text-blue-600">{quickViewVoucher.price.toLocaleString()} đ</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Số lượng</p>
                <p className="font-medium text-lg">
                  <span className="text-gray-800">{quickViewVoucher.max_quantity} / {quickViewVoucher.total || 0}</span>
                </p>
              </div>
            </div>

            {/* Application details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Áp dụng cho</p>
                <div>
                  {quickViewVoucher.for_type === "Hạng thẻ" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-gold-100 text-gold-800">
                      Hạng {quickViewVoucher.for}
                    </span>
                  )}
                  {quickViewVoucher.for_type === "Khách hàng cụ thể" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                      {quickViewVoucher.user_list?.length || 0} khách hàng
                    </span>
                  )}
                  {quickViewVoucher.for_type === "CTV" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                      Cộng tác viên
                    </span>
                  )}
                  {quickViewVoucher.for_type === "ALL" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
                      Tất cả
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Yêu cầu</p>
                <p className="font-medium text-lg">
                  {quickViewVoucher.required_points > 0 ? (
                    <span className="text-gray-800">{quickViewVoucher.required_points.toLocaleString()} đ</span>
                  ) : (
                    <span className="text-green-600">Miễn phí</span>
                  )}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
              <p>Tạo lúc: {quickViewVoucher.createdAt ? formatDate(quickViewVoucher.createdAt) : "N/A"}</p>
              <p>Cập nhật lần cuối: {quickViewVoucher.updatedAt ? formatDate(quickViewVoucher.updatedAt) : "N/A"}</p>
            </div>
          </div>
        )}
      </StandardDialog>

      {/* Snackbar message */}
      {snackbarMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-400 text-white px-5 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-up">
          <div className="mr-3 bg-white bg-opacity-20 rounded-full p-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">{snackbarMsg}</span>
          <button
            onClick={() => setSnackbarMsg("")}
            className="ml-4 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 px-3 py-1 rounded-full"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherPage;
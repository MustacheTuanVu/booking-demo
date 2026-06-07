"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import ActionSheet, { ActionItem } from "@/components/ui/ActionSheet";
import api from "@/utils/api";
import { formatDate } from "@/utils/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhoneAlt,
  faEnvelope,
  faTicketAlt,
  faHandshake,
  faMedal,
  faUserCog,
  faEdit,
  faPlus,
  faEllipsisV
} from "@fortawesome/free-solid-svg-icons";

interface Employee {
  _id?: string;
  phone: string;
  cukcuk_id?: string;
  name: string;
  email: string;
  address?: string;
  identity_number?: string;
  role?: string;
  referral_code?: string;
  customer_type?: string;
  customer_type_expiry?: string;
  isDelete?: string;
  createdAt?: string;
  updatedAt?: string;
  IncomInfo?: {
    _id: string;
    name: string;
    price: number;
    type_price: string;
    desc?: string;
  }[];
}

interface EmployeeResponse {
  userModels: Employee[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface Order {
  _id: string;
  code: string;
  total_price: number;
  createdAt: string;
  status: string;
  referred_by?: string;
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
}

interface OrderResponse {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Status type for the dropdown
interface StatusOption {
  value: string;
  label: string;
  color: string;
}

const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State cho dialog gán chính sách thu nhập
  const [openIncomeDialog, setOpenIncomeDialog] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");

  // State for status management
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [selectedEmployeeForStatus, setSelectedEmployeeForStatus] = useState<Employee | null>(null);

  // State for role filter
  const [roleFilter, setRoleFilter] = useState<string[]>(["ADMIN", "BOSS"]);

  // State for dialog hiển thị order của nhân viên
  const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrderPrice, setTotalOrderPrice] = useState<number>(0);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // State for dialog hiển thị order từ tiếp thị liên kết
  const [openAffiliateDialog, setOpenAffiliateDialog] = useState<boolean>(false);
  const [affiliateOrders, setAffiliateOrders] = useState<Order[]>([]);
  const [totalAffiliatePrice, setTotalAffiliatePrice] = useState<number>(0);
  const [loadingAffiliateOrders, setLoadingAffiliateOrders] = useState<boolean>(false);

  const [snackbarMsg, setSnackbarMsg] = useState<string>("");

  // Add useState for tracking active dropdown
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Add state for ActionSheet
  const [actionSheetOpen, setActionSheetOpen] = useState<boolean>(false);
  const [currentActionEmployee, setCurrentActionEmployee] = useState<Employee | null>(null);
  const [actionSheetActions, setActionSheetActions] = useState<ActionItem[]>([]);

  // Add viewMode state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Add a useEffect to handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.more-actions-dropdown')) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdownId]);

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

  // Status options for dropdown
  const statusOptions: StatusOption[] = [
    { value: "ACTIVE", label: "Hoạt động", color: "text-green-500" },
    { value: "INACTIVE", label: "Tạm khóa", color: "text-yellow-500" },
    { value: "NOT_VERIFY", label: "Chưa xác thực", color: "text-red-500" },
    { value: "DELETE", label: "Xóa", color: "text-red-500" }
  ];

  // Hàm fetch danh sách chính sách thu nhập
  const fetchIncomes = async (employeeIncomeId?: string) => {
    try {
      const res = await api.get("income/getIncomesByCondition?page=1&limit=9999999");
      setIncomes(res.data.income || []);

      // Nếu nhân viên đã có chính sách, chọn nó làm mặc định
      if (employeeIncomeId) {
        setSelectedIncomeId(employeeIncomeId);
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

  // Hàm mở dialog gán chính sách thu nhập
  const handleAssignIncome = (employee: any) => {
    setSelectedEmployeeId(employee._id || "");
    setSelectedEmployee(employee);
    if (employee.IncomInfo && employee.IncomInfo[0]) {
      fetchIncomes(employee.IncomInfo[0]._id);
    } else {
      fetchIncomes()
    }

    setOpenIncomeDialog(true);
  };

  // Hàm gán chính sách
  const handleSubmitAssignIncome = async () => {
    if (!selectedEmployeeId || !selectedIncomeId) return;

    setIsLoading(true);
    try {
      await api.put(`income/updateIncomeForUser/${selectedIncomeId}`, [selectedEmployeeId]);
      setOpenIncomeDialog(false);
      setSnackbarMsg("Gán chính sách CTV thành công!");
      fetchEmployees();
    } catch (error) {
      console.error("Error assigning income", error);
      setSnackbarMsg("Có lỗi xảy ra khi gán chính sách  CTV!");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open ActionSheet with employee actions
  const handleOpenActionSheet = (employee: Employee) => {
    setCurrentActionEmployee(employee);

    const actions: ActionItem[] = [
      {
        label: "Xem đơn hàng",
        icon: faTicketAlt,
        iconColor: "text-blue-500",
        onClick: () => handleViewOrders(employee._id!, employee)
      },
      {
        label: "Đơn hàng tiếp thị",
        icon: faHandshake,
        iconColor: "text-green-500",
        onClick: () => handleViewAffiliateOrders(employee.referral_code || "", employee)
      },
      {
        label: "Thay đổi trạng thái",
        icon: faUserCog,
        iconColor: "text-yellow-500",
        onClick: () => handleChangeStatus(employee)
      },
      {
        label: "Gán chính sách CTV",
        icon: faMedal,
        iconColor: "text-purple-500",
        onClick: () => handleAssignIncome(employee)
      }
    ];

    setActionSheetActions(actions);
    setActionSheetOpen(true);
  };

  const fetchEmployees = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Format the role filter for the query
      const roleQuery = JSON.stringify(roleFilter);

      // API getStaffByQuery tính page từ 1
      const res = await api.get(
        `users/getStaffByQuery?page=${page + 1}&limit=${limit}&query=${searchQuery || roleQuery}`
      );
      const data: EmployeeResponse = res.data;

      // Lọc lại ở phía client để chỉ lấy những nhân viên có isDelete === 'ACTIVE'
      const activeEmployees = data.userModels.filter(emp => emp.isDelete === 'ACTIVE' || emp.isDelete === 'INACTIVE' || emp.isDelete === 'NOT_VERIFY');

      setEmployees(activeEmployees);
      setTotal(activeEmployees.length); // Hoặc giữ nguyên data.total nếu không muốn đếm lại
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      // Short timeout to ensure skeleton loaders are visible for at least a moment
      // which helps users perceive the system is responsive even on fast connections
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [page, limit, roleFilter, searchQuery]);

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, roleFilter, fetchEmployees]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as any;
    let employeeData: any = null

    if (editingEmployee) {
      employeeData = {
        name: form.name.value,
        role: form.role.value,
      };
    } else {
      employeeData = {
        phone: form.phone.value,
        name: form.name.value,
        email: form.email.value,
        role: form.role.value,
        ...(editingEmployee ? {} : { password: form.password.value }),
      };
    }

    try {
      if (editingEmployee) {
        await api.put(`users/updateStaffInfo?id=${editingEmployee._id}`, employeeData);
      } else {
        await api.post("users/createStaff", employeeData);
      }
      handleDialogClose();
      fetchEmployees();
    } catch (error: any) {
      console.error("Error saving employee", error);
      if  (error?.response?.data?.code == 'PHONE_IS_EXIST') {
        alert("Số điện thoại đã được sử dụng");
      } else if (error?.response?.data?.code == 'EMAIL_IS_EXIST') {
        alert("Email đã được sử dụng");
      } else {
        alert("Có lỗi xảy ra khi lưu thông tin nhân viên");
      }

    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpenDialog(true);
  };

  const handleChangeStatus = (employee: Employee) => {
    setSelectedEmployeeForStatus(employee);
    setStatusDialogOpen(true);
  };

  const confirmChangeStatus = async (status: string) => {
    if (!selectedEmployeeForStatus) return;

    try {
      setIsLoading(true);
      await api.delete(`users/channgeStatusUser/${selectedEmployeeForStatus._id}?status=${status}&userId=${selectedEmployeeForStatus._id}`);
      setStatusDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error changing employee status", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy danh sách order của một nhân viên, không phân trang
  const handleViewOrders = async (employeeId: string, employee: Employee) => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `orders/GetMany?page=1&limit=9999&query=${employeeId}&status=PAID`
      );
      const data: OrderResponse = res.data;
      setOrders(data.orders);
      setCurrentEmployee(employee);
      const totalPrice = data.orders.reduce((sum, order) => sum + order.total_price, 0);
      setTotalOrderPrice(totalPrice);
      setOpenOrderDialog(true);
    } catch (error) {
      console.error("Error fetching orders for employee", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy danh sách order từ tiếp thị liên kết của nhân viên
  const handleViewAffiliateOrders = async (referralCode: string, employee: Employee) => {
    if (!referralCode) {
      alert("Nhân viên này không có mã giới thiệu");
      return;
    }

    setCurrentEmployee(employee);
    setLoadingAffiliateOrders(true);
    setOpenAffiliateDialog(true);

    try {
      const res = await api.get(`orders/GetMany?query=${referralCode}&limit=9999`);

      // Lọc chỉ lấy các đơn hàng có referred_by trùng với mã giới thiệu
      const filteredOrders = res.data.orders.filter(
        (order: any) => order.referred_by === referralCode
      );

      setAffiliateOrders(filteredOrders);

      // Tính tổng doanh thu từ đơn hàng tiếp thị liên kết
      const totalPrice = filteredOrders.reduce(
        (sum: number, order: Order) => sum + (order.total_price || 0),
        0
      );

      setTotalAffiliatePrice(totalPrice);
    } catch (error) {
      console.error("Error fetching affiliate orders for employee", error);
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

  // Get employee status display info
  const getEmployeeStatusInfo = (status: string | undefined) => {
    switch (status) {
      case "ACTIVE":
        return { text: "Hoạt động", color: "text-green-500" };
      case "INACTIVE":
        return { text: "Tạm khóa", color: "text-yellow-500" };
      case "DELETE":
        return { text: "Đã xóa", color: "text-red-500" };
      case "NOT_VERIFY":
        return { text: "Chưa xác thực", color: "text-red-500" };
      default:
        return { text: "Hoạt động", color: "text-green-500" };
    }
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quản lý nhân viên | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý nhân viên tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>
        {/* Nội dung chính */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Replacing the custom header with DashboardHeader component */}
          <DashboardHeader
            title="Quản lý Nhân viên"
            searchEnabled={true}
            searchQuery={searchQuery}
            onSearchChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            onSearchClear={() => {
              setSearchQuery("");
              setPage(0); // Reset to first page when clearing search
              fetchEmployees();
            }}
            addEnabled={true}
            addButtonLabel="Thêm Nhân viên"
            onAddClick={() => setOpenDialog(true)}
            searchResultText={searchQuery ? `Kết quả tìm kiếm: ${total} nhân viên` : ""}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Tổng nhân viên</div>
                  <div className="text-lg md:text-2xl font-bold">{isLoading ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div> : total}</div>
                </div>
                <div className="bg-blue-100 p-2 md:p-3 rounded-full flex-shrink-0">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Nhân viên</div>
                  <div className="text-lg md:text-2xl font-bold">{isLoading ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div> : employees.filter(e => e.role === "ADMIN").length}</div>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-full flex-shrink-0">
                  <FontAwesomeIcon icon={faUserCog} className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Cộng tác viên</div>
                  <div className="text-lg md:text-2xl font-bold">{isLoading ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div> : employees.filter(e => e.IncomInfo && e.IncomInfo[0]).length}</div>
                </div>
                <div className="bg-purple-100 p-2 md:p-3 rounded-full flex-shrink-0">
                  <FontAwesomeIcon icon={faHandshake} className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Role Filter */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-100">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="text-sm font-medium text-gray-700 mr-2">Vai trò:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRoleFilter(["ADMIN", "BOSS"])}
                  className={`px-3 py-1.5 text-sm rounded-full ${roleFilter.length === 2 ? "bg-gold-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setRoleFilter(["ADMIN"])}
                  className={`px-3 py-1.5 text-sm rounded-full ${roleFilter.length === 1 && roleFilter[0] === "ADMIN" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Nhân viên
                </button>
                <button
                  onClick={() => setRoleFilter(["BOSS"])}
                  className={`px-3 py-1.5 text-sm rounded-full flex items-center ${roleFilter.length === 1 && roleFilter[0] === "BOSS" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  <FontAwesomeIcon icon={faUserCog} className="h-3 w-3 mr-1.5" />
                  Full quyền
                </button>
              </div>
            </div>
          </div>
          {/* ViewSwitcher */}
          <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center">
            <div className="text-sm text-gray-500 mb-3 md:mb-0">
              {searchQuery ? `Kết quả tìm kiếm: ${total} nhân viên` : `Hiển thị ${employees.length} trên tổng số ${total} nhân viên`}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Role legend */}
              <div className="flex items-center mr-2">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-1"></span>
                  <span className="text-xs text-gray-600 mr-2">Nhân viên</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-purple-100 border border-purple-300 mr-1"></span>
                  <span className="text-xs text-gray-600 flex items-center">
                    <FontAwesomeIcon icon={faUserCog} className="h-2.5 w-2.5 mr-1 text-purple-500" />
                    Full quyền
                  </span>
                </div>
              </div>

              {!isMobile && (
                <ViewSwitcher
                  value={viewMode}
                  onChange={setViewMode}
                  disabled={isMobile}
                />
              )}
            </div>
          </div>

          {/* Employee Table with improved styling */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">

            {/* Loading state or Empty state */}
            {isLoading ? (
              <div className="p-4">
                {/* Desktop View - Skeleton Table */}
                <div className="hidden md:block">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex space-x-4 mb-4">
                        <div className="w-10 h-6 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                        <div className="w-1/6 h-6 bg-gray-200 rounded"></div>
                        <div className="w-1/5 h-6 bg-gray-200 rounded"></div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                        <div className="w-12 h-6 bg-gray-200 rounded"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile View - Skeleton Cards */}
                <div className="block md:hidden">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="pt-2 flex space-x-2">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="pt-2 grid grid-cols-3 gap-2">
                          <div className="h-12 bg-gray-200 rounded"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <EmptyState
                title={searchQuery ? "Không tìm thấy nhân viên" : "Chưa có nhân viên nào"}
                subtitle={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm nhân viên mới để bắt đầu"}
                searchQuery={searchQuery}
                onActionClick={() => setOpenDialog(true)}
                actionButtonText="Thêm nhân viên"
                icon={faUser}
              />
            ) : (
              <>
                {/* Desktop view - Table */}
                {viewMode === "table" && (
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">STT</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Họ tên</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Liên hệ</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center hidden lg:table-cell">Mã giới thiệu</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center hidden lg:table-cell">CTV</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Vai trò</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Trạng thái</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {employees.map((emp, index) => (
                          <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-center">{index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{emp.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faPhoneAlt} className="text-gray-400 mr-2 h-3.5 w-3.5" />
                                <span>{emp.phone}</span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate" title={emp.email}>{emp.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                              {emp.referral_code ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {emp.referral_code}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                              {emp.IncomInfo && emp.IncomInfo[0] ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {emp.IncomInfo[0].name}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === "ADMIN" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                {emp.role === "ADMIN" ? (
                                  "Nhân viên"
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faUserCog} className="h-3 w-3 mr-1" />
                                    Full quyền
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmployeeStatusInfo(emp.isDelete).color === "text-green-500"
                                ? "bg-green-100 text-green-800"
                                : getEmployeeStatusInfo(emp.isDelete).color === "text-yellow-500"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                                }`}>
                                {getEmployeeStatusInfo(emp.isDelete).text}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <ActionButtonsGroup
                                showView={false}
                                showEdit={true}
                                showDelete={false}
                                onEdit={() => handleEdit(emp)}
                                editTooltip="Chỉnh sửa"
                                moreActions={[
                                  {
                                    label: "Xem đơn hàng",
                                    icon: faTicketAlt,
                                    iconColor: "text-blue-500",
                                    onClick: () => handleViewOrders(emp._id!, emp)
                                  },
                                  {
                                    label: "Đơn hàng tiếp thị",
                                    icon: faHandshake,
                                    iconColor: "text-green-500",
                                    onClick: () => handleViewAffiliateOrders(emp.referral_code || "", emp)
                                  },
                                  {
                                    label: "Thay đổi trạng thái",
                                    icon: faUserCog,
                                    iconColor: "text-yellow-500",
                                    onClick: () => handleChangeStatus(emp)
                                  },
                                  {
                                    label: "Gán chính sách CTV",
                                    icon: faMedal,
                                    iconColor: "text-purple-500",
                                    onClick: () => handleAssignIncome(emp)
                                  }
                                ]}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Card view (both mobile and desktop when selected) */}
                {viewMode === "card" && (
                  <div className={`${isMobile ? "block" : ""}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                      {employees.map((emp) => (
                        <div
                          key={emp._id}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
                        >
                          <div className="p-4 border-b border-gray-100 flex-grow">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${emp.role === "ADMIN" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                  {emp.role === "ADMIN" ? "NV" : <FontAwesomeIcon icon={faUserCog} className="h-4 w-4" />}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-800 truncate">{emp.name}</h3>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FontAwesomeIcon icon={faPhoneAlt} className="flex-shrink-0 mr-2 h-3 w-3" />
                                  <span className="truncate">{emp.phone}</span>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FontAwesomeIcon icon={faEnvelope} className="flex-shrink-0 mr-2 h-3 w-3" />
                                  <span className="truncate" title={emp.email}>{emp.email}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3 justify-between">
                              {emp.referral_code && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Mã: {emp.referral_code}
                                </span>
                              )}

                              {emp.IncomInfo && emp.IncomInfo[0] && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  CTV: {emp.IncomInfo[0].name}
                                </span>
                              )}

                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEmployeeStatusInfo(emp.isDelete).color === "text-green-500"
                                ? "bg-green-100 text-green-800"
                                : getEmployeeStatusInfo(emp.isDelete).color === "text-yellow-500"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                                }`}>
                                {getEmployeeStatusInfo(emp.isDelete).text}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 bg-gray-50 mt-auto">
                            <button
                              onClick={() => handleViewOrders(emp._id!, emp)}
                              className="p-3 text-center font-medium text-sm text-blue-600 border-r border-gray-200 hover:bg-blue-50"
                            >
                              <FontAwesomeIcon icon={faTicketAlt} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Đơn hàng</span>
                            </button>
                            <button
                              onClick={() => handleEdit(emp)}
                              className="p-3 text-center font-medium text-sm text-gold-600 border-r border-gray-200 hover:bg-gold-50"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Chỉnh sửa</span>
                            </button>
                            <button
                              onClick={() => handleChangeStatus(emp)}
                              className="p-3 text-center font-medium text-sm text-yellow-600 border-r border-gray-200 hover:bg-yellow-50"
                            >
                              <FontAwesomeIcon icon={faUserCog} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Trạng thái</span>
                            </button>
                            <button
                              onClick={() => handleOpenActionSheet(emp)}
                              className="p-3 text-center font-medium text-sm text-purple-600 hover:bg-purple-50"
                            >
                              <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Thêm</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Improved pagination using PaginationControls component */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mt-6">
            <div className="mb-4 md:mb-0 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Hiển thị:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(0); // Reset to first page when changing limit
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200 focus:border-gold-400"
              >
                {[8, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 ml-2">nhân viên</span>
            </div>

            <PaginationControls
              page={page}
              total={total}
              limit={limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>

    <>
      {/* Modal tạo/cập nhật nhân viên */}
      {openDialog && (
        <StandardDialog
          open={openDialog}
          onClose={handleDialogClose}
          disableBackdropClick={true}
          title={editingEmployee ? "Cập nhật Nhân viên" : "Thêm Nhân viên"}
          maxWidth="md"
          className="rounded-xl overflow-hidden w-full max-w-screen-md mx-auto"
          headerClassName="bg-gradient-to-r from-gold-50 to-white border-b py-4"
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
                  const form = document.getElementById("employee-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                variant="primary"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 transition-all duration-200 shadow-sm hover:shadow"
                disabled={isLoading}
              >
                {isLoading && (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                )}
                {editingEmployee ? "Cập nhật" : "Thêm mới"}
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-200 to-gold-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-gold-300 to-gold-100 rounded-full opacity-10 -z-10"></div>

            {/* Header with icon */}
            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={editingEmployee ? faEdit : faPlus} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{editingEmployee ? "Chỉnh sửa thông tin nhân viên" : "Tạo nhân viên mới"}</h3>
                <p className="text-sm text-gray-500">{editingEmployee ? "Cập nhật thông tin cho nhân viên hiện có" : "Điền thông tin để tạo nhân viên mới"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" id="employee-form">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                  Thông tin cơ bản
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingEmployee?.name || ""}
                        placeholder="Nhập họ tên nhân viên"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                        required
                        // readOnly={editingEmployee}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        name="phone"
                        defaultValue={editingEmployee?.phone || ""}
                        placeholder="Nhập số điện thoại"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                        required
                        pattern="^0\d{9}$"
                        title="Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số"
                        readOnly={editingEmployee}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faPhoneAlt} className="text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        defaultValue={editingEmployee?.email || ""}
                        placeholder="Nhập email"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                        required
                        readOnly={editingEmployee}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Vai trò <span className="text-red-500">*</span></label>
                    <select
                      name="role"
                      defaultValue={editingEmployee?.role || "ADMIN"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                      required
                    >
                      <option value="ADMIN">Nhân viên</option>
                      <option value="BOSS">Full quyền</option>
                    </select>
                  </div>
                  {!editingEmployee && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="password"
                          name="password"
                          placeholder="Nhập mật khẩu"
                          className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          required
                          minLength={6}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </StandardDialog>
      )}

      {/* Modal for changing employee status */}
      {statusDialogOpen && selectedEmployeeForStatus && (
        <StandardDialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          title="Thay đổi trạng thái"
          maxWidth="sm"
          className="rounded-xl overflow-hidden w-full max-w-md mx-auto"
          headerClassName="bg-gradient-to-r from-gold-50 to-white border-b py-4"
          contentClassName="p-6"
          actions={
            <div className="flex gap-3 justify-end w-full">
              <DialogActionButton
                onClick={() => setStatusDialogOpen(false)}
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                disabled={isLoading}
              >
                Hủy
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-200 to-gold-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-gold-300 to-gold-100 rounded-full opacity-10 -z-10"></div>

            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={faUserCog} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Thay đổi trạng thái nhân viên</h3>
                <p className="text-sm text-gray-500">
                  Nhân viên: <span className="font-semibold">{selectedEmployeeForStatus.name}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => confirmChangeStatus(option.value)}
                  className={`w-full p-3 rounded-lg flex items-center transition-all duration-200 ${selectedEmployeeForStatus.isDelete === option.value
                    ? "bg-gray-100 border-2 border-gold-500 shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50 hover:border-gold-300 hover:shadow-sm"
                    }`}
                  disabled={isLoading || selectedEmployeeForStatus.isDelete === option.value}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${option.value === "ACTIVE"
                      ? "bg-green-500"
                      : option.value === "INACTIVE"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      }`}></div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {selectedEmployeeForStatus.isDelete === option.value && (
                    <span className="text-gold-500 text-sm font-medium ml-auto">(Hiện tại)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </StandardDialog>
      )}

      {/* Modal hiển thị danh sách order của nhân viên */}
      {openOrderDialog && (
        <StandardDialog
          open={openOrderDialog}
          onClose={() => setOpenOrderDialog(false)}
          title={`Đơn hàng của ${currentEmployee?.name}`}
          maxWidth="lg"
          className="rounded-xl overflow-hidden w-full max-w-screen-xl mx-auto"
          headerClassName="bg-gradient-to-r from-blue-50 to-white border-b py-4"
          contentClassName="p-6"
          actions={
            <div className="flex gap-3 justify-end w-full">
              <DialogActionButton
                onClick={() => setOpenOrderDialog(false)}
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
              >
                Đóng
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-300 to-blue-100 rounded-full opacity-10 -z-10"></div>

            {orders.length > 0 ? (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl shadow-sm mb-6 border border-blue-100">
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-sm mr-4">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Tổng quan</h3>
                        <p className="text-gray-600 text-sm">Tổng số đơn: <span className="font-bold">{orders.length}</span></p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-xl font-bold text-blue-600">
                        Tổng doanh thu: {totalOrderPrice.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Mã đơn hàng</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Khách hàng</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Sự kiện</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-right">Tổng tiền</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Ngày tạo</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-blue-600">{order.code}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{order.InfoUser?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FontAwesomeIcon icon={faPhoneAlt} className="h-3 w-3 mr-1 text-gray-400" />
                              {order.InfoUser?.phone || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">{order.eventDetail?.title || "N/A"}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {order.total_price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusText(order.InfoOrderPayment?.status || "").color === "text-green-500"
                              ? "bg-green-100 text-green-800"
                              : getStatusText(order.InfoOrderPayment?.status || "").color === "text-yellow-500"
                                ? "bg-yellow-100 text-yellow-800"
                                : getStatusText(order.InfoOrderPayment?.status || "").color === "text-red-500"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
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
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                <FontAwesomeIcon icon={faTicketAlt} className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
                <p className="text-gray-400 text-sm">Nhân viên này chưa tạo đơn hàng nào</p>
              </div>
            )}
          </div>
        </StandardDialog>
          )}

      {/* Modal hiển thị danh sách order từ tiếp thị liên kết */}
      {openAffiliateDialog && (
        <StandardDialog
          open={openAffiliateDialog}
          onClose={() => setOpenAffiliateDialog(false)}
          title={`Đơn hàng tiếp thị liên kết của ${currentEmployee?.name}`}
          maxWidth="lg"
          className="rounded-xl overflow-hidden w-full max-w-screen-xl mx-auto"
          headerClassName="bg-gradient-to-r from-purple-50 to-white border-b py-4"
          contentClassName="p-6"
          actions={
            <div className="flex gap-3 justify-end w-full">
              <DialogActionButton
                onClick={() => setOpenAffiliateDialog(false)}
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
              >
                Đóng
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-purple-300 to-purple-100 rounded-full opacity-10 -z-10"></div>

            {loadingAffiliateOrders ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-opacity-75"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : affiliateOrders.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center shadow-sm mr-3">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                        <p className="text-xl font-bold">{affiliateOrders.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center shadow-sm mr-3">
                        <FontAwesomeIcon icon={faHandshake} className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                        <p className="text-xl font-bold text-purple-600">{totalAffiliatePrice.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 flex items-center justify-center shadow-sm mr-3">
                        <FontAwesomeIcon icon={faMedal} className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Mã giới thiệu</p>
                        <div className="flex items-center">
                          <p className="text-lg font-bold">{currentEmployee?.referral_code}</p>
                          <button
                            className="ml-2 p-1 text-gray-500 hover:text-purple-600 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(currentEmployee?.referral_code || "");
                              alert("Đã sao chép mã giới thiệu!");
                            }}
                            title="Sao chép mã"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Mã đơn hàng</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Khách hàng</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Sự kiện</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-right">Tổng tiền</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Ngày tạo</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {affiliateOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-purple-600">{order.code}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{order.InfoUser?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FontAwesomeIcon icon={faPhoneAlt} className="h-3 w-3 mr-1 text-gray-400" />
                              {order.InfoUser?.phone || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">{order.eventDetail?.title || "N/A"}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {order.total_price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusText(order.InfoOrderPayment?.status || "").color === "text-green-500"
                              ? "bg-green-100 text-green-800"
                              : getStatusText(order.InfoOrderPayment?.status || "").color === "text-yellow-500"
                                ? "bg-yellow-100 text-yellow-800"
                                : getStatusText(order.InfoOrderPayment?.status || "").color === "text-red-500"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
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
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                <FontAwesomeIcon icon={faHandshake} className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Không có đơn hàng nào từ tiếp thị liên kết</p>
                <div className="mt-4 text-sm bg-white inline-block py-2 px-4 rounded-md border">
                  <p>Mã giới thiệu: <span className="font-medium">{currentEmployee?.referral_code || "Chưa có mã giới thiệu"}</span></p>
                </div>
              </div>
            )}
          </div>
        </StandardDialog>
      )}
      {/* Modal gán chính sách thu nhập */}
      {openIncomeDialog && (
        <StandardDialog
          open={openIncomeDialog}
          onClose={() => setOpenIncomeDialog(false)}
          title={`Gán chính sách CTV cho ${selectedEmployee?.name}`}
          maxWidth="md"
          className="rounded-xl overflow-hidden w-full max-w-screen-md mx-auto"
          headerClassName="bg-gradient-to-r from-green-50 to-white border-b py-4"
          contentClassName="p-6"
          actions={
            <div className="flex gap-3 justify-end w-full">
              <DialogActionButton
                onClick={() => setOpenIncomeDialog(false)}
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                disabled={isLoading}
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={handleSubmitAssignIncome}
                variant="primary"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-all duration-200 shadow-sm hover:shadow"
                disabled={isLoading || !selectedIncomeId || incomes.length === 0}
              >
                {isLoading && (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                )}
                Gán chính sách
              </DialogActionButton>
            </div>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-200 to-green-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-green-300 to-green-100 rounded-full opacity-10 -z-10"></div>

            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={faHandshake} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Gán chính sách cộng tác viên</h3>
                <p className="text-sm text-gray-500">Chọn chính sách thu nhập cho nhân viên này</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mr-2"></div>
                <span>Đang tải...</span>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-4">
                  <label className="block font-medium text-gray-700 mb-2">Chọn chính sách CTV:</label>
                  <div className="flex flex-col gap-3">
                    {incomes.length > 0 ? (
                      incomes.map((income) => (
                        <label key={income._id} className={`inline-flex items-center p-3 border rounded-lg hover:bg-white transition-all duration-200 ${selectedIncomeId === income._id ? 'bg-white border-green-300 shadow-sm' : 'border-gray-200'}`}>
                          <input
                            type="radio"
                            className="form-radio text-green-500 focus:ring-green-400"
                            name="income"
                            value={income._id}
                            checked={selectedIncomeId === income._id}
                            onChange={() => setSelectedIncomeId(income._id)}
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-800">{income.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {income.type_price === "PERCENT" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {income.price}% doanh thu
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {income.price.toLocaleString()} đ / đơn hàng
                                </span>
                              )}
                              {income.desc && <span className="ml-2 text-gray-500"> - {income.desc}</span>}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-gray-200">
                        <FontAwesomeIcon icon={faHandshake} className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="mb-2 font-medium">Không có chính sách CTV nào.</p>
                        <p>Vui lòng tạo chính sách trước tại trang &quot;Quản lý chính sách CTV&quot;.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </StandardDialog>
      )}

      {/* Snackbar message */}
      {snackbarMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-white px-5 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-up">
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

      {/* ActionSheet for mobile actions */}
      <ActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Thao tác với nhân viên"
        actions={actionSheetActions}
      />
    </>
    </div>
  );
};

export default EmployeePage;

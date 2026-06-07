"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import ActionSheet from "@/components/ui/ActionSheet";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import type { ActionItem } from "@/components/ui/ActionSheet";
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
  faEllipsisV,
  faArrowRight,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

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

interface OrderResponse {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface MembershipPrice {
  _id: string;
  type: string;
  duration: string;
  priceInMonth: number;
}

const CustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(8);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // State cho dialog hiển thị order của khách hàng
  const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrderPrice, setTotalOrderPrice] = useState<number>(0);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // State cho dialog cập nhật hạng thẻ
  const [openMembershipDialog, setOpenMembershipDialog] = useState<boolean>(false);
  const [membershipTime, setMembershipTime] = useState<number>(1);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>("");
  const [currentCustomerId, setCurrentCustomerId] = useState<string>("");
  const [membershipPrices, setMembershipPrices] = useState<MembershipPrice[]>([]);
  const [totalMembershipPrice, setTotalMembershipPrice] = useState<number>(0);

  // State cho dialog hiển thị order tiếp thị liên kết
  const [openAffiliateDialog, setOpenAffiliateDialog] = useState<boolean>(false);
  const [affiliateOrders, setAffiliateOrders] = useState<Order[]>([]);
  const [totalAffiliatePrice, setTotalAffiliatePrice] = useState<number>(0);
  const [loadingAffiliateOrders, setLoadingAffiliateOrders] = useState<boolean>(false);

  // Thêm state này vào đầu component
  const [openIncomeDialog, setOpenIncomeDialog] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [incomes, setIncomes] = useState<any[]>([]);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");

  // Add useState for tracking active dropdown
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Add state for ActionSheet
  const [actionSheetOpen, setActionSheetOpen] = useState<boolean>(false);
  const [currentActionCustomer, setCurrentActionCustomer] = useState<Customer | null>(null);
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

  // Function to handle dropdown toggle
  const handleToggleDropdown = (customerId: string) => {
    setActiveDropdownId(prevId => prevId === customerId ? null : customerId);
  };

  // Điều chỉnh function để fetch danh sách incomes và chọn mặc định chính sách hiện tại của khách hàng
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

  // Điều chỉnh function để mở dialog gán chính sách
  const handleAssignIncome = (customerId: string, customerIncomeId?: string) => {
    setSelectedCustomerId(customerId);

    // Trước khi mở dialog, fetch danh sách chính sách
    fetchIncomes(customerIncomeId);
    setOpenIncomeDialog(true);
  };

  // Thêm function để gán chính sách
  const handleSubmitAssignIncome = async () => {
    try {
      await api.put(`income/updateIncomeForUser/${selectedIncomeId}`, [selectedCustomerId]);
      setOpenIncomeDialog(false);
      alert("Gán chính sách thu nhập thành công!");
      fetchCustomers(); // Tải lại danh sách khách hàng
    } catch (error) {
      console.error("Error assigning income", error);
      alert("Có lỗi xảy ra khi gán chính sách thu nhập!");
    }
  };

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      // API getUserByQuery tính page từ 1
      const apiPage = page + 1; // Convert from 0-based to 1-based page numbering

      const res = await api.get(
        `users/getUserByQuery?page=${apiPage}&limit=${limit}&query=${searchQuery}&role=USER&status=ACTIVE`
      );
      const data: CustomerResponse = res.data;
      setCustomers(data.userModels);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      // Short timeout to ensure skeleton loaders are visible for at least a moment
      // which helps users perceive the system is responsive even on fast connections
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const fetchMembershipPrices = async () => {
    try {
      const res = await api.get("membership_prices");
      setMembershipPrices(res.data);
      if (res.data.length > 0) {
        setSelectedMembershipId(res.data[0]._id);
        setTotalMembershipPrice(res.data[0].priceInMonth * membershipTime);
      }
    } catch (error) {
      console.error("Error fetching membership prices", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchMembershipPrices();
  }, [page, limit, searchQuery]);

  useEffect(() => {
    // Tính toán giá tiền khi thời gian hoặc loại thẻ thay đổi
    const selectedMembership = membershipPrices.find(m => m._id === selectedMembershipId);
    if (selectedMembership) {
      setTotalMembershipPrice(selectedMembership.priceInMonth * membershipTime);
    }
  }, [selectedMembershipId, membershipTime, membershipPrices]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as any;
    const customerData: Partial<Customer> = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
    };

    try {
      if (editingCustomer) {
        await api.put(`users/updateUserInfo?id=${editingCustomer._id}`, customerData);
      } else {
        // Nếu tạo mới, thêm password
        await api.post("users/createUser", {
          ...customerData
        });
      }
      handleDialogClose();
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer", error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setOpenDialog(true);
  };

  const handleDelete = async (customerId: string) => {
    // Show the delete confirmation dialog
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  // Function to execute the actual delete operation after confirmation
  const executeDelete = async () => {
    if (!customerToDelete) return;

    try {
      await api.delete(`users/channgeStatusUser/{userId}?userId=${customerToDelete}&status=DELETE`);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      fetchCustomers(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting customer", error);
      alert("Xóa khách hàng thất bại!");
    }
  };

  // Hàm xử lý mở dialog nâng cấp hạng thẻ
  const handleOpenMembershipDialog = (customerId: string, currentType: string) => {
    setCurrentCustomerId(customerId);
    // Tìm membership tương ứng hoặc lấy membership đầu tiên
    const currentCustomer = customers.find(c => c._id === customerId);

    // Đặt membership mặc định
    if (membershipPrices.length > 0) {
      // Tìm membership hiện tại hoặc dùng membership đầu tiên
      const currentMembership = membershipPrices.find(m => m.type === currentCustomer?.customer_type) || membershipPrices[0];
      setSelectedMembershipId(currentMembership._id);
      setTotalMembershipPrice(currentMembership.priceInMonth * membershipTime);
    }

    setOpenMembershipDialog(true);
  };

  // Hàm xử lý nâng cấp hạng thẻ
  const handleUpgradeMembership = async () => {
    try {
      await api.put("users/updateCustomerType", {
        uid: currentCustomerId,
        time: membershipTime,
        priceMemberShipId: selectedMembershipId
      });

      setOpenMembershipDialog(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error upgrading membership", error);
    }
  };

  // Hàm lấy danh sách order của một khách hàng
  const handleViewOrders = async (customerPhone: string, customer: Customer) => {
    try {
      const res = await api.get(
        `orders/GetMany?page=1&limit=9999&phone=${customerPhone}`
      );
      const data: OrderResponse = res.data;
      setOrders(data.orders);
      setCurrentCustomer(customer);
      const totalPrice = data.orders.reduce((sum, order) => sum + order.total_price, 0);
      setTotalOrderPrice(totalPrice);
      setOpenOrderDialog(true);
    } catch (error) {
      console.error("Error fetching orders for customer", error);
    }
  };

  // Hàm lấy danh sách order từ tiếp thị liên kết
  const handleViewAffiliateOrders = async (referralCode: string, customer: Customer) => {
    if (!referralCode) {
      alert("Khách hàng này không có mã giới thiệu");
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

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case "J":
        return "J";
      case "Q":
        return "Q";
      case "K":
        return "K";
      default:
        return type;
    }
  };

  // Hàm kiểm tra trạng thái khách mời
  const isValidGuest = (customer: any) => {
    if (!customer.guest) return false;

    const isGuest = customer.guest.is_guest === true;
    const hasValidExpiry = customer.guest.expiry && new Date(customer.guest.expiry) > new Date();

    return isGuest && hasValidExpiry;
  }

  // Hàm xác định style dựa trên trạng thái khách hàng và loại thành viên
  const getCustomerStatusStyle = (customer: any) => {
    // Kiểm tra khách mời
    const isGuest = isValidGuest(customer);

    // Kiểm tra loại thẻ
    const membershipType = customer.customer_type || "J";

    // Style cho table row
    let rowStyle = "";
    // Style cho card
    let cardStyle = "";
    // Style cho icon thẻ
    let badgeStyle = "";

    if (isGuest) {
      // Khách mời với các loại thẻ khác nhau
      if (membershipType === "Q") {
        // Khách mời + Queen: Gold on light silver
        rowStyle = "bg-gradient-to-r from-green-50 to-gold-50 hover:from-green-100 hover:to-gold-100";
        cardStyle = "border-l-4 border-gold-400 bg-gradient-to-r from-green-50 to-gold-50";
        badgeStyle = "bg-gold-200 text-gold-800 ring-1 ring-gold-400";
      } else if (membershipType === "K") {
        // Khách mời + King: Gold on black
        rowStyle = "bg-gradient-to-r from-green-50 to-gray-100 hover:from-green-100 hover:to-gray-200";
        cardStyle = "border-l-4 border-black bg-gradient-to-r from-green-50 to-gray-100";
        badgeStyle = "bg-black text-gold-400 ring-1 ring-gold-400";
      } else {
        // Khách mời thông thường (Jack): Light green
        rowStyle = "bg-green-50 hover:bg-green-100";
        cardStyle = "border-l-4 border-green-400 bg-green-50";
        badgeStyle = "bg-green-200 text-green-800 ring-1 ring-green-400";
      }
    } else {
      // Không phải khách mời, chỉ check theo loại thẻ
      if (membershipType === "Q") {
        // Queen: Gold theme
        rowStyle = "bg-gold-50 hover:bg-gold-100";
        cardStyle = "border-l-4 border-gold-400 bg-gold-50";
        badgeStyle = "bg-gold-200 text-gold-800 ring-1 ring-gold-400";
      } else if (membershipType === "K") {
        // King: Dark theme with gold accents
        rowStyle = "bg-gray-100 hover:bg-gray-200";
        cardStyle = "border-l-4 border-black bg-gray-100";
        badgeStyle = "bg-black text-gold-400 ring-1 ring-gold-400";
      } else {
        // Jack: Default light styling
        rowStyle = "hover:bg-gray-50";
        cardStyle = "border-l-1 border-gray-200";
        badgeStyle = "bg-gray-100 text-gray-800";
      }
    }

    return { rowStyle, cardStyle, badgeStyle };
  };

  // Hàm xử lý thay đổi trạng thái khách mời
  const handleToggleGuestStatus = async (customer: any) => {
    try {
      // Kiểm tra và thiết lập trạng thái khách mời ngược lại
      const isCurrentlyGuest = customer.guest && customer.guest.is_guest === true;

      // Tạo ngày hết hạn mới (30 ngày từ hiện tại) nếu đang bật trạng thái guest
      const expiryDate = !isCurrentlyGuest ? new Date(new Date().setDate(new Date().getDate() + 30)) : null;

      const guestData = {
        guests: [
          {
            phone: customer.phone,
            is_guest: !isCurrentlyGuest,
            expiry: expiryDate
          }
        ]
      };

      await api.put("users/updateGuestUser", guestData);
      fetchCustomers(); // Tải lại danh sách khách hàng
    } catch (error) {
      console.error("Error updating guest status", error);
    }
  }

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quản lý khách hàng | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý khách hàng tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>
        {/* Nội dung chính */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Replacing the custom header with DashboardHeader component */}
          <DashboardHeader
            title="Quản lý Khách hàng"
            searchEnabled={true}
            searchQuery={searchQuery}
            onSearchChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            onSearchClear={() => {
              setSearchQuery("");
              setPage(0); // Reset to first page when clearing search
              fetchCustomers();
            }}
            addEnabled={true}
            addButtonLabel="Thêm Khách hàng"
            onAddClick={() => setOpenDialog(true)}
            searchResultText={searchQuery ? `Kết quả tìm kiếm: ${total} khách hàng` : ""}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Tổng khách hàng</div>
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
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Khách mời</div>
                  <div className="text-lg md:text-2xl font-bold">{isLoading ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div> : customers.filter(c => isValidGuest(c)).length}</div>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-full flex-shrink-0">
                  <FontAwesomeIcon icon={faTicketAlt} className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <div className="text-gray-500 text-xs md:text-sm mb-1 truncate">Cộng tác viên</div>
                  <div className="text-lg md:text-2xl font-bold">{isLoading ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div> : customers.filter(c => c.IncomInfo && c.IncomInfo[0]).length}</div>
                </div>
                <div className="bg-purple-100 p-2 md:p-3 rounded-full flex-shrink-0">
                  <FontAwesomeIcon icon={faHandshake} className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* ViewSwitcher */}
          <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center">
            <div className="text-sm text-gray-500 mb-3 md:mb-0">
              {searchQuery ? `Kết quả tìm kiếm: ${total} khách hàng` : `Hiển thị ${customers.length} trên tổng số ${total} khách hàng`}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Color coding legend */}
              <div className="flex items-center mr-2">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-300 mr-1"></span>
                  <span className="text-xs text-gray-600 mr-2">Khách mời</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-gold-100 border border-gold-300 mr-1"></span>
                  <span className="text-xs text-gray-600 mr-2">Queen</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-black border border-gold-400 mr-1"></span>
                  <span className="text-xs text-gray-600">King</span>
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

          {/* Customer Table with improved styling */}
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
            ) : customers.length === 0 ? (
              <EmptyState
                title={searchQuery ? "Không tìm thấy khách hàng" : "Chưa có khách hàng nào"}
                subtitle={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm khách hàng mới để bắt đầu"}
                searchQuery={searchQuery}
                onActionClick={() => setOpenDialog(true)}
                actionButtonText="Thêm khách hàng"
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
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Họ tên</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">SĐT</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Email</th>
                          {/* Hide below lg */}
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center hidden lg:table-cell">Mã giới thiệu</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Hạng thẻ & Trạng thái</th> {/* Updated Header */}
                          {/* Hide below lg */}
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center hidden lg:table-cell">CTV</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                          <tr key={customer._id} className={`hover:bg-gray-50 transition-colors ${getCustomerStatusStyle(customer).rowStyle}`}>
                            <td className="py-3 px-4">
                              <div className="font-medium">{customer.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faPhoneAlt} className="text-gray-400 mr-2 h-3.5 w-3.5" />
                                <span>{customer.phone}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center text-gray-500 text-sm">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2 h-3.5 w-3.5 flex-shrink-0" />
                                {/* Add truncate and title */}
                                <span className="truncate" title={customer.email}>{customer.email}</span>
                              </div>
                            </td>
                            {/* Hide below lg */}
                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                              {customer.referral_code ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {customer.referral_code}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center">
                                {/* Tier Badge */}
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-1 ${getCustomerStatusStyle(customer).badgeStyle}`}>
                                  {getCustomerTypeLabel(customer.customer_type || "J")}
                                </span>
                                {customer.customer_type_expiry && (
                                  <div className="text-xs text-gray-500">
                                    Hết hạn: {new Date(customer.customer_type_expiry).toLocaleDateString()}
                                  </div>
                                )}

                                {/* Guest Status (if applicable) */}
                                {isValidGuest(customer) && (
                                  <div className="mt-1.5 flex flex-col items-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <FontAwesomeIcon icon={faTicketAlt} className="h-3 w-3 mr-1" />
                                      Khách mời
                                    </span>
                                    {customer.guest?.expiry && (
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        Hết hạn: {new Date(customer.guest.expiry).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Hide below lg */}
                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                              {customer.IncomInfo && customer.IncomInfo[0] ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {customer.IncomInfo[0].name}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <ActionButtonsGroup
                                // Only show Edit inline
                                showView={false}
                                showEdit={true}
                                showDelete={false}
                                onEdit={() => handleEdit(customer)}
                                editTooltip="Chỉnh sửa"
                                // Add View and Delete to moreActions
                                moreActions={[
                                  {
                                    label: "Xem đơn hàng",
                                    icon: faTicketAlt, // Use appropriate icon for view orders
                                    iconColor: "text-blue-500",
                                    onClick: () => handleViewOrders(customer.phone, customer)
                                  },
                                  {
                                    label: "Đơn hàng tiếp thị",
                                    icon: faHandshake,
                                    iconColor: "text-green-500",
                                    onClick: () => handleViewAffiliateOrders(customer.referral_code || "", customer)
                                  },
                                  {
                                    label: "Nâng cấp hạng thẻ",
                                    icon: faMedal,
                                    iconColor: "text-gold-500",
                                    onClick: () => handleOpenMembershipDialog(customer._id!, customer.customer_type || 'J')
                                  },
                                  {
                                    label: isValidGuest(customer) ? 'Hủy khách mời' : 'Đặt làm khách mời',
                                    icon: faTicketAlt,
                                    iconColor: "text-blue-500",
                                    onClick: () => handleToggleGuestStatus(customer)
                                  },
                                  {
                                    label: "Gán chính sách thu nhập",
                                    icon: faUserCog,
                                    iconColor: "text-purple-500",
                                    onClick: () => handleAssignIncome(customer._id!, customer.IncomInfo && customer.IncomInfo[0] ? customer.IncomInfo[0]._id : undefined)
                                  },
                                  {
                                    label: "Xóa",
                                    icon: faTimes, // Use appropriate icon for delete
                                    iconColor: "text-red-500",
                                    onClick: () => handleDelete(customer._id)
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
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col ${getCustomerStatusStyle(customer).cardStyle}`}
                        >
                          <div className="p-4 border-b border-gray-100 flex-grow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800">{customer.name}</h3>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-2 h-3 w-3" />
                                  {customer.phone}
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 h-3 w-3" />
                                  {customer.email}
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getCustomerStatusStyle(customer).badgeStyle}`}>
                                  {getCustomerTypeLabel(customer.customer_type || "J")}
                                </span>
                                {customer.customer_type_expiry && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(customer.customer_type_expiry).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3 justify-between">
                              {isValidGuest(customer) && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FontAwesomeIcon icon={faTicketAlt} className="h-3 w-3 mr-1" />
                                  Khách mời
                                </span>
                              )}

                              {customer.referral_code && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Mã: {customer.referral_code}
                                </span>
                              )}

                              {customer.IncomInfo && customer.IncomInfo[0] && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  CTV: {customer.IncomInfo[0].name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 bg-gray-50 mt-auto">
                            <button
                              onClick={() => handleViewOrders(customer.phone, customer)}
                              className="p-3 text-center font-medium text-sm text-blue-600 border-r border-gray-200 hover:bg-blue-50"
                            >
                              <FontAwesomeIcon icon={faTicketAlt} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Đơn hàng</span>
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-3 text-center font-medium text-sm text-gold-600 border-r border-gray-200 hover:bg-gold-50"
                            >
                              <FontAwesomeIcon icon={faUser} className="w-4 h-4 mb-1 mx-auto" />
                              <span className="block text-xs">Chỉnh sửa</span>
                            </button>
                            <div className="relative">
                              <button
                                className="p-3 w-full text-center font-medium text-sm text-gray-600 hover:bg-gray-100"
                                onClick={() => {
                                  setCurrentActionCustomer(customer);
                                  setActionSheetActions([
                                    {
                                      label: "Đơn hàng tiếp thị",
                                      icon: faHandshake,
                                      iconColor: "text-green-500",
                                      onClick: () => handleViewAffiliateOrders(customer.referral_code || "", customer)
                                    },
                                    {
                                      label: "Nâng cấp hạng thẻ",
                                      icon: faMedal,
                                      iconColor: "text-gold-500",
                                      onClick: () => handleOpenMembershipDialog(customer._id!, customer.customer_type || 'J')
                                    },
                                    {
                                      label: isValidGuest(customer) ? 'Hủy khách mời' : 'Đặt làm khách mời',
                                      icon: faTicketAlt,
                                      iconColor: "text-blue-500",
                                      onClick: () => handleToggleGuestStatus(customer)
                                    },
                                    {
                                      label: "Gán chính sách thu nhập",
                                      icon: faUserCog,
                                      iconColor: "text-purple-500",
                                      onClick: () => handleAssignIncome(customer._id!, customer.IncomInfo && customer.IncomInfo[0] ? customer.IncomInfo[0]._id : undefined)
                                    },
                                    {
                                      label: "Xóa",
                                      icon: faTimes,
                                      iconColor: "text-red-500",
                                      onClick: () => handleDelete(customer._id)
                                    }
                                  ]);
                                  setActionSheetOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4 mb-1 mx-auto" />
                                <span className="block text-xs">Thêm</span>
                              </button>
                            </div>
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
                {[8, 12, 24, 48].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 ml-2">khách hàng</span>
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

      {/* Modal tạo/cập nhật khách hàng */}
      {openDialog && (
        <StandardDialog
          open={openDialog}
          onClose={handleDialogClose}
          disableBackdropClick={true}
          title={editingCustomer ? "Cập nhật Khách hàng" : "Thêm Khách hàng"}
          maxWidth="md"
          actions={
            <>
              <DialogActionButton
                onClick={handleDialogClose}
                variant="outline"
                className="px-4 py-2 text-sm sm:text-base"
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={() => {
                  const form = document.getElementById("customer-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                variant="primary"
                className="px-4 py-2 text-sm sm:text-base"
              >
                {editingCustomer ? "Cập nhật" : "Thêm mới"}
              </DialogActionButton>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4" id="customer-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCustomer?.name || ""}
                  placeholder="Họ tên"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingCustomer?.phone || ""}
                  placeholder="Số điện thoại"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    // Giữ lại chỉ các ký tự số và giới hạn độ dài
                    target.value = target.value.replace(/\D/g, '').slice(0, 10);
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={editingCustomer?.email || ""}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all"
                required
              />
            </div>
          </form>
        </StandardDialog>
      )}

      {/* Modal hiển thị danh sách order của khách hàng */}
      {openOrderDialog && (
        <StandardDialog
          open={openOrderDialog}
          onClose={() => setOpenOrderDialog(false)}
          title={`Lịch sử đơn hàng của ${currentCustomer?.name}`}
          maxWidth="3xl"
          actions={
            <DialogActionButton
              onClick={() => setOpenOrderDialog(false)}
              variant="primary"
              className="px-5 py-2 text-sm sm:text-base"
            >
              Đóng
            </DialogActionButton>
          }
        >
          {orders.length > 0 ? (
            <div>
              <div className="bg-gold-50 p-5 rounded-lg mb-6 border border-gold-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold text-gold-600">{totalOrderPrice.toLocaleString()} đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số đơn hàng</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Chi tiêu trung bình</p>
                    <p className="text-2xl font-bold text-gold-600">
                      {orders.length > 0
                        ? Math.round(totalOrderPrice / orders.length).toLocaleString()
                        : 0} đ
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-4 px-5 text-sm font-semibold text-gray-700 uppercase text-left">Mã đơn hàng</th>
                      <th className="py-4 px-5 text-sm font-semibold text-gray-700 uppercase text-left">Sự kiện</th>
                      <th className="py-4 px-5 text-sm font-semibold text-gray-700 uppercase text-left w-[180px]">Tổng tiền</th>
                      <th className="py-4 px-5 text-sm font-semibold text-gray-700 uppercase text-left">Ngày tạo</th>
                      <th className="py-4 px-5 text-sm font-semibold text-gray-700 uppercase text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.open(`/dashboard/ticket-detail/${order._id}`, '_blank')}
                      >
                        <td className="py-4 px-5 font-medium">{order.code}</td>
                        <td className="py-4 px-5 text-gray-700">{order.eventDetail?.title || "N/A"}</td>
                        <td className="py-4 px-5 text-gold-600 font-medium">{order.total_price.toLocaleString()} đ</td>
                        <td className="py-4 px-5 text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            ${order.InfoOrderPayment?.status === "PAID" ? "bg-green-100 text-green-800" :
                              order.InfoOrderPayment?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                order.InfoOrderPayment?.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                                  order.InfoOrderPayment?.status === "CANCELED" ? "bg-red-100 text-red-800" :
                                    order.InfoOrderPayment?.status === "REFUNDED" ? "bg-purple-100 text-purple-800" :
                                      "bg-gray-100 text-gray-800"}`}>
                            {getStatusText(order.InfoOrderPayment?.status || "").text}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{order.code}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${order.InfoOrderPayment?.status === "PAID" ? "bg-green-100 text-green-800" :
                              order.InfoOrderPayment?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                order.InfoOrderPayment?.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                                  order.InfoOrderPayment?.status === "CANCELED" ? "bg-red-100 text-red-800" :
                                    order.InfoOrderPayment?.status === "REFUNDED" ? "bg-purple-100 text-purple-800" :
                                      "bg-gray-100 text-gray-800"}`}>
                            {getStatusText(order.InfoOrderPayment?.status || "").text}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {order.eventDetail?.title && (
                          <div>
                            <p className="text-xs text-gray-500">Sự kiện:</p>
                            <p className="text-sm font-medium">{order.eventDetail.title}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Tổng tiền:</p>
                            <p className="text-sm font-semibold text-gold-600">{order.total_price.toLocaleString()} đ</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ngày tạo:</p>
                            <p className="text-sm">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-end">
                          <button
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => window.open(`/dashboard/ticket-detail/${order._id}`, '_blank')}
                          >
                            <FontAwesomeIcon icon={faArrowRight} className="mr-1.5 h-3 w-3" />
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Chưa có đơn hàng nào"
              subtitle="Khách hàng này chưa có lịch sử mua hàng"
              icon={faTicketAlt}
            />
          )}
        </StandardDialog>
      )}

      {/* Modal hiển thị danh sách order từ tiếp thị liên kết */}
      {openAffiliateDialog && (
        <StandardDialog
          open={openAffiliateDialog}
          onClose={() => setOpenAffiliateDialog(false)}
          title={`Đơn hàng tiếp thị liên kết của ${currentCustomer?.name}`}
          maxWidth="3xl"
          actions={
            <DialogActionButton
              onClick={() => setOpenAffiliateDialog(false)}
              variant="primary"
              className="px-5 py-2 text-sm sm:text-base"
            >
              Đóng
            </DialogActionButton>
          }
        >
          {loadingAffiliateOrders ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : affiliateOrders.length > 0 ? (
            <div>
              <div className="bg-gold-50 p-4 rounded-lg mb-4 border border-gold-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                    <p className="text-xl font-bold">{affiliateOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng doanh thu</p>
                    <p className="text-xl font-bold text-gold-600">{totalAffiliatePrice.toLocaleString()} đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã giới thiệu</p>
                    <p className="text-xl font-bold text-blue-600">{currentCustomer?.referral_code}</p>
                  </div>
                </div>
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Mã đơn hàng</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Khách hàng</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Sự kiện</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Tổng tiền</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Ngày tạo</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliateOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{order.code}</td>
                        <td className="py-3 px-4">{order.InfoUser?.name || "N/A"}</td>
                        <td className="py-3 px-4">{order.eventDetail?.title || "N/A"}</td>
                        <td className="py-3 px-4 text-gold-600">{order.total_price.toLocaleString()} đ</td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${order.InfoOrderPayment?.status === "PAID" ? "bg-green-100 text-green-800" :
                              order.InfoOrderPayment?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                order.InfoOrderPayment?.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                                  order.InfoOrderPayment?.status === "CANCELED" ? "bg-red-100 text-red-800" :
                                    order.InfoOrderPayment?.status === "REFUNDED" ? "bg-purple-100 text-purple-800" :
                                      "bg-gray-100 text-gray-800"}`}>
                            {getStatusText(order.InfoOrderPayment?.status || "").text}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards */}
              <div className="md:hidden">
                <div className="space-y-4">
                  {affiliateOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-medium">{order.code}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.InfoOrderPayment?.status === "PAID" ? "bg-green-100 text-green-800" :
                            order.InfoOrderPayment?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                              order.InfoOrderPayment?.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                                order.InfoOrderPayment?.status === "CANCELED" ? "bg-red-100 text-red-800" :
                                  order.InfoOrderPayment?.status === "REFUNDED" ? "bg-purple-100 text-purple-800" :
                                    "bg-gray-100 text-gray-800"}`}>
                          {getStatusText(order.InfoOrderPayment?.status || "").text}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Khách hàng:</p>
                          <div className="text-sm">
                            {order.InfoUser?.name || "N/A"}
                            {order.InfoUser?.phone && (
                              <span className="text-xs text-gray-500 ml-1">({order.InfoUser.phone})</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Sự kiện:</p>
                          <p className="text-sm">{order.eventDetail?.title || "N/A"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500">Tổng tiền:</p>
                            <p className="text-sm font-semibold text-gold-600">{order.total_price.toLocaleString()} đ</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ngày tạo:</p>
                            <p className="text-sm">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Không có đơn hàng tiếp thị liên kết"
              subtitle={currentCustomer?.referral_code
                ? "Chưa có ai sử dụng mã giới thiệu của khách hàng này"
                : "Khách hàng này chưa có mã giới thiệu"}
              icon={faHandshake}
            />
          )}
        </StandardDialog>
      )}

      {/* Modal nâng cấp hạng thẻ */}
      {openMembershipDialog && (
        <StandardDialog
          open={openMembershipDialog}
          onClose={() => setOpenMembershipDialog(false)}
          title="Nâng cấp hạng thẻ"
          variant="default"
          maxWidth="md"
          actions={
            <>
              <DialogActionButton
                onClick={() => setOpenMembershipDialog(false)}
                variant="outline"
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={handleUpgradeMembership}
                variant="primary"
              >
                Nâng cấp
              </DialogActionButton>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Chọn hạng thẻ:</label>
              <div className="flex flex-wrap gap-4">
                {membershipPrices.map((membership) => (
                  <label key={membership._id} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="membership"
                      value={membership._id}
                      checked={selectedMembershipId === membership._id}
                      onChange={() => setSelectedMembershipId(membership._id)}
                    />
                    <span className="ml-2">
                      {membership.type === "J" ? "Jack (J)" :
                        membership.type === "Q" ? "Queen (Q)" :
                          membership.type === "K" ? "King (K)" :
                            `${membership.type}`}
                      {" - "}
                      {membership.priceInMonth.toLocaleString()}đ/{membership.duration === "month" ? "tháng" :  membership.duration === "year" ? "năm" : ""} 
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Thời hạn:</label>
              <input
                type="number"
                min="1"
                value={membershipTime}
                onChange={(e) => setMembershipTime(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="font-semibold text-lg mb-2">Tóm tắt</h3>
              <div className="flex justify-between mb-2">
                <span>Gói thành viên:</span>
                <span>
                  {membershipPrices.find(m => m._id === selectedMembershipId)?.type === "J" ? "Jack (J)" :
                    membershipPrices.find(m => m._id === selectedMembershipId)?.type === "Q" ? "Queen (Q)" :
                      membershipPrices.find(m => m._id === selectedMembershipId)?.type === "K" ? "King (K)" :
                        membershipPrices.find(m => m._id === selectedMembershipId)?.type || ""}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Thời hạn:</span>
                <span>{membershipTime} {membershipPrices.find(m => m._id === selectedMembershipId)?.duration === "month" ? "tháng" :  membershipPrices.find(m => m._id === selectedMembershipId)?.duration === "year" ? "năm" : ""}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tổng tiền:</span>
                <span>{totalMembershipPrice.toLocaleString()} đ</span>
              </div>
            </div>
          </div>
        </StandardDialog>
      )}

      {openIncomeDialog && (
        <StandardDialog
          open={openIncomeDialog}
          onClose={() => setOpenIncomeDialog(false)}
          title="Gán chính sách thu nhập"
          variant="default"
          maxWidth="md"
          actions={
            <>
              <DialogActionButton
                onClick={() => setOpenIncomeDialog(false)}
                variant="outline"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Chọn chính sách thu nhập:</label>
              <div className="flex flex-col gap-2">
                {incomes.length > 0 ? (
                  incomes.map((income) => (
                    <label key={income._id} className="inline-flex items-center p-2 border rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        className="form-radio"
                        name="income"
                        value={income._id}
                        checked={selectedIncomeId === income._id}
                        onChange={() => setSelectedIncomeId(income._id)}
                      />
                      <div className="ml-2">
                        <div className="font-medium">{income.name}</div>
                        <div className="text-sm text-gray-500">
                          {income.type_price === "PERCENT" ? "Phần trăm: " : "Cố định: "}
                          {income.price}{income.type_price === "PERCENT" ? "%" : "đ"}
                        </div>
                        {income.desc && <div className="text-xs text-gray-500">{income.desc}</div>}
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Không có chính sách thu nhập nào. Vui lòng tạo chính sách trước.
                  </div>
                )}
              </div>
            </div>
          </div>
        </StandardDialog>
      )}
      {deleteDialogOpen && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={executeDelete}
          title="Xác nhận xóa khách hàng"
          message="Bạn có chắc chắn muốn xóa khách hàng này không?"
          confirmButtonText="Xóa"
          cancelButtonText="Hủy"
          confirmButtonColor="error"
        />
      )}
      {actionSheetOpen && (
        <ActionSheet
          open={actionSheetOpen}
          onClose={() => setActionSheetOpen(false)}
          actions={actionSheetActions}
        />
      )}
    </div>
  );
};

export default CustomerPage;
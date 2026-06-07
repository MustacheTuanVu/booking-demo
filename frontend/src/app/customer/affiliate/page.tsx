"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { formatDate } from "@/utils/date";
import api from "@/utils/api";
import { AppContext } from "@/context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faReceipt,
  faMoneyBillWave,
  faGift,
  faUserPlus,
  faPaperPlane,
  faRegistered
} from "@fortawesome/free-solid-svg-icons";
import TicketHistoryDialog from "@/components/TicketHistoryDialog";
import {
  CustomerPageLayout,
  CustomerCard,
  CustomerSnackbar
} from "@/components/CustomerLayout";
import { FaExclamationTriangle, FaCheck, FaCopy } from "react-icons/fa";
import { motion } from "framer-motion";
import { Animate, AnimateGroup } from "@/components/ui/animate";
import CashModal from "./CashModal";
import RegisterCTV from "./RegisterCTV";
// Import SnackbarTest component for development
import SnackbarTest from "./SnackbarTest";

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
}

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

interface PromotionType {
  _id: string;
  code: string;
  name: string;
  desc?: string;
  expired: string;
  status: Status;
  type_price: TypePromotion;
  price: number;
  required_points: number;
  max_quantity: number;
  for: CustomerType;
  total: number;
}

interface PromotionResponse {
  promotion: PromotionType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function AffiliateMarketingPage() {
  const [limit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const { userInfo, isLogin } = useContext(AppContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<PromotionType[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showRegisterCTV, setShowRegisterCTV] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    successfulOrders: 0,
    canceledOrders: 0,
    failedOrders: 0
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [dataMyInfo, setDataMyInfo] = useState<any>({});
  const [dataCTV, setDataCTV] = useState<any[]>([]);
  const [showTicketHistory, setShowTicketHistory] = useState(false);
  const [showTicketHistoryModal, setShowTicketHistoryModal] = useState(false);
  const [hasBankInfo, setHasBankInfo] = useState(false);
  // New state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  // Helper function for snackbar
  const showSnackbar = useCallback((message: string, success: boolean = true) => {
    setSnackbarMessage(message);
    setSnackbarSuccess(success);
    setSnackbarOpen(true);
  }, []);


  const fetchVouchers = useCallback(async () => {
    try {
      const res = await api.get(
        `promotion/GetMany?page=${page + 1}&limit=${99999999}`
      );
      const data: PromotionResponse = res.data;

      const newList = [];
      const currentDate = new Date();

      for (let i = 0; i < data.promotion.length; i++) {
        const e: any = data.promotion[i];
        if (e.for_type == "CTV" && new Date(e.expired) > currentDate && e.status == "ACTIVE" && e.max_quantity > 0) {
          // if (e.purchased_by.length == 0) {
            // if (!e.purchased_by.includes(userInfo?._id)) {
              newList.push(e);
            // }
          // }
        }
      }

      setVouchers(newList);
    } catch (error) {
      console.error("Error fetching vouchers", error);
      showSnackbar("Không thể tải dữ liệu voucher", false);
    }
  }, [page, userInfo, showSnackbar]);

  useEffect(() => {
    if (userInfo) {
      fetchVouchers();
    }
  }, [page, limit, userInfo, fetchVouchers]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('users/getMyInfo');
        setDataMyInfo(response.data);
        if (response.data.BankInfo && response.data.BankInfo.length > 0) {
          setBankInfo(response.data.BankInfo[0]);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        showSnackbar("Không thể tải thông tin người dùng", false);
      }
    };
    const fetchCTV = async () => {
      try {
        const response = await api.get(`ticket/getTicketsByCondition?page=${page + 1}&limit=${99999999}&status=COMPLETE&type=COLLABORATOR`);
        setDataCTV(response.data.tickets);
      } catch (error) {
        console.error("Error fetching user info:", error);
        showSnackbar("Không thể tải thông tin người dùng", false);
      }
    };

    fetchUserInfo();
    fetchCTV();
  }, [page, showSnackbar]);
  useEffect(() => {
    if (dataMyInfo?._id && Array.isArray(dataCTV)) {
      const isMatched = dataCTV.some((data: any) => data?.uid?._id === dataMyInfo._id);
      if (isMatched) {
        setShowTicketHistory(true);
      }
    }
  }, [dataMyInfo, dataCTV]);

  useEffect(() => {
    if (bankInfo) {
      setFormData(prev => ({
        ...prev,
        bankCode: bankInfo.bankCode || "",
        bankName: bankInfo.bankName || "",
        accountNumber: bankInfo.accountNumber || "",
        accountHolderName: bankInfo.accountHolderName || "",
      }));
    }
  }, [bankInfo]);
  const fetchAffiliateOrders = useCallback(async () => {
    if (!isLogin || !userInfo?.referral_code) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // We'll search for orders where referred_by matches the user's referral_code
      const response = await api.get(`/orders/GetMany`, {
        params: {
          query: userInfo.referral_code,
          limit: 100,
          ...(selectedFilter !== "ALL" && selectedFilter && { status: selectedFilter })
        }
      });

      // Filter to only include orders where referred_by exactly matches the referral_code
      const affiliateOrders = response.data.orders.filter(
        (order: any) => order.referred_by === userInfo.referral_code
      );

      setOrders(affiliateOrders);

      // Calculate statistics
      const totalRevenue = affiliateOrders.reduce((sum: number, order: Order) =>
        sum + (order.total_price || 0), 0
      );

      const pendingOrders = affiliateOrders.filter(
        (order: Order) => order.InfoOrderPayment?.status === "PENDING"
      ).length;

      const successfulOrders = affiliateOrders.filter(
        (order: Order) => order.InfoOrderPayment?.status === "PAID"
      ).length;

      const canceledOrders = affiliateOrders.filter(
        (order: Order) => order.InfoOrderPayment?.status === "CANCELED"
      ).length;

      const failedOrders = affiliateOrders.filter(
        (order: Order) => order.InfoOrderPayment?.status === "FAILED"
      ).length;

      setStats({
        totalOrders: affiliateOrders.length,
        totalRevenue,
        pendingOrders,
        successfulOrders,
        canceledOrders,
        failedOrders
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching affiliate orders:", err);
      setError("Không thể tải dữ liệu đơn hàng từ tiếp thị liên kết.");
      showSnackbar("Không thể tải dữ liệu đơn hàng", false);
      setLoading(false);
    }
  }, [isLogin, userInfo, selectedFilter, showSnackbar]);
  // Fetch orders that have the user's referral code
  useEffect(() => {
    fetchAffiliateOrders();
  }, [fetchAffiliateOrders]);
  const filteredOrders = orders.filter(
    order => (selectedFilter || "ALL") === "ALL" || order?.status === selectedFilter,
  );
  const copyReferralCode = () => {
    if (userInfo?.referral_code) {
      const referralLink = process.env.NEXT_PUBLIC_URL + '?ref=' + userInfo.referral_code;

      // Copy to clipboard
      navigator.clipboard.writeText(referralLink);
      setCopiedCode(true);
      showSnackbar("Đã sao chép mã giới thiệu vào clipboard!");

      // Save to localStorage with 7-day expiration
      const now = new Date();
      const expiresAt = now.getTime() + 7 * 24 * 60 * 60 * 1000; // 7 ngày
      localStorage.setItem('referral_link', JSON.stringify({
        link: referralLink,
        expiresAt
      }));

      // Reset copied state after 2s
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const checkVoucherPurchased = (voucher: any) => {
    if (!voucher.purchase_history || !userInfo?._id) return false;
    return voucher.purchase_history.some(
      (history: any) => history.ctv_id === userInfo._id && history.status === "ACTIVE"
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PAID":
        return { color: "bg-green-100 text-green-800", label: "Đã thanh toán" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", label: "Đang xử lý" };
      case "FAILED":
        return { color: "bg-red-100 text-red-800", label: "Đơn lỗi TT" };
      case "CANCELED":
        return { color: "bg-gray-100 text-gray-800", label: "Đã hủy" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Không xác định" };
    }
  };

  const handleExchangeVoucher = async (voucher: any) => {
    try {
      // Call API to buy promotion
      const response = await api.put('promotion/buyPromotion', {
        promotionId: voucher._id
      });

      if (response && response.status === 200) {
        // Success
        showSnackbar(`Đổi voucher ${voucher.name} thành công!`);
        fetchVouchers(); // Refresh vouchers list
        setShowVoucherModal(false);
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error exchanging voucher:', error);
      showSnackbar(error.response?.data?.message || 'Lỗi khi đổi voucher', false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterCTV = async (_e: React.FormEvent): Promise<void> => {
    try {
      // Gọi API kiểm tra xem đã gửi yêu cầu CTV chưa
      const res = await api.get(`ticket/getTicketsByCondition?page=1&limit=99999999&type=COLLABORATOR`);
      const dataCTV = res.data?.tickets || [];

      const hasSentRequest = dataCTV.some((data: any) => data?.uid?._id === dataMyInfo?._id);

      if (hasSentRequest) {
        showSnackbar('Bạn đã gửi yêu cầu đăng ký cộng tác viên rồi!', false);
        throw new Error('Đã gửi yêu cầu trước đó');
      }

      // Nếu chưa gửi, gọi API tạo ticket
      const response = await api.post('ticket/createTicket', {
        type: 'COLLABORATOR',
        title: 'Gửi yêu cầu đăng ký CTV',
        price: 0
      });

      if (response && response.status === 200) {
        showSnackbar('Đã gửi yêu cầu đăng ký CTV!');
        // Fetch CTV data again to update the UI
        const updatedRes = await api.get(`ticket/getTicketsByCondition?page=${page + 1}&limit=${99999999}&status=COMPLETE&type=COLLABORATOR`);
        setDataCTV(updatedRes.data.tickets);
        return Promise.resolve();
      } else {
        throw new Error('Lỗi khi gửi yêu cầu');
      }

    } catch (error: any) {
      console.error('Error sending register request:', error);
      showSnackbar(error.response?.data?.message || 'Lỗi khi gửi yêu cầu đăng ký CTV', false);
      return Promise.reject(error);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bankInfoData = (({ bankCode, bankName, accountNumber, accountHolderName }) => ({
        bankCode, bankName, accountNumber, accountHolderName
      }))(formData)
      if (hasBankInfo) {
        await api.put("bank/updateBank", bankInfoData);
        showSnackbar("Cập nhật thông tin ngân hàng thành công!");
      } else {
        // await api.post("bank/createBank", bankInfoData);
        setHasBankInfo(true);
      }
      await api.post('ticket/createTicket', {
        type: 'COMPLAINTS',
        title: 'Gửi yêu cầu quy đổi',
        price: Number(formData.amount),
      });
      showSnackbar("Gửi yêu cầu quy đổi thành công!");
      setFormData(prev => ({ ...prev, amount: 0 }));
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu", error);
      showSnackbar("Gửi yêu cầu quy đổi thất bại!", false);
    } finally {
      setLoading(false);
    }

  };
  // closeSnackbar function

  const closeSnackbar = () => setSnackbarOpen(false);

  // Voucher Modal Component
  const VoucherModal = () => {
    if (!showVoucherModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
            <h3 className="text-xl font-bold text-white">Đổi voucher từ điểm</h3>
            <button
              onClick={() => setShowVoucherModal(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-6">
              <p className="text-gray-700">
                Điểm hiện có: <span className="font-bold text-[var(--clr-bg-1)]">
                  {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"}
                </span> điểm
                {/* <span className="text-sm text-gray-500 ml-2">
                  (tương đương {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"} đ)
                </span> */}
              </p>
            </div>

            {vouchers.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <FontAwesomeIcon icon={faGift} className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500">Hiện không có voucher nào để đổi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map((voucher) => {
                  const isAffordable = (userInfo?.point || 0) >= voucher.required_points;

                  return (
                    <div
                      key={voucher._id}
                      className={`
                        border rounded-lg p-4 relative overflow-hidden transition-all
                        ${isAffordable && !checkVoucherPurchased(voucher)
                          ? 'border-[var(--clr-bg-1)] hover:shadow-md cursor-pointer'
                          : 'border-gray-200 opacity-70'
                        }
                      `}
                      onClick={() => isAffordable && !checkVoucherPurchased(voucher) && handleExchangeVoucher(voucher)}
                    >
                      {!isAffordable && (
                        <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
                          <div className="bg-white px-3 py-2 rounded-lg shadow text-center">
                            <p className="text-gray-500 text-sm">Điểm không đủ</p>
                            <p className="text-xs text-gray-400">Còn thiếu {(((voucher.required_points || 0) - (userInfo?.point || 0)) * 1000).toLocaleString()} điểm</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-gray-800">{voucher.name}</h4>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {voucher.code}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{voucher.desc}</p>

                      <div className="flex justify-between items-center mt-auto">
                        <div className="text-[var(--clr-bg-1)] font-bold">
                          {voucher.type_price === "PERCENT"
                            ? `${voucher.price}%`
                            : `${voucher.price.toLocaleString()} đ`
                          }
                        </div>
                        <div className="text-gray-500 text-sm">
                          {(voucher.required_points * 1000).toLocaleString()} điểm
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          HSD: {formatDate(voucher.expired)}
                        </div>
                        {isAffordable && (
                          <button 
                            className={`text-xs px-3 py-1 rounded transition-colors ${
                              checkVoucherPurchased(voucher)
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-[var(--clr-bg-1)] text-white hover:bg-[var(--clr-bg-7)]'
                            }`}
                            disabled={checkVoucherPurchased(voucher)}
                            // onClick={() => !checkVoucherPurchased(voucher) && handleExchangeVoucher(voucher)}
                          >
                            {checkVoucherPurchased(voucher) ? 'Đã mua' : 'Đổi ngay'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setShowVoucherModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    );
  };


  // For development: Set to true to show the SnackbarTest component
  const showSnackbarTest = false;

  return (
    <CustomerPageLayout
      title="Tiếp thị liên kết"
      subtitle="Tạo và chia sẻ mã giới thiệu để nhận điểm thưởng và đổi quà"
      description="Trang quản lý tiếp thị liên kết tại Queen Acoustic."
      isLoading={loading}
    >
      {/* SnackbarTest component for development */}
      {showSnackbarTest && <SnackbarTest />}
      {error ? (
        <Animate variant="fade" duration={0.8}>
          <CustomerCard>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-red-500 text-6xl mb-4">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Không thể tải dữ liệu</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
              >
                Thử lại
              </button>
            </div>
          </CustomerCard>
        </Animate>
      ) : (
        <AnimateGroup
          staggerDelay={0.1}
          childVariant="slide-up"
          className="space-y-8"
        >
          {showTicketHistory ? (
            <>
              {/* Referral Code Card */}
              <CustomerCard title="Mã giới thiệu của bạn" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 opacity-10">
                  <FontAwesomeIcon icon={faUserPlus} className="w-full h-full text-[var(--clr-bg-1)]" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-700">
                      Chia sẻ mã giới thiệu này với bạn bè và nhận điểm thưởng mỗi khi họ đặt vé sự kiện tại Queen Acoustic. Mỗi đơn hàng thành công sẽ giúp bạn tích lũy điểm để đổi các ưu đãi hấp dẫn.
                    </p>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Đường dẫn giới thiệu của bạn:</div>
                      <div className="relative">
                        <input
                          type="text"
                          value={`${process.env.NEXT_PUBLIC_URL}?ref=${userInfo?.referral_code || ''}`}
                          readOnly
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 pr-12"
                        />
                        <button
                          onClick={copyReferralCode}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[var(--clr-bg-1)] transition-colors p-2"
                          aria-label="Copy referral code"
                        >
                          <FaCopy className={`${copiedCode ? 'text-green-500' : ''}`} />
                          {copiedCode && (
                            <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                              Đã sao chép!
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-64 shrink-0 border-l border-gray-200 pl-6 flex flex-col items-center justify-center py-4">
                    <div className="text-sm text-gray-500 mb-2">Tổng điểm hiện có:</div>
                    <div className="text-3xl font-bold text-[var(--clr-bg-1)] mb-1">
                      {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"}
                    </div>

                    <button
                      onClick={() => setShowVoucherModal(true)}
                      className="mt-4 px-4 py-2 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors flex items-center"
                    >
                      <FontAwesomeIcon icon={faGift} className="mr-2" />
                      Đổi voucher
                    </button>
                    <button
                      onClick={() => setShowCashModal(true)}
                      className="mt-4 px-4 py-2 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors flex items-center"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                      Gửi yêu cầu quy đổi
                    </button>
                  </div>
                </div>
              </CustomerCard>

              {/* Statistics Cards */}
              <CustomerCard title="Thống kê đơn hàng" subtitle="Tổng quan về các đơn hàng từ mã giới thiệu của bạn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div
                    className={`bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer ${selectedFilter === "ALL" || selectedFilter === null ? 'ring-2 ring-[var(--clr-bg-1)]' : ''}`}
                    onClick={() => setSelectedFilter(selectedFilter === "ALL" || selectedFilter === null ? null : "ALL")}
                  >
                    <div>
                      <h4 className="text-gray-500 text-sm">Tổng đơn hàng</h4>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <div className="text-gray-400 bg-gray-50 rounded-full p-3">
                      <FontAwesomeIcon icon={faReceipt} className="text-lg" />
                    </div>
                  </div>

                  <div
                    className={`bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer ${selectedFilter === "PAID" ? 'ring-2 ring-[var(--clr-bg-1)]' : ''}`}
                    onClick={() => setSelectedFilter(selectedFilter === "PAID" ? "ALL" : "PAID")}
                  >
                    <div>
                      <h4 className="text-gray-500 text-sm">Đơn thành công</h4>
                      <p className="text-2xl font-bold text-green-600">{stats.successfulOrders}</p>
                    </div>
                    <div className="text-green-600 bg-green-50 rounded-full p-3">
                      <FaCheck className="text-lg" />
                    </div>
                  </div>

                  <div
                    className={`bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer ${selectedFilter === "FAILED" ? 'ring-2 ring-[var(--clr-bg-1)]' : ''}`}
                    onClick={() => setSelectedFilter(selectedFilter === "FAILED" ? "ALL" : "FAILED")}
                  >
                    <div>
                      <h4 className="text-gray-500 text-sm">Đơn lỗi TT</h4>
                      <p className="text-2xl font-bold text-yellow-500">{stats.failedOrders}</p>
                    </div>
                    <div className="text-yellow-500 bg-yellow-50 rounded-full p-3">
                      <FaExclamationTriangle className="text-lg" />
                    </div>
                  </div>

                  <div
                    className={`bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer ${selectedFilter === "CANCELED" ? 'ring-2 ring-[var(--clr-bg-1)]' : ''}`}
                    onClick={() => setSelectedFilter(selectedFilter === "CANCELED" ? "ALL" : "CANCELED")}
                  >
                    <div>
                      <h4 className="text-gray-500 text-sm">Đơn đã hủy</h4>
                      <p className="text-2xl font-bold text-red-500">{stats.canceledOrders}</p>
                    </div>
                    <div className="text-red-500 bg-red-50 rounded-full p-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-gray-500 text-sm">Tổng doanh thu</h4>
                      <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} đ</p>
                    </div>
                    <div className="text-[var(--clr-bg-1)] bg-gray-50 rounded-full p-3">
                      <FontAwesomeIcon icon={faChartLine} className="text-lg" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-gray-500 text-sm">Tổng điểm tích lũy</h4>
                      <p className="text-xs text-blue-500 mt-1">Quy đổi 1:1</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold mr-2">
                        {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"}
                      </p>
                      <div className="text-[var(--clr-bg-1)] bg-gray-50 rounded-full p-3">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </CustomerCard>

              {/* Orders List */}
              <CustomerCard
                title="Danh sách đơn hàng"
                subtitle={selectedFilter ? `Đang hiển thị đơn ${getStatusDisplay(selectedFilter).label.toLowerCase()}` : "Tất cả đơn hàng từ mã giới thiệu của bạn"}
                headerRightContent={
                  selectedFilter && (
                    <button
                      onClick={() => setSelectedFilter(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Xem tất cả
                    </button>
                  )
                }
              >
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--clr-bg-1)]"></div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-red-500 text-6xl mb-4">
                      <FaExclamationTriangle />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Không thể tải dữ liệu</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-gray-300 text-6xl mb-4">
                      <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Chưa có đơn hàng nào</h3>
                    <p className="text-gray-500">Hãy chia sẻ mã giới thiệu của bạn và bắt đầu nhận điểm.</p>
                    <button
                      onClick={copyReferralCode}
                      className="mt-6 px-4 py-2 bg-[var(--clr-bg-1)] text-white rounded-lg flex items-center"
                    >
                      <FaCopy className="mr-2" />
                      {copiedCode ? "Đã sao chép mã!" : "Sao chép mã giới thiệu"}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <AnimateGroup
                      staggerDelay={0.05}
                      childVariant="fade"
                      className="min-w-full bg-white"
                    >
                      <table className="min-w-full bg-white">
                        <thead className="border-b border-gray-200 bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Người đặt</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sự kiện</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng đơn</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredOrders.map((order, index) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-center text-sm text-gray-500">{index + 1}</td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.code}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {order.InfoUser?.name || "N/A"}
                                {order.InfoUser?.phone && (
                                  <div className="text-xs text-gray-400">{order.InfoUser.phone}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">{order.eventDetail?.title || "N/A"}</td>
                              <td className="py-3 px-4 text-center text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                              <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                                {order.total_price?.toLocaleString() || 0} đ
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(order.InfoOrderPayment?.status || "").color}`}>
                                  {getStatusDisplay(order.InfoOrderPayment?.status || "").label}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </AnimateGroup>
                  </div>
                )}
              </CustomerCard>
            </>
          ) :
            <>
              <CustomerCard className="relative overflow-hidden border-0 shadow-lg">
                {/* Background gradient and pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--clr-bg-1)]/5 to-[var(--clr-bg-7)]/10 z-0"></div>
                <div className="absolute inset-0 opacity-5 z-0"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                    backgroundSize: '20px 20px'
                  }}>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 -mt-10 -mr-10 opacity-10 transform rotate-12">
                  <FontAwesomeIcon icon={faUserPlus} className="w-full h-full text-[var(--clr-bg-1)]" />
                </div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 opacity-10 transform -rotate-12">
                  <FontAwesomeIcon icon={faGift} className="w-full h-full text-[var(--clr-bg-7)]" />
                </div>

                <div className="relative z-10 p-2">
                  {/* Header */}
                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <span className="bg-[var(--clr-bg-1)] text-white p-2 rounded-lg mr-3 shadow-md">
                        <FontAwesomeIcon icon={faUserPlus} className="text-lg" />
                      </span>
                      Đăng ký để trở thành CTV
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">Mở khóa đặc quyền và nhận thưởng từ mỗi lượt giới thiệu</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Content section */}
                    <div className="flex-1 space-y-4">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-gray-700 leading-relaxed">
                          Hãy trở thành Cộng Tác Viên của Queen Acoustic và nhận điểm thưởng khi bạn bè sử dụng mã giới thiệu của bạn để đặt vé tham gia sự kiện. Mỗi lượt đặt vé thành công không chỉ là niềm vui được lan tỏa mà còn giúp bạn tích lũy điểm để đổi lấy những phần quà hấp dẫn và ưu đãi độc quyền từ chúng tôi.
                        </p>
                      </div>

                      {/* Benefits section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-start p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                          <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">Tích lũy điểm thưởng</h3>
                            <p className="text-sm text-gray-600">Nhận điểm từ mỗi đơn hàng thành công</p>
                          </div>
                        </div>
                        <div className="flex items-start p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                          <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                            <FontAwesomeIcon icon={faGift} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">Đổi quà hấp dẫn</h3>
                            <p className="text-sm text-gray-600">Voucher và ưu đãi độc quyền</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action section */}
                    <div className="md:w-64 flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                      <div className="w-20 h-20 mb-4 text-[var(--clr-bg-1)]">
                        <FontAwesomeIcon icon={faRegistered} className="w-full h-full" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Bắt đầu ngay hôm nay</h3>
                      <p className="text-sm text-gray-600 text-center mb-6">Chỉ mất vài phút để đăng ký và bắt đầu kiếm điểm</p>

                      <motion.button
                        onClick={() => setShowRegisterCTV(true)}
                        className="w-full px-6 py-3 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors flex items-center justify-center shadow-md while-hover:scale-105 whitespace-nowrap"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                        Đăng ký Cộng Tác Viên
                      </motion.button>
                    </div>
                  </div>
                </div>
              </CustomerCard>
            </>
          }
        </AnimateGroup>
      )}

      {/* Render modals */}
      {showVoucherModal && <VoucherModal />}
      {showCashModal && <CashModal showCashModal={showCashModal} setShowCashModal={setShowCashModal} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} userInfo={userInfo} />}
      {showRegisterCTV && <RegisterCTV showRegisterCTV={showRegisterCTV} setShowRegisterCTV={setShowRegisterCTV} dataMyInfo={dataMyInfo} handleRegisterCTV={handleRegisterCTV} />}

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
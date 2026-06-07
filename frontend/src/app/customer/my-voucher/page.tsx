"use client";

import React, { useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import { AppContext } from "@/context/AppContext";
import { formatDate } from "@/utils/date";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  CustomerPageLayout, 
  CustomerCard, 
  CustomerCardButton,
  CustomerSnackbar
} from "@/components/CustomerLayout";
import { 
  MdConfirmationNumber as FaTicket, 
  MdAccessTime as FaClock, 
  MdCalendarToday as FaCalendarAlt, 
  MdPercent as FaPercentage, 
  MdVisibility as FaEye, 
  MdContentCopy as FaCopy, 
  MdFilterList as FaFilter,
  MdSearch as FaSearch,
  MdLocalOffer as FaTag
} from "react-icons/md";
import { Animate, AnimateGroup } from "@/components/ui/animate";

// Enums matching backend
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

// Interfaces for typings
interface PurchaseHistory {
  ctv_id: string;
  code: string;
  purchase_date: string;
  status: Status;
  _id: string;
}

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
  for: CustomerType;
  total: number;
  createdAt: string;
  purchased_by: string[];
  purchase_history: PurchaseHistory[];
}

interface PromotionResponse {
  promotion: PromotionType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

enum VoucherStatus {
  EXPIRED = "EXPIRED",
  INACTIVE = "INACTIVE",
  USED = "USED",
  ACTIVE = "ACTIVE"
}

interface FilterParams {
  status?: VoucherStatus;
  for?: CustomerType;
  expired?: string;
  page: number;
  limit: number;
  orderBy?: string;
}

export default function MyPromotionsPage() {
  const { userInfo, isLogin } = useContext(AppContext);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [promotions, setPromotions] = useState<PromotionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
  });
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionType | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // New state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  // Fetch promotions with filters
  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters and handle status filtering
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'status' && value) {
          // Don't append status to query params as we'll handle it client-side
          return;
        }
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`promotion/GetMyPromotion?${queryParams.toString()}`);
      
      if (response.status === 200) {
        const data: PromotionResponse = response.data;
        let filteredPromotions = data.promotion;
        
        // Filter based on selected status
        if (filters.status) {
          filteredPromotions = filteredPromotions.filter(promotion => {
            const userPurchase = promotion.purchase_history.find(
              ph => promotion.purchased_by.includes(userInfo?._id || '')
            );
            if (!userPurchase) return false;

            const expDate = new Date(promotion.expired);
            expDate.setHours(0, 0, 0, 0);
            
            switch (filters.status) {
              case VoucherStatus.EXPIRED:
                return isExpired(promotion.expired);
              case VoucherStatus.INACTIVE:
                return promotion.status === Status.INACTIVE;
              case VoucherStatus.USED:
                return userPurchase.status !== Status.ACTIVE;
              case VoucherStatus.ACTIVE:
                return currentDate < expDate && 
                       promotion.status === Status.ACTIVE && 
                       userPurchase.status === Status.ACTIVE;
              default:
                return true;
            }
          });
        }

        // Extract purchase history for filtered promotions
        const allPurchaseHistory: PurchaseHistory[] = [];
        filteredPromotions.forEach(promo => {
          if (promo.purchase_history) {
            const userPurchases = promo.purchase_history.filter(purchase => 
              promo.purchased_by.includes(userInfo?._id || '') && 
              purchase.ctv_id === userInfo?._id
            );
            allPurchaseHistory.push(...userPurchases);
          }
        });

        // Sort purchase history by purchase date (most recent first)
        allPurchaseHistory.sort((a, b) => 
          new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
        );

        setPurchaseHistory(allPurchaseHistory);
        setPromotions(filteredPromotions);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        setError('Failed to fetch promotions');
        showSnackbar('Failed to fetch promotions', false);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('An error occurred while fetching promotions');
      showSnackbar('An error occurred while fetching promotions', false);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    // Fetch promotions when filters change
    fetchPromotions();
  }, [filters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  // Handle filter change
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1, // Reset page when filter changes
    }));
  };

  // Copy promotion code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code.trim()).then(
      () => {
        setCopiedCode(true);
        showSnackbar('Mã giảm giá đã được sao chép!', true);
        setTimeout(() => setCopiedCode(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        showSnackbar('Không thể sao chép mã', false);
      }
    );
  };

  const showSnackbar = (message: string, success: boolean) => {
    setSnackbarMessage(message);
    setSnackbarSuccess(success);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  // View promotion code
  const handleViewCode = (promotion: PromotionType) => {
    setSelectedPromotion(promotion);
    setShowCodeModal(true);
    setCopiedCode(false);
  };

  // Format price display based on promotion type
  const formatPromotionPrice = (promotion: PromotionType) => {
    if (promotion.type_price === TypePromotion.PERCENT) {
      return `${promotion.price}%`;
    } else {
      return `${promotion.price.toLocaleString('vi-VN')} đ`;
    }
  };

  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-rose-600 text-white'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    );

    return pages;
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const isPromotionActive = (promotion: any) => {
    // check promotion.expired + 7 tiếng > ngày hiện tại

    // TODO: check promotion.expired có < ngày hiện tại không (không so sánh giờ), nếu < thì return false, ngược tại return true

    const expDate = new Date(promotion.expired);

    console.log('expDate', expDate.toString())

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('today', today.toString())


    if (today > expDate) {
      return false
    }

    if (promotion.status == Status.INACTIVE) {
      return false;
    }

    if (promotion.status == Status.ACTIVE) {
      if (promotion.max_quantity == 0) {
        return false;
      }
    }

    return true;
  }

  // Function to determine status badge color
  const getPromotionStatus = (promotion: PromotionType, userPurchase: PurchaseHistory) => {
    // Check if expired
    const expDate = new Date(promotion.expired);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isExpired(promotion.expired)) {
      return {
        text: 'Hết hạn',
        color: 'bg-red-100 text-red-800'
      };
    }

    // Check if inactive
    if (promotion.status === Status.INACTIVE) {
      return {
        text: 'Không hoạt động',
        color: 'bg-gray-100 text-gray-800'
      };
    }

    // Check if used
    if (userPurchase.status !== Status.ACTIVE) {
      return {
        text: 'Đã sử dụng',
        color: 'bg-yellow-100 text-yellow-800'
      };
    }

    // If none of the above, it's active
    return {
      text: 'Hoạt động',
      color: 'bg-green-100 text-green-800'
    };
  };

  return (
    <CustomerPageLayout
      title="Lịch Sử Mua Voucher"
      subtitle="Danh sách mã giảm giá bạn đã mua"
      description="Trang quản lý lịch sử mua voucher tại Queen Acoustic"
      isLoading={pageLoading}
    >
      <AnimatePresence>
        <CustomerCard className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <h3 className="text-lg font-medium">Bộ lọc</h3>
            </div>
            
            <div className="w-full md:w-auto grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  onChange={(e) => handleFilterChange('status', e.target.value as VoucherStatus)}
                  value={filters.status || ""}
                >
                  <option value="">Tất cả</option>
                  <option value={VoucherStatus.ACTIVE}>Hoạt động</option>
                  <option value={VoucherStatus.EXPIRED}>Hết hạn</option>
                  <option value={VoucherStatus.INACTIVE}>Không hoạt động</option>
                  <option value={VoucherStatus.USED}>Đã sử dụng</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
            </div>
          ) : promotions.length > 0 ? (
            <AnimateGroup staggerDelay={0.08} containerVariant="fade" childVariant="slide-up">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tên Voucher
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Mã giảm giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Ngày hết hạn
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promotions.map((promotion, index) => {
                      // Find all purchase histories for current user where ctv_id matches
                      const userPurchases = promotion.purchase_history.filter(
                        ph => promotion.purchased_by.includes(userInfo?._id || '') && 
                             ph.ctv_id === userInfo?._id
                      );
                      
                      if (userPurchases.length === 0) return null;

                      return userPurchases.map((userPurchase) => (
                        <tr key={userPurchase._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {promotion.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {userPurchase.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {new Date(promotion.expired).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(() => {
                              const status = getPromotionStatus(promotion, userPurchase);
                              return (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                  {status.text}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => copyToClipboard(userPurchase.code)}
                              className="flex mx-auto items-center px-3 py-1 text-sm text-rose-600 hover:text-rose-700 focus:outline-none"
                            >
                              <FaCopy className="mr-1" />
                              Sao chép
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </AnimateGroup>
          ) : (
            <Animate variant="fade" duration={0.8}>
              <div className="text-center py-8">
                <p className="text-gray-500">Bạn chưa mua mã giảm giá nào</p>
              </div>
            </Animate>
          )}
        </CustomerCard>
      </AnimatePresence>

      <CustomerSnackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={closeSnackbar}
        isSuccess={snackbarSuccess}
      />
    </CustomerPageLayout>
  );
}
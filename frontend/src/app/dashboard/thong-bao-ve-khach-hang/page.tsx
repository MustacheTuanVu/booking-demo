"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { formatDate } from "@/utils/date";
import * as XLSX from 'xlsx';

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
  guest?: {
    is_guest: boolean;
    expiry: Date;
  };
  IncomInfo?: any[];
}

interface CustomerResponse {
  userModels: Customer[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const RecentCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>("all"); // "all", "today", "yesterday", "dayBeforeYesterday"
  const [searchQuery, setSearchQuery] = useState<string>("");

  const router = useRouter();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Getting current date for filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Set time_from and time_to based on active filter
      let time_from, time_to;

      switch (activeFilter) {
        case "today":
          time_from = today.toISOString();
          time_to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          break;
        case "yesterday":
          time_from = yesterday.toISOString();
          time_to = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          break;
        case "dayBeforeYesterday":
          time_from = dayBeforeYesterday.toISOString();
          time_to = new Date(dayBeforeYesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          break;
        default:
          time_from = threeDaysAgo.toISOString();
          time_to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          break;
      }

      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(limit),
        time_from,
        time_to,
      });

      if (searchQuery) {
        queryParams.append("query", searchQuery);
      }

      const res = await api.get(`users/getUserByQuery?${queryParams.toString()}`);
      const data: CustomerResponse = res.data;
      setCustomers(data.userModels);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, activeFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchCustomers();
  };

  const getFilterButtonClass = (filter: string) => {
    return activeFilter === filter
      ? "bg-gold-500 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300";
  };

  const exportToExcel = async (filterType: string) => {
    setLoading(true);
    try {
      // Getting current date for filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Set time_from and time_to based on filter
      let time_from, time_to, fileName;

      switch (filterType) {
        case "today":
          time_from = today.toISOString();
          time_to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          fileName = `Khách_hàng_Hôm_nay_${new Date().toISOString().split('T')[0]}`;
          break;
        case "yesterday":
          time_from = yesterday.toISOString();
          time_to = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          fileName = `Khách_hàng_Hôm_qua_${yesterday.toISOString().split('T')[0]}`;
          break;
        case "dayBeforeYesterday":
          time_from = dayBeforeYesterday.toISOString();
          time_to = new Date(dayBeforeYesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          fileName = `Khách_hàng_Hôm_kia_${dayBeforeYesterday.toISOString().split('T')[0]}`;
          break;
        default:
          time_from = threeDaysAgo.toISOString();
          time_to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          fileName = `Khách_hàng_3_ngày_gần_đây`;
          break;
      }

      // Fetch all customers for the selected time period (no pagination)
      const res = await api.get(`users/getUserByQuery?page=1&limit=9999&time_from=${time_from}&time_to=${time_to}`);
      const data: CustomerResponse = res.data;

      // Prepare data for Excel export
      const exportData = data.userModels.map((customer) => ({
        'Họ tên': customer.name,
        'Số điện thoại': customer.phone,
        'Email': customer.email,
        'Hạng thẻ': customer.customer_type || 'J',
        'Ngày hết hạn thẻ': customer.customer_type_expiry ? new Date(customer.customer_type_expiry).toLocaleDateString() : 'N/A',
        'Khách mời': customer.guest?.is_guest ? 'Có' : 'Không',
        'Điểm tích lũy': customer.point || 0,
        'Mã giới thiệu': customer.referral_code || 'N/A',
        'Trạng thái': customer.isDelete === 'ACTIVE' ? 'Hoạt động' :
          customer.isDelete === 'INACTIVE' ? 'Tạm khóa' :
            customer.isDelete === 'DELETE' ? 'Đã xóa' : 'N/A',
        'Ngày tạo': customer.createdAt ? new Date(customer.createdAt).toLocaleString() : 'N/A',
        'Cập nhật lúc': customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : 'N/A',
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');

      // Generate Excel file
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel", error);
      alert("Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const formatUpdatedDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateOnly.getTime() === today.getTime()) {
      return "Hôm nay - " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return "Hôm qua - " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dateOnly.getTime() === dayBeforeYesterday.getTime()) {
      return "Hôm kia - " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const isValidGuest = (customer: any) => {
    if (!customer.guest) return false;

    const isGuest = customer.guest.is_guest === true;
    const hasValidExpiry = customer.guest.expiry && new Date(customer.guest.expiry) > new Date();

    return isGuest && hasValidExpiry;
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Khách hàng Gần đây | Queen Acoustic</title>
      <meta name="description" content="Danh sách khách hàng đã cập nhật trong 3 ngày qua." />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl font-bold mb-3">Khách hàng Gần đây</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push("/dashboard/customer")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center"
              >
                Xem tất cả khách hàng
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số điện thoại"
                className="p-2 border rounded flex-grow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded ${getFilterButtonClass("all")}`}
                >
                  Tất cả (3 ngày)
                </button>
                <button
                  onClick={() => setActiveFilter("today")}
                  className={`px-4 py-2 rounded ${getFilterButtonClass("today")}`}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setActiveFilter("yesterday")}
                  className={`px-4 py-2 rounded ${getFilterButtonClass("yesterday")}`}
                >
                  Hôm qua
                </button>
                <button
                  onClick={() => setActiveFilter("dayBeforeYesterday")}
                  className={`px-4 py-2 rounded ${getFilterButtonClass("dayBeforeYesterday")}`}
                >
                  Hôm kia
                </button>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => exportToExcel(activeFilter)}
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Customer count and export controls */}
          <div className="mb-4 bg-gray-100 p-3 rounded-lg flex flex-col md:flex-row justify-between items-center">
            <p className="font-semibold">Tổng số: <span className="text-gold-500">{total}</span> khách hàng</p>

            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => exportToExcel("today")}
                disabled={loading}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded disabled:opacity-70"
                title="Xuất Excel cho khách hàng Hôm nay"
              >
                Excel Hôm nay
              </button>
              <button
                onClick={() => exportToExcel("yesterday")}
                disabled={loading}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded disabled:opacity-70"
                title="Xuất Excel cho khách hàng Hôm qua"
              >
                Excel Hôm qua
              </button>
              <button
                onClick={() => exportToExcel("dayBeforeYesterday")}
                disabled={loading}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded disabled:opacity-70"
                title="Xuất Excel cho khách hàng Hôm kia"
              >
                Excel Hôm kia
              </button>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500"></div>
            </div>
          )}

          {/* Customer table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-2 px-4 border">Họ tên</th>
                    <th className="py-2 px-4 border">SĐT</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Hạng thẻ</th>
                    <th className="py-2 px-4 border">Cập nhật lúc</th>
                    <th className="py-2 px-4 border">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{customer.name}</td>
                        <td className="py-2 px-4">{customer.phone}</td>
                        <td className="py-2 px-4">{customer.email}</td>
                        <td className="py-2 px-4 text-center">
                          {getCustomerTypeLabel(customer.customer_type || "J")}
                          {customer.customer_type_expiry && (
                            <div className="text-xs text-gray-500">
                              Hết hạn: {new Date(customer.customer_type_expiry).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <span className="font-medium">{formatUpdatedDate(customer.updatedAt)}</span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isValidGuest(customer) ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Khách mời
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {customer.isDelete === "ACTIVE" ? "Hoạt động" :
                                customer.isDelete === "INACTIVE" ? "Tạm khóa" :
                                  customer.isDelete === "DELETE" ? "Đã xóa" : "N/A"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        Không có khách hàng nào được cập nhật trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && customers.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-70"
              >
                Trang trước
              </button>
              <span>
                Trang {page + 1} / {Math.max(1, Math.ceil(total / limit))}
              </span>
              <button
                onClick={() => setPage((prev) => (customers.length < limit ? prev : prev + 1))}
                disabled={customers.length < limit}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-70"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCustomersPage;
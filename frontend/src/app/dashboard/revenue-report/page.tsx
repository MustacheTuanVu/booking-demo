"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/utils/api";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";

interface RevenueReport {
  totalRevenue: number;
  orderRevenue: number;
  membershipRevenue: number;
  orders: {
    _id: string;
    createdAt: string;
    total_price?: number;
  }[];
  membershipLogs: {
    _id: string;
    createdAt: string;
    price?: number;
  }[];
}

const RevenueReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState("2025-03-01T00:00:00Z");
  const [endDate, setEndDate] = useState("2025-03-31T00:00:00Z");
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `analytics/GetRevenueReport?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );
      setReport(res.data);
    } catch (error) {
      console.error("Error fetching revenue report", error);
      setSnackbarMsg("Lỗi tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };
  const formatMonth = (tick: string) => {
    const [year, month] = tick.split('-');
    return `${month}/${year}`;
  };
  const formatWeek = (week: string) => {
    const [start, end] = week.split(" - ");
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatDate = (date: Date) =>
      `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  // Nhóm doanh thu theo tháng
  const getMonthlyData = () => {
    const monthlyMap: { [month: string]: number } = {};

    // Tạo đủ 12 tháng mặc định với doanh thu = 0
    const currentYear = new Date().getFullYear();
    for (let i = 1; i <= 12; i++) {
      const month = `${currentYear}-${i.toString().padStart(2, "0")}`;
      monthlyMap[month] = 0;
    }

    if (report) {
      report.orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        monthlyMap[month] += Number(order.total_price || 0);
      });

      report.membershipLogs.forEach((log) => {
        const date = new Date(log.createdAt);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        monthlyMap[month] += Number(log.price || 0);
      });
    }

    return Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));
  };

  // Nhóm doanh thu theo tuần
  const getWeeklyData = () => {
    const weeklyMap: { [weekRange: string]: number } = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Lấy ngày đầu tiên của tháng hiện tại
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const weeks: string[] = [];

    // Tạo 4 tuần mặc định
    for (let i = 0; i < 4; i++) {
      const startOfWeek = new Date(firstDayOfMonth);
      startOfWeek.setDate(firstDayOfMonth.getDate() + i * 7);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const weekLabel = `${startOfWeek.toISOString().split("T")[0]} - ${endOfWeek.toISOString().split("T")[0]}`;
      weeks.push(weekLabel);
      weeklyMap[weekLabel] = 0;
    }

    if (report) {
      report.orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const weekRange = weeks.find((week) => {
          const [start, end] = week.split(" - ");
          return date >= new Date(start) && date <= new Date(end);
        });
        if (weekRange) {
          weeklyMap[weekRange] += Number(order.total_price || 0);
        }
      });

      report.membershipLogs.forEach((log) => {
        const date = new Date(log.createdAt);
        const weekRange = weeks.find((week) => {
          const [start, end] = week.split(" - ");
          return date >= new Date(start) && date <= new Date(end);
        });
        if (weekRange) {
          weeklyMap[weekRange] += Number(log.price || 0);
        }
      });
    }

    return Object.entries(weeklyMap).map(([week, revenue]) => ({ week, revenue }));
  };

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Grid chia sidebar và nội dung chính */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>
        {/* Nội dung chính */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          <h1 className="text-3xl font-bold text-center mb-4">Báo cáo doanh thu</h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 mb-4">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
            <button
              onClick={loadReport}
              disabled={loading}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                "Bộ Lọc"
              )}
            </button>
          </div>
          {report && (
            <div className="text-center mb-4">
              <p className="text-lg font-semibold">
                Tổng doanh thu: {report.totalRevenue.toLocaleString()} đ
              </p>
              <p className="text-base">
                Doanh thu đơn hàng: {report.orderRevenue.toLocaleString()} đ
              </p>
              <p className="text-base">
                Doanh thu hạng thẻ: {report.membershipRevenue.toLocaleString()} đ
              </p>
            </div>
          )}
          {report && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Biểu đồ doanh thu theo tháng</h2>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 15, dy: 5 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 13, dy: 5 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label: string) => formatMonth(label)}
                    />
                    {/* <Legend wrapperStyle={{ marginTop: 20 }} /> */}
                    <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" barSize={70}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {report && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-2">Biểu đồ doanh thu theo tuần</h2>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tickFormatter={formatWeek} tick={{ fontSize: 15, dy: 5 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 13, dy: 5 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label: string) => formatWeek(label)}
                    />
                    {/* <Legend wrapperStyle={{ marginTop: 20 }} /> */}
                    <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" barSize={70} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      {snackbarMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
          <span>{snackbarMsg}</span>
          <button onClick={() => setSnackbarMsg("")} className="ml-2 text-sm underline">
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default RevenueReportPage;

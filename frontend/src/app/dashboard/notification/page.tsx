"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import NotificationCard from "@/components/Dashboard/ui/NotificationCard";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: number;
  content: {
    phone: string;
    email: string;
    orderId: string;
    status: boolean;
  };
}

export default function NotificationListPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const router = useRouter();

  // Lấy dữ liệu từ localStorage khi component được mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("paidInvoiceMsg");
      if (storedData) {
        const parsedData: NotificationItem[] = JSON.parse(storedData);
        setNotifications(parsedData);
        setTotal(parsedData.length);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ localStorage:", error);
      showNotification("error", "Có lỗi xảy ra khi tải thông báo.");
    }
  }, []);

  // Hàm xử lý xóa thông báo
  const handleDeleteNotification = (id: number) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Hàm xử lý xóa thông báo sau khi xác nhận
  const confirmDeleteNotification = () => {
    if (notificationToDelete) {
      try {
        // Lọc thông báo cần xóa khỏi danh sách
        const updatedNotifications = notifications.filter(
          (notification) => notification.id !== notificationToDelete
        );

        // Cập nhật state và localStorage
        setNotifications(updatedNotifications);
        localStorage.setItem(
          "paidInvoiceMsg",
          JSON.stringify(updatedNotifications)
        );

        setTotal(updatedNotifications.length);
        showNotification("success", "Đã xóa thông báo thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
        showNotification("error", "Có lỗi xảy ra khi xóa thông báo.");
      }
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Hàm xử lý xóa tất cả thông báo
  const handleClearAllNotifications = () => {
    setDeleteAllDialogOpen(true);
  };

  // Hàm xử lý xóa tất cả thông báo sau khi xác nhận
  const confirmClearAllNotifications = () => {
    try {
      // Xóa tất cả thông báo
      setNotifications([]);
      localStorage.setItem("paidInvoiceMsg", JSON.stringify([]));
      setTotal(0);
      showNotification("success", "Đã xóa tất cả thông báo thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa tất cả thông báo:", error);
      showNotification("error", "Có lỗi xảy ra khi xóa tất cả thông báo.");
    }
    setDeleteAllDialogOpen(false);
  };

  // Tính toán các thông báo để hiển thị dựa trên phân trang
  const paginatedNotifications = notifications.slice(
    page * limit,
    (page + 1) * limit
  );

  const handleRouter = (id: any) => {
    router.push('/ve/' + id);
  }

  // Show notification helper
  const showNotification = (severity: "success" | "error" | "info" | "warning", message: string) => {
    setSnackbarSeverity(severity);
    setSnackbarMsg(message);
    setSnackbarOpen(true);
  };

  return (
    <div className="container mx-auto my-4 px-4 text-gray-900">
      <title>Danh sách thông báo | Queen Acoustic</title>
      <meta
        name="description"
        content="Trang danh sách thông báo tại Queen Acoustic."
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Dashboard Header */}
          <DashboardHeader
            title="Thông báo"
            searchEnabled={false}
            addEnabled={false}
            extraButtons={
              notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Xóa tất cả</span>
                </button>
              )
            }
          />

          {/* Notification List */}
          {notifications.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paginatedNotifications.map((notification: any) => (
                  <NotificationCard
                    key={notification.id}
                    id={notification.id}
                    content={notification.content}
                    onDelete={handleDeleteNotification}
                    onClick={handleRouter}
                  />
                ))}
              </div>

              {/* Pagination */}
              {notifications.length > limit && (
                <div className="mt-6">
                  <PaginationControls
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Không có thông báo nào"
              subtitle="Bạn chưa có thông báo nào"
              icon={faBell}
              minHeight="400px"
            />
          )}
        </div>
      </div>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteNotification}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thông báo này?"
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        onConfirm={confirmClearAllNotifications}
        title="Xác nhận xóa tất cả"
        message="Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa tất cả"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />
    </div>
  );
}
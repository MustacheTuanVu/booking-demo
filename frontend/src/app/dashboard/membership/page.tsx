"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { formatMoney } from "@/utils/money";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faEdit } from "@fortawesome/free-solid-svg-icons";

// UI Components
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";
import { cn } from "@/lib/utils";

interface MembershipPrice {
  _id: string;
  type: string;
  priceInMonth: number;
  duration: string;
}

const MembershipPage: React.FC = () => {
  const [memberships, setMemberships] = useState<MembershipPrice[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingMembership, setEditingMembership] = useState<MembershipPrice | null>(null);
  const [formattedPrice, setFormattedPrice] = useState<string>('0');
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("Q");

  // Fetch membership prices
  const fetchMemberships = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("membership_prices");
      // Chỉ hiển thị loại Q và K
      const filteredMemberships = res.data.filter(
        (membership: MembershipPrice) => membership.type === "Q" || membership.type === "K"
      );
      setMemberships(filteredMemberships);
    } catch (error) {
      console.error("Error fetching memberships", error);
      setSnackbarMsg("Không thể tải dữ liệu thành viên. Vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingMembership(null);
    setSelectedType("Q"); // Reset to default
    setFormattedPrice('0');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as any;
    // Convert formatted price back to number by removing commas
    const priceValue = formattedPrice.replace(/\./g, '').replace(/,/g, '');

    const membershipData = {
      type: selectedType,
      priceInMonth: Number(priceValue),
      duration: form.duration.value
    };

    try {
      if (editingMembership) {
        // Cập nhật membership hiện có
        await api.put(`membership_prices/${editingMembership._id}`, membershipData);
        setSnackbarMsg("Cập nhật hạng thành viên thành công!");
      } else {
        // Tạo membership mới
        await api.post("membership_prices", membershipData);
        setSnackbarMsg("Tạo hạng thành viên mới thành công!");
      }
      handleDialogClose();
      fetchMemberships();
    } catch (error) {
      console.error("Error saving membership", error);
      setSnackbarMsg("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleEdit = (membership: MembershipPrice) => {
    setEditingMembership(membership);
    setSelectedType(membership.type);
    setFormattedPrice(membership.priceInMonth.toLocaleString('vi-VN'));
    setOpenDialog(true);
  };

  const getMembershipTypeLabel = (type: string) => {
    switch (type) {
      case "Q":
        return "Queen (Q)";
      case "K":
        return "King (K)";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quản lý Hạng thẻ thành viên | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý hạng thẻ thành viên tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Dashboard Header */}
          <DashboardHeader
            title="Quản lý Hạng thẻ thành viên"
            searchEnabled={false}
            addEnabled={false}
            className="mb-6"
          />

          {/* Luxury Card Display for Membership Levels */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memberships.length > 0 ? (
                memberships.map((membership) => (
                  <div
                    key={membership._id}
                    className={cn(
                      "relative overflow-hidden bg-white rounded-xl shadow-md border transition-all duration-300 hover:shadow-lg",
                      membership.type === 'K'
                        ? "border-gold-400 hover:border-gold-500"
                        : "border-gray-200 hover:border-gold-300"
                    )}
                  >
                    {/* Premium top accent bar */}
                    <div
                      className={cn(
                        "h-2 w-full",
                        membership.type === 'K'
                          ? "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400"
                          : "bg-gradient-to-r from-gray-300 via-gold-300 to-gray-300"
                      )}
                    ></div>

                    <div className="p-6">
                      {/* Membership Type Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-full w-16 h-16 shadow-md",
                            membership.type === 'K'
                              ? "bg-gradient-to-br from-gold-300 to-gold-600 text-white"
                              : "bg-gradient-to-br from-gray-200 to-gray-500 text-white"
                          )}
                        >
                          <FontAwesomeIcon
                            icon={faCrown}
                            className={cn(
                              "h-10 w-10",
                              membership.type === 'K' ? "text-white" : "text-white"
                            )}
                          />
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(membership)}
                          className="flex items-center justify-center p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gold-300 transition-colors"
                          aria-label="Edit membership"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Membership Details */}
                      <div className="space-y-4">
                        <div>
                          <h3 className={cn(
                            "text-2xl font-bold",
                            membership.type === 'K' ? "text-gold-700" : "text-gray-700"
                          )}>
                            {getMembershipTypeLabel(membership.type)}
                          </h3>
                          <div className="mt-4 text-md text-gray-500">
                            Kỳ hạn: {membership.duration === 'year' ? 'Năm' : membership.duration === 'month' && 'Tháng'}
                          </div>
                        </div>

                        {/* Price Display */}
                        <div>
                          <div className="text-md text-gray-500 mb-2">Giá thành viên:</div>
                          <div className={cn(
                            "text-3xl font-bold",
                            membership.type === 'K' ? "text-gold-600" : "text-gray-700"
                          )}>
                            {formatMoney(membership.priceInMonth)}
                            <span className="text-sm font-normal text-gray-500 ml-1">/{membership.duration === 'month' ? 'tháng' : membership.duration === 'year' ? 'năm' : ''}</span>
                          </div>
                        </div>

                        {/* Premium visual elements */}
                        {membership.type === 'K' && (
                          <div className="absolute top-20 right-0 w-32 h-32 opacity-5">
                            <FontAwesomeIcon icon={faCrown} className="w-full h-full text-gold-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <FontAwesomeIcon icon={faCrown} className="text-gray-400 h-8 w-8" />
                    </div>
                    <p className="text-gray-600 font-medium">Không có dữ liệu hạng thành viên</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modern Dialog for editing membership */}
      <StandardDialog
        open={openDialog}
        onClose={handleDialogClose}
        disableBackdropClick={true}
        title={editingMembership ? "Cập nhật Hạng thành viên" : "Thêm Hạng thành viên"}
        maxWidth="md"
        className="overflow-visible"
        // headerClassName="bg-gradient-to-r from-gold-500 to-gold-400 text-white py-4"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Membership Type Preview */}
          <div className="flex justify-center -mt-16 mb-6">
            <div
              className={cn(
                "flex items-center justify-center rounded-full w-24 h-24 shadow-lg border-4 border-white membership-type-badge relative mt-16",
                editingMembership?.type === 'K' || (!editingMembership && selectedType === 'K')
                  ? "bg-gradient-to-br from-gold-300 to-gold-600 text-white"
                  : "bg-gradient-to-br from-gray-200 to-gray-500 text-white"
              )}
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-md"></div>
              <FontAwesomeIcon
                icon={faCrown}
                className="h-10 w-20 text-white relative z-10"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-inner space-y-5">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Loại thành viên
              </label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:border-gold-500 focus:ring focus:ring-gold-200 focus:ring-opacity-50 transition-colors bg-white"
                  value={selectedType}
                  required
                  onChange={(e) => {
                    // Update the selectedType state to trigger re-render of the badge
                    setSelectedType(e.target.value);
                  }}
                >
                  <option value="Q">Queen (Q)</option>
                  <option value="K">King (K)</option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faCrown} className="text-gold-500 h-5 w-5" />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Chọn loại thành viên phù hợp với cấp độ ưu đãi</p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 my-2">
                Kỳ hạn
              </label>
              <div className="relative">
                <select
                  id="duration"
                  name="duration"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:border-gold-500 focus:ring focus:ring-gold-200 focus:ring-opacity-50 transition-colors bg-white"
                  defaultValue={editingMembership?.duration || "month"}
                  required
                >
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Chọn kỳ hạn thanh toán cho thành viên</p>
            </div>

            <div>
              <label htmlFor="priceInMonth" className="block text-sm font-medium text-gray-700 mb-2">
                Giá tiền (VNĐ)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="priceInMonth"
                  name="priceInMonth"
                  value={formattedPrice}
                  onChange={(e) => {
                    // Only allow numbers and format with commas
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      setFormattedPrice('0');
                    } else {
                      setFormattedPrice(Number(value).toLocaleString('vi-VN'));
                    }
                  }}
                  placeholder="Giá theo tháng"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:border-gold-500 focus:ring focus:ring-gold-200 focus:ring-opacity-50 transition-colors bg-white"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 font-medium">đ</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Nhập giá tiền thẻ thành viên</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-3 border-t border-gray-100">
            <DialogActionButton
              onClick={handleDialogClose}
              variant="outline"
            >
              Hủy
            </DialogActionButton>
            <DialogActionButton
              type="submit"
              variant="primary"
              onClick={() => {}}
            >
              {editingMembership ? "Cập nhật" : "Thêm mới"}
            </DialogActionButton>
          </div>
        </form>
      </StandardDialog>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={!!snackbarMsg}
        message={snackbarMsg}
        severity="success"
        onClose={() => setSnackbarMsg("")}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default MembershipPage;
"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/api";
import { AppContext } from "@/context/AppContext";
import { motion, Variants } from "framer-motion";
import { FaUser, FaSave, FaEdit, FaEnvelope, FaPhone, FaCreditCard, FaTimes, FaLock, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import {
  CustomerPageLayout,
  CustomerCard,
  CustomerCardButton,
  CustomerSnackbar
} from "@/components/CustomerLayout";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, TextField } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Animate } from "@/components/ui/animate";

const MyInfoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    identity_number: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);
  const { userInfo, saveUserInfo, isLogin, saveIsLogin } = useContext(AppContext);
  
  // Password change state
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const checkUserInfo = async () => {
    try {
      const res = await api.get("auth/getUserByJWT");
      saveUserInfo(res.data);
      saveIsLogin(true);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        identity_number: res.data.identity_number || "",
      });
      setPageLoading(false);
    } catch (error: any) {
      if (error.response && error.response.status !== 400) {
        console.error("Lỗi kiểm tra đăng nhập:", error);
      }
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      checkUserInfo();
    } else {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        address: userInfo.address || "",
        identity_number: userInfo.identity_number || "",
      });
      setPageLoading(false);
    }
  }, [isLogin, userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (passwordError) setPasswordError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("users/updateUserInfo", formData);
      setSnackbarMessage("Cập nhật thông tin thành công!");
      setSnackbarSuccess(true);
      setSnackbarOpen(true);
      setEditMode(false);
      // Cập nhật lại thông tin sau khi sửa
      checkUserInfo();
    } catch (error) {
      console.error("Error updating user info", error);
      setSnackbarMessage("Cập nhật thông tin thất bại!");
      setSnackbarSuccess(false);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setPasswordData({ password: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      return;
    }
    
    // Validate password length
    if (passwordData.password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    setPasswordLoading(true);
    try {
      const response = await api.post('/auth/changePassword?newPass='+ passwordData.password);
      if (response.status === 200) {
        setPasswordSuccess(true);
        setPasswordError("");
        // Close dialog after 2 seconds of showing success
        setTimeout(() => {
          setOpenDialog(false);
          setPasswordSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setPasswordError("Mật khẩu không hợp lệ, vui lòng thử lại!");
      } else {
        setPasswordError("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Animation variants
  const containerVariants: Variants ={
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const profileVariants: Variants ={
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2
      }
    }
  };

  // Generate initials from name
  const getInitials = () => {
    if (!formData.name) return "QA";

    const names = formData.name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <CustomerPageLayout
      title="Thông tin cá nhân"
      subtitle="Quản lý và cập nhật thông tin cá nhân của bạn"
      description="Trang thông tin cá nhân tại Queen Acoustic."
      isLoading={pageLoading}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-8 grid-cols-1 md:grid-cols-7 md:h-full md:items-stretch"
      >
        {/* Profile Summary Card - increase column span to give more space */}
        <motion.div variants={itemVariants} className="md:col-span-3 h-full flex">
          <CustomerCard className="w-full h-full flex flex-col">
            <div className="flex flex-col items-center py-6 px-2 sm:px-4 flex-grow">
              <motion.div
                variants={profileVariants}
                className="mb-4 relative"
              >
                {/* Profile Badge with Initials */}
                <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--clr-bg-1)] to-[var(--clr-bg-7)] text-white shadow-lg">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{getInitials()}</span>
                    <FaCreditCard className="mt-2" size={24} />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-xl font-semibold text-gray-800 mt-2">{formData.name || "Chưa cập nhật"}</h2>
              <p className="text-gray-500 mb-4">Hạng Thẻ {userInfo?.customer_type || "J"}</p>

              <div className="w-full space-y-3 md:my-7 my-2 px-4 flex-grow">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-3 text-gray-400" />
                  <span className="text-sm truncate">{formData.email || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-3 text-gray-400" />
                  <span className="text-sm">{formData.phone || "Chưa cập nhật"}</span>
                </div>
              </div>
              
              {/* Improved button layout with more width */}
              <div className="mt-auto flex flex-col sm:flex-row w-full gap-3 px-4">
                <div className="flex-1">
                  <CustomerCardButton
                    label="Đổi mật khẩu"
                    onClick={handleDialogOpen}
                    icon={<FaLock />}
                    isPrimary={false}
                    className="text-sm hover:bg-gray-200 whitespace-nowrap w-full justify-center"
                  />
                </div>
                
                {/* <div className="flex-1">
                  <CustomerCardButton
                    label={editMode ? "Thoát chỉnh sửa" : "Chỉnh sửa thông tin"}
                    onClick={toggleEditMode}
                    icon={editMode ? <FaTimes /> : <FaEdit />}
                    isPrimary={editMode}
                    className={`text-sm whitespace-nowrap w-full justify-center ${editMode ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                  />
                </div> */}
              </div>
            </div>
          </CustomerCard>
        </motion.div>

        {/* Profile Information Card - adjust the column sizing */}
        <motion.div variants={itemVariants} className="md:col-span-4 h-full flex">
          <CustomerCard
            title="Thông tin chi tiết"
            subtitle="Thông tin cá nhân của bạn"
            // headerRightContent={
            //   <div className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${editMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            //     {editMode ? 'Đang chỉnh sửa' : 'Chế độ xem'}
            //   </div>
            // }
            className="w-full h-full flex flex-col"
          >
            <Animate variant={editMode ? "slide-up" : "fade"} duration={0.3} className="flex-grow flex flex-col">
              <form onSubmit={handleSubmit} className="w-full flex-grow flex flex-col">
                <div className={`space-y-6 flex-grow ${editMode ? 'border-2 border-blue-100 p-4 rounded-lg' : ''}`}>
                  <div className="relative">
                    <label
                      htmlFor="name"
                      className={`block text-sm font-medium transition-all duration-300 ${editMode ? 'text-[var(--clr-bg-1)]' : 'text-gray-700'
                        }`}
                    >
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {formData.name || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium transition-all duration-300 ${editMode ? 'text-[var(--clr-bg-1)]' : 'text-gray-700'
                        }`}
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        {formData.email || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="phone"
                      className={`block text-sm font-medium transition-all duration-300 ${editMode ? 'text-[var(--clr-bg-1)]' : 'text-gray-700'
                        }`}
                    >
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center">
                        <FaPhone className="text-gray-400 mr-2" />
                        {formData.phone || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>

                  {editMode && (
                    <div className="flex justify-end mt-8 space-x-3">
                      <CustomerCardButton
                        label="Hủy"
                        onClick={toggleEditMode}
                        isPrimary={false}
                        icon={<FaTimes />}
                        className="hover:bg-gray-200"
                      />
                      <button
                        type="submit"
                        className={`px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center bg-[var(--clr-bg-1)] hover:bg-[var(--clr-bg-7)] text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                      >
                        {loading ? null : <FaSave className="mr-2" />}
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </Animate>
          </CustomerCard>
        </motion.div>
      </motion.div>

      <CustomerSnackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={closeSnackbar}
        isSuccess={snackbarSuccess}
      />
      
      {/* Password Change Dialog */}
      <Dialog
        open={openDialog}
        maxWidth="xs"
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '16px',
            width: '100%',
            maxWidth: '500px'
          }
        }}
      >
        <form onSubmit={handleChangePassword}>
          <DialogTitle 
            sx={{ 
              fontWeight: 'bold', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 2,
              pt: 2,
              pb: 1
            }}
          >
            <div className="flex items-center">
              <FaLock className="mr-2 text-[var(--clr-bg-1)]" />
              <span>Đổi mật khẩu</span>
            </div>
            <IconButton 
              onClick={handleDialogClose} 
              size="small"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <FaTimes size={16} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ px: 2, py: 3 }}>
            {passwordSuccess ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FaCheck className="text-green-500" size={24} />
                </div>
                <p className="text-lg font-medium text-green-600">Đã cập nhật mật khẩu thành công!</p>
                <p className="text-sm text-gray-500 mt-1">Tự động đóng sau 2 giây</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Nhập mật khẩu mới của bạn. Mật khẩu phải có ít nhất 6 ký tự.
                  </p>
                </div>
                
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>
                
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {!passwordSuccess && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleDialogClose}
                  disabled={passwordLoading}
                  sx={{ 
                    borderRadius: '8px',
                    borderColor: 'rgba(0,0,0,0.2)',
                    color: 'rgba(0,0,0,0.7)',
                    '&:hover': {
                      borderColor: 'rgba(0,0,0,0.4)',
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={passwordLoading}
                  sx={{ 
                    backgroundColor: "var(--clr-bg-1)", 
                    borderRadius: "8px",
                    padding: '8px 24px',
                    "&:hover": { 
                      backgroundColor: "var(--clr-bg-7)" 
                    },
                    "& .MuiCircularProgress-root": {
                      color: "white",
                      width: "24px !important",
                      height: "24px !important"
                    }
                  }}
                >
                  {passwordLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </Button>
              </>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* CSS fix for small mobile screens */}
      <style jsx global>{`
        @media (max-width: 340px) {
          .whitespace-nowrap {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </CustomerPageLayout>
  );
};

export default MyInfoPage;

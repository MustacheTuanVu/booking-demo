"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { motion, Variants } from "framer-motion";
import { FaUniversity, FaCreditCard, FaIdCard, FaUserAlt, FaSave, FaMoneyCheck } from "react-icons/fa";
import { 
  CustomerPageLayout, 
  CustomerCard, 
  CustomerCardButton,
  CustomerSnackbar
} from "@/components/CustomerLayout";

const MyBankInfoPage: React.FC = () => {
    const [formData, setFormData] = useState({
        bankCode: "",
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSuccess, setSnackbarSuccess] = useState(true);
    const [hasBankInfo, setHasBankInfo] = useState(false);

    const getMyBankInfo = async () => {
        try {
            setPageLoading(true);
            const res = await api.get("users/getMyInfo");
            if (res.data.BankInfo && res.data.BankInfo.length > 0) {
                setFormData({
                    bankCode: res.data.BankInfo[0].bankCode || "",
                    bankName: res.data.BankInfo[0].bankName || "",
                    accountNumber: res.data.BankInfo[0].accountNumber || "",
                    accountHolderName: res.data.BankInfo[0].accountHolderName || "",
                });
                setHasBankInfo(true);
            }
        } catch (error: any) {
            if (error.response && error.response.status !== 400) {
                console.error("Lỗi lấy dữ liệu:", error);
                showSnackbar("Không thể tải thông tin ngân hàng", false);
            }
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        getMyBankInfo();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (hasBankInfo) {
                await api.put("bank/updateBank", formData);
                showSnackbar("Cập nhật thông tin ngân hàng thành công!");
            } else {
                await api.post("bank/createBank", formData);
                showSnackbar("Thêm thông tin ngân hàng thành công!");
                setHasBankInfo(true);
            }
        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu", error);
            showSnackbar("Cập nhật thông tin ngân hàng thất bại!", false);
        } finally {
            setLoading(false);
        }
    };

    // Helper function for snackbar
    const showSnackbar = (message: string, success: boolean = true) => {
        setSnackbarMessage(message);
        setSnackbarSuccess(success);
        setSnackbarOpen(true);
    };

    const closeSnackbar = () => setSnackbarOpen(false);

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

    return (
        <CustomerPageLayout
            title="Thông Tin Ngân Hàng"
            subtitle="Quản lý thông tin tài khoản ngân hàng của bạn"
            description="Trang quản lý thông tin ngân hàng tại Queen Acoustic."
            isLoading={pageLoading}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {/* Information Card */}
                <motion.div variants={itemVariants} className="md:col-span-1">
                    <CustomerCard>
                        <div className="flex flex-col items-center py-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--clr-bg-1)] to-[var(--clr-bg-7)] text-white shadow-lg mb-4">
                                <FaMoneyCheck className="text-6xl" />
                            </div>
                            
                            <h2 className="text-xl font-semibold text-gray-800 mt-2">Thông Tin Ngân Hàng</h2>
                            <p className="text-gray-500 mb-4 text-center">Thông tin này sẽ được sử dụng cho các giao dịch nhận tiền</p>
                            
                            <div className="w-full space-y-3 mt-2 px-4">
                                {hasBankInfo ? (
                                    <>
                                        <div className="flex items-center text-gray-600">
                                            <FaUniversity className="mr-3 text-gray-400 flex-shrink-0" />
                                            <div className="text-sm">
                                                <span className="block text-xs text-gray-500">Ngân hàng:</span>
                                                <span className="font-medium">{formData.bankName || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <FaCreditCard className="mr-3 text-gray-400 flex-shrink-0" />
                                            <div className="text-sm">
                                                <span className="block text-xs text-gray-500">Số tài khoản:</span>
                                                <span className="font-medium">{formData.accountNumber || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <FaUserAlt className="mr-3 text-gray-400 flex-shrink-0" />
                                            <div className="text-sm">
                                                <span className="block text-xs text-gray-500">Chủ tài khoản:</span>
                                                <span className="font-medium">{formData.accountHolderName || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>Bạn chưa thêm thông tin ngân hàng.</p>
                                        <p className="text-sm mt-1">Vui lòng điền thông tin bên cạnh.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CustomerCard>
                </motion.div>
                
                {/* Bank Info Form */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <CustomerCard 
                        title={hasBankInfo ? "Cập nhật thông tin ngân hàng" : "Thêm thông tin ngân hàng"} 
                        subtitle="Thông tin này được sử dụng cho các giao dịch nhận tiền mặt hoặc hoàn tiền"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label 
                                        htmlFor="bankCode" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Mã ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUniversity className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="bankCode"
                                            id="bankCode"
                                            placeholder="VCB, BIDV, TCB..."
                                            value={formData.bankCode}
                                            onChange={handleChange}
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Viết tắt của ngân hàng (ví dụ: VCB - Vietcombank)</p>
                                </div>
                                
                                <div className="relative">
                                    <label 
                                        htmlFor="bankName" 
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Tên ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUniversity className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="bankName"
                                            id="bankName"
                                            placeholder="Vietcombank, Techcombank..."
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Tên đầy đủ của ngân hàng</p>
                                </div>
                            </div>

                            <div className="relative">
                                <label 
                                    htmlFor="accountNumber" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Số tài khoản <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCreditCard className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        id="accountNumber"
                                        placeholder="Nhập số tài khoản của bạn"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Nhập đúng số tài khoản, không thêm dấu cách hoặc ký tự đặc biệt</p>
                            </div>
                            
                            <div className="relative">
                                <label 
                                    htmlFor="accountHolderName" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Tên chủ tài khoản <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaIdCard className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        id="accountHolderName"
                                        placeholder="Nhập tên chủ tài khoản"
                                        value={formData.accountHolderName}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Tên chủ tài khoản phải khớp với thông tin trên thẻ</p>
                            </div>

                            <div className="flex justify-end mt-6">
                                <CustomerCardButton
                                    label={loading ? "Đang xử lý..." : (hasBankInfo ? "Cập nhật thông tin" : "Lưu thông tin")}
                                    onClick={() => {}}
                                    icon={<FaSave />}
                                    isPrimary={true}
                                    disabled={loading}
                                    className="px-6"
                                />
                            </div>
                        </form>
                    </CustomerCard>
                </motion.div>
            </motion.div>
            
            <CustomerSnackbar
                message={snackbarMessage}
                isOpen={snackbarOpen}
                onClose={closeSnackbar}
                isSuccess={snackbarSuccess}
            />
        </CustomerPageLayout>
    );
};

export default MyBankInfoPage;

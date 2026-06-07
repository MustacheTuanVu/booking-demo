import { motion } from "framer-motion";
import React from 'react'

export default function CashModal({ showCashModal, setShowCashModal, formData, handleChange, handleSubmit, userInfo,
}: {
    showCashModal: boolean;
    setShowCashModal: (value: boolean) => void;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    userInfo?: { point?: number };
}) {
    if (!showCashModal) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300 ${
                showCashModal ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
            }`}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                    <h3 className="text-xl font-bold text-white">Quy đổi điểm thưởng</h3>
                    <button
                        onClick={() => setShowCashModal(false)}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-3">
                        <p className="text-gray-700">
                            Điểm hiện có: <span className="font-bold text-[var(--clr-bg-1)]">
                                {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"}
                            </span> điểm
                            {/* <span className="text-sm text-gray-500 ml-2">
                (tương đương {userInfo?.point ? (userInfo.point * 1000).toLocaleString() : "0"} đ)
              </span> */}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            *Bạn chỉ có thể quy đổi từ 500.000 điểm trở lên!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Số điểm muốn quy đổi
                            </label>
                            <input
                                type="text"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Nhập số điểm quy đổi"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Mã ngân hàng
                                </label>
                                <input
                                    type="text"
                                    name="bankCode"
                                    value={formData.bankCode}
                                    onChange={handleChange}
                                    placeholder="VCB, TCB..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Tên ngân hàng
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    placeholder="Vietcombank, Techcombank..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Số tài khoản
                            </label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                placeholder="Nhập số tài khoản"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Tên chủ tài khoản
                            </label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={handleChange}
                                placeholder="Nhập tên chủ tài khoản"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowCashModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors"
                        >
                            Gửi yêu cầu
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

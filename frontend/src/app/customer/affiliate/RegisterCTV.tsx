import { motion, Variants } from 'framer-motion';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faPhone,
    faEnvelope,
    faPaperPlane,
    faTimes,
    faHandshake,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function RegisterCTV({
    showRegisterCTV,
    setShowRegisterCTV,
    dataMyInfo,
    handleRegisterCTV
}: {
    showRegisterCTV: boolean;
    setShowRegisterCTV: (value: boolean) => void;
    dataMyInfo?: any;
    handleRegisterCTV: (e: React.FormEvent) => void;
}) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle form submission with confirmation state
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await handleRegisterCTV(e);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Animation variants
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: {
                duration: 0.2
            }
        }
    };

    const contentVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    if (!showRegisterCTV) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
        >
            <motion.div
                variants={modalVariants}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden overflow-y-auto"
            >
                {/* Header with gradient background */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[var(--clr-bg-1)] to-[var(--clr-bg-7)]">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-2 rounded-lg mr-3">
                            <FontAwesomeIcon icon={faHandshake} className="text-white text-lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Đăng ký Cộng Tác Viên</h3>
                            <p className="text-white/80 text-sm">Xác nhận thông tin của bạn để tiếp tục</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowRegisterCTV(false)}
                        className="text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-lg" />
                    </motion.button>
                </div>

                {/* Content with animation */}
                <motion.div
                    className="p-6 max-h-[calc(90vh-5rem)]"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {isSubmitted ? (
                        // Success confirmation view
                        <motion.div
                            className="flex flex-col items-center justify-center py-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <motion.div
                                className="w-24 h-24 text-green-500 mb-6"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="w-full h-full" />
                            </motion.div>

                            <motion.h3
                                className="text-xl font-bold text-gray-800 mb-2 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Yêu cầu đã được gửi thành công!
                            </motion.h3>

                            <motion.p
                                className="text-gray-600 text-center mb-8 max-w-md"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Cảm ơn bạn đã đăng ký trở thành Cộng Tác Viên của Queen Acoustic. Chúng tôi sẽ xem xét yêu cầu của bạn và phản hồi trong thời gian sớm nhất.
                            </motion.p>

                            <motion.button
                                type="button"
                                onClick={() => setShowRegisterCTV(false)}
                                className="px-6 py-3 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors flex items-center shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Đóng
                            </motion.button>
                        </motion.div>
                    ) : (
                        // Registration form
                        <motion.form onSubmit={onSubmit}>
                            <div className="mb-6">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Vui lòng xác nhận thông tin cá nhân của bạn để đăng ký trở thành Cộng Tác Viên của Queen Acoustic.
                                    Sau khi gửi yêu cầu, chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-[var(--clr-bg-1)]/10 p-2 rounded-full mr-3">
                                            <FontAwesomeIcon icon={faUser} className="text-[var(--clr-bg-1)]" />
                                        </div>
                                        <label className="block text-gray-700 text-sm font-medium">
                                            Tên khách hàng
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={dataMyInfo?.name || ''}
                                        placeholder="Tên khách hàng"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent bg-white"
                                        readOnly
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-[var(--clr-bg-1)]/10 p-2 rounded-full mr-3">
                                            <FontAwesomeIcon icon={faPhone} className="text-[var(--clr-bg-1)]" />
                                        </div>
                                        <label className="block text-gray-700 text-sm font-medium">
                                            Số điện thoại
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={dataMyInfo?.phone || ''}
                                        placeholder="Số điện thoại"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent bg-white"
                                        readOnly
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-[var(--clr-bg-1)]/10 p-2 rounded-full mr-3">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-[var(--clr-bg-1)]" />
                                        </div>
                                        <label className="block text-gray-700 text-sm font-medium">
                                            Email
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        value={dataMyInfo?.email || ''}
                                        placeholder="Email"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:border-transparent bg-white"
                                        readOnly
                                        required
                                    />
                                </motion.div>
                            </div>

                            <motion.div
                                variants={itemVariants}
                                className="flex justify-end space-x-4 mt-8"
                            >
                                <motion.button
                                    type="button"
                                    onClick={() => setShowRegisterCTV(false)}
                                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center shadow-sm mb-3"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                >
                                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                    Hủy
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className={`px-5 py-3 bg-[var(--clr-bg-1)] text-white rounded-lg hover:bg-[var(--clr-bg-7)] transition-colors flex items-center shadow-md mb-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    whileHover={isSubmitting ? {} : { scale: 1.02 }}
                                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                            Gửi yêu cầu
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.form>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

"use client";
import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaCrown, FaTimes, FaCheck, FaStar, FaCreditCard } from 'react-icons/fa';
import Image from 'next/image';
import { Animate, AnimateGroup } from "@/components/ui/animate";

interface InfoCardProps {
    openDialog: boolean
    handleDialogClose: () => void
}

export default function InfoCard({ openDialog, handleDialogClose }: InfoCardProps) {
    const cardData = [
        {
            id: "J",
            title: "Hạng thẻ J",
            titleFull: "Hạng thẻ J – Đặc quyền cơ bản",
            description: "Hạng thẻ J dành cho những thành viên mới hoặc những khách hàng có mức độ sử dụng dịch vụ ở mức cơ bản. Các đặc quyền bao gồm:\n\n- Được đặt chỗ trong khoảng thời gian tiêu chuẩn.\n- Hỗ trợ dịch vụ khách hàng 24/7.\n- Ưu đãi giảm giá cơ bản khi sử dụng dịch vụ.\n- Tham gia chương trình tích điểm để nâng cấp lên hạng thẻ cao hơn.",
            accent: "#475569",
            bgImage: "/images/j.png",
            level: "Cơ bản",
            stars: 1
        },
        {
            id: "Q",
            title: "Hạng thẻ Q",
            titleFull: "Hạng thẻ Q – Đặc quyền được đặt chỗ sớm sau Hạng K",
            description: "Hạng thẻ Q là sự lựa chọn hoàn hảo cho những thành viên mong muốn có ưu tiên đặt chỗ cao hơn so với hạng thẻ J. Các đặc quyền bao gồm:\n\n- Được đặt chỗ sớm hơn so với hạng thẻ J, chỉ sau hạng thẻ K.\n- Hỗ trợ ưu tiên khi có danh sách chờ.\n- Nhận ưu đãi đặc biệt vào những dịp quan trọng.\n- Được tiếp cận với các chương trình khuyến mãi dành riêng cho thành viên hạng Q.\n- Có thể tham gia sự kiện dành riêng cho thành viên cao cấp.",
            accent: "#2563eb",
            bgImage: "/images/q.png",
            level: "Nâng cao",
            stars: 2
        },
        {
            id: "K",
            title: "Hạng thẻ K",
            titleFull: "Hạng thẻ K – Đặc quyền được đặt chỗ sớm nhất",
            description: "Hạng thẻ K là hạng cao cấp nhất, dành cho những khách hàng thân thiết với mức độ ưu tiên tối đa trong hệ thống. Các đặc quyền bao gồm:\n\n- Được đặt chỗ sớm nhất trước tất cả các hạng thẻ khác.\n- Hỗ trợ đặc biệt khi có yêu cầu đặc biệt.\n- Nhận thông báo sớm về các chương trình khuyến mãi và sự kiện.\n- Hưởng mức ưu đãi cao nhất trong hệ thống.\n- Được tham gia vào những sự kiện giới hạn chỉ dành cho hạng thẻ K.\n- Nhận quà tặng tri ân định kỳ.",
            accent: "#f59e0b",
            bgImage: "/images/k.png",
            level: "Cao cấp",
            stars: 3
        },
        {
            id: "Guest",
            title: "Hạng thẻ Khách Mời",
            titleFull: "Hạng thẻ Khách Mời – Đặc quyền được đặt chỗ như Hạng thẻ K&Q",
            description: "Hạng thẻ Khách Mời là hạng thẻ đặc biệt dành cho khách hàng VIP hoặc những người được mời tham gia chương trình thành viên. Các đặc quyền bao gồm:\n\n- Được đặt chỗ cùng với hạng thẻ K và Q.\n- Hỗ trợ ưu tiên khi đặt chỗ theo lịch trình cụ thể.\n- Được hưởng các chương trình ưu đãi như thành viên hạng Q.\n- Có thể chuyển đổi sang hạng thẻ chính thức nếu đủ điều kiện.",
            accent: "#9333ea",
            bgImage: "/images/k.png", // Using k.png as fallback for Guest type
            level: "Khách mời",
            stars: 2
        },
    ];

    // Animation variants
    const overlayVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };
    
    const modalVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.1 * i, duration: 0.4 }
        })
    };

    const renderStars = (count: number) => {
        return (
            <div className="flex">
                {Array(count).fill(0).map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" size={14} />
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {openDialog && (
                <motion.div 
                    className="fixed inset-0 z-50 overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDialogClose}></div>
                    
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <motion.div 
                            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative z-10"
                            variants={modalVariants}
                        >
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="max-w-[calc(100%-40px)]">
                                        <h2 className="text-2xl font-bold text-white flex items-center">
                                            <FaCrown className="mr-2 text-yellow-300 flex-shrink-0" />
                                            <span className="truncate">Thẻ Thành Viên</span>
                                        </h2>
                                        <p className="text-xs md:text-sm text-gray-300 mt-1 whitespace-normal md:whitespace-nowrap text-ellipsis overflow-hidden">
                                            Chi tiết đặc quyền và lợi ích của từng hạng thẻ
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDialogClose}
                                        className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-black/20 flex-shrink-0"
                                        aria-label="Đóng"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <p className="text-gray-600 mb-8">Mỗi hạng thẻ thành viên đều mang đến những đặc quyền riêng biệt, giúp bạn có những trải nghiệm tuyệt vời nhất. Hãy tìm hiểu và lựa chọn hạng thẻ phù hợp với nhu cầu của bạn.</p>
                                
                                <AnimateGroup 
                                    staggerDelay={0.15} 
                                    containerVariant="fade" 
                                    childVariant="slide-up" 
                                    className="space-y-10"
                                >
                                    {cardData.map((card, index) => (
                                        <div
                                            key={card.id}
                                            className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                                        >
                                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                                    {card.id === "K" && <FaCrown className="text-yellow-400 mr-2" />}
                                                    {card.titleFull}
                                                </h3>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm font-medium text-gray-500 mr-2">{card.level}</span>
                                                    {renderStars(card.stars)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row">
                                                {/* Card showcase - full display */}
                                                <div className="md:w-1/3 p-6 flex items-center justify-center">
                                                    <div className="w-full max-w-[280px] mb-4 md:mb-0 relative h-[180px]">
                                                        <Image 
                                                            src={card.bgImage} 
                                                            alt={`Thẻ ${card.id}`}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 280px"
                                                            priority={index === 0}
                                                            style={{
                                                                objectFit: 'contain'
                                                            }}
                                                            className="transition-all duration-300"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Card benefits */}
                                                <div className="md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-gray-100">
                                                    <h4 className="font-medium text-gray-700 mb-4">Đặc quyền thành viên:</h4>
                                                    <AnimateGroup 
                                                        staggerDelay={0.03} 
                                                        containerVariant="none" 
                                                        childVariant="fade" 
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"
                                                    >
                                                        {card.description.split('\n').map((line, i) => {
                                                            if (line.trim().startsWith('-')) {
                                                                return (
                                                                    <div key={i} className="flex items-start">
                                                                        <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" size={12} />
                                                                        <p className="text-gray-700">{line.replace('-', '').trim()}</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }).filter(Boolean)}
                                                    </AnimateGroup>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </AnimateGroup>
                            </div>
                            
                            <div className="p-4 bg-gray-50 border-t flex justify-end">
                                <button
                                    onClick={handleDialogClose}
                                    className="px-6 py-2 rounded-lg bg-[var(--clr-bg-1)] hover:bg-[var(--clr-bg-7)] text-white font-medium transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

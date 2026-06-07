"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import CustomerSidebar from "@/components/Dashboard/CustomerSidebar";
import { FaCreditCard, FaArrowRight, FaCrown, FaCheck, FaLock, FaStar } from "react-icons/fa";
import Link from "next/link";
import InfoCard from "./InfoCard";
import Image from "next/image";
import { Animate, AnimateGroup } from "@/components/ui/animate";

interface UserInfo {
  _id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  role: string;
  customer_type: string;
  customer_type_expiry: string | null;
  guest?: any
}

interface MembershipTier {
  _id: string;
  type: string;
  duration: string;
  priceInMonth: number;
}

const cardInfo = {
  "J": {
    title: "Hạng thẻ J – Đặc quyền cơ bản",
    image: "/images/j.png",
    stars: 1,
    level: "Cơ bản",
    benefits: [
      "Được đặt chỗ trong khoảng thời gian tiêu chuẩn",
      "Hỗ trợ dịch vụ khách hàng 24/7",
      "Ưu đãi giảm giá cơ bản khi sử dụng dịch vụ",
      "Tham gia chương trình tích điểm để nâng cấp lên hạng thẻ cao hơn"
    ]
  },
  "Q": {
    title: "Hạng thẻ Q – Đặc quyền đặt chỗ sớm sau Hạng K",
    image: "/images/q.png",
    stars: 2, 
    level: "Nâng cao",
    benefits: [
      "Được đặt chỗ sớm hơn so với hạng thẻ J, chỉ sau hạng thẻ K",
      "Hỗ trợ ưu tiên khi có danh sách chờ",
      "Nhận ưu đãi đặc biệt vào những dịp quan trọng",
      "Được tiếp cận với các chương trình khuyến mãi dành riêng",
      "Tham gia sự kiện dành riêng cho thành viên cao cấp"
    ]
  },
  "K": {
    title: "Hạng thẻ K – Đặc quyền đặt chỗ sớm nhất",
    image: "/images/k.png",
    stars: 3,
    level: "Cao cấp",
    benefits: [
      "Được đặt chỗ sớm nhất trước tất cả các hạng thẻ khác",
      "Hỗ trợ đặc biệt khi có yêu cầu đặc biệt",
      "Nhận thông báo sớm về các chương trình khuyến mãi và sự kiện",
      "Hưởng mức ưu đãi cao nhất trong hệ thống",
      "Tham gia vào những sự kiện giới hạn chỉ dành cho hạng thẻ K",
      "Nhận quà tặng tri ân định kỳ"
    ]
  },
  "Khách Mời": {
    title: "Hạng thẻ Khách Mời – Đặc quyền như Hạng thẻ K&Q",
    image: "/images/k.png",
    stars: 2,
    level: "Khách mời",
    benefits: [
      "Được đặt chỗ cùng với hạng thẻ K và Q",
      "Hỗ trợ ưu tiên khi đặt chỗ theo lịch trình cụ thể",
      "Được hưởng các chương trình ưu đãi như thành viên hạng Q",
      "Có thể chuyển đổi sang hạng thẻ chính thức nếu đủ điều kiện"
    ]
  }
};

const MyTypePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get("auth/getUserByJWT");
        setUserInfo(res.data);
        setSelectedTier(res.data.customer_type);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user info", error);
        setSnackbarMsg("Không lấy được thông tin người dùng");
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo?.customer_type) {
      const fetchMembershipTiers = async () => {
        try {
          if (isValidGuest(userInfo)) {
            setTiers([]);
            return;
          }

          const res = await api.get("membership_prices");

          const filteredTiers = res.data.filter((tier: { type: string }) => {
            if (userInfo.customer_type === "J") return ["Q", "K", "Khách mời"].includes(tier.type);
            if (userInfo.customer_type === "Q") return ["K", "Khách mời"].includes(tier.type);
            if (userInfo.customer_type === "K") return ["Khách mời"].includes(tier.type);
            return false;
          });

          setTiers(filteredTiers);
        } catch (error) {
          console.error("Error fetching membership tiers", error);
          setSnackbarMsg("Không lấy được danh sách hạng thẻ");
        }
      };

      fetchMembershipTiers();
    }
  }, [userInfo]);

  const handleDialogClose = () => {
    setOpenDialog(false);
  }

  const handleBuyTier = async (tier: MembershipTier) => {
    try {

      let returnURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/return-membership?orderId=${userInfo?._id}&memberType=${tier.type}`;
      let cancelURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/cancel-membership?orderId=${userInfo?._id}&memberType=${tier.type}`;

      const paymentRes = await api.post(`demo-payment/create-membership-payment-url`, {
        orderCode: Math.floor(1000000 + Math.random() * 9000000),
        description: 'Thanh toán membership',
        amount: tier.priceInMonth,
        returnUrl: returnURL,
        cancelUrl: cancelURL,
        memberType: tier.type,
      });


      console.log("Payment URL created successfully:", paymentRes.data);

      if (paymentRes?.data?.checkoutUrl) {
        window.location.href = paymentRes.data.checkoutUrl;
      } else {
        setSnackbarMsg("Không thể tạo URL thanh toán");
      }
    } catch (error) {
      console.error("Error creating membership payment URL", error);
      setSnackbarMsg("Có lỗi xảy ra khi thanh toán");
    }
  };

  const isValidGuest = (userInfo: UserInfo | null): boolean => {
    if (!userInfo?.guest?.is_guest) return false;

    const now = new Date();
    const guestExpiry = userInfo.guest.expiry ? new Date(userInfo.guest.expiry) : null;

    return Boolean(guestExpiry && now < guestExpiry);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Get current tier type
  const currentTierType = userInfo ? 
    (isValidGuest(userInfo) ? "Khách Mời" : userInfo.customer_type) : "";

  const renderStars = (count: number) => {
    return (
      <div className="flex mt-1">
        {Array(count).fill(0).map((_, i) => (
          <FaStar key={i} className="text-yellow-400" size={16} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <title>Hạng Thẻ | Queen Acoustic</title>
      <meta name="description" content="Trang hạng thẻ của tài khoản tại Queen Acoustic." />
      
      <header className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay z-0"></div>
        <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Thẻ Thành Viên</h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto whitespace-normal md:whitespace-nowrap text-ellipsis overflow-hidden">
              Khám phá đặc quyền độc đáo của từng hạng thẻ và tận hưởng những trải nghiệm ưu tiên
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <CustomerSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--clr-bg-1)]"></div>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Your Current Card */}
                {userInfo && (
                  <AnimateGroup 
                    staggerDelay={0.1} 
                    containerVariant="fade" 
                    childVariant="slide-up"
                  >
                    <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold">Hạng thẻ hiện tại của bạn</h2>
                      </div>
                      
                      <div className="flex flex-col md:flex-row">
                        {/* Card Image */}
                        <div className="md:w-1/3 p-6 flex justify-center">
                          <div className="w-full max-w-[280px] relative h-[180px]">
                            <Image 
                              src={cardInfo[currentTierType as keyof typeof cardInfo]?.image || "/images/j.png"} 
                              alt={`Thẻ ${currentTierType}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 280px"
                              priority={true}
                              style={{
                                objectFit: 'contain'
                              }}
                              className="transition-all duration-300"
                            />
                          </div>
                        </div>
                        
                        {/* Card Details */}
                        <div className="md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-gray-100">
                          <h3 className="text-xl font-semibold mb-2">{cardInfo[currentTierType as keyof typeof cardInfo]?.title || `Hạng Thẻ ${currentTierType}`}</h3>
                          
                          {(userInfo.customer_type_expiry || (isValidGuest(userInfo) && userInfo.guest?.expiry)) && (
                            <div className="mb-4 text-sm text-gray-500">
                              <span className="font-medium">Hạn sử dụng:</span> {isValidGuest(userInfo)
                                ? formatDate(userInfo.guest.expiry)
                                : formatDate(userInfo.customer_type_expiry!)}
                            </div>
                          )}
                          
                          <h4 className="font-medium text-gray-700 mb-3">Đặc quyền của bạn:</h4>
                          <AnimateGroup 
                            staggerDelay={0.05} 
                            containerVariant="none" 
                            childVariant="fade"
                            className="space-y-2 mb-6"
                          >
                            {cardInfo[currentTierType as keyof typeof cardInfo]?.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start list-none">
                                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </AnimateGroup>
                          
                          <button
                            onClick={() => setOpenDialog(true)}
                            className="mt-4 text-[var(--clr-bg-1)] hover:text-[var(--clr-bg-7)] font-medium inline-flex items-center"
                          >
                            Xem chi tiết tất cả các hạng thẻ <FaArrowRight className="ml-2 h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </section>
                  </AnimateGroup>
                )}
                
                {!((isValidGuest(userInfo) && userInfo?.guest?.expiry)) ?
                <>
                {/* Available Upgrades */}
                {tiers.length > 0 && (
                  <AnimateGroup 
                    staggerDelay={0.1} 
                    containerVariant="fade" 
                    childVariant="slide-up" 
                    duration={0.6}
                  >
                    <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold">Nâng cấp hạng thẻ</h2>
                        <p className="text-gray-500 mt-1">Trải nghiệm nhiều đặc quyền hơn với hạng thẻ cao cấp</p>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        <AnimateGroup 
                          staggerDelay={0.1} 
                          containerVariant="none" 
                          childVariant="slide-up"
                        >
                          {tiers.map((tier, index) => (
                            <div 
                              key={tier._id} 
                              className="flex flex-col md:flex-row p-6 hover:bg-gray-50 transition-colors"
                            >
                              {/* Card Image */}
                              <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                                <div className="w-full max-w-[200px] relative h-[140px]">
                                  <Image 
                                    src={cardInfo[tier.type as keyof typeof cardInfo]?.image || "/images/j.png"} 
                                    alt={`Thẻ ${tier.type}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 200px"
                                    priority={index === 0}
                                    style={{
                                      objectFit: 'contain'
                                    }}
                                    className="transition-all duration-300"
                                  />
                                </div>
                              </div>
                              
                              {/* Card Details */}
                              <div className="md:w-2/4 md:px-6">
                                <h3 className="text-lg font-semibold mb-1 flex items-center">
                                  {tier.type === "K" && <FaCrown className="text-yellow-400 mr-1" />}
                                  {cardInfo[tier.type as keyof typeof cardInfo]?.title || `Hạng Thẻ ${tier.type}`}
                                </h3>
                                
                                {renderStars(cardInfo[tier.type as keyof typeof cardInfo]?.stars || 1)}
                                
                                <div className="mt-3 grid grid-cols-1 gap-y-1 text-sm">
                                  {cardInfo[tier.type as keyof typeof cardInfo]?.benefits.slice(0, 3).map((benefit, index) => (
                                    <div key={index} className="flex items-start">
                                      <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" size={12} />
                                      <span className="text-gray-700">{benefit}</span>
                                    </div>
                                  ))}
                                  {cardInfo[tier.type as keyof typeof cardInfo]?.benefits.length > 3 && (
                                    <button
                                      onClick={() => setOpenDialog(true)}
                                      className="text-[var(--clr-bg-1)] text-sm ml-5 mt-1 hover:underline"
                                    >
                                      + {cardInfo[tier.type as keyof typeof cardInfo]?.benefits.length - 3} đặc quyền khác
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Price and Action */}
                              <div className="md:w-1/4 flex flex-col justify-center items-center md:items-end mt-4 md:mt-0 border-t pt-4 md:pt-0 md:border-t-0">
                                <div className="text-xl font-bold text-gray-800 mb-3">
                                  {tier.priceInMonth.toLocaleString()} đ
                                  <span className="text-sm font-normal">
                                    /{tier.duration === 'month' ? 'tháng' : tier.duration === 'year' ? 'năm' : ''}
                                  </span>
                                </div>
                                {!((isValidGuest(userInfo) && userInfo?.guest?.expiry)) ?
                                  <motion.button
                                    onClick={() => handleBuyTier(tier)} 
                                    className="px-5 py-2 rounded-lg font-medium bg-[var(--clr-bg-1)] hover:bg-[var(--clr-bg-7)] text-white transition-colors w-full md:w-auto text-center"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    Nâng cấp ngay
                                  </motion.button>
                                  : null
                                }
                                
                              </div>
                            </div>
                          ))}
                        </AnimateGroup>
                      </div>
                    </section>
                  </AnimateGroup>
                )}</>:null}
                
              </div>
            )}
          </div>
        </div>
      </div>
      
      <InfoCard openDialog={openDialog} handleDialogClose={handleDialogClose} />
      
      {snackbarMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center justify-between">
          <span>{snackbarMsg}</span>
          <button
            onClick={() => setSnackbarMsg("")}
            className="ml-4 text-sm underline hover:text-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTypePage;

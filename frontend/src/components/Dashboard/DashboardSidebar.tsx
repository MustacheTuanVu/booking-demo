"use client";
import { useRouter, usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import api from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faUsers,
  faMicrophone,
  faMugHot,
  faUserTie,
  faTags,
  faCalendarPlus,
  faBars,
  faTimes,
  faPizzaSlice,
  faLayerGroup,
  faBoxes,
  faMoneyBill,
  faShieldHalved,
  faSackDollar,
  faQrcode,
  faChevronDown,
  faBell,
  faUserCircle,
  faPeopleRoof,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import Image from "next/image";

export default function DashboardSidebar() {
  const { userInfo, saveUserInfo, isLogin, saveIsLogin, notifications } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();
  const [localIsLogin, setLocalIsLogin] = useState(isLogin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Spring animation constants
  const microInteractionSpring: Transition = {
    type: "spring",
    stiffness: 120,
    damping: 12,
  };

  const mediumTransitionSpring: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 20
  };

  const heavyTransitionSpring: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  // Modern hover animation variants
  const menuItemHoverVariants: Variants = {
    rest: {
      x: 0,
      backgroundColor: "transparent",
      boxShadow: "0 0 0 0 rgba(202, 138, 4, 0)"
    },
    hover: {
      x: 3,
      backgroundColor: "rgba(202, 138, 4, 0.08)",
      boxShadow: "0 2px 8px rgba(202, 138, 4, 0.12), 0 0 0 1px rgba(202, 138, 4, 0.05)",
      transition: {
        ...microInteractionSpring,
        type: "spring",
        backgroundColor: { duration: 0.2 },
        boxShadow: { duration: 0.2 }
      }
    },
    active: {
      x: 3,
      backgroundColor: "rgba(202, 138, 4, 0.08)",
      boxShadow: "0 2px 8px rgba(202, 138, 4, 0.12), 0 0 0 1px rgba(202, 138, 4, 0.05)",
    }
  };

  // Gold color matching the text-gold-600 class
  const elegantGold = "#806837"; // Tailwind gold-600 color

  // Icon animation variants
  const iconVariants: Variants = {
    rest: { scale: 1, color: "currentColor" },
    hover: {
      scale: 1.1,
      color: elegantGold,
      transition: {
        ...microInteractionSpring,
        type: "spring",
        delay: 0
      }
    },
    active: {
      scale: 1.1,
      color: elegantGold
    }
  };

  // Text animation variants
  const textVariants: Variants = {
    rest: { x: 0, color: "currentColor" },
    hover: {
      x: 2,
      color: elegantGold,
      transition: {
        ...microInteractionSpring,
        type: "spring",
        delay: 0.05
      }
    },
    active: {
      x: 2,
      color: elegantGold
    }
  };


  // Get unread notifications count
  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  // Load expanded sections state from localStorage
  useEffect(() => {
    try {
      // Initialize with all sections expanded
      const defaultExpandedState = {
        food: true,
        events: true,
        customers: true,
        internal: true
      };

      // Set default expanded state in localStorage if it doesn't exist
      const storedExpandedSections = localStorage.getItem('dashboardExpandedSections');
      if (!storedExpandedSections) {
        localStorage.setItem('dashboardExpandedSections', JSON.stringify(defaultExpandedState));
      } else {
        // Ensure all new sections are expanded by default
        const parsedSections = JSON.parse(storedExpandedSections);
        const updatedSections = {
          ...defaultExpandedState,
          ...parsedSections,
          // Force these to be true regardless of stored value
          customers: true,
          internal: true
        };

        // Only update if there are differences
        if (JSON.stringify(updatedSections) !== storedExpandedSections) {
          localStorage.setItem('dashboardExpandedSections', JSON.stringify(updatedSections));
          setExpandedSections(updatedSections);
        } else {
          setExpandedSections(parsedSections);
        }
      }
    } catch (error) {
      console.error('Error loading expanded sections state:', error);
    }
  }, []);

  // State for collapsible sections - all expanded by default
  const [expandedSections, setExpandedSections] = useState({
    food: true,
    events: true,
    customers: true,
    internal: true
  });

  const toggleSection = (section: 'food' | 'events' | 'customers' | 'internal') => {
    const newExpandedSections = {
      ...expandedSections,
      [section]: !expandedSections[section]
    };

    setExpandedSections(newExpandedSections);

    // Save to localStorage
    try {
      localStorage.setItem('dashboardExpandedSections', JSON.stringify(newExpandedSections));
    } catch (error) {
      console.error('Error saving expanded sections state:', error);
    }
  };

  const navigate = (slug: string) => {
    router.replace(slug);
    setMobileMenuOpen(false);
  };

  // Class helpers
  const menuItemClass = (pathLink: string) => {
    const isActive = pathname.includes(pathLink);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-300 ${isActive
        ? "bg-gold-100 text-gold-600 font-medium"
        : "text-gray-700 hover:bg-gray-100"
      }`;
  };

  const sectionTitleClass = "flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 mt-6 mb-3 px-3 border-b border-gray-100 pb-2";

  const iconClass = "w-5 h-5";

  useEffect(() => {
    if (!localIsLogin) {
      const checkUserInfo = async () => {
        try {
          const res = await api.get("auth/getUserByJWT");
          saveUserInfo(res.data);
          saveIsLogin(true);
          setLocalIsLogin(true);
        } catch (error: any) {
          if (error.response && error.response.status !== 400) {
            console.error("Lỗi kiểm tra đăng nhập:", error);
          }
        }
      };
      checkUserInfo();
    }
  }, [localIsLogin, saveIsLogin, saveUserInfo]);

  // The content of the sidebar based on role
  const renderMenuItems = () => (
    <div className="space-y-2 px-2">
      {/* System Items */}
      <div className={sectionTitleClass}>
        <span>Hệ thống</span>
      </div>

      <motion.button
        onClick={() => navigate("/dashboard/notification")}
        className={menuItemClass("notification")}
        variants={menuItemHoverVariants}
        initial="rest"
        whileHover="hover"
        animate={pathname.includes("notification") ? "active" : "rest"}
        whileTap={{ scale: 0.98 }}
        aria-label="Thông báo"
      >
        <motion.div
          className="relative"
          variants={iconVariants}
        >
          <FontAwesomeIcon icon={faBell} className={iconClass} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </motion.div>
        <motion.span variants={textVariants}>Thông báo</motion.span>
      </motion.button>

      {userInfo?.role === 'ADMIN' && (
        <>
          <motion.button
            onClick={() => navigate("/dashboard/qr-code")}
            className={menuItemClass("qr-code")}
            variants={menuItemHoverVariants}
            initial="rest"
            whileHover="hover"
            animate={pathname.includes("qr-code") ? "active" : "rest"}
            whileTap={{ scale: 0.98 }}
            aria-label="Checkin"
          >
            <motion.div variants={iconVariants}>
              <FontAwesomeIcon icon={faQrcode} className={iconClass} />
            </motion.div>
            <motion.span variants={textVariants}>Checkin</motion.span>
          </motion.button>

          <div className={sectionTitleClass}>
            <span>Quản lý Sự kiện</span>
          </div>

          <motion.button
            onClick={() => navigate("/dashboard/ticket-list")}
            className={menuItemClass("ticket-list")}
            variants={menuItemHoverVariants}
            initial="rest"
            whileHover="hover"
            animate={pathname.includes("ticket-list") ? "active" : "rest"}
            whileTap={{ scale: 0.98 }}
            aria-label="Quản lý đặt chỗ"
          >
            <motion.div variants={iconVariants}>
              <FontAwesomeIcon icon={faMoneyBill} className={iconClass} />
            </motion.div>
            <motion.span variants={textVariants}>Quản lý đặt chỗ</motion.span>
          </motion.button>
        </>
      )}

      {userInfo?.role === 'BOSS' && (
        <>
          <motion.button
            onClick={() => navigate("/dashboard/qr-code")}
            className={menuItemClass("qr-code")}
            variants={menuItemHoverVariants}
            initial="rest"
            whileHover="hover"
            animate={pathname.includes("qr-code") ? "active" : "rest"}
            whileTap={{ scale: 0.98 }}
            aria-label="Checkin"
          >
            <motion.div variants={iconVariants}>
              <FontAwesomeIcon icon={faQrcode} className={iconClass} />
            </motion.div>
            <motion.span variants={textVariants}>Checkin</motion.span>
          </motion.button>

          {/* Food Management Section */}
          <motion.div
            className={`${sectionTitleClass} cursor-pointer`}
            onClick={() => toggleSection('food')}
            whileHover={{
              backgroundColor: "rgba(202, 138, 4, 0.08)",
              boxShadow: "0 2px 8px rgba(202, 138, 4, 0.08)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={microInteractionSpring}
            role="button"
            tabIndex={0}
            aria-expanded={expandedSections.food}
            aria-controls="food-section-content"
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('food')}
          >
            <motion.span
              whileHover={{ color: elegantGold }}
              transition={microInteractionSpring}
            >
              Quản lý Ẩm thực
            </motion.span>
            <motion.div
              animate={{
                rotate: expandedSections.food ? 180 : 0,
                color: expandedSections.food ? elegantGold : "currentColor"
              }}
              transition={mediumTransitionSpring}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className="w-3 h-3 text-gray-400"
              />
            </motion.div>
          </motion.div>

          <motion.div
            id="food-section-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: expandedSections.food ? 1 : 0,
              height: expandedSections.food ? 'auto' : 0
            }}
            transition={mediumTransitionSpring}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-1">
              <motion.button
                onClick={() => navigate("/dashboard/drink-food")}
                className={menuItemClass("drink")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("drink") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý món Ăn/ Uống"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faMugHot} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý món Ăn/ Uống</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/category-item")}
                className={menuItemClass("category-item")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("category-item") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý danh mục Món"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faLayerGroup} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý danh mục Món</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/menu")}
                className={menuItemClass("menu")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("menu") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý menu"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faPizzaSlice} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý menu</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/combo")}
                className={menuItemClass("combo")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("combo") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý combo"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faBoxes} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý combo</motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Event Operations Section */}
          <motion.div
            className={`${sectionTitleClass} cursor-pointer`}
            onClick={() => toggleSection('events')}
            whileHover={{
              backgroundColor: "rgba(202, 138, 4, 0.08)",
              boxShadow: "0 2px 8px rgba(202, 138, 4, 0.08)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={microInteractionSpring}
            role="button"
            tabIndex={0}
            aria-expanded={expandedSections.events}
            aria-controls="events-section-content"
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('events')}
          >
            <motion.span
              whileHover={{ color: elegantGold }}
              transition={microInteractionSpring}
            >
              Quản lý Sự kiện
            </motion.span>
            <motion.div
              animate={{
                rotate: expandedSections.events ? 180 : 0,
                color: expandedSections.events ? elegantGold : "currentColor"
              }}
              transition={mediumTransitionSpring}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className="w-3 h-3 text-gray-400"
              />
            </motion.div>
          </motion.div>

          <motion.div
            id="events-section-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: expandedSections.events ? 1 : 0,
              height: expandedSections.events ? 'auto' : 0
            }}
            transition={mediumTransitionSpring}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-1">
              <motion.button
                onClick={() => navigate("/dashboard/create-event")}
                className={menuItemClass("create-event")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("create-event") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Tạo sự kiện"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faCalendarPlus} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Tạo sự kiện</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/event-list")}
                className={menuItemClass("event-list")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("event-list") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý sự kiện"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faCalendar} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý sự kiện</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/ticket-list")}
                className={menuItemClass("ticket-list")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("ticket-list") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý đặt chỗ"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faMoneyBill} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý đặt chỗ</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/artist")}
                className={menuItemClass("artist")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("artist") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý ca sĩ"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faMicrophone} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý ca sĩ</motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Customer & Partner Relations Section */}
          <motion.div
            className={`${sectionTitleClass} cursor-pointer`}
            onClick={() => toggleSection('customers')}
            whileHover={{
              backgroundColor: "rgba(202, 138, 4, 0.08)",
              boxShadow: "0 2px 8px rgba(202, 138, 4, 0.08)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={microInteractionSpring}
            role="button"
            tabIndex={0}
            aria-expanded={expandedSections.customers}
            aria-controls="customers-section-content"
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('customers')}
          >
            <motion.span
              whileHover={{ color: elegantGold }}
              transition={microInteractionSpring}
            >
              Quản lý Khách hàng & Đối tác
            </motion.span>
            <motion.div
              animate={{
                rotate: expandedSections.customers ? 180 : 0,
                color: expandedSections.customers ? elegantGold : "currentColor"
              }}
              transition={mediumTransitionSpring}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className="w-3 h-3 text-gray-400"
              />
            </motion.div>
          </motion.div>

          <motion.div
            id="customers-section-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: expandedSections.customers ? 1 : 0,
              height: expandedSections.customers ? 'auto' : 0
            }}
            transition={mediumTransitionSpring}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-1">
              <motion.button
                onClick={() => navigate("/dashboard/customer")}
                className={menuItemClass("customer")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("customer") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý khách hàng"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faUsers} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý khách hàng</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/cong-tac-vien")}
                className={menuItemClass("/dashboard/cong-tac-vien")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname === "/dashboard/cong-tac-vien" ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý CTV"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faPeopleRoof} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý CTV</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/chinh-sach-cong-tac-vien")}
                className={menuItemClass("/dashboard/chinh-sach-cong-tac-vien")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname === "/dashboard/chinh-sach-cong-tac-vien" ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Chính sách CTV"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faShieldHalved} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Chính sách CTV</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/yeu-cau")}
                className={menuItemClass("yeu-cau")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("yeu-cau") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý yêu cầu"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faGlobe} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý yêu cầu</motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Internal Management Section */}
          <motion.div
            className={`${sectionTitleClass} cursor-pointer`}
            onClick={() => toggleSection('internal')}
            whileHover={{
              backgroundColor: "rgba(202, 138, 4, 0.08)",
              boxShadow: "0 2px 8px rgba(202, 138, 4, 0.08)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={microInteractionSpring}
            role="button"
            tabIndex={0}
            aria-expanded={expandedSections.internal}
            aria-controls="internal-section-content"
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('internal')}
          >
            <motion.span
              whileHover={{ color: elegantGold }}
              transition={microInteractionSpring}
            >
              Quản lý Nội bộ
            </motion.span>
            <motion.div
              animate={{
                rotate: expandedSections.internal ? 180 : 0,
                color: expandedSections.internal ? elegantGold : "currentColor"
              }}
              transition={mediumTransitionSpring}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className="w-3 h-3 text-gray-400"
              />
            </motion.div>
          </motion.div>

          <motion.div
            id="internal-section-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: expandedSections.internal ? 1 : 0,
              height: expandedSections.internal ? 'auto' : 0
            }}
            transition={mediumTransitionSpring}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-1">
              <motion.button
                onClick={() => navigate("/dashboard/employee")}
                className={menuItemClass("employee")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("employee") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý nhân viên"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faUserTie} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý nhân viên</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/voucher")}
                className={menuItemClass("voucher")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("voucher") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Quản lý voucher"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faTags} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Quản lý voucher</motion.span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/dashboard/membership")}
                className={menuItemClass("membership")}
                variants={menuItemHoverVariants}
                initial="rest"
                whileHover="hover"
                animate={pathname.includes("membership") ? "active" : "rest"}
                whileTap={{ scale: 0.98 }}
                aria-label="Giá hạng thẻ"
              >
                <motion.div variants={iconVariants}>
                  <FontAwesomeIcon icon={faSackDollar} className={iconClass} />
                </motion.div>
                <motion.span variants={textVariants}>Giá hạng thẻ</motion.span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-30">
        <motion.button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
          whileHover={{
            backgroundColor: "rgba(202, 138, 4, 0.08)",
            boxShadow: "0 2px 8px rgba(202, 138, 4, 0.12)"
          }}
          whileTap={{ scale: 0.9 }}
          transition={microInteractionSpring}
        >
          <FontAwesomeIcon
            icon={mobileMenuOpen ? faTimes : faBars}
            className="text-xl text-gray-700"
          />
        </motion.button>
        <div className="text-lg font-medium text-gray-800">Quản lý</div>
        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -280, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
              animate={{
                x: 0,
                boxShadow: "5px 0 25px rgba(0, 0, 0, 0.15)"
              }}
              exit={{ x: -280, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
              transition={heavyTransitionSpring}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-semibold overflow-hidden">
                    {userInfo?.avatar ? (
                      <Image
                        src={userInfo.avatar}
                        alt={userInfo.name || 'User'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {userInfo?.name || 'User'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo?.email || ''}
                    </p>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gold-600">
                  Dashboard
                </h2>
                <p className="text-sm text-gray-500">
                  {userInfo?.role === 'ADMIN' ? 'Quản trị viên' : 'Chủ doanh nghiệp'}
                </p>
              </div>

              <div className="py-2">{renderMenuItems()}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Auto-expanding on larger screens */}
      <motion.div
        className="hidden md:block border border-gray-100 bg-white m-4 rounded-xl shadow-lg sticky top-4 max-h-screen-sidebar"
        initial={{ opacity: 0, x: -20, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
        animate={{
          opacity: 1,
          x: 0,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(198, 168, 72, 0.05)"
        }}
        transition={mediumTransitionSpring}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-semibold overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 0 2px rgba(202, 138, 4, 0.3)"
              }}
              transition={microInteractionSpring}
            >
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  alt={userInfo.name || 'User'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.h3
                className="text-sm font-medium text-gray-900 truncate"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...microInteractionSpring }}
              >
                {userInfo?.name || 'User'}
              </motion.h3>
              <motion.p
                className="text-xs text-gray-500 truncate"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...microInteractionSpring }}
              >
                {userInfo?.email || ''}
              </motion.p>
            </div>
          </div>
          <motion.h2
            className="text-lg font-semibold text-gold-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...microInteractionSpring }}
          >
            Dashboard
          </motion.h2>
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...microInteractionSpring }}
          >
            {userInfo?.role === 'ADMIN' ? 'Quản trị viên' : 'Chủ doanh nghiệp'}
          </motion.p>
        </div>

        <div className="p-2">{renderMenuItems()}</div>
      </motion.div>

    </>
  );
}

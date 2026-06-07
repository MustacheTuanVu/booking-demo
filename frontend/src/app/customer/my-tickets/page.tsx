"use client";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate, formatDateTime3 } from "@/utils/date";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { FaClock, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaPen, FaExclamationTriangle, FaTicketAlt, FaBarcode, FaQrcode } from "react-icons/fa";
import dynamic from "next/dynamic";
import { 
  CustomerPageLayout, 
  CustomerCard,
  CustomerCardTabs,
  CustomerCardItem,
  CustomerCardButton,
  CustomerSnackbar
} from "@/components/CustomerLayout";
import { Animate, AnimateGroup } from "@/components/ui/animate";
import { Modal, Box, Typography, IconButton, Tooltip, Divider } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

// Lazy load the UpdateDrink component
const UpdateDrink = dynamic(() => import("@/app/dashboard/ticket-list/UpdateDrink"), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--clr-bg-1)]"></div>
    </div>
  ),
  ssr: false
});

interface OrderStatus {
  label: string;
  color: string;
}

interface StatusLabels {
  PAID: OrderStatus;
  FAILED: OrderStatus;
  CANCELED: OrderStatus;
  PENDING: OrderStatus;
  CONFIRMED: OrderStatus;
  [key: string]: OrderStatus;
}

interface ShowTime {
  time_start: string;
  [key: string]: any;
}

interface Event {
  _id: string;
  InfoShowTimes: ShowTime[];
  [key: string]: any;
}

interface EventDetail {
  title?: string;
  banner?: string;
  [key: string]: any;
}

interface Order {
  _id: string;
  status: string;
  total_price: number;
  code?: string;
  event_id: string;
  eventDetail?: EventDetail;
  InfoOrderItems?: any[];
  contentEvent?: any;
  [key: string]: any;
}

// Fixed address from the footer for all orders
const FIXED_LOCATION = "Tầng 1, 15 Lê Đại Cang, P. Thành Công, Tp. Buôn Ma Thuột, Đắk Lắk";

// Status values matching backend enum
const STATUS_TYPES = ["", "PAID", "PENDING", "FAILED", "CANCELED", "CONFIRMED"];
const STATUS_LABELS: StatusLabels = {
  "PAID": { label: "Thành công", color: "bg-green-100 text-green-800" },
  "FAILED": { label: "Lỗi", color: "bg-red-100 text-red-800" },
  "CANCELED": { label: "Đã hủy", color: "bg-gray-100 text-gray-800" },
  "PENDING": { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
  "CONFIRMED": { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" }
};

// Initial tab data structure
const INITIAL_TAB_DATA = [
  { label: "Tất cả", content: [] },
  { label: "Thành công", content: [] },
  { label: "Đang xử lý", content: [] },
  { label: "Đơn lỗi", content: [] },
  { label: "Đã hủy", content: [] },
];

// QR Code Modal Component
const QRCodeModal = memo(({ open, onClose, orderCode, orderTitle, eventDate }: { 
  open: boolean; 
  onClose: () => void; 
  orderCode?: string;
  orderTitle?: string;
  eventDate?: string;
}) => {
  const [isQrLoading, setIsQrLoading] = useState(true);
  
  const qrCodeUrl = orderCode
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${orderCode}&size=200x200`
    : "/images/qrcode.png";

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="qr-code-modal-title"
      aria-describedby="qr-code-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 3,
        borderRadius: 2,
        outline: 'none',
        maxWidth: '500px',
      }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Typography id="qr-code-modal-title" variant="h6" component="h2" sx={{ 
          mb: 1.5, 
          fontWeight: 600,
          textAlign: 'center',
          color: 'rgb(171, 141, 89)'
        }}>
          Mã Check-in
        </Typography>
        
        <Divider sx={{ mb: 2, borderColor: 'rgba(171, 141, 89, 0.2)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          mt: 1
        }}>
          <Typography variant="body1" sx={{ 
            textAlign: 'center', 
            fontWeight: 600,
            mb: 0.75,
            maxWidth: '100%',
            wordBreak: 'break-word' 
          }}>
            {orderTitle || "Vé sự kiện"}
          </Typography>
          
          {eventDate && (
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              mb: 2.5
            }}>
              {eventDate}
            </Typography>
          )}
          
          <Box sx={{ 
            p: 2,
            border: '3px solid rgb(171, 141, 89)',
            borderRadius: 2,
            mb: 2,
            backgroundColor: 'white',
            position: 'relative',
            width: '220px',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isQrLoading && (
              <Box sx={{
                position: 'absolute',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}>
                <Box sx={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(171, 141, 89, 0.2)',
                  borderRadius: '50%',
                  borderTop: '3px solid rgb(171, 141, 89)',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </Box>
            )}
            <Box sx={{ 
              width: '200px', 
              height: '200px', 
              position: 'relative',
              margin: '0 auto'
            }}>
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                fill
                style={{ objectFit: 'contain' }}
                priority
                onLoad={() => setIsQrLoading(false)}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <FaBarcode size={18} style={{ color: 'rgb(171, 141, 89)' }} />
            <Typography sx={{ 
              fontWeight: 600, 
              fontSize: '1.1rem',
              letterSpacing: '1px',
              color: 'rgb(171, 141, 89)'
            }}>
              {orderCode || "N/A"}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ 
            mt: 2,
            textAlign: 'center',
            color: 'text.secondary',
            fontStyle: 'italic',
            fontSize: '0.8rem'
          }}>
            Vui lòng xuất trình mã QR này cho nhân viên khi check-in
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
});

QRCodeModal.displayName = 'QRCodeModal';

// Custom Check In Button Component
const CheckInButton = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-[38px] px-4 rounded-lg font-medium transition-colors flex items-center justify-center bg-[rgb(171,141,89)] hover:bg-[rgb(151,121,69)] text-white relative whitespace-nowrap"
    >
      <span className="mr-1.5"><FaQrcode size={14} /></span>
      <span>Check in</span>
    </button>
  );
});

CheckInButton.displayName = 'CheckInButton';

// Memoized OrderItem component for better rendering performance
const OrderItem = memo(({ 
  order, 
  onViewDetails, 
  onUpdateDrink,
  onShowQRCode,
  getDataTimeEvent, 
  STATUS_LABELS 
}: { 
  order: Order; 
  onViewDetails: (id: string) => void; 
  onUpdateDrink: (order: Order) => void;
  onShowQRCode: (order: Order) => void;
  getDataTimeEvent: (id: string) => string;
  STATUS_LABELS: StatusLabels;
}) => {
  // Generate image URL only when needed
  const imageUrl = useMemo(() => {
    return order?.eventDetail?.banner 
      ? getMediaUrl(order.eventDetail.banner)
      : '/images/placeholder.jpg';
  }, [order?.eventDetail?.banner]);
  
  return (
    <CustomerCardItem 
      className="hover:bg-gray-50 transition-all rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex flex-col md:flex-row">
        {/* Event Image */}
        <div className="md:w-1/5 mb-4 md:mb-0 relative">
          <div className="relative w-full h-48 md:h-32 overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={order.eventDetail?.title || 'Event image'}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              style={{ objectFit: 'cover' }}
              loading="lazy"
              className="transition-all duration-300"
            />
          </div>
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
            {STATUS_LABELS[order.status]?.label || order.status}
          </div>
        </div>

        {/* Order Details */}
        <div className="md:w-[45%] md:px-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
            {order.eventDetail?.title || "Sự kiện không có tên"}
          </h3>
          
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-400 mr-2" size={14} />
              <span>{getDataTimeEvent(order.event_id)}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-400 mr-2" size={14} />
              <span className="line-clamp-1">
                {FIXED_LOCATION}
              </span>
            </div>
            <div className="flex items-center">
              <FaBarcode className="text-gray-400 mr-2" size={14} />
              <span className="font-medium">
                Mã đặt chỗ: {order.code || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="md:w-[35%] flex flex-col justify-center mt-4 md:mt-0 md:pl-4">
          <div className="text-lg font-bold text-[var(--clr-bg-1)] mb-3 md:text-right">
            <span className="text-sm text-gray-500 font-normal mr-1.5">Tổng:</span>
            {Number(order.total_price).toLocaleString()} đ
          </div>
          
          {/* Action Buttons Container - Adjusted for desktop layout */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-x-2 gap-y-2 w-full">
            <div className="col-span-1 md:col-span-1 md:mb-2">
              <CustomerCardButton
                label="Xem chi tiết"
                onClick={() => onViewDetails(order._id)}
                icon={<FaEye />}
                isPrimary={false}
                isFullWidth={true}
                className="h-[38px] whitespace-nowrap md:w-[85%] md:ml-auto"
              />
            </div>
            
            <div className="col-span-1 md:col-span-1 md:mb-2">
              <div className="w-full md:w-[85%] md:ml-auto">
                <CheckInButton onClick={() => onShowQRCode(order)} />
              </div>
            </div>
            
            {order.status === "PAID" && (
              <div className="col-span-2 md:col-span-1">
                <CustomerCardButton
                  label="Chỉnh sửa"
                  onClick={() => onUpdateDrink(order)}
                  icon={<FaPen />}
                  isPrimary={true}
                  isFullWidth={true}
                  className="h-[38px] md:w-[85%] md:ml-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerCardItem>
  );
});

OrderItem.displayName = 'OrderItem';

// Memoized EmptyState component
const EmptyState = memo(() => (
  <Animate variant="fade" duration={0.8}>
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <FaTicketAlt size={48} className="text-gray-300 mb-4" />
      <p className="text-lg font-medium">Không có chỗ đặt trước nào</p>
      <p className="text-sm mt-2">Bạn chưa có chỗ đặt trước nào trong mục này</p>
    </div>
  </Animate>
));

EmptyState.displayName = 'EmptyState';

export default function MyTickets() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndexMain, setTabIndexMain] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [eventSelected, setEventSelected] = useState<any>(null);
  const [comboData, setComboData] = useState<any>(null);
  const [tabData, setTabData] = useState(INITIAL_TAB_DATA);
  const [eventList, setEventList] = useState<Event[]>([]);
  
  // QR Code Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    code: string;
    title: string;
    date: string;
  }>({ code: "", title: "", date: "" });
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  // Constants
  const ITEMS_PER_PAGE = 10;

  // Fetch combo and event data only once on component mount
  useEffect(() => {
    let mounted = true;
    
    const fetchInitialData = async () => {
      try {
        // Use Promise.all to fetch parallel requests
        const [comboRes, eventRes] = await Promise.all([
          api.get(`combo_event/GetByCondition?page=1&limit=999999'`),
          api.get('/events/getEventByCondition?page=1&limit=50')
        ]);
        
        if (mounted) {
          setComboData(comboRes.data.combo);
          setEventList(eventRes.data.events);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (mounted) {
          setSnackbarMessage("Không thể tải dữ liệu");
          setSnackbarSuccess(false);
          setSnackbarOpen(true);
        }
      }
    };

    fetchInitialData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  // Memoized function to get event date/time
  const getDataTimeEvent = useCallback((eventId: string) => {
    const event = eventList.find((event: Event) => event._id === eventId);
    if (event && event.InfoShowTimes && event.InfoShowTimes.length > 0) {
      return formatDateTime3(event.InfoShowTimes[0].time_start);
    }
    return "N/A";
  }, [eventList]);

  // Memoized function to find combo by ID
  const handleCombo = useCallback((_id: string) => {
    return comboData?.find((combo: any) => combo._id === _id) || null;
  }, [comboData]);

  // Optimized function to fetch order list with error handling and state updates
  const getOrderList = useCallback(async (status = "", page = 1, tabIndex = tabIndexMain) => {
    setIsLoading(true);
    
    try {
      // Build query with pagination and optional status filter
      let query = `/orders/GetMyOrder?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (status) {
        query += `&status=${status}`;
      }

      const res = await api.get(query);

      // Backend returns pagination info
      const { orders, total, totalPages: pages, currentPage: pageNumber } = res.data;

      // Update state with current tab data (using functional update to avoid stale state)
      setTabData(prevTabData => {
        const newTabData = [...prevTabData];
        newTabData[tabIndex] = {
          ...newTabData[tabIndex],
          content: orders || []
        };
        return newTabData;
      });

      // Update pagination info
      setTotalPages(pages || 1);
      setTotalItems(total || 0);
      setCurrentPage(pageNumber || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setSnackbarMessage("Không thể tải dữ liệu chỗ đặt trước");
      setSnackbarSuccess(false);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [tabIndexMain]);

  // Load data when tab changes
  useEffect(() => {
    getOrderList(STATUS_TYPES[tabIndexMain], 1, tabIndexMain);
  }, [tabIndexMain, getOrderList]);

  // Handler for tab changes
  const handleTabChange = useCallback((index: number) => {
    setTabIndexMain(index);
    setCurrentPage(1); // Reset to first page when changing tabs
  }, []);

  // Handler for page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    getOrderList(STATUS_TYPES[tabIndexMain], page);
  }, [tabIndexMain, getOrderList]);

  // Handler to navigate to detail page
  const handleViewDetails = useCallback((id: string) => {
    // Store the current customer page URL with a special identifier for customers
    localStorage.setItem("previousURL", `${window.location.pathname}?customer=true`);
    router.push('/ve/' + id);
  }, [router]);

  // Memoized pagination rendering
  const renderPagination = useMemo(() => {
    const pages = [];
    // Show max 5 page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="mx-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          «
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-3 py-1 rounded-lg ${i === currentPage
            ? "bg-[var(--clr-bg-1)] text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="mx-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          »
        </button>
      );
    }

    return pages;
  }, [currentPage, totalPages, handlePageChange]);

  // Optimized handler for update drink
  const handleUpdateDrink = useCallback((sourceJson: Order) => {
    // Extract combo info from the first order item
    const extractedCombos = sourceJson.InfoOrderItems?.[0]?.combo_info || [];

    // Create quantities object from extracted combos
    const quantities: Record<string, number> = {};
    extractedCombos.forEach((combo: any, index: number) => {
      quantities[`${index + 1}-${combo.comboId}`] = 1;
    });

    // Format the time from contentEvent.time
    const eventTime = new Date(sourceJson.contentEvent.time);
    const formattedTime = `${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`;

    // Extract the date from contentEvent.time
    const eventDate = eventTime.toISOString().split('T')[0];

    // Create the transformed JSON
    const targetJson = {
      id: sourceJson._id,
      time: formattedTime,
      time_end: sourceJson.contentEvent?.time || "",
      title: sourceJson.eventDetail?.title || "Unknown Event",
      performer: "",
      status: sourceJson.status.toLowerCase(),
      genre: "Music",
      banner: sourceJson.eventDetail?.banner || "",
      slug: sourceJson.eventDetail?.slug || "",
      desc: sourceJson.eventDetail?.desc || "",
      combos: extractedCombos.map((combo: any) => (
        handleCombo(combo.comboId)
      )),
      date: eventDate,
      quantities: quantities
    };

    setEventSelected(targetJson);
  }, [handleCombo]);

  // Handler for showing QR code
  const handleShowQRCode = useCallback((order: Order) => {
    // For testing: Allow showing modal even for orders without a code
    if (!order.code) {
      // Show warning but still open the modal with placeholder
      setSnackbarMessage("Đơn hàng này chưa có mã QR (hiển thị cho mục đích kiểm thử)");
      setSnackbarSuccess(false);
      setSnackbarOpen(true);
      
      setQrModalData({
        code: "TEST-QR-CODE",
        title: order.eventDetail?.title || "Sự kiện (Thử nghiệm)",
        date: getDataTimeEvent(order.event_id)
      });
      setQrModalOpen(true);
      return;
    }
    
    setQrModalData({
      code: order.code,
      title: order.eventDetail?.title || "Sự kiện",
      date: getDataTimeEvent(order.event_id)
    });
    setQrModalOpen(true);
  }, [getDataTimeEvent]);

  // Snackbar close handler
  const closeSnackbar = useCallback(() => setSnackbarOpen(false), []);

  // Memoized tab content to avoid frequent recalculations
  const tabContent = useMemo(() => {
    return tabData.map((tab, index) => ({
      label: tab.label,
      content: (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--clr-bg-1)]"></div>
            </div>
          ) : tab.content.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <Animate variant="fade" duration={0.5}>
                <div className="mb-4 text-right text-gray-700">
                  <p>Tổng số: {totalItems} đơn hàng</p>
                </div>
              </Animate>

              <AnimateGroup 
                staggerDelay={0.05} // Reduced from 0.1 for faster appearance
                childVariant="slide-up" 
                className="space-y-4"
              >
                {tab.content.map((order: Order) => (
                  <OrderItem
                    key={order._id}
                    order={order}
                    onViewDetails={handleViewDetails}
                    onUpdateDrink={handleUpdateDrink}
                    onShowQRCode={handleShowQRCode}
                    getDataTimeEvent={getDataTimeEvent}
                    STATUS_LABELS={STATUS_LABELS}
                  />
                ))}
              </AnimateGroup>

              {totalPages > 1 && (
                <Animate variant="fade" delay={0.1} duration={0.3}>
                  <div className="flex justify-center mt-6">
                    {renderPagination}
                  </div>
                </Animate>
              )}
            </>
          )}
        </div>
      )
    }));
  }, [tabData, isLoading, totalItems, totalPages, handleViewDetails, handleUpdateDrink, handleShowQRCode, getDataTimeEvent, renderPagination]);

  return (
    <CustomerPageLayout 
      title="Chỗ Đặt Trước" 
      subtitle="Quản lý và theo dõi các chỗ bạn đã đặt trước"
      description="Trang quản lý chỗ đặt trước tại Queen Acoustic."
      isLoading={false}
    >
      <Animate variant="fade" duration={0.5}>
        <CustomerCard title="Danh sách chỗ đặt trước">
          <CustomerCardTabs
            tabs={tabContent}
            activeIndex={tabIndexMain}
            onChange={handleTabChange}
          />
        </CustomerCard>
      </Animate>
      
      {/* QR Code Modal */}
      <QRCodeModal 
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        orderCode={qrModalData.code}
        orderTitle={qrModalData.title}
        eventDate={qrModalData.date}
      />
      
      {eventSelected && (
        <UpdateDrink
          event={eventSelected}
          open={!!eventSelected}
          handleClose={() => setEventSelected(null)}
        />
      )}
      
      <CustomerSnackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={closeSnackbar}
        isSuccess={snackbarSuccess}
      />
    </CustomerPageLayout>
  );
}

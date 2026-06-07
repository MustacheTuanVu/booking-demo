/* eslint-disable react-hooks/exhaustive-deps */
"use client"; // Khai báo component chạy ở phía client

// Import các thành phần, thư viện cần thiết
import { AppContext } from "@/context/AppContext";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { 
  faAnglesRight, 
  faArrowLeft, 
  faCircleExclamation, 
  faClose, 
  faDoorOpen, 
  faMinus, 
  faPlus, 
  faInfoCircle,
  faCalendarAlt,
  faMapMarkerAlt,
  faTicketAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState, useMemo, useCallback, memo, lazy, Suspense } from "react";
// Import SeatSelection with discount code functionality
import SeatSelection from "@/components/SeatSelection";
import BookingSummary from "@/components/BookingSummary";
import SeatLayout from '@/app/su-kien/[id]/[ref]/bookings/select-ticket/SeatLayout';
import CircularProgress from "@mui/material/CircularProgress";
import LoadingSkeleton from './LoadingSkeleton';

// Lazy load heavy components
const DrinksMenu = lazy(() => import("@/components/booking/DrinksMenu"));
const OrderSummaryPreview = lazy(() => import("./OrderSummaryPreview"));
const PaymentLoadingOverlay = lazy(() => import("./PaymentLoadingOverlay "));
import BookingProgressWidget from "@/components/booking/BookingProgressWidget";

// Interface định nghĩa cấu trúc của combo
interface Combo {
  _id: string;
  name: string;
  size_seat: number;
  size_food: number;
  size_drink: number;
  price: number;
  menu_id: string;
  status: string;
  MenuOrder: {
    _id: string;
    name: string;
    description: string;
    type: string;
    status: string;
    image?: string;
    DRINK: any[];
    FOOD: any[];
  };
  // Added properties for grouped combos
  count?: number;
  original_size_food?: number;
  original_size_drink?: number;
  original_size_seat?: number;
}

// Add utility components after all imports but before the main component
const MemoizedComboItem = memo(function ComboItem({ 
  dialog, 
  index, 
  selectedItems, 
  handleOpenComboDialog 
}: {
  dialog: any;
  index: number;
  selectedItems: any;
  handleOpenComboDialog: (index: number) => void;
}) {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
    >
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center max-w-[calc(100%-100px)] mr-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {dialog.combo.name}
            </h3>
            {dialog.combo.count && dialog.combo.count > 1 && (
              <span className="ml-2 inline-flex flex-shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800 whitespace-nowrap">
                x{dialog.combo.count}
              </span>
            )}
          </div>
          
          {/* Mobile "Chọn Món" button - always visible regardless of selection status */}
          <div className="sm:hidden">
            <button
              className="px-4 py-1.5 bg-gold-600 hover:bg-gold-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 text-sm flex-shrink-0"
              onClick={() => handleOpenComboDialog(index)}
            >
              <span>Chọn Món</span>
            </button>
          </div>
          
          {/* Desktop button */}
          <div className="hidden sm:block">
            <button
              className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all flex-shrink-0"
              onClick={() => handleOpenComboDialog(index)}
            >
              Chọn Món
            </button>
          </div>
        </div>
        
        {/* Requirements subtitle with check/cross icons */}
        <div className="mt-1.5 text-sm text-gray-500 flex items-center flex-wrap gap-x-3 gap-y-1">
          {/* Drink requirement */}
          <div className="flex items-center">
            <span>
              {dialog.combo.size_drink} đồ uống
            </span>
            {selectedItems[dialog.id] && (
              selectedItems[dialog.id].drink.reduce((sum: number, item: any) => sum + item.quantity, 0) === dialog.combo.size_drink ? (
                <svg className="w-4 h-4 ml-1 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )
            )}
          </div>

          {/* Food requirement - only show if required */}
          {dialog.combo.size_food > 0 && (
            <div className="flex items-center">
              <span>
                {dialog.combo.size_food} món ăn
              </span>
              {selectedItems[dialog.id] && (
                selectedItems[dialog.id].food.reduce((sum: number, item: any) => sum + item.quantity, 0) === dialog.combo.size_food ? (
                  <svg className="w-4 h-4 ml-1 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {selectedItems[dialog.id] && (
        <SelectedItemsList items={selectedItems[dialog.id]} />
      )}
    </div>
  );
});

const SelectedItemsList = memo(function SelectedItemsList({ items }: { items: any }) {
  return (
    <div className="mt-3 border-t border-gray-100 pt-3 px-4 pb-4">
      <div className="relative p-4 bg-[rgba(171,141,89,0.03)] border border-[rgba(171,141,89,0.1)] rounded-lg overflow-hidden">
        {/* Gold accent bar on the left */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[rgba(171,141,89,0.6)]"></div>
        
        {/* Items container with dashed border */}
        <div className="ml-2 pl-3 border-l border-dashed border-[rgba(171,141,89,0.25)]">
          {/* Drink items */}
          {items.drink.length > 0 && (
            <>
              {items.drink
                .sort((a: any, b: any) => b.quantity - a.quantity)
                .map((item: any, i: number) => (
                  <div 
                    key={`drink-${i}`} 
                    className="flex items-center mb-2 last:mb-0"
                  >
                    {/* Item icon */}
                    <div className="w-6 h-6 mr-2 text-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 4l1.5 16h9L18 4H6z" />
                        <path d="M4 4h16" />
                      </svg>
                    </div>
                    
                    {/* Item name and quantity */}
                    <div className="text-gray-700 text-sm font-medium">
                      <span>{item.name}</span>
                      <span className="ml-1.5 text-xs text-gray-500 font-normal">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
          
          {/* Food items */}
          {items.food.length > 0 && (
            <>
              {items.food
                .sort((a: any, b: any) => b.quantity - a.quantity)
                .map((item: any, i: number) => (
                  <div 
                    key={`food-${i}`} 
                    className="flex items-center mb-2 last:mb-0"
                  >
                    {/* Item icon */}
                    <div className="w-6 h-6 mr-2 text-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 11h4.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2H10" />
                        <path d="M12 4v16" />
                        <path d="M12 4L8 8" />
                        <path d="M12 4l4 4" />
                      </svg>
                    </div>
                    
                    {/* Item name and quantity */}
                    <div className="text-gray-700 text-sm font-medium">
                      <span>{item.name}</span>
                      <span className="ml-1.5 text-xs text-gray-500 font-normal">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// Component chính hiển thị bản đồ ghế và các dialog liên quan đặt chỗ
export default function CanvasSeatMap() {
  useContext(AppContext);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSMUp = useMediaQuery(theme.breakpoints.up("xs"));
  const { userInfo } = useContext(AppContext);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [isExceedingSeatsAvailable, setIsExceedingSeatsAvailable] = useState(false);
  const [openDialogMaxChair, setOpenDialogMaxChair] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogMaxArea, setOpenDialogMaxArea] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [openselectedArea, setOpenSelectedArea] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tempSeatCount, setTempSeatCount] = useState<{ [key: string]: number }>({});
  const [dialogCombos, setDialogCombos] = useState<{ id: string, show: boolean, combo: Combo }[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [comboId: string]: { food: any[], drink: any[] } }>({});
  // Calculate the total seats required across all combos
  // This now correctly accounts for multiple quantities of the same combo
  const totalSeatsInCombos = useMemo(() => {
    return dialogCombos?.length > 0 
      ? dialogCombos.reduce((total, dialog) => {
          // The size_seat already includes the multiplier from the count
          // For clarity: each combo's seat requirement is now: original_size_seat * count
          return total + dialog.combo.size_seat;
        }, 0)
      : 0;
  }, [dialogCombos]);
  const [seatQuantities, setSeatQuantities] = useState<any>({
    J: "",
    Q: "",
    K: "",
  });

  // Thêm state để hiển thị màn hình tổng kết đơn hàng
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<any>(null);

  const [stepChoiceItem, setStepChoiceItem] = useState('DRINK');

  const totalSeatsSelected: number = useMemo(() => {
    return Object.values(seatQuantities).reduce(
      (sum: number, value: unknown) => sum + Number(value as string | number),
      0
    );
  }, [seatQuantities]);
  
  const remainingSeatsToChoose = useMemo(() => {
    return totalSeatsInCombos - totalSeatsSelected;
  }, [totalSeatsInCombos, totalSeatsSelected]);
  
  // Add a function to check if we've reached the max seats allowed across all areas
  const hasReachedMaxSeats = () => {
    return totalSeatsSelected >= totalSeatsInCombos;
  };
  
  // Calculate total seats including temporary count for current area
  const getRealTimeTotal = (area: string | null) => {
    if (!area) return totalSeatsSelected;
    
    // Get the confirmed seat count for all areas
    const confirmedTotal = Object.entries(seatQuantities).reduce(
      (sum, [key, value]) => {
        // Skip the current area as we'll use the temp count for it
        if (key === area) return sum;
        return sum + Number(value || 0);
      }, 
      0
    );
    
    // Add the temporary count for the current area
    return confirmedTotal + (tempSeatCount[area] || 0);
  };

  console.log('remainingSeatsToChoose', totalSeatsInCombos, totalSeatsSelected)
  const [eventSelected, setEventSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const savedEvent = localStorage.getItem("eventSelected");
      return savedEvent ? JSON.parse(savedEvent) : null;
    }
    return null;
  });

  useEffect(() => {
    if (!eventSelected) {
      const savedEvent = localStorage.getItem("eventSelected");
      if (savedEvent) {
        setEventSelected(JSON.parse(savedEvent));
      }
    }
  }, []);
  const handleIncrease = (currentArea: string) => {
    // Check if adding 1 more seat would exceed the total seats limit
    if (currentArea && getRealTimeTotal(currentArea) < totalSeatsInCombos) {
      setTempSeatCount(prev => ({
        ...prev,
        [currentArea]: (prev[currentArea] || 0) + 1, // Tăng số lượng ghế của khu đang chọn
      }));

      const newEvent = { target: { value: String((tempSeatCount[currentArea] || 0) + 1) } } as React.ChangeEvent<HTMLInputElement>;
      handleQuantityChange(currentArea)(newEvent);
    } else if (getRealTimeTotal(currentArea) >= totalSeatsInCombos) {
      // Show the max chairs dialog if trying to exceed limit
      setOpenDialogMaxChair(true);
    }
  };

  const handleDecrease = (currentArea: string) => {
    if (currentArea && (tempSeatCount[currentArea] || 0) > 0) {
      setTempSeatCount(prev => ({
        ...prev,
        [currentArea]: (prev[currentArea] || 0) - 1, // Giảm số lượng ghế của khu đang chọn
      }));

      const newEvent = { target: { value: String((tempSeatCount[currentArea] || 0) - 1) } } as React.ChangeEvent<HTMLInputElement>;
      handleQuantityChange(currentArea)(newEvent);
    }
  };
  const handleRemoveArea = (area: string) => {
    setSelectedAreas(prev => prev.filter(a => a !== area)); // Xóa khu vực khỏi danh sách

    setSeatQuantities((prev: any) => {
      const updated = { ...prev };
      delete updated[area]; // Xóa số ghế đã chọn của khu vực đó
      return updated;
    }
    );

    setTempSeatCount(prev => {
      const updated = { ...prev };
      delete updated[area]; // Xóa số ghế tạm thời nếu có
      return updated;
    });

    if (selectedAreas.length === 1) {
      setOpenSelectedArea(false); // Đóng popup nếu không còn khu vực nào
    }
  };
  // State for booking date dialog
  const [openBookingDateDialog, setOpenBookingDateDialog] = useState(false);
  const [bookingDateMessage, setBookingDateMessage] = useState("");

  const handleCloseBookingDateDialog = () => {
    setOpenBookingDateDialog(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    // Reset any upsell items to prevent price duplication when reopening
    setPaidDrinkQuantities({});
  };

  // Add a specific handler for the max chair dialog
  const handleMaxChairDialogClose = () => {
    setOpenDialogMaxChair(false);
  };

  // Add null check on eventSelected and eventSelected.quantities
  const quantityCombo: any = eventSelected && eventSelected.quantities 
    ? Object.values(eventSelected.quantities).reduce((sum: any, value) => sum + value, 0) 
    : 0;

  // Lấy các tham số từ URL (quantityCombo, ref, id)
  const { ref } = useParams<any>();
  // Xác định số lượng combo (nếu không có thì mặc định là 1)
  const freeDrinkLimit = Number(quantityCombo) || 1;

  // Sử dụng hook của Material UI để lấy theme và kiểm tra kích thước màn hình
  const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));

  // Tạo ref cho container
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sử dụng router của Next.js để điều hướng
  const router = useRouter();

  // Lấy thêm tham số id từ URL
  const { id } = useParams();

  // State lưu trữ chi tiết sự kiện và danh sách menu (combo đồ uống,...)
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any>([]);

  // State điều khiển hiển thị dialog chọn khách hàng
  const [openSelectCustomer, setOpenSelectCustomer] = useState<any>(false);

  // Chuyển đổi state để lưu trữ các combo từ eventSelected
  const [comboMenu, setComboMenu] = useState<{ id: string, combo: Combo }[]>([]);

  // Chuyển đổi state cho dialog combos


  // State cho dialog đồ uống trả phí
  const [openPaidDrinkDialog, setOpenPaidDrinkDialog] = useState(false);

  // State for discount code
  const [discountCode, setDiscountCode] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // Handler for discount code changes
  const handleDiscountCodeChange = (code: string) => {
    setDiscountCode(code);
  };

  // Khởi tạo danh sách combos
  useEffect(() => {
    if (eventSelected && eventSelected.combos && eventSelected.quantities) {
      // Group combos by their ID and count occurrences
      const groupedCombos: { [comboId: string]: { combo: Combo, count: number } } = {};

      // Lặp qua tất cả các combo trong quantities
      Object.keys(eventSelected.quantities).forEach(key => {
        // Phân tách key để lấy thông tin combo ID (format: "eventId-comboId")
        const parts = key.split('-');
        if (parts.length === 2) {
          const comboId = parts[1];
          // Tìm combo tương ứng trong danh sách combos
          const combo = eventSelected.combos.find((c: Combo) => c._id === comboId);
          
          // Only process combos with quantity > 0
          const count = eventSelected.quantities[key];
          if (combo && count > 0) {
            // Add combo to grouped object with count
            if (groupedCombos[comboId]) {
              groupedCombos[comboId].count += count;
            } else {
              groupedCombos[comboId] = { combo, count };
            }
          }
        }
      });

      // Convert grouped combos to array format for state
      const combosToShow = Object.entries(groupedCombos).map(([comboId, { combo, count }]) => ({
        id: `${comboId}`,
        combo: {
          ...combo,
          // Multiply the food, drink and seat limits by the quantity of this combo
          size_food: combo.size_food * count,
          size_drink: combo.size_drink * count,
          size_seat: combo.size_seat * count,
          // Save the original values and count for reference
          original_size_food: combo.size_food,
          original_size_drink: combo.size_drink,
          original_size_seat: combo.size_seat,
          count: count
        }
      }));

      setComboMenu(combosToShow);

      // Khởi tạo trạng thái dialog cho mỗi combo
      const dialogStates = combosToShow.map(item => ({
        id: item.id,
        show: false,
        combo: item.combo
      }));

      setDialogCombos(dialogStates);
    } else {
      // Clear states if no eventSelected or no combos
      setComboMenu([]);
      setDialogCombos([]);
    }
  }, [eventSelected]);

  const handleOpenComboDialog = (index: number) => {
    if (index >= dialogCombos.length) {
      // Nếu đã xử lý hết tất cả combo, mở dialog đồ uống trả phí
      setOpenPaidDrinkDialog(true);
    } else {
      setStepChoiceItem('DRINK')
      // Cập nhật state để hiển thị dialog cho combo tại index
      setDialogCombos(prevState =>
        prevState.map((item, i) =>
          i === index ? { ...item, show: true } : item
        )
      );
    }
  };

  const handleCloseComboDialog = (index: number) => {
    setDialogCombos(prevState =>
      prevState.map((item, i) =>
        i === index ? { ...item, show: false } : item
      )
    );
  };

  // State lưu số lượng đồ uống miễn phí và trả phí
  const [freeDrinkQuantities, setFreeDrinkQuantities] = useState<{ [comboId: string]: { [itemId: string]: number } }>({});
  const [paidDrinkQuantities, setPaidDrinkQuantities] = useState<any>({});

  // Calculate total amount for paid drinks
  //totalAmount = giá combo * số lượng combo
  const totalAmount = useMemo(() => {
    return dialogCombos.reduce((sum, dialog) => sum + (dialog.combo.price * (dialog.combo.count || 1)), 0) +
      Object.keys(paidDrinkQuantities).reduce((sum, itemId) => {
        const item = menuItems.find((menuItem: any) => menuItem._id === itemId);
        const quantity = paidDrinkQuantities[itemId] || 0;
        return sum + (item?.price || 0) * quantity;
      }, 0);
  }, [dialogCombos, paidDrinkQuantities, menuItems]);

  // Hàm xử lý khi khách hàng đã hoàn tất chọn thông tin khách hàng
  const handleFinishCustomer = async (customerInfo: any) => {
    try {
      // Tạo body cho request API
      const finalDiscountCode = previewOrder.discountCode;

      const body: any = {
        "event_id": eventDetails._id,
        "seat_id": eventDetails.InfoSeatMap._id,
        "showtimes_id": eventDetails.InfoShowTimes[0]._id,
        "employee_id": null,
        "promotion_code": finalDiscountCode,
        "note": null,
        "status": "PENDING",
        "createOrderDetail": previewOrder.orderDetails,
        "phone": customerInfo.phone,
        "email": customerInfo.email,
        "name": customerInfo.name
      };

      // Gọi API staff-create
      const response = await api.post('orders/staff-create', body);

      // Xử lý response
      if (response?.data?.length === 2) {
        setBill(response.data);
        setFinish(true);
      }

      return response;
    } catch (error: any) {
      console.error("Error creating order:", error.response?.data?.message || error);
      if (error?.response?.data?.code) {
        alert(error?.response?.data?.message);
      } else {
        alert('Lỗi tạo order, liên hệ nhân viên để trợ giúp');
      }
      return null;
    }
  };

  // Hàm lấy chi tiết sự kiện và danh sách combo đồ uống từ API
  const getEventDetails = async () => {
    // Gọi API lấy chi tiết sự kiện dựa vào slug (id)
    const eventResponse = await api.get('/events/getDetailEventBySlug' + '?slug=' + id);
    // Nếu có dữ liệu, lưu đối tượng đầu tiên; nếu không thì set null
    setEventDetails(eventResponse.data ? eventResponse.data : null);

    // Gọi API lấy danh sách menu (combo đồ uống)
    const menuItemsResponse = await api.get('/menu_item/GetMyMenuItem?page=1&limit=999999');
    setMenuItems(menuItemsResponse.data && menuItemsResponse.data.menuItem ? menuItemsResponse.data.menuItem : []);
  };

  // Scroll to top when component mounts (especially important for mobile)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Gọi hàm getEventDetails ngay khi component được mount
  useEffect(() => {
    getEventDetails();

    return () => {
      // Thêm code cleanup ở đây
      console.log('Component đã bị unmount');
      // saveEventSelected(null);
      // localStorage.removeItem("eventSelected");
    };
  }, []);

  // State lưu hóa đơn (bill) sau khi tạo order thành công
  const [bill, setBill] = useState<any>(null);

  // Hàm tìm kiếm thông tin của ghế theo tên từ dữ liệu orderSeats
  function getSeatInfo(dataSeatName: any, orderSeatsData: any) {
    // Duyệt qua từng đối tượng trong mảng orderSeatsData
    for (const item of orderSeatsData) {
      // Tìm trong mảng data_seat xem có ghế nào có name trùng với dataSeatName không
      const foundSeat = item.data_seat.find((seat: any) => seat.name === dataSeatName);
      if (foundSeat) {
        // Nếu tìm thấy, trả về thông tin gồm id của ghế, giá chỗ và id từ hệ thống CukCuk
        return {
          seat_id: foundSeat.id,
          price: item.price,
          cukcuk_id: foundSeat.cukcuk_id
        };
      }
    }
    // Nếu không tìm thấy ghế phù hợp, trả về null
    return null;
  }

  // Hàm xử lý khi người dùng chọn combo đồ uống miễn phí
  const handleComboSelection = (comboId: string, quantities: { [itemId: string]: number }) => {
    const selectedFood: any[] = [];
    const selectedDrink: any[] = [];

    // Lấy combo hiện tại
    const currentCombo = dialogCombos.find(item => item.id === comboId)?.combo;
    if (!currentCombo) return;

    // Lặp qua số lượng món đã chọn
    Object.keys(quantities).forEach(itemId => {
      const quantity = quantities[itemId];
      if (quantity > 0) {
        if (currentCombo.MenuOrder.FOOD) {
          const foodItem = currentCombo.MenuOrder.FOOD.find(f => f._id === itemId);

          if (foodItem) {
            selectedFood.push({ ...foodItem, quantity });
          }
        }
        
        const drinkItem = currentCombo.MenuOrder.DRINK.find(d => d._id === itemId);

        
        if (drinkItem) {
          selectedDrink.push({ ...drinkItem, quantity });
        }
      }
    });

    // Cập nhật danh sách món đã chọn
    setSelectedItems(prev => ({
      ...prev,
      [comboId]: { food: selectedFood, drink: selectedDrink }
    }));

    // Thêm dòng này để cập nhật freeDrinkQuantities
    setFreeDrinkQuantities(prev => ({
      ...prev,
      [comboId]: quantities
    }));

    // Đóng dialog
    const currentIndex = dialogCombos.findIndex(item => item.id === comboId);
    handleCloseComboDialog(currentIndex);
  };
  const allCombosSelected = dialogCombos.every(dialog => {
    const selected = selectedItems[dialog.id];
    return (
      selected &&
      selected.food.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_food &&
      selected.drink.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_drink
    );
  });
  // Hàm xử lý khi người dùng muốn quay lại dialog trước
  const handleBackDialog = () => {
    // Nếu đang ở dialog đồ uống trả phí
    if (openPaidDrinkDialog) {
      setOpenPaidDrinkDialog(false);
      // Mở lại dialog combo cuối cùng
      if (dialogCombos.length > 0) {
        handleOpenComboDialog(dialogCombos.length - 1);
      }
      return;
    }

    // Tìm dialog combo đang mở
    const currentIndex = dialogCombos.findIndex(dialog => dialog.show);
    if (currentIndex > 0) {
      // Đóng dialog hiện tại
      handleCloseComboDialog(currentIndex);
      // Mở lại dialog trước đó
      handleOpenComboDialog(currentIndex - 1);
    }
  };

  // Hàm để chuẩn bị dữ liệu đơn hàng cho màn hình tổng kết
  const prepareOrderData = (paidQuantities: any = null, discountCodeParam: any = '') => {
    // Prepare data for food/drinks
    const combo_info: any = [];
    const item_upsell: any = [];

    // Process free items from combos
    Object.keys(freeDrinkQuantities).forEach(comboId => {
      const comboItems = freeDrinkQuantities[comboId];
      const selectedItems: any[] = [];

      // Find matching combo
      let currentCombo = null;
      for (const dialogCombo of dialogCombos) {
        if (dialogCombo.id === comboId) {
          currentCombo = dialogCombo.combo;
          break;
        }
      }

      if (!currentCombo) return;

      // Map selected items in combo
      Object.keys(comboItems).forEach(itemId => {
        const quantity = comboItems[itemId];
        if (quantity > 0) {
          let item = null;
          const foodItem = currentCombo.MenuOrder.FOOD ? currentCombo.MenuOrder.FOOD.find((f: any) => f._id === itemId) : null;
          const drinkItem = currentCombo.MenuOrder.DRINK.find((d: any) => d._id === itemId);
          item = foodItem || drinkItem;

          if (item) {
            selectedItems.push({
              "itemId": item._id,
              "quantity": quantity,
              "name": item.name,
              "desc": item.desc || "",
              "ingredient": item.ingredient || "",
              "category_name": item.category_name || "",
              "type": item.type,
              "unit": item.unit || "",
              "price": item.price || 0,
              "code_cukcuk": item.code_cukcuk || "",
              "item_id_cukcuk": item.item_id_cukcuk || "",
              "item_name_cukcuk": item.item_name_cukcuk || ""
            });
          }
        }
      });

      // Add combo and selected items to combo_info
      combo_info.push({
        "comboId": currentCombo._id,
        "name": currentCombo.name,
        "items": selectedItems,
        "price": currentCombo.price,
        "count": currentCombo.count || 1
      });
    });

    // Process paid items
    const paidItems = paidQuantities || paidDrinkQuantities;
    Object.keys(paidItems).forEach(itemId => {
      const quantity = paidItems[itemId];
      if (quantity > 0) {
        const item = menuItems.find((menuItem: any) => menuItem._id === itemId);
        if (item) {
          item_upsell.push({
            "itemId": item._id,
            "quantity": quantity,
            "name": item.name,
            "desc": item.desc || "",
            "ingredient": item.ingredient || "",
            "category_name": item.category_name || "",
            "type": item.type,
            "unit": item.unit || "",
            "price": item.price || 0,
            "code_cukcuk": item.code_cukcuk || "",
            "item_id_cukcuk": item.item_id_cukcuk || "",
            "item_name_cukcuk": item.item_name_cukcuk || ""
          });
        }
      }
    });

    // Update j_size, q_size, k_size based on selected seat quantities
    const j_size = parseInt(seatQuantities["J"] || "0");
    const q_size = parseInt(seatQuantities["Q"] || "0");
    const k_size = parseInt(seatQuantities["K"] || "0");

    // Create order details object
    const orderDetails = {
      combo_info,
      item_upsell,
      j_size,
      q_size,
      k_size
    };

    // Calculate total price
    const totalComboPrice = combo_info.reduce((total: number, combo: any) => {
      // Use the count from the combo_info object itself, which we already set correctly when creating it
      return total + (combo.price * combo.count);
    }, 0);

    const totalUpsellPrice = item_upsell.reduce((total: number, item: any) =>
      total + (item.price * item.quantity), 0);

    const totalPrice = totalComboPrice + totalUpsellPrice;

    const orderSummary = {
      event: eventDetails,
      orderDetails: orderDetails,
      totalPrice: totalPrice,
      discountCode: discountCodeParam
    };

    return orderSummary;
  };


  // Hàm mới để xác nhận đơn hàng sau khi xem tổng kết
  const handleConfirmOrder = async (directDiscountCode?: string, phoneNumber?: string) => {
    try {
      console.log('User', userInfo)
      // Tạo body cho request API
      const finalDiscountCode = directDiscountCode || previewOrder.discountCode;

      const body: any = {
        "event_id": eventDetails._id,
        "seat_id": eventDetails.InfoSeatMap._id,
        "showtimes_id": eventDetails.InfoShowTimes[0]._id,
        "employee_id": null,
        "promotion_code": finalDiscountCode,
        "note": null,
        "referred_by": null,
        "status": "PENDING",
        "createOrderDetail": previewOrder.orderDetails
      };

      // Xử lý thông tin khách hàng
      if (ref && ref !== '666') {
        body.referred_by = ref;
      }

      let response;

      // Gọi API create order với query param phone nếu có
      if (phoneNumber) {
        if (phoneNumber.includes('@')) {
          response = await api.post(`orders/Create?email=${phoneNumber}`, body);
        } else {
          response = await api.post(`orders/Create?phone=${phoneNumber}`, body);
        }
        
      } else {
        response = await api.post('orders/Create', body);
      }

      // Xử lý response
      if (response?.data?.length === 2) {
        setBill(response.data);
        setFinish(true);
      }

      return response;
    } catch (error: any) {
      console.error("Error creating order:", error.response?.data?.message || error);
      if (error?.response?.data?.code) {
        alert(error?.response?.data?.message);
      } else {
        alert('Lỗi tạo order, liên hệ nhân viên để trợ giúp');
      }
      return null;
    }
  };

  // Handler for when the user confirms the order from the preview screen
  const handleOrderConfirmation = async (discountCode: string, customerInfo: any) => {
    setShowOrderSummary(false);
    setIsProcessingPayment(true);
    try {
      let phoneToUse = null;
      // Xử lý thông tin khách hàng
      try {
        const createUserResponse = await api.post('users/createUser', {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          password: customerInfo.password
        });

        if (!createUserResponse?.data?.infoUser) {
          phoneToUse = customerInfo.phone;
        } else if (createUserResponse?.data?.infoUser?.phone) {
          phoneToUse = createUserResponse?.data?.infoUser?.phone
        } else {
          phoneToUse = customerInfo.phone;
        }
      } catch (error: any) {
        if (userInfo && userInfo.email) {
          
        } else {
          if (error?.response?.data?.code == 'EMAIL_IS_EXIST') {
            phoneToUse = error?.response?.data?.message;
            alert('Email này đã được sử dụng, hãy đăng nhập bằng email này để đặt vé')
            router.replace('/login')
            return;
          } else {
            phoneToUse = customerInfo.phone;
            alert('Số điện thoại này đã được sử dụng, hãy đăng nhập bằng số điện thoại này để đặt vé')
            router.replace('/login')
            return;
          }
        }
        
      }

      // Cập nhật previewOrder
      if (previewOrder) {
        const updatedPreviewOrder = {
          ...previewOrder,
          discountCode: discountCode,
          customerInfo: { ...customerInfo, phone: phoneToUse }
        };
        setPreviewOrder(updatedPreviewOrder);
      }

      // Xử lý giống như nút thanh toán
      if (false) { // userInfo && userInfo.role && userInfo.role === 'ADMIN'
        setOpenSelectCustomer(true);
      } else {
        // Gọi API đặt hàng và xử lý kết quả
        let queryCreateOrder:any = null;
        if (phoneToUse) {
          queryCreateOrder = phoneToUse
        } else {
          if (customerInfo?.email) {
            queryCreateOrder = customerInfo.email
          }
        }
        if (userInfo && userInfo.email) {
          queryCreateOrder = null;
        } 
        const response = await handleConfirmOrder(discountCode, queryCreateOrder);

        // Nếu có bill sau khi tạo đơn, set bill và finish
        if (response?.data?.length === 2) {
          setBill(response.data);
          setFinish(true);

          const adminOrderBody: any = {
            amount: response.data[0].total_price,
            orderCode: response.data[0]._id,
          }

          if (phoneToUse) {
            adminOrderBody.phone = phoneToUse
          } else {
            if (customerInfo?.email) {
              adminOrderBody.email = customerInfo.email
            }
          }

          // Thêm logic tương tự nút thanh toán tại đây
          if (userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS')) {
            // const paymentRes = await api.post('demo-payment/create-payment-link', adminOrderBody);
            // window.location.href = paymentRes.data.url;
            router.push('/ve/' + response.data[0]._id);
          } else {
            if (userInfo) {  
              let returnURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/return?orderId=${response.data[0]._id}`;
              let cancelURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/cancel?orderId=${response.data[0]._id}`; 
              const paymentRes = await api.post('demo-payment/create-payment-link', {
                // amount: 2000,
                phone: adminOrderBody.phone,
                amount: response.data[0].total_price,
                orderCode: Math.floor(1000000 + Math.random() * 9000000),
                description: response.data[0]._id,
                returnUrl: returnURL,
                cancelUrl: cancelURL
              });
              // console.log(paymentRes);
              if (parseInt(response.data[0].total_price) > 0) {
                window.location.href = paymentRes.data.checkoutUrl;
              } else {
                window.location.href = process.env.NEXT_PUBLIC_URL + '/thanh-toan-thanh-cong/' + response.data[0]._id;
              }
              
              // router.push('/thanh-toan-thanh-cong/' + response.data[0]._id);
            } else {
              let returnURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/return?orderId=${response.data[0]._id}`;
              let cancelURL =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/cancel?orderId=${response.data[0]._id}`;
              const paymentRes = await api.post(`demo-payment/create-payment-url-public`, {
                phone: adminOrderBody.phone,
                amount: response.data[0].total_price,
                orderCode: Math.floor(1000000 + Math.random() * 9000000),
                description: response.data[0]._id,
                returnUrl: returnURL,
                cancelUrl: cancelURL
              });
              // console.log(paymentRes);
              if (parseInt(response.data[0].total_price) > 0) {
                window.location.href = paymentRes.data.checkoutUrl;
              } else {
                window.location.href = process.env.NEXT_PUBLIC_URL + '/thanh-toan-thanh-cong/' + response.data[0]._id;
              }
              // router.push('/thanh-toan-thanh-cong/' + response.data[0]._id);
            }


          }
        }
      }
    } catch (error) {
      console.error("Error creating user or order:", error);
      alert('Lỗi trong quá trình xử lý. Vui lòng thử lại.');
    }
  };


  // Hàm xử lý hoàn tất combo (sau khi chọn đồ uống trả phí)
  const handleFinishCombo = async (paidQuantities: any) => {
    // Close the paid drink dialog
    setOpenPaidDrinkDialog(false);

    // Save the paid quantities - replace instead of merging
    setPaidDrinkQuantities(paidQuantities);

    // Tạo bản xem trước đơn hàng
    const previewOrderData = prepareOrderData(paidQuantities, discountCode);
    setPreviewOrder(previewOrderData);

    // Hiển thị màn hình tổng kết đơn hàng
    setShowOrderSummary(true);
  };

  // Hàm tạo order sau khi khách đã chọn đồ uống miễn phí và trả phí
  // Improved handleCreateOrder function that aligns with backend API structure
  const handleCreateOrder = async (customerInfo: any = null, paidQuantities: any = null, discountCodeParam: any = '') => {
    // Use the provided discount code or the one from state
    const finalDiscountCode = discountCodeParam || discountCode;

    // Prepare data for food/drinks
    const combo_info: any = [];
    const item_upsell: any = [];

    // Process free items from combos
    Object.keys(freeDrinkQuantities).forEach(comboId => {
      const comboItems = freeDrinkQuantities[comboId];
      const selectedItems: any[] = [];

      // Find matching combo
      let currentCombo = null;
      for (const dialogCombo of dialogCombos) {
        if (dialogCombo.id === comboId) {
          currentCombo = dialogCombo.combo;
          break;
        }
      }

      if (!currentCombo) return;

      // Map selected items in combo
      Object.keys(comboItems).forEach(itemId => {
        const quantity = comboItems[itemId];
        if (quantity > 0) {
          let item = null;
          const foodItem = currentCombo.MenuOrder.FOOD.find((f: any) => f._id === itemId);
          const drinkItem = currentCombo.MenuOrder.DRINK.find((d: any) => d._id === itemId);
          item = foodItem || drinkItem;

          if (item) {
            selectedItems.push({
              "itemId": item._id,
              "quantity": quantity,
              "name": item.name,
              "desc": item.desc || "",
              "ingredient": item.ingredient || "",
              "category_name": item.category_name || "",
              "type": item.type,
              "unit": item.unit || "",
              "price": item.price || 0,
              "code_cukcuk": item.code_cukcuk || "",
              "item_id_cukcuk": item.item_id_cukcuk || "",
              "item_name_cukcuk": item.item_name_cukcuk || ""
            });
          }
        }
      });

      // Add combo and selected items to combo_info
      combo_info.push({
        "comboId": currentCombo._id,
        "name": currentCombo.name,
        "items": selectedItems,
        "price": currentCombo.price,
        "count": currentCombo.count || 1
      });
    });

    // Process paid items
    const paidItems = paidQuantities || paidDrinkQuantities;
    Object.keys(paidItems).forEach(itemId => {
      const quantity = paidItems[itemId];
      if (quantity > 0) {
        const item = menuItems.find((menuItem: any) => menuItem._id === itemId);
        if (item) {
          item_upsell.push({
            "itemId": item._id,
            "quantity": quantity,
            "name": item.name,
            "desc": item.desc || "",
            "ingredient": item.ingredient || "",
            "category_name": item.category_name || "",
            "type": item.type,
            "unit": item.unit || "",
            "price": item.price || 0,
            "code_cukcuk": item.code_cukcuk || "",
            "item_id_cukcuk": item.item_id_cukcuk || "",
            "item_name_cukcuk": item.item_name_cukcuk || ""
          });
        }
      }
    });

    // Update j_size, q_size, k_size based on selected seat quantities
    const j_size = parseInt(seatQuantities["J"] || "0");
    const q_size = parseInt(seatQuantities["Q"] || "0");
    const k_size = parseInt(seatQuantities["K"] || "0");

    // Create order details object according to backend API structure
    const createOrderDetail = {
      combo_info,
      item_upsell,
      j_size,
      q_size,
      k_size
    };

    // Create order request body aligned with backend API
    const body: any = {
      "event_id": eventDetails._id,
      "seat_id": eventDetails.InfoSeatMap._id,
      "showtimes_id": eventDetails.InfoShowTimes[0]._id,
      "employee_id": null,
      "promotion_code": finalDiscountCode,
      "note": null,
      "referred_by": null,
      "status": "PENDING",
      "createOrderDetail": createOrderDetail
    };

    try {
      let response;

      // If customer info is provided (for ADMIN users)
      if (customerInfo) {
        body.phone = customerInfo.phone;
        body.email = customerInfo.email;
        body.name = customerInfo.name;
        // Call staff-create API endpoint
        response = await api.post('orders/staff-create', body);
      } else {
        // Handle referral parameter
        if (ref && ref !== '666') {
          body.referred_by = ref;
        }
        // Call regular user order creation endpoint
        response = await api.post('orders/Create', body);
      }

      // Process successful response
      if (response?.data?.length === 2) {
        setBill(response.data);
        setFinish(true);
      }

      return response;
    } catch (error: any) {
      console.error("Error creating order:", error.response?.data?.message || error);

      // Handle specific error cases
      if (error?.response?.data?.code) {
        alert(error?.response?.data?.message);
      } else {
        alert('Lỗi tạo order, liên hệ nhân viên để trợ giúp');
      }
      return null;
    }
  };

  // Hàm xử lý thanh toán
  const handlePay = async (amount: any, orderCode: any) => {
    // Nếu người dùng là ADMIN, chuyển hướng đến trang chỗ
      let returnUrl =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/return?orderId=${orderCode}`;
      let cancelUrl =  process.env.NEXT_PUBLIC_API_URL + `/demo-payment/cancel?orderId=${orderCode}`;
    if (userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS')) {
      router.push('/thanh-toan-thanh-cong/' + orderCode);
    } else {
      // Nếu không, gọi API tạo URL thanh toán và chuyển hướng đến đó
      const res = await api.post('demo-payment/create-payment-link', { amount: amount, orderCode: orderCode, description: orderCode, returnUrl: returnUrl, cancelUrl: cancelUrl  });
      // router.push('/thanh-toan-thanh-cong/' + orderCode);
      window.location.href = res.data.url;
    }
  };

  const handleQuantityChange = (zone: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(event.target.value) || 0;
    const previousVal = Number(seatQuantities[zone]) || 0;
    const newTotal = totalSeatsSelected - previousVal + newVal;

    // Always allow reducing to zero
    if (newVal === 0) {
      setIsExceedingLimit(false);
      setIsExceedingSeatsAvailable(false);
      return;
    }

    // Nếu tổng số ghế vượt quá số lượng combo, disable nút xác nhận
    if (newTotal > totalSeatsInCombos) {
      setIsExceedingLimit(true);
      setOpenDialogMaxChair(true);
    } else {
      setIsExceedingLimit(false);
    }

    // Kiểm tra nếu số ghế vượt quá số ghế trống
    if (newVal > eventDetails.remainingSeats[zone]) {
      setDialogMessage(`Số lượng đăng ký vượt quá số ghế trống. Vui lòng chọn lại!`);
      setOpenDialogMaxArea(true);
      setIsExceedingSeatsAvailable(true);
    } else {
      setIsExceedingSeatsAvailable(false);
    }

    // Kiểm tra điều kiện đặt ghế
    const eligibility = checkBookingEligibility(zone);
    if (!eligibility.eligible) {
      setBookingDateMessage(eligibility.message);
      setOpenBookingDateDialog(true);
      return;
    }

    // Nếu hợp lệ, cập nhật số lượng ghế
    // setSeatQuantities((prev: any) => ({ ...prev, [zone]: event.target.value }));
  };

  const [finish, setFinish] = useState(false);
  const [currentArea, setCurrentArea] = useState<string | null>(null);
  // const [seatCount, setSeatCount] = useState<number>(1);

  const handleOpenPopup = (area: string) => {
    const eligibility = checkBookingEligibility(area);
    if (!eligibility.eligible) {
      setBookingDateMessage(eligibility.message);
      setOpenBookingDateDialog(true);
      return;
    }

    setOpenSelectedArea(true);
    setCurrentArea(area);
    setTempSeatCount(prev => ({
      ...prev,
      [area]: seatQuantities[area] || 0,
    }));
  };

  const handleClosePopup = () => {
    // setSelectedArea(null);
    // setSeatCount(seatCount); // Reset số lượng ghế
    setOpenSelectedArea(false)
  };

  const handleConfirmSeats = () => {
    if (currentArea) {
      if (tempSeatCount[currentArea] === 0) {
        // If the user confirms 0 seats, remove this area from selections
        setSeatQuantities((prev: any) => {
          const updated = { ...prev };
          updated[currentArea] = 0; // Set to 0 explicitly (will be handled as empty)
          return updated;
        });
        
        // Remove the area from selected areas if it was previously selected
        setSelectedAreas(prev => prev.filter(a => a !== currentArea));
      } else {
        // Normal flow for selecting seats > 0
        setSeatQuantities((prev: any) => ({
          ...prev,
          [currentArea]: tempSeatCount[currentArea] || 0, // Lưu số ghế của khu vực
        }));

        // Only add to selected areas if not already included and seat count > 0
        setSelectedAreas(prev =>
          prev.includes(currentArea) ? prev : [...prev, currentArea]
        );
      }

      setOpenSelectedArea(false);
      setCurrentArea(null);
    }
  };

  // Function to check booking eligibility
  const checkBookingEligibility = (zone: string) => {
    // if (!userInfo || !eventDetails) return { eligible: true, message: "" };

    /* TODO:
      - Check hạng thẻ khách mời
        + Về thời gian book vé: ngang K
        + Về khu được book: Được book mỗi K và Q
    */

    const customerType = userInfo?.customer_type || "J";

    const now = new Date();


    // Find seat section information for each zone
    const jSection = eventDetails.InfoSeatSections.find((section: any) => section.type === "J");
    const qSection = eventDetails.InfoSeatSections.find((section: any) => section.type === "Q");
    const kSection = eventDetails.InfoSeatSections.find((section: any) => section.type === "K");

    if (!jSection || !qSection || !kSection) return { eligible: true, message: "" };

    // Get booking start times for each zone
    const jStartTime = jSection.j_booking_start ? new Date(jSection.j_booking_start) : null;
    const qStartTime = qSection.q_booking_start ? new Date(qSection.q_booking_start) : null;
    const kStartTime = kSection.k_booking_start ? new Date(kSection.k_booking_start) : null;

    if (!jStartTime || !qStartTime || !kStartTime) return { eligible: true, message: "" };

    // Format dates for display in messages
    const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check if booking is not yet open for any zone
    if (now < kStartTime) {
      return {
        eligible: false,
        message: `Rất tiếc, hạng thành viên hiện tại của quý khách chưa đủ điều kiện để đặt chỗ tại khu vực này. Khu vực sẽ được mở đặt trước vào ngày ${formatDate(kStartTime)}. Quý khách vui lòng nâng cấp hạng thành viên để được ưu tiên đặt trước. Xin cảm ơn!`
      };
    }

    // Thêm logic kiểm tra khách mời (đặt ở đầu hàm)
    const isGuest = userInfo?.guest?.is_guest === true;
    const guestExpiry = userInfo?.guest?.expiry ? new Date(userInfo.guest.expiry) : null;
    const isValidGuest = isGuest && guestExpiry && now < guestExpiry;

    // Trước các câu điều kiện kiểm tra customerType, thêm điều kiện kiểm tra khách mời
    if (isValidGuest) {
      // Khách mời được ưu tiên đặt vé như hạng K nhưng chỉ cho phép đặt khu K và Q
      if (zone === "J") {
        return {
          eligible: false,
          message: "Khách mời chỉ có thể đặt vé ở khu K hoặc khu Q."
        };
      }
      // Được đặt vé khu K và Q từ thời điểm k_booking_start
      return { eligible: true, message: "" };
    }


    // Check eligibility based on customer type and zone
    if (customerType === "K") {
      // K-type customers can book any zone from k_booking_start
      return { eligible: true, message: "" };
    }
    else if (customerType === "Q") {
      // Q-type customers:
      // - Can book J and Q zones from k_booking_start
      // - Can book K zone from q_booking_start
      if (zone === "K" && now < qStartTime) {
        return {
          eligible: false,
          message: `Rất tiếc, hạng thành viên hiện tại của quý khách chưa đủ điều kiện để đặt chỗ tại khu vực này. Khu vực sẽ được mở đặt trước vào ngày ${formatDate(qStartTime)}. Quý khách vui lòng nâng cấp hạng thành viên để được ưu tiên đặt trước. Xin cảm ơn!`
        };
      }
      return { eligible: true, message: "" };
    }
    else if (customerType === "J") {
      // J-type customers:
      // - Can book J zone from k_booking_start
      // - Can book Q zone from q_booking_start
      // - Can book K zone from j_booking_start
      if (zone === "Q" && now < qStartTime) {
        return {
          eligible: false,
          message: `Rất tiếc, hạng thành viên hiện tại của quý khách chưa đủ điều kiện để đặt chỗ tại khu vực này. Khu vực sẽ được mở đặt trước vào ngày ${formatDate(qStartTime)}. Quý khách vui lòng nâng cấp hạng thành viên để được ưu tiên đặt trước. Xin cảm ơn!`
        };
      }
      else if (zone === "K" && now < jStartTime) {
        return {
          eligible: false,
          message: `Rất tiếc, hạng thành viên hiện tại của quý khách chưa đủ điều kiện để đặt chỗ tại khu vực này. Khu vực sẽ được mở đặt trước vào ngày ${formatDate(jStartTime)}. Quý khách vui lòng nâng cấp hạng thành viên để được ưu tiên đặt trước. Xin cảm ơn!`
        };
      }
      return { eligible: true, message: "" };
    }

    // Default case - allow booking
    return { eligible: true, message: "" };
  };

  const BookingDateDialog = ({ open, handleClose, message, isValidGuest }: any) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm" // Giới hạn kích thước tối đa
        sx={{
          "& .MuiDialog-paper": {
            position: "relative",
            margin: "auto",
            width: "95%",
            maxWidth: "500px",
            borderRadius: 3,
            boxShadow: 5,
            padding: 2,
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">Thông báo</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#333", textAlign: "center", px: 2 }}>
            {message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 2 }}>
          {isValidGuest && (
            <Button
              onClick={() => {
                handleClose();
                router.push("/customer/my-type");
              }}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                width: "80%",
                backgroundColor: "var(--clr-bg-1)"
              }}
            >
              Nâng Cấp Ngay
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              width: "80%",
              backgroundColor: "var(--clr-bg-2)",
              color: "var(--clr-txt-1)"
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Add memoized counts for better performance
  const completedCombosCount = useMemo(() => {
    return dialogCombos.filter(dialog => 
      selectedItems[dialog.id] && 
      selectedItems[dialog.id].drink.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_drink &&
      (dialog.combo.size_food === 0 || selectedItems[dialog.id].food.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_food)
    ).length;
  }, [dialogCombos, selectedItems]);

  const allCombosComplete = useMemo(() => {
    return dialogCombos.every(dialog => 
      selectedItems[dialog.id] && 
      selectedItems[dialog.id].drink.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_drink &&
      (dialog.combo.size_food === 0 || selectedItems[dialog.id].food.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_food)
    );
  }, [dialogCombos, selectedItems]);

  // Add effect to control body scrolling when dialogs are open
  useEffect(() => {
    // Check if any dialog is open
    const isAnyDialogOpen = 
      openDialog ||
      openPaidDrinkDialog ||
      openBookingDateDialog ||
      openDialogMaxArea ||
      openselectedArea ||
      showOrderSummary ||
      dialogCombos.some(dialog => dialog.show);

    // Prevent scrolling when any dialog is open
    if (isAnyDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [
    openDialog,
    openPaidDrinkDialog,
    openBookingDateDialog,
    openDialogMaxArea,
    openselectedArea,
    showOrderSummary,
    dialogCombos
  ]);

  // 1. Add a loading state
  const [loading, setLoading] = useState(true);

  // 2. In useEffect after fetching eventDetails and menuItems:
  useEffect(() => {
    if (eventDetails && menuItems) {
      setLoading(false);
    }
  }, [eventDetails, menuItems]);

  // Show loading skeleton while data is loading
  if (loading) {
    return (
      <>
        <title>Chọn Ghế | Queen Acoustic</title>
        <meta name="description" content="Chọn vị trí chỗ ngồi cho sự kiện tại Queen Acoustic." />
        <LoadingSkeleton isMdUp={isMdUp} isBelow1028={isBelow1028} />
      </>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
        // display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--clr-bg)",
      }}
    >
      <title>Chọn Ghế | Queen Acoustic</title>
      <meta name="description" content="Chọn vị trí chỗ ngồi cho sự kiện tại Queen Acoustic." />
      {/* <Box
        sx={{
          // position: "absolute",
          // top: -30,
          ml: 2, // Căn góc trái
        }}
      >
        <Tooltip title="Quay lại">
          <Button
            variant="contained"
            size="large"
            onClick={() => { router.push("/") }}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              backgroundColor: "var(--clr-bg-1)",
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
              "&:hover": {
                backgroundColor: "var(--clr-bg-7)",
                color: "#fff",
              },
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "5px" }} /> Quay lại
          </Button>
        </Tooltip>
      </Box> */}
      <Dialog
        open={openDialogMaxChair}
        onClose={handleMaxChairDialogClose}
        fullWidth
        maxWidth="sm" // Giới hạn kích thước tối đa
        sx={{
          "& .MuiDialog-paper": {
            position: "relative",
            margin: "auto",
            width: "95%",
            maxWidth: "500px",
            borderRadius: 3,
            boxShadow: 5,
            padding: 2,
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* <WarningAmberIcon color="warning" fontSize="large" /> */}
          <Typography variant="h6" fontWeight="bold">Thông báo</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#333", textAlign: "center", px: 2 }}>
            Bạn đã chọn tối đa số ghế trong combo. Vui lòng kiểm tra lại!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleMaxChairDialogClose}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none", px: 3, width: "80%", backgroundColor: "var(--clr-bg-1)" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogMaxArea}
        onClose={() => setOpenDialogMaxArea(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            position: "relative",
            margin: "auto",
            width: "95%",
            maxWidth: "500px",
            borderRadius: 3,
            boxShadow: 5,
            padding: 2,
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">Thông báo</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#333", textAlign: "center", px: 2 }}>
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={() => setOpenDialogMaxArea(false)}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              width: "80%",
              backgroundColor: "var(--clr-bg-1)"
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container ref={containerRef} sx={{ width: "100%" }}>
        {/* Cột bên trái hiển thị bản đồ ghế và tiêu đề */}
        <Grid size={{ xs: 12, md: isBelow1028 ? 12 : 8 }} direction="column" alignItems="center">
          <Box sx={{ position: "relative", width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              {eventDetails &&
                <SeatLayout
                  eventDetails={eventDetails}
                  isMdUp={isMdUp}
                  handleOpenPopup={handleOpenPopup}
                />
              }
            </Box>
          </Box>
          
          {/* Re-add the dialog for seat selection which was removed when adding the loading spinner */}
          {eventDetails && currentArea && (
            <Dialog 
              open={openselectedArea} 
              onClose={handleClosePopup} 
              sx={{ 
                "& .MuiDialog-paper": { 
                  position: "relative",
                  margin: "auto", 
                  borderRadius: 3, 
                  minWidth: isMdUp ? 450 : isSMUp ? 300 : "95%",
                  maxWidth: "500px"
                } 
              }}>
              <Box sx={{ position: "relative" }}>
                {/* Close button */}
                <IconButton sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  zIndex: 10,
                  "&:hover": { 
                    backgroundColor: "white",
                    boxShadow: "0px 3px 6px rgba(0,0,0,0.15)"
                  },
                }} onClick={handleClosePopup}>
                  <FontAwesomeIcon icon={faClose} size="sm" />
                </IconButton>

                {/* Tiêu đề */}
                <DialogTitle 
                  sx={{ 
                    p: 0,
                    m: 0,
                    overflow: "hidden",
                    position: "relative",
                    minHeight: "160px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    borderTopLeftRadius: "inherit",
                    borderTopRightRadius: "inherit",
                    background: currentArea === "J" 
                      ? "linear-gradient(135deg, #d4e6ff 0%, #2986cc 100%)"
                      : currentArea === "Q" 
                      ? "linear-gradient(135deg, #fff7d6 0%, #f0c350 100%)"
                      : currentArea === "K" 
                      ? "linear-gradient(135deg, #333333 0%, #111111 100%)"
                      : "white"
                  }}
                >
                  {/* Decorative elements */}
                  <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "100%",
                    opacity: 0.15,
                    background: currentArea === "J" 
                      ? "radial-gradient(circle at 15% 85%, #ffffff 0%, transparent 35%), radial-gradient(circle at 85% 15%, #ffffff 0%, transparent 35%)"
                      : currentArea === "Q" 
                      ? "radial-gradient(circle at 15% 85%, #ffffff 0%, transparent 35%), radial-gradient(circle at 85% 15%, #ffffff 0%, transparent 35%)"
                      : currentArea === "K" 
                      ? "radial-gradient(circle at 15% 85%, #444444 0%, transparent 35%), radial-gradient(circle at 85% 15%, #444444 0%, transparent 35%)"
                      : "transparent"
                  }} />

                  {/* Top area with large letter */}
                  <Box sx={{
                    position: "absolute",
                    top: -10,
                    right: 20,
                    fontSize: "120px",
                    fontWeight: 900,
                    opacity: 0.15,
                    color: currentArea === "K" ? "#ffffff" : "#000000",
                    fontFamily: "'Arial', sans-serif",
                    lineHeight: 1
                  }}>
                    {currentArea}
                  </Box>

                  {/* Main content container */}
                  <Box sx={{
                    p: 3,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 5
                  }}>
                    {/* Area title with badge */}
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5
                    }}>
                      {/* Area badge */}
                      <Box sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.25)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "4px",
                        px: 1.5,
                        py: 0.5,
                        mb: 1
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            color: currentArea === "K" ? "white" : currentArea === "Q" ? "#5f4b11" : "rgba(0,0,0,0.7)"
                          }}
                        >
                          Khu vực
                        </Typography>
                      </Box>
                      
                      {/* Area name */}
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "0.01em",
                          color: currentArea === "K" ? "white" : currentArea === "Q" ? "#5f4b11" : "rgba(0,0,0,0.85)",
                          textShadow: currentArea === "K" 
                            ? "0 2px 4px rgba(0,0,0,0.3)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                          textAlign: "center"
                        }}
                      >
                        {currentArea === "J" ? "Jack" : 
                         currentArea === "Q" ? "Queen" : 
                         currentArea === "K" ? "King" : currentArea}
                      </Typography>
                      
                      {/* Available seats badge */}
                      <Box sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1,
                        borderRadius: "6px",
                        background: currentArea === "K" 
                          ? "rgba(255,255,255,0.1)" 
                          : "rgba(255,255,255,0.45)",
                        backdropFilter: "blur(5px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.3rem",
                            color: currentArea === "K" ? "white" : currentArea === "Q" ? "#5f4b11" : "rgba(0,0,0,0.8)"
                          }}
                        >
                          {eventDetails.remainingSeats[currentArea as "J" | "Q" | "K"] ?? 0}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            fontWeight: 500,
                            color: currentArea === "K" ? "rgba(255,255,255,0.8)" : currentArea === "Q" ? "rgba(95,75,17,0.8)" : "rgba(0,0,0,0.6)"
                          }}
                        >
                          ghế trống
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 3, py: 3 }}>
                  {/* Summary & remaining seats - moved to top */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      border: '1px solid rgba(0,0,0,0.07)',
                      mb: 3
                    }}
                  >
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "baseline",
                      mb: 1.5
                    }}>
                      <Typography fontSize={14} color="text.primary">
                        Đã chọn:
                      </Typography>
                      <Typography 
                        fontSize={14} 
                        fontWeight={500}
                        sx={{
                          color: "#333"
                        }}
                      >
                        {getRealTimeTotal(currentArea)} / {totalSeatsInCombos} ghế
                      </Typography>
                    </Box>
                    
                    {/* Progress bar */}
                    <Box sx={{ 
                      height: "8px", 
                      bgcolor: "rgba(0,0,0,0.06)", 
                      borderRadius: "10px", 
                      overflow: "hidden",
                      mb: 1.5
                    }}>
                      <Box 
                        sx={{ 
                          height: "100%", 
                          width: `${Math.min(100, (getRealTimeTotal(currentArea) / totalSeatsInCombos) * 100)}%`,
                          bgcolor: (totalSeatsInCombos - getRealTimeTotal(currentArea)) <= 0 
                            ? "#d32f2f" 
                            : (totalSeatsInCombos - getRealTimeTotal(currentArea)) <= 2 
                              ? "#ed6c02" 
                              : "#2e7d32",
                          borderRadius: "10px",
                          transition: "width 0.3s ease-in-out"
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center"
                    }}>
                      <Typography 
                        fontSize={13} 
                        fontWeight="medium" 
                        sx={{
                          color: (totalSeatsInCombos - getRealTimeTotal(currentArea)) <= 0 
                            ? "#d32f2f" 
                            : (totalSeatsInCombos - getRealTimeTotal(currentArea)) <= 2 
                              ? "#ed6c02" 
                              : "#2e7d32",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: 12, marginRight: 6 }} />
                        Còn lại {Math.max(0, totalSeatsInCombos - getRealTimeTotal(currentArea))} ghế
                      </Typography>
                    </Box>
                  </Box>

                  {/* Main seat counter - moved to bottom */}
                  <Box sx={{ textAlign: "center" }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        pt: 1, 
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                        fontSize: "0.75rem"
                      }}
                    >
                      Chọn Số Lượng Ghế
                    </Typography>
                    
                    {/* Counter controls */}
                    <Box 
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "16px",
                        backgroundColor: "#f7f7f9",
                        padding: "12px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.02)"
                      }}
                    >
                      <IconButton
                        onClick={() => handleDecrease(currentArea)}
                        disabled={(tempSeatCount[currentArea] || 0) === 0}
                        sx={{
                          backgroundColor: (tempSeatCount[currentArea] || 0) === 0 ? "rgba(0,0,0,0.05)" : "white",
                          color: (tempSeatCount[currentArea] || 0) === 0 ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)",
                          boxShadow: (tempSeatCount[currentArea] || 0) === 0 ? "none" : "0px 2px 4px rgba(0,0,0,0.1)",
                          transition: "all 0.2s ease",
                          "&:hover": { 
                            backgroundColor: (tempSeatCount[currentArea] || 0) === 0 ? "rgba(0,0,0,0.05)" : "white", 
                            transform: (tempSeatCount[currentArea] || 0) === 0 ? "none" : "translateY(-1px)",
                            boxShadow: (tempSeatCount[currentArea] || 0) === 0 ? "none" : "0px 3px 5px rgba(0,0,0,0.15)"
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faMinus} size="sm" />
                      </IconButton>

                      <Typography sx={{ 
                        fontSize: 32, 
                        fontWeight: "bold", 
                        color: "#222", 
                        mx: 3, 
                        minWidth: "60px", 
                        textAlign: "center",
                        fontFamily: "'Roboto Condensed', sans-serif"
                      }}>
                        {tempSeatCount[currentArea] || 0}
                      </Typography>

                      <IconButton
                        onClick={() => handleIncrease(currentArea)}
                        disabled={getRealTimeTotal(currentArea) >= totalSeatsInCombos}
                        sx={{
                          backgroundColor: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "rgba(0,0,0,0.05)" : "white",
                          color: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)",
                          boxShadow: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "none" : "0px 2px 4px rgba(0,0,0,0.1)",
                          transition: "all 0.2s ease",
                          "&:hover": { 
                            backgroundColor: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "rgba(0,0,0,0.05)" : "white",
                            transform: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "none" : "translateY(-1px)",
                            boxShadow: getRealTimeTotal(currentArea) >= totalSeatsInCombos ? "none" : "0px 3px 5px rgba(0,0,0,0.15)"
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                      </IconButton>
                    </Box>
                  </Box>
                </DialogContent>

                {/* Footer actions */}
                <DialogActions 
                  sx={{ 
                    p: 3, 
                    pt: 1,
                    justifyContent: "center", 
                    gap: 2,
                    borderTop: "1px solid rgba(0,0,0,0.08)"
                  }}
                >
                  <Button 
                    onClick={handleClosePopup} 
                    variant="outlined" 
                    sx={{ 
                      flex: 1,
                      borderColor: "rgba(0,0,0,0.2)",
                      color: "text.primary",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      py: 1
                    }}
                  >
                    Hủy
                  </Button>
                  
                  <Button
                    onClick={handleConfirmSeats}
                    disabled={isExceedingLimit || isExceedingSeatsAvailable}
                    variant="contained"
                    sx={{
                      flex: 1,
                      backgroundColor: isExceedingLimit || isExceedingSeatsAvailable
                        ? "rgba(0,0,0,0.25)"
                        : "var(--clr-bg-1)",
                      color: "#fff",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      py: 1,
                      boxShadow: isExceedingLimit || isExceedingSeatsAvailable
                        ? "none"
                        : "0px 3px 6px rgba(0,0,0,0.15)",
                      "&:hover": {
                        backgroundColor: isExceedingLimit || isExceedingSeatsAvailable
                          ? "rgba(0,0,0,0.25)"
                          : "var(--clr-bg-7)",
                        boxShadow: isExceedingLimit || isExceedingSeatsAvailable
                          ? "none"
                          : "0px 4px 8px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    Xác nhận
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>
          )}
          
          {/* Legend remains visible even while loading */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, my: 2, }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box className="w-4 h-4 bg-blue-100" sx={{ width: 16, height: 16, border: "1px solid #A0A0A0", borderRadius: "4px" }} />
              <Typography>{isMdUp ? "Khu J (Jack)" : "Jack"}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: "#D4AF37", borderRadius: "4px" }} />
              <Typography> {isMdUp ? "Khu Q (Queen)" : "Queen"}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: "#1A1A1A", borderRadius: "4px" }} />
              <Typography>{isMdUp ? "Khu K (King)" : "King"}</Typography>
            </Box>
          </Box>
        </Grid>
        {/* Cột bên phải hiển thị thông tin hóa đơn và nút thanh toán */}
        <Grid size={{ xs: 12, md: isBelow1028 ? 12 : 4 }}>
          <Card sx={{ 
            position: { xs: "sticky", md: "relative" }, 
            top: { xs: "auto", md: "auto" },
            bottom: { xs: 0, md: "auto" },
            borderRadius: { xs: "16px 16px 0 0", md: 3 }, 
            boxShadow: { xs: "0px -4px 10px rgba(0, 0, 0, 0.1)", md: 2 }, 
            height: "auto", 
            m: { xs: 0, md: 2 },
            zIndex: { xs: 10, md: 1 }, 
            backgroundColor: "white"
          }}>
            <CardContent sx={{
              flex: "1 1 50%",
              position: "relative",
              padding: { xs: 2, md: 2.5 },
              paddingBottom: { xs: "16px !important", md: "20px !important" },
              order: isBelow1028 ? 2 : 1,
              boxShadow: "none",
              display: "flex",
              flexDirection: "column",
              height: "auto"
            }}>
              {/* Event Details Section */}
              {eventDetails && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2.5, 
                  backgroundColor: "rgba(171, 141, 89, 0.04)",
                  borderRadius: 2,
                  border: "1px solid rgba(171, 141, 89, 0.1)"
                }}>
                  {/* Event Image and Title */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    {/* Event Image */}
                    {eventDetails.avatar && (
                      <Box
                        component="img"
                        src={getMediaUrl(eventDetails.avatar)}
                        alt={eventDetails.title}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          objectFit: "cover",
                          border: "2px solid rgba(171, 141, 89, 0.2)"
                        }}
                      />
                    )}
                    
                    {/* Event Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: "#2c2c2c", 
                        fontSize: { xs: "1.1rem", md: "1.25rem" },
                        flex: 1
                      }}
                    >
                      {eventDetails.title}
                    </Typography>
                  </Box>
                  
                  {/* Event Details Grid */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {/* Date */}
                    {eventDetails.InfoShowTimes && eventDetails.InfoShowTimes[0] && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FontAwesomeIcon 
                          icon={faCalendarAlt} 
                          style={{ 
                            color: "var(--clr-bg-1)", 
                            fontSize: "14px",
                            width: "16px"
                          }} 
                        />
                        <Typography variant="body2" sx={{ color: "#555", fontSize: "0.9rem" }}>
                          {new Date(eventDetails.InfoShowTimes[0].time_start).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Venue */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FontAwesomeIcon 
                        icon={faMapMarkerAlt} 
                        style={{ 
                          color: "var(--clr-bg-1)", 
                          fontSize: "14px",
                          width: "16px"
                        }} 
                      />
                      <Typography variant="body2" sx={{ color: "#555", fontSize: "0.9rem" }}>
                        {eventDetails.venue || "Queen Acoustic - Tầng 1, 15 Lê Đại Cang, Thành Công, Buôn Ma Thuột, Đắk Lắk"}
                      </Typography>
                    </Box>
                    
                    {/* Selected Combos Summary */}
                    {eventSelected && eventSelected.combos && eventSelected.quantities && (
                      <Box sx={{ mt: 1, pt: 1.5, borderTop: "1px solid rgba(171, 141, 89, 0.15)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <FontAwesomeIcon 
                            icon={faTicketAlt} 
                            style={{ 
                              color: "var(--clr-bg-1)", 
                              fontSize: "14px",
                              width: "16px"
                            }} 
                          />
                          <Typography variant="body2" sx={{ color: "#555", fontSize: "0.9rem", fontWeight: 600 }}>
                            Combo đã chọn:
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 2.5 }}>
                          {Object.entries(eventSelected.quantities).map(([key, quantity]) => {
                            const parts = key.split('-');
                            const quantityNum = Number(quantity);
                            if (parts.length === 2 && quantityNum > 0) {
                              const comboId = parts[1];
                              const combo = eventSelected.combos.find((c: any) => c._id === comboId);
                              if (combo) {
                                return (
                                  <Typography 
                                    key={key}
                                    variant="body2" 
                                    sx={{ 
                                      color: "#666", 
                                      fontSize: "0.85rem",
                                      mb: 0.5
                                    }}
                                  >
                                    • {combo.name} x{quantityNum}
                                  </Typography>
                                );
                              }
                            }
                            return null;
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Component hiển thị lựa chọn ghế (SeatSelection) */}
              {!finish && eventDetails?.remainingSeats && <SeatSelection
                selectedArea={selectedAreas}
                seatQuantities={seatQuantities}
                handleRemoveArea={handleRemoveArea}
                handleQuantityChange={handleQuantityChange}
                seatRemainQuantity={eventDetails.remainingSeats}
                onDiscountCodeChange={handleDiscountCodeChange}
                remainingSeatsToChoose={remainingSeatsToChoose}
              />}
              {/* Nếu có hóa đơn (bill) thì hiển thị thông tin order chi tiết */}
              {finish && <BookingSummary quantityCombo={quantityCombo} isBelow1028={isBelow1028} billData={bill} setOpenDialog={setOpenDialog} />}

              {/* Nút mua chỗ / thanh toán */}
              <Button
                variant="contained"
                size="large"
                disabled={Object.values(seatQuantities).reduce((sum: any, value) => sum + Number(value), 0) != totalSeatsInCombos}
                sx={{
                  cursor: "pointer",
                  width: "100%",
                  marginTop: { xs: 1.5, md: 2 },
                  padding: { xs: "10px", md: "12px" },
                  borderRadius: 2,
                  backgroundColor: remainingSeatsToChoose === 0 ? "var(--clr-bg-1)" : "rgba(171, 141, 89, 0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  boxShadow: "0 4px 8px rgba(171, 141, 89, 0.2)",
                  "&:hover": {
                    backgroundColor: remainingSeatsToChoose === 0 ? "var(--clr-bg-7)" : "rgba(171, 141, 89, 0.8)",
                    color: "#fff",
                    boxShadow: "0 6px 12px rgba(171, 141, 89, 0.3)",
                  },
                  "&:disabled": {
                    backgroundColor: "#d1d1d1",
                    color: "#777"
                  },
                  transition: "all 0.2s ease"
                }}
                onClick={() => {
                  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập qua Google
                  // if (!userInfo) {
                  //   window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google';
                  //   return;
                  // }
                  // Nếu đã có bill thì xử lý thanh toán, ngược lại mở dialog chọn đồ uống miễn phí
                  if (bill) {
                    handlePay(bill[0].total_price, bill[0]._id);
                  } else {
                    // Only open dialog if there are combos to display
                    if (dialogCombos.length > 0) {
                      setOpenDialog(true);
                    } else {
                      // Nếu không có combo nào, tiến hành tạo order trực tiếp
                      handleCreateOrder();
                    }
                  }
                }}
              >
                {remainingSeatsToChoose === 0
                  ? (!bill ? `Tiếp tục chọn món` : (userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS') ? 'KẾT THÚC' : 'THANH TOÁN'))
                  : dialogCombos.length > 0 && dialogCombos[0].combo.count && dialogCombos[0].combo.count > 1
                    ? `Vui lòng chọn thêm ${remainingSeatsToChoose} ghế cho ${dialogCombos[0].combo.count} combo`
                    : `Vui lòng chọn thêm ${remainingSeatsToChoose} ghế`}
                <FontAwesomeIcon icon={faAnglesRight} style={{ marginLeft: "8px" }} />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <div>
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => handleDialogClose()}>
            <div className="relative bg-white rounded-xl w-full lg:w-2/3 max-w-3xl overflow-hidden max-h-[90vh] shadow-2xl transition-all duration-300 animate-fadeIn flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="relative bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200 rounded-full -translate-y-1/2 translate-x-1/4 opacity-30"></div>
                <div className="relative z-10 pr-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-gold-800 leading-tight">
                    Hãy chọn món yêu thích ngay thôi nào
                  </h2>
                  <p className="text-gold-700 mt-1 text-xs sm:text-sm">
                    Chọn món ăn và đồ uống cho {dialogCombos.length} combo của bạn
                  </p>
                </div>
                {/* Improved close button - larger hit area */}
                <button
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-700 hover:text-red-500 rounded-lg p-2.5 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-200 flex items-center justify-center z-20"
                  onClick={() => handleDialogClose()}
                  aria-label="Đóng"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Content - Scrollable with windowed rendering for large lists */}
              <div className="p-5 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="space-y-4">
                  {/* Render only items in chunks of 10 for better performance with large lists */}
                  {dialogCombos.map((dialog, index) => (
                    <MemoizedComboItem
                      key={dialog.id}
                      dialog={dialog}
                      index={index}
                      selectedItems={selectedItems}
                      handleOpenComboDialog={handleOpenComboDialog}
                    />
                  ))}
                </div>
              </div>
              
              {/* Sticky footer with "Tiếp tục" button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-auto shadow-md flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {completedCombosCount}/{dialogCombos.length} combo đã chọn đủ món
                </div>
                <button
                  disabled={!allCombosComplete}
                  className={`px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${
                    allCombosComplete
                    ? 'bg-gold-600 hover:bg-gold-700 text-white hover:shadow'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    // Restore original workflow
                    console.log('upesell', eventSelected.combos)
                    let isShowUpsell = false;
                    for (let i = 0; i < eventSelected.combos.length; i++) {
                      const e = eventSelected.combos[i];
                      if (e.is_show_upsell) {
                        isShowUpsell = true;
                        break;
                      }
                    }
                    
                    if (isShowUpsell) {
                      // Reset paidDrinkQuantities to prevent duplicated prices
                      setPaidDrinkQuantities({});
                      setStepChoiceItem('DRINK')
                      setOpenPaidDrinkDialog(true);
                      setOpenDialog(false);
                    } else {
                      setOpenPaidDrinkDialog(false);
                      handleFinishCombo({});
                    }
                  }}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {
        dialogCombos.map((dialog, index) => (
          <Suspense key={dialog.id} fallback={<div />}>
            <DrinksMenu
              onOpen={dialog.show}
              onClose={() => handleCloseComboDialog(index)}
              menuItems={[]} // Không sử dụng menuItems nữa
              comboMenuOrder={dialog.combo.MenuOrder} // Sử dụng MenuOrder từ combo
              freeDrinkLimit={dialog.combo.size_drink} // Lấy giới hạn đồ uống từ combo
              freeFoodLimit={dialog.combo.size_food}
              onConfirm={(quantities: any) => handleComboSelection(dialog.id, quantities)}
              title={`Hãy chọn món yêu thích ngay thôi nào`}
              isCombo={true}
              onBack={index > 0 ? handleBackDialog : undefined}
              stepChoiceItem={stepChoiceItem}
              setStepChoiceItem={setStepChoiceItem}
              comboCount={dialog.combo.count}
              originalDrinkLimit={dialog.combo.original_size_drink}
              originalFoodLimit={dialog.combo.original_size_food}
            />
          </Suspense>
        ))
      }
      <Suspense fallback={<div />}>
        <DrinksMenu
          onOpen={openPaidDrinkDialog}
          onClose={() => setOpenPaidDrinkDialog(false)}
          menuItems={menuItems}
          onConfirm={(paidQuantities: any) => {
            setOpenPaidDrinkDialog(false);
            handleFinishCombo(paidQuantities);
          }}
          title={'Gọi thêm món - tận hưởng trọn vẹn đêm nhạc'}
          isCombo={false}
          onBack={handleBackDialog}
          totalAmount={totalAmount}
          stepChoiceItem={stepChoiceItem}
          setStepChoiceItem={setStepChoiceItem}
        />
      </Suspense>

      {/* Dialog chọn khách hàng (dành cho ADMIN) */}
      {/* <SelectCustomer
        open={openSelectCustomer}
        setOpenSelectCustomer={setOpenSelectCustomer}
        handleFinishCustomer={handleFinishCustomer}
      /> */}

      <BookingDateDialog
        open={openBookingDateDialog}
        handleClose={handleCloseBookingDateDialog}
        message={bookingDateMessage}
      />

      <Suspense fallback={<div />}>
        <OrderSummaryPreview
          open={showOrderSummary}
          onClose={() => setShowOrderSummary(false)}
          onConfirm={(discountCode, customerInfo) => handleOrderConfirmation(discountCode, customerInfo)}
          previewOrder={previewOrder}
          userInfo={userInfo}
          bill={bill}
          handlePay={handlePay}
        />
      </Suspense>
      <Suspense fallback={<div />}>
        <PaymentLoadingOverlay isVisible={isProcessingPayment} />
      </Suspense>

      {/* Booking Progress Widget */}
      <BookingProgressWidget
        currentStep={
          allCombosComplete ? 5 : // Step 5: Items selected, ready to confirm
          totalSeatsSelected > 0 && totalSeatsSelected >= totalSeatsInCombos ? 4 : // Step 4: Seats selected, need to select items
          3 // Step 3: Just arrived, need to select seats
        }
        eventTitle={eventDetails?.title}
        totalAmount={totalAmount}
        formatCurrency={(amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        showContinueButton={false}
        additionalInfo={
          totalSeatsSelected > 0 && totalSeatsSelected < totalSeatsInCombos
            ? `Đã chọn ${totalSeatsSelected}/${totalSeatsInCombos} ghế` 
            : totalSeatsSelected >= totalSeatsInCombos && !allCombosComplete
            ? `Đã chọn đủ ${totalSeatsSelected} ghế, hãy chọn món`
            : allCombosComplete 
            ? `Đã chọn đủ món cho ${dialogCombos.length} combo` 
            : undefined
        }
        onOpenItemSelection={() => {
          if (dialogCombos.length > 0) {
            setOpenDialog(true);
          }
        }}
      />
    </Box >
  );
}

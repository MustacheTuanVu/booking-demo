/* eslint-disable react-hooks/exhaustive-deps */
"use client"; // Khai báo component chạy ở phía client

// Import các thành phần, thư viện cần thiết
import { AppContext } from "@/context/AppContext";
import api from "@/utils/api";
import { 
  faAnglesRight, 
  faArrowLeft, 
  faCircleExclamation, 
  faClose, 
  faDoorOpen, 
  faMinus, 
  faPlus, 
  faInfoCircle 
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
import LoadingSkeleton from './LoadingSkeleton';

// Lazy load heavy components for better performance
const DrinksMenu = lazy(() => import("@/components/booking/DrinksMenu"));
const OrderSummaryPreview = lazy(() => import("./OrderSummaryPreview"));
const PaymentLoadingOverlay = lazy(() => import("./PaymentLoadingOverlay "));

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

// Memoized components for better performance
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
          
          {/* Mobile "Chọn Món" button */}
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
export default function OptimizedCanvasSeatMap() {
  const { userInfo } = useContext(AppContext);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSMUp = useMediaQuery(theme.breakpoints.up("xs"));
  const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));
  const router = useRouter();
  const { ref, id } = useParams<any>();

  // State management
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [dialogCombos, setDialogCombos] = useState<{ id: string, show: boolean, combo: Combo }[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [comboId: string]: { food: any[], drink: any[] } }>({});
  const [seatQuantities, setSeatQuantities] = useState<any>({ J: "", Q: "", K: "" });
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tempSeatCount, setTempSeatCount] = useState<{ [key: string]: number }>({});
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaidDrinkDialog, setOpenPaidDrinkDialog] = useState(false);
  const [openselectedArea, setOpenSelectedArea] = useState(false);
  const [currentArea, setCurrentArea] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Other states
  const [stepChoiceItem, setStepChoiceItem] = useState('DRINK');
  const [discountCode, setDiscountCode] = useState("");
  const [freeDrinkQuantities, setFreeDrinkQuantities] = useState<{ [comboId: string]: { [itemId: string]: number } }>({});
  const [paidDrinkQuantities, setPaidDrinkQuantities] = useState<any>({});
  const [bill, setBill] = useState<any>(null);
  const [finish, setFinish] = useState(false);

  // Memoized calculations for better performance
  const totalSeatsInCombos = useMemo(() => {
    return dialogCombos?.length > 0 
      ? dialogCombos.reduce((total, dialog) => {
          return total + dialog.combo.size_seat;
        }, 0)
      : 0;
  }, [dialogCombos]);

  const totalSeatsSelected = useMemo(() => {
    return Object.values(seatQuantities).reduce(
      (sum: number, value: unknown) => sum + Number(value as string | number),
      0
    );
  }, [seatQuantities]);
  
  const remainingSeatsToChoose = useMemo(() => {
    return totalSeatsInCombos - totalSeatsSelected;
  }, [totalSeatsInCombos, totalSeatsSelected]);

  const totalAmount = useMemo(() => {
    return dialogCombos.reduce((sum, dialog) => sum + (dialog.combo.price * (dialog.combo.count || 1)), 0) +
      Object.keys(paidDrinkQuantities).reduce((sum, itemId) => {
        const item = menuItems.find((menuItem: any) => menuItem._id === itemId);
        const quantity = paidDrinkQuantities[itemId] || 0;
        return sum + (item?.price || 0) * quantity;
      }, 0);
  }, [dialogCombos, paidDrinkQuantities, menuItems]);

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

  // Event selected state with localStorage optimization
  const [eventSelected, setEventSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const savedEvent = localStorage.getItem("eventSelected");
      return savedEvent ? JSON.parse(savedEvent) : null;
    }
    return null;
  });

  // Optimized event handlers with useCallback
  const handleDiscountCodeChange = useCallback((code: string) => {
    setDiscountCode(code);
  }, []);

  const handleOpenComboDialog = useCallback((index: number) => {
    if (index >= dialogCombos.length) {
      setOpenPaidDrinkDialog(true);
    } else {
      setStepChoiceItem('DRINK');
      setDialogCombos(prevState =>
        prevState.map((item, i) =>
          i === index ? { ...item, show: true } : item
        )
      );
    }
  }, [dialogCombos.length]);

  const handleCloseComboDialog = useCallback((index: number) => {
    setDialogCombos(prevState =>
      prevState.map((item, i) =>
        i === index ? { ...item, show: false } : item
      )
    );
  }, []);

  // API calls
  const getEventDetails = useCallback(async () => {
    try {
      const eventResponse = await api.get('/events/getDetailEventBySlug' + '?slug=' + id);
      setEventDetails(eventResponse.data ? eventResponse.data : null);

      const menuItemsResponse = await api.get('/menu_item/GetMyMenuItem?page=1&limit=999999');
      setMenuItems(menuItemsResponse.data && menuItemsResponse.data.menuItem ? menuItemsResponse.data.menuItem : []);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }, [id]);

  // Effects
  useEffect(() => {
    getEventDetails();
  }, [getEventDetails]);

  useEffect(() => {
    if (eventDetails && menuItems) {
      setLoading(false);
    }
  }, [eventDetails, menuItems]);

  // Initialize combos
  useEffect(() => {
    if (eventSelected && eventSelected.combos && eventSelected.quantities) {
      const groupedCombos: { [comboId: string]: { combo: Combo, count: number } } = {};

      Object.keys(eventSelected.quantities).forEach(key => {
        const parts = key.split('-');
        if (parts.length === 2) {
          const comboId = parts[1];
          const combo = eventSelected.combos.find((c: Combo) => c._id === comboId);
          
          const count = eventSelected.quantities[key];
          if (combo && count > 0) {
            if (groupedCombos[comboId]) {
              groupedCombos[comboId].count += count;
            } else {
              groupedCombos[comboId] = { combo, count };
            }
          }
        }
      });

      const combosToShow = Object.entries(groupedCombos).map(([comboId, { combo, count }]) => ({
        id: `${comboId}`,
        combo: {
          ...combo,
          size_food: combo.size_food * count,
          size_drink: combo.size_drink * count,
          size_seat: combo.size_seat * count,
          original_size_food: combo.size_food,
          original_size_drink: combo.size_drink,
          original_size_seat: combo.size_seat,
          count: count
        }
      }));

      const dialogStates = combosToShow.map(item => ({
        id: item.id,
        show: false,
        combo: item.combo
      }));

      setDialogCombos(dialogStates);
    } else {
      setDialogCombos([]);
    }
  }, [eventSelected]);

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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--clr-bg)",
      }}
    >
      <title>Chọn Ghế | Queen Acoustic</title>
      <meta name="description" content="Chọn vị trí chỗ ngồi cho sự kiện tại Queen Acoustic." />
      
      <Grid container sx={{ width: "100%" }}>
        {/* Cột bên trái hiển thị bản đồ ghế */}
        <Grid size={{ xs: 12, md: isBelow1028 ? 12 : 8 }} direction="column" alignItems="center">
          <Box sx={{ position: "relative", width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              {eventDetails && (
                <SeatLayout
                  eventDetails={eventDetails}
                  isMdUp={isMdUp}
                  handleOpenPopup={(area: string) => {
                    setOpenSelectedArea(true);
                    setCurrentArea(area);
                    setTempSeatCount(prev => ({
                      ...prev,
                      [area]: seatQuantities[area] || 0,
                    }));
                  }}
                />
              )}
            </Box>
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, my: 2 }}>
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
        
        {/* Cột bên phải hiển thị thông tin booking */}
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
              {/* Component hiển thị lựa chọn ghế */}
              {!finish && eventDetails?.remainingSeats && (
                <SeatSelection
                  selectedArea={selectedAreas}
                  seatQuantities={seatQuantities}
                  handleRemoveArea={(area: string) => {
                    setSelectedAreas(prev => prev.filter(a => a !== area));
                    setSeatQuantities((prev: any) => {
                      const updated = { ...prev };
                      delete updated[area];
                      return updated;
                    });
                    setTempSeatCount(prev => {
                      const updated = { ...prev };
                      delete updated[area];
                      return updated;
                    });
                    if (selectedAreas.length === 1) {
                      setOpenSelectedArea(false);
                    }
                  }}
                  handleQuantityChange={() => {}}
                  seatRemainQuantity={eventDetails.remainingSeats}
                  onDiscountCodeChange={handleDiscountCodeChange}
                  remainingSeatsToChoose={remainingSeatsToChoose}
                />
              )}
              
              {/* Nếu có hóa đơn thì hiển thị thông tin order */}
              {finish && (
                <BookingSummary 
                  quantityCombo={0} 
                  isBelow1028={isBelow1028} 
                  billData={bill} 
                  setOpenDialog={setOpenDialog} 
                />
              )}

              {/* Nút tiếp tục */}
              <Button
                variant="contained"
                size="large"
                disabled={remainingSeatsToChoose !== 0}
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
                  if (bill) {
                    // Handle payment
                  } else {
                    if (dialogCombos.length > 0) {
                      setOpenDialog(true);
                    }
                  }
                }}
              >
                {remainingSeatsToChoose === 0
                  ? (!bill ? `Tiếp tục chọn món` : 'THANH TOÁN')
                  : `Vui lòng chọn thêm ${remainingSeatsToChoose} ghế`}
                <FontAwesomeIcon icon={faAnglesRight} style={{ marginLeft: "8px" }} />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lazy-loaded dialogs */}
      {dialogCombos.map((dialog, index) => (
        <Suspense key={dialog.id} fallback={<div />}>
          <DrinksMenu
            onOpen={dialog.show}
            onClose={() => handleCloseComboDialog(index)}
            menuItems={[]}
            comboMenuOrder={dialog.combo.MenuOrder}
            freeDrinkLimit={dialog.combo.size_drink}
            freeFoodLimit={dialog.combo.size_food}
            onConfirm={(quantities: any) => {
              // Handle combo selection
              setSelectedItems(prev => ({
                ...prev,
                [dialog.id]: { food: [], drink: [] }
              }));
              handleCloseComboDialog(index);
            }}
            title="Hãy chọn món yêu thích ngay thôi nào"
            isCombo={true}
            onBack={index > 0 ? () => {} : undefined}
            stepChoiceItem={stepChoiceItem}
            setStepChoiceItem={setStepChoiceItem}
            comboCount={dialog.combo.count}
            originalDrinkLimit={dialog.combo.original_size_drink}
            originalFoodLimit={dialog.combo.original_size_food}
          />
        </Suspense>
      ))}

      <Suspense fallback={<div />}>
        <DrinksMenu
          onOpen={openPaidDrinkDialog}
          onClose={() => setOpenPaidDrinkDialog(false)}
          menuItems={menuItems}
          onConfirm={(paidQuantities: any) => {
            setOpenPaidDrinkDialog(false);
            // Handle finish combo
          }}
          title="Gọi thêm món - tận hưởng trọn vẹn đêm nhạc"
          isCombo={false}
          onBack={() => {}}
          totalAmount={totalAmount}
          stepChoiceItem={stepChoiceItem}
          setStepChoiceItem={setStepChoiceItem}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <OrderSummaryPreview
          open={showOrderSummary}
          onClose={() => setShowOrderSummary(false)}
          onConfirm={(discountCode, customerInfo) => {}}
          previewOrder={previewOrder}
          userInfo={userInfo}
          bill={bill}
          handlePay={() => {}}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <PaymentLoadingOverlay isVisible={isProcessingPayment} />
      </Suspense>
    </Box>
  );
} 
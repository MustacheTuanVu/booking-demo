"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import UpdateDrink from "./UpdateDrink";
import * as XLSX from 'xlsx';
import { formatDateTime, formatDateTime2 } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faFileExport, 
  faPhone, 
  faCalendarAlt, 
  faTicketAlt, 
  faUser, 
  faInfoCircle, 
  faPencilAlt,
  faTimes,
  faArrowRight,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import UpdateSeat from "./UpdateSeat";

// Remove the debounce function since we want to query immediately
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

interface TabData {
  label: string;
  content: any[]; // Bạn có thể định nghĩa kiểu cụ thể cho đơn hàng
}

interface SearchParams {
  query?: string;
  time_from?: string;
  time_to?: string;
  phone?: string;
  name?: string;
  orderBy?: string;
  status?: string;
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

export default function MyTickets() {
  const router = useRouter();
  const [tabIndexMain, setTabIndexMain] = useState(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");
  const [orderByField, setOrderByField] = useState<string>("createdAt:desc");
  const [tabData, setTabData] = useState<TabData[]>([
    { label: "Tất cả", content: [] },
    { label: "Thành công", content: [] },
    { label: "Đang xử lý", content: [] },
    { label: "Đã hủy", content: [] },
  ]);
  const [eventList, setEventList] = useState<Event[]>([]);
  // New state for filter panel visibility with localStorage persistence
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(true);

  const [eventSelected, setEventSelected] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  // State to track counts for each tab category with dedicated fetch status
  const [tabCounts, setTabCounts] = useState<number[]>([0, 0, 0, 0]);
  const [isCountsLoading, setIsCountsLoading] = useState<boolean>(true);
  // New state to track when a tab is actively changing
  const [isTabChanging, setIsTabChanging] = useState<boolean>(false);
  // Previous tab index to help with transitions
  const [prevTabIndex, setPrevTabIndex] = useState<number>(0);

  // Effect to initialize filter expanded state from localStorage
  useEffect(() => {
    const savedFilterState = localStorage.getItem('ticketListFilterExpanded');
    if (savedFilterState !== null) {
      setIsFilterExpanded(savedFilterState === 'true');
    }
  }, []);

  // Effect to save filter expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('ticketListFilterExpanded', isFilterExpanded.toString());
  }, [isFilterExpanded]);

  // Helper function to fetch tab counts
  const fetchTabCounts = async () => {
    try {
      setIsCountsLoading(true);
      let queryParams = "";

      // Tạo queryParams nếu có filter
      if (searchParams.status) {
        queryParams += `&status=${searchParams.status}`;
      }
      if (searchParams.query) {
        queryParams += `&query=${encodeURIComponent(searchParams.query)}`;
      }
      // Xử lý time range
      if (searchParams.time_from) {
        queryParams += `&time_from=${encodeURIComponent(searchParams.time_from)}`;
        
        if (searchParams.time_to) {
          // Cả 2 có
          queryParams += `&time_to=${encodeURIComponent(searchParams.time_to)}`;
        } else {
          // Chỉ có from → default to cuối ngày
          const endOfDay = new Date(searchParams.time_from);
          endOfDay.setHours(23, 59, 59, 999);
          queryParams += `&time_to=${encodeURIComponent(endOfDay.toISOString())}`;
        }
      } else if (searchParams.time_to) {
        // Chỉ có to
        queryParams += `&time_to=${encodeURIComponent(searchParams.time_to)}`;
      }
      if (searchParams.phone) {
        queryParams += `&phone=${encodeURIComponent(searchParams.phone)}`;
      }
      if (searchParams.name) {
        queryParams += `&name=${encodeURIComponent(searchParams.name)}`;
      }
      if (searchParams.orderBy) {
        queryParams += `&orderBy=${encodeURIComponent(searchParams.orderBy)}`;
      }
      
      // Loại bỏ dấu `&` đầu tiên nếu cần (cho đẹp)
      const finalParams = queryParams.startsWith('&') ? queryParams.slice(1) : queryParams;
      
      // Gọi API tương ứng
      let allResponse, paidResponse, pendingResponse, canceledResponse;
      
      if (finalParams) {
        [allResponse, paidResponse, pendingResponse, canceledResponse] = await Promise.all([
          api.get(`/orders/GetMany?page=1&limit=1&${finalParams}`),
          api.get(`/orders/GetMany?page=1&limit=1&status=PAID&${finalParams}`),
          api.get(`/orders/GetMany?page=1&limit=1&status=PENDING&${finalParams}`),
          api.get(`/orders/GetMany?page=1&limit=1&status=CANCELED&${finalParams}`)
        ]);
      } else {
        [allResponse, paidResponse, pendingResponse, canceledResponse] = await Promise.all([
          api.get(`/orders/GetMany?page=1&limit=1`),
          api.get(`/orders/GetMany?page=1&limit=1&status=PAID`),
          api.get(`/orders/GetMany?page=1&limit=1&status=PENDING`),
          api.get(`/orders/GetMany?page=1&limit=1&status=CANCELED`)
        ]);
      }
      
      // Update tab counts with actual values
      setTabCounts([
        allResponse.data.total,
        paidResponse.data.total,
        pendingResponse.data.total,
        canceledResponse.data.total
      ]);
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    } finally {
      setIsCountsLoading(false);
    }
  };

  const getEventList = async (tabIndex: number, pageNumber: number) => {
    // Set tab changing state at the beginning of data fetching
    setIsTabChanging(true);

    // Start with basic pagination parameters
    let queryParams = `page=${pageNumber + 1}`;
  
    // If date range is selected, show all records instead of paginating
    if (searchParams.time_from && searchParams.time_to) {
      queryParams += `&limit=999999`; // Use a very high limit to get all records
    } else {
      queryParams += `&limit=${limit}`;
    }

    // Add status parameter based on the selected tab
    if (tabIndex !== 0) {
      switch (tabIndex) {
        case 1:
          queryParams += "&status=PAID";
          break;
        case 2:
          queryParams += "&status=PENDING";
          break;
        case 3:
          queryParams += "&status=CANCELED";
          break;
      }
    } else if (searchParams.status) {
      // If on "All" tab but a status filter is applied
      queryParams += `&status=${searchParams.status}`;
    }

    // Add other search parameters if present
    if (searchParams.query) {
      queryParams += `&query=${encodeURIComponent(searchParams.query)}`;
    }

    if (searchParams.time_from && searchParams.time_to) {
      queryParams += `&time_from=${encodeURIComponent(searchParams.time_from)}`;
      queryParams += `&time_to=${encodeURIComponent(searchParams.time_to)}`;
    }

    if (searchParams.phone) {
      queryParams += `&phone=${encodeURIComponent(searchParams.phone)}`;
    }

    if (searchParams.name) {
      queryParams += `&name=${encodeURIComponent(searchParams.name)}`;
    }

    if (searchParams.orderBy) {
      queryParams += `&orderBy=${encodeURIComponent(searchParams.orderBy)}`;
    }

    try {
      const res = await api.get(`/orders/GetMany?${queryParams}`);

      const newTabData = [...tabData];
      newTabData[tabIndex].content = res.data.orders;
      setTotal(res.data.total);
      setTabData(newTabData);
      
      // Update only the current tab's count directly
      const newTabCounts = [...tabCounts];
      newTabCounts[tabIndex] = res.data.total;
      setTabCounts(newTabCounts);
    } catch (error) {
      console.error(error);
    } finally {
      // Clear tab changing state when data is loaded
      setIsTabChanging(false);
    }
  };
  useEffect(() => {
    updateSearchParams();
  }, [timeFrom, timeTo, orderByField]);
  useEffect(() => {
    fetchTabCounts();
  }, [searchTerm, customerPhone, customerName, timeFrom, timeTo, orderByField]);
 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateSearchParams();
    }
  };
  const [comboData, setComboData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [comboRes, eventRes] = await Promise.all([
        api.get(`combo_event/GetByCondition?page=1&limit=999999'`),
        api.get('/events/getEventByCondition?page=1&limit=50')
      ]);
      setComboData(comboRes.data.combo);
      setEventList(eventRes.data.events);
    }
    fetchData();
  }, []);
  const getDataTimeEvent = useCallback((eventId: string) => {
    const event = eventList.find((event: Event) => event._id === eventId);
    if (event && event.InfoShowTimes && event.InfoShowTimes.length > 0) {
      return formatDateTime2(event.InfoShowTimes[0].time_start);
    }
    return "N/A";
  }, [eventList]);
  useEffect(() => {
    getEventList(tabIndexMain, page);
  }, [tabIndexMain, page, searchParams]);

  useEffect(() => {
    fetchTabCounts();
  }, [searchParams]);

  // Effect to reset tab changing state when data is loaded
  useEffect(() => {
    if (!isTabChanging) {
      setPrevTabIndex(tabIndexMain);
    }
  }, [isTabChanging, tabIndexMain]);

  const handleCombo = (_id: any) => {
    return comboData?.find((combo: any) => combo._id === _id) || null;
  }

  const resetSearch = () => {
    setSearchTerm("");
    setCustomerName("");
    setCustomerPhone("");
    setTimeFrom("");
    setTimeTo("");
    setOrderByField("createdAt:desc");
    setSearchParams({});
    setPage(0);
  };

  // Replace the debounced search with direct update
  const updateSearchParams = () => {
    setPage(0); // Reset page when searching
    
    const params: any = {};

    // Check if searchTerm is provided (for general query like order code)
    if (searchTerm.trim()) {
      params.query = searchTerm.trim();
    }

    // Add customer information search parameters
    if (customerPhone.trim()) {
      params.phone = customerPhone.trim();
    }

    if (customerName.trim()) {
      params.name = customerName.trim();
    }

    // Add date range if both dates are provided
    if (timeFrom && timeTo) {
      // For timeFrom, set the time to the beginning of the selected datetime
      params.time_from = timeFrom;
    
      const toDate = new Date(timeTo);
      toDate.setHours(23, 59);
      params.time_to = toDate.toISOString();
    } else if (timeFrom && !timeTo) {
      // Nếu chỉ có timeFrom → mặc định timeTo là cuối ngày đó
      const fromDate = new Date(timeFrom);
      params.time_from = timeFrom;
    
      const endOfDay = new Date(fromDate);
      endOfDay.setHours(23, 59);
      params.time_to = endOfDay.toISOString();
    }

    // Add sorting option
    if (orderByField) {
      params.orderBy = orderByField;
    }

    // Don't override tab status with search status
    if (tabIndexMain === 0) {
      params.status = null;
    }

    setSearchParams(params);
  };
  
  const handleUpdateDrink = async (sourceJson: any) => {
    // Extract combo info from the first order item
    const extractedCombos = sourceJson.InfoOrderItems[0]?.combo_info || [];

    // Create quantities object from extracted combos
    const quantities: Record<string, number> = {};
    extractedCombos.forEach((combo: any, index: any) => {
      quantities[`${index + 1}-${combo.comboId}`] = 1;
    });

    // Format the time from contentEvent.time
    const eventTime = new Date(sourceJson.contentEvent?.time || new Date());
    const formattedTime = `${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`;

    // Extract the date from contentEvent.time
    const eventDate = eventTime.toISOString().split('T')[0];

    // Create the transformed JSON
    const targetJson: any = {
      id: sourceJson._id, // Assign an id (could be extracted from _id if needed)
      time: formattedTime,
      time_end: sourceJson.contentEvent?.time,
      title: sourceJson.eventDetail?.title,
      performer: "", // No direct performer info in source, could be extracted from artist_id if needed
      status: sourceJson.status?.toLowerCase(),
      genre: "Music", // Default, as there's no direct genre mapping
      banner: sourceJson.eventDetail?.banner,
      slug: sourceJson.eventDetail?.slug,
      desc: sourceJson.eventDetail?.desc,
      combos: extractedCombos.map((combo: any) => (
        handleCombo(combo.comboId)
      )),
      date: eventDate,
      quantities: quantities
    };

    console.log('targetJson', targetJson);
    setEventSelected(targetJson);
  }
  const handleUpdateSeat = async () => {
    setOpenDialog(true);
  }

  const exportToExcel = () => {
    // Create data array for Excel export
    const exportData = tabData[tabIndexMain].content.map((order) => {
      // Extract combo and item information
      const combos = order.InfoOrderItems?.[0]?.combo_info || [];
      const comboDetails = combos.map((combo: any) => {
        const comboData = handleCombo(combo.comboId);
        const comboName = comboData?.name || combo.name || 'Unknown Combo';
        
        // Extract actual item names from combo items
        const comboItems = combo.items.map((item: any) => {
          const itemName = item.name || item.item_name_cukcuk || 'Unnamed Item';
          return `${itemName} x${item.quantity}`;
        }).join(', ');
        
        return `${comboName} (${comboItems}) x${combo.count}`;
      }).join('\n');
      
      // Extract upsell items with detailed information
      const upsellItems = order.InfoOrderItems?.[0]?.item_upsell || [];
      const upsellDetails = upsellItems.map((item: any) => {
        const itemName = item.name || item.item_name_cukcuk || 'Unnamed Item';
        return `${itemName} x${item.quantity} (${Number(item.price).toLocaleString('vi-VN')}đ)`;
      }).join('\n');
      
      // Extract seat information if available
      const jSize = order.InfoOrderItems?.[0]?.j_size || 0;
      const qSize = order.InfoOrderItems?.[0]?.q_size || 0;
      const kSize = order.InfoOrderItems?.[0]?.k_size || 0;
      const seatInfo = [
        jSize > 0 ? `J: ${jSize}` : '',
        qSize > 0 ? `Q: ${qSize}` : '',
        kSize > 0 ? `K: ${kSize}` : ''
      ].filter(Boolean).join('; ');
      
      // Format status text
      let statusText = '';
      if (order.InfoOrderPayment?.status === "PAID") statusText = "ĐÃ THANH TOÁN";
      else if (order.InfoOrderPayment?.status === "PENDING") statusText = "ĐANG CHỜ THANH TOÁN";
      else if (order.InfoOrderPayment?.status === "CONFIRMED") statusText = "ĐÃ XÁC NHẬN";
      else if (order.InfoOrderPayment?.status === "CANCELED") statusText = "ĐÃ HỦY";
      else if (order.InfoOrderPayment?.status === "REFUNDED") statusText = "ĐÃ HOÀN TIỀN";
      else statusText = "THANH TOÁN THẤT BẠI";
      
      // Format date
      const orderDate = formatDateTime(order.createdAt);
      const eventDate = order.contentEvent?.time ? new Date(order.contentEvent.time).toLocaleDateString('vi-VN') : '';
      const eventTime = order.contentEvent?.time ? new Date(order.contentEvent.time).toLocaleTimeString('vi-VN') : '';
      
      // Return formatted data row
      return {
        'Mã đơn hàng': order.code,
        'Ngày đặt': orderDate,
        'Trạng thái': statusText,
        'Tổng tiền': Number(order.total_price).toLocaleString('vi-VN') + 'đ',
        'Tên khách hàng': order.InfoUser?.name || '',
        'SĐT': order.InfoUser?.phone || '',
        'Email': order.InfoUser?.email || '',
        'Tên sự kiện': order.eventDetail?.title || '',
        'Địa điểm': order.eventDetail?.venue || '',
        'Ngày sự kiện': eventDate,
        'Giờ sự kiện': eventTime,
        'Chỗ ngồi': seatInfo,
        'Combo': comboDetails,
        'Món thêm': upsellDetails,
        'Nhân viên đặt': order.employee_id ? 'Có' : 'Không',
        'Mã giảm giá': order.promotion?.code || '',
        'Ghi chú': order.note || ''
      };
    });
    
    // Create workbook and worksheet
    const worksheet:any = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 15 }, // Mã đơn hàng
      { wch: 12 }, // Ngày đặt
      { wch: 15 }, // Trạng thái
      { wch: 12 }, // Tổng tiền
      { wch: 25 }, // Tên khách hàng
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 30 }, // Tên sự kiện
      { wch: 40 }, // Địa điểm
      { wch: 12 }, // Ngày sự kiện
      { wch: 12 }, // Giờ sự kiện
      { wch: 15 }, // Chỗ ngồi
      { wch: 50 }, // Combo - extra wide for detailed combo information
      { wch: 40 }, // Món thêm - extra wide for detailed item information
      { wch: 15 }, // Nhân viên đặt
      { wch: 15 }, // Mã giảm giá
      { wch: 20 }  // Ghi chú
    ];
    
    // Configure worksheet for better readability
    worksheet['!rows'] = exportData.map(() => ({ hpt: 24 })); // Set row height
    
    // Apply text wrapping to the combo and upsell item columns (index 12 and 13)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const comboCell = XLSX.utils.encode_cell({ r: row, c: 12 });
      const upsellCell = XLSX.utils.encode_cell({ r: row, c: 13 });
      
      if (!worksheet[comboCell]) continue;
      if (!worksheet[upsellCell]) continue;
      
      if (!worksheet[comboCell].s) worksheet[comboCell].s = {};
      if (!worksheet[upsellCell].s) worksheet[upsellCell].s = {};
      
      worksheet[comboCell].s.alignment = { wrapText: true, vertical: 'top' };
      worksheet[upsellCell].s.alignment = { wrapText: true, vertical: 'top' };
    }
    
    // Generate filename with current date
    const date = new Date();
    const dateString = `${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}`;
    const fileName = `Queen_Acoustic_Orders_${dateString}.xlsx`;
    
    // Export file
    XLSX.writeFile(workbook, fileName);
  };

  // Toggle filter panel function
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  return (
    <div className="container mx-auto px-4 py-6 text-gray-900 max-w-screen-2xl">
      <title>Quản lý đặt chỗ | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý đặt chỗ tại Queen Acoustic." />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Fixed width with flex-shrink-0 to prevent squishing */}
        <div className="w-full lg:w-[280px] flex-shrink-0">
          <div className="lg:sticky lg:top-6">
            <DashboardSidebar />
          </div>
        </div>
        {/* Main content - With flex-grow to use remaining space */}
        <div className="flex-grow">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-gold-500 to-gold-400 rounded-xl shadow-md p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 md:mb-0">Quản lý đặt chỗ</h1>
              <div className="flex items-center w-full md:w-auto">
                {/* Export Excel Button */}
                <button
                  onClick={exportToExcel}
                  disabled={tabData[tabIndexMain].content.length === 0}
                  className="w-full md:w-auto bg-white text-gold-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Improved Filter Section with collapsible panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden transition-all duration-300">
            {/* Filter Header with toggle */}
            <div 
              className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
              onClick={() => toggleFilterPanel()}
            >
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faSearch} className="mr-2 text-gold-500" />
                Tìm kiếm và lọc
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the panel toggle
                    resetSearch();
                  }}
                  variant="ghost"
                  size="sm"
                  className={`text-xs font-medium text-gray-500 hover:text-gold-600 ${!(searchTerm || customerName || customerPhone || timeFrom || timeTo || orderByField !== "createdAt:desc") && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!(searchTerm || customerName || customerPhone || timeFrom || timeTo || orderByField !== "createdAt:desc")}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1.5 h-3 w-3" />
                  Xóa bộ lọc
                </Button>
                <button 
                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  aria-expanded={isFilterExpanded}
                  aria-label={isFilterExpanded ? "Thu gọn bộ lọc" : "Mở rộng bộ lọc"}
                >
                  <FontAwesomeIcon 
                    icon={isFilterExpanded ? faChevronUp : faChevronDown} 
                    className="h-3.5 w-3.5" 
                  />
                </button>
              </div>
            </div>

            {/* Filter Content - Animated with height transition */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isFilterExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Order Code Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faTicketAlt} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Mã đơn hàng
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          // updateSearchParams();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập mã..."
                        className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 pl-8"
                      />
                      <FontAwesomeIcon 
                        icon={faSearch} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" 
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            updateSearchParams();
                            // If no other filters are applied, reset to original state
                            if (!(customerPhone || customerName || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                              resetSearch();
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone Number Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          // updateSearchParams();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập SĐT..."
                        className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 pl-8"
                      />
                      <FontAwesomeIcon 
                        icon={faPhone} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" 
                      />
                      {customerPhone && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerPhone("");
                            updateSearchParams();
                            // If no other filters are applied, reset to original state
                            if (!(searchTerm || customerName || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                              resetSearch();
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Name Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Tên khách hàng
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          // updateSearchParams();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tên..."
                        className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 pl-8"
                      />
                      <FontAwesomeIcon 
                        icon={faUser} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" 
                      />
                      {customerName && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerName("");
                            updateSearchParams();
                            // If no other filters are applied, reset to original state
                            if (!(searchTerm || customerPhone || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                              resetSearch();
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date From Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Từ ngày
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={timeFrom}
                        onChange={(e) => {
                          setTimeFrom(e.target.value);
                          if (timeTo) {
                            updateSearchParams();
                            fetchTabCounts();
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 pl-8"
                      />
                      <FontAwesomeIcon 
                        icon={faCalendarAlt} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" 
                      />
                      {timeFrom && (
                        <button
                          type="button"
                          onClick={() => {
                            setTimeFrom("");
                            updateSearchParams();
                            // If no other filters are applied, reset to original state
                            if (!(searchTerm || customerPhone || customerName || timeTo || orderByField !== "createdAt:desc")) {
                              resetSearch();
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date To Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Đến ngày
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={timeTo}
                        onChange={(e) => {
                          setTimeTo(e.target.value);
                          if (timeFrom) {
                            updateSearchParams();
                            fetchTabCounts();
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 pl-8"
                      />
                      <FontAwesomeIcon 
                        icon={faCalendarAlt} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" 
                      />
                      {timeTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setTimeTo("");
                            updateSearchParams();
                            // If no other filters are applied, reset to original state
                            if (!(searchTerm || customerPhone || customerName || timeFrom || orderByField !== "createdAt:desc")) {
                              resetSearch();
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sort order */}
                <div className="mt-4">
                  <div className="space-y-1.5 max-w-xs">
                    <label className="text-xs md:text-sm font-semibold text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faArrowRight} className="mr-1.5 h-3 w-3 text-gray-400" />
                      Sắp xếp theo
                    </label>
                    <select
                      value={orderByField}
                      onChange={(e) => {
                        setOrderByField(e.target.value);
                        // updateSearchParams();
                      }}
                      className="w-full p-2.5 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all duration-200 appearance-none bg-white pr-8"
                    >
                      <option value="createdAt:desc">Mới nhất trước</option>
                      <option value="createdAt:asc">Cũ nhất trước</option>
                      <option value="total_price:desc">Giá trị cao nhất trước</option>
                      <option value="total_price:asc">Giá trị thấp nhất trước</option>
                      <option value="code:asc">Mã đơn hàng (A-Z)</option>
                      <option value="code:desc">Mã đơn hàng (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display - Show only when filter is collapsed and there are filters */}
          {!isFilterExpanded && (searchTerm || customerName || customerPhone || (timeFrom && timeTo) || orderByField !== "createdAt:desc") && (
            <div className="flex flex-wrap gap-2 items-center mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <button 
                className="mr-1 text-gold-600 hover:text-gold-700 flex items-center"
                onClick={() => toggleFilterPanel()}
              >
                <FontAwesomeIcon icon={faSearch} className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs font-medium">Mở bộ lọc</span>
              </button>
              
              {/* Filter Pills */}
              {searchTerm && (
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center">
                  <FontAwesomeIcon icon={faTicketAlt} className="mr-1.5 h-2.5 w-2.5 text-gold-500" />
                  <span className="mr-1.5">{searchTerm}</span>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      updateSearchParams();
                      // If no other filters are applied, reset to original state
                      if (!(customerPhone || customerName || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                        resetSearch();
                      }
                    }}
                    className="text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {customerPhone && (
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="mr-1.5 h-2.5 w-2.5 text-gold-500" />
                  <span className="mr-1.5">{customerPhone}</span>
                  <button
                    onClick={() => {
                      setCustomerPhone("");
                      updateSearchParams();
                      // If no other filters are applied, reset to original state
                      if (!(searchTerm || customerName || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                        resetSearch();
                      }
                    }}
                    className="text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {customerName && (
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-1.5 h-2.5 w-2.5 text-gold-500" />
                  <span className="mr-1.5">{customerName}</span>
                  <button
                    onClick={() => {
                      setCustomerName("");
                      updateSearchParams();
                      // If no other filters are applied, reset to original state
                      if (!(searchTerm || customerPhone || timeFrom || timeTo || orderByField !== "createdAt:desc")) {
                        resetSearch();
                      }
                    }}
                    className="text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {timeFrom && timeTo && (
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 h-2.5 w-2.5 text-gold-500" />
                  <span className="mr-1.5">{new Date(timeFrom).toLocaleDateString('vi-VN')} - {new Date(timeTo).toLocaleDateString('vi-VN')}</span>
                  <button
                    onClick={() => {
                      setTimeFrom("");
                      setTimeTo("");
                      updateSearchParams();
                      // If no other filters are applied, reset to original state
                      if (!(searchTerm || customerPhone || customerName || orderByField !== "createdAt:desc")) {
                        resetSearch();
                      }
                    }}
                    className="text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {orderByField !== "createdAt:desc" && (
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center">
                  <FontAwesomeIcon icon={faArrowRight} className="mr-1.5 h-2.5 w-2.5 text-gold-500" />
                  <span className="mr-1.5">{
                    orderByField === "createdAt:asc" ? "Cũ nhất trước" :
                    orderByField === "total_price:desc" ? "Giá trị cao nhất" :
                    orderByField === "total_price:asc" ? "Giá trị thấp nhất" :
                    orderByField === "code:asc" ? "Mã A-Z" :
                    orderByField === "code:desc" ? "Mã Z-A" : 
                    "Tùy chỉnh"
                  }</span>
                  <button
                    onClick={() => {
                      setOrderByField("createdAt:desc");
                      updateSearchParams();
                      // If no other filters are applied, reset to original state
                      if (!(searchTerm || customerPhone || customerName || timeFrom || timeTo)) {
                        resetSearch();
                      }
                    }}
                    className="text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Tab Navigation - Improved */}
          <div className="mb-6">
            <nav className="flex p-1 bg-white rounded-xl shadow-sm overflow-x-auto">
              {tabData.map((tab, index) => {
                // Determine badge color based on tab index
                const getBadgeColor = (idx: number) => {
                  switch(idx) {
                    case 1: return "bg-emerald-100 text-emerald-700"; // Success
                    case 2: return "bg-amber-100 text-amber-700";     // Pending
                    case 3: return "bg-red-100 text-red-700";         // Canceled
                    default: return "bg-gray-100 text-gray-700";      // All
                  }
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setPrevTabIndex(tabIndexMain);
                      setTabIndexMain(index);
                      setPage(0); // reset page when changing tab
                      setIsTabChanging(true);
                    }}
                    className={`flex items-center justify-center px-4 py-2.5 m-1 rounded-lg transition-all duration-200 flex-1 min-w-[100px]
                      ${tabIndexMain === index
                        ? "bg-gold-500 text-white shadow-md font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gold-500"
                      }`}
                    aria-selected={tabIndexMain === index}
                    role="tab"
                  >
                    <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
                    
                    {/* Count badge with improved state handling to prevent flickering */}
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full
                      ${tabIndexMain === index ? "bg-white bg-opacity-20 text-white" : getBadgeColor(index)}`}
                    >
                      {isCountsLoading && !isTabChanging ? "..." : 
                       (isTabChanging && index === tabIndexMain) ? "..." : 
                       tabCounts[index]}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {tabData[tabIndexMain].content.length > 0 ? (
            <>
              {tabData[tabIndexMain].content.map((event, idx) => (
                <div
                  key={idx}
                  className={`bg-white mb-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-l-4 ${
                    event.InfoOrderPayment?.status === "PAID" || event.InfoOrderPayment?.status === "CONFIRMED"
                      ? "border-emerald-500"
                      : event.InfoOrderPayment?.status === "PENDING"
                      ? "border-amber-500"
                      : "border-rose-500"
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-3 items-center">
                      
                      {/* Column 1: Order & Event Info with better visual hierarchy */}
                      <div className="sm:col-span-4 space-y-2.5">
                        <div className="flex items-center justify-between sm:justify-start">
                          <p className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1.5 hover:text-gold-600 transition-colors" title={event.code}>
                            <FontAwesomeIcon icon={faTicketAlt} className="h-3.5 w-3.5 md:h-4 md:w-4 text-gold-500" />
                            {event.code}
                          </p>
                          
                          {/* Status Badge (Mobile View) */}
                          <div className={`sm:hidden inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            event.InfoOrderPayment?.status === "PAID" || event.InfoOrderPayment?.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-700"
                              : event.InfoOrderPayment?.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}>
                            {event.InfoOrderPayment?.status === "PAID" ? "ĐÃ TT" : 
                             event.InfoOrderPayment?.status === "PENDING" ? "ĐANG CHỜ" :
                             event.InfoOrderPayment?.status === "CONFIRMED" ? "ĐÃ XN" : 
                             event.InfoOrderPayment?.status === "CANCELED" ? "ĐÃ HỦY" :
                             event.InfoOrderPayment?.status === "REFUNDED" ? "ĐÃ HOÀN" : 
                             "LỖI TT"}
                          </div>
                        </div>
                        
                        {/* Event title with event date concatenated */}
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed" title={`${event.eventDetail?.title}${event.contentEvent?.time ? ` - ${new Date(event.contentEvent.time).toLocaleDateString('vi-VN')}` : ''}`}>
                          {event.eventDetail?.title || 'N/A'}
                          {event?.event_id && ` - ${getDataTimeEvent(event.event_id)}`}
                        </p>
                      </div>

                      {/* Column 2: Customer Info with improved layout */}
                      <div className="sm:col-span-3 space-y-2.5">
                        <p className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-1.5 hover:text-gold-600 transition-colors" title={event.InfoUser?.name}>
                          <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
                          <span className="truncate">{event.InfoUser?.name || 'N/A'}</span>
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5" title={event.InfoUser?.phone}>
                          <FontAwesomeIcon icon={faPhone} className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-500" />
                          {event.InfoUser?.phone || 'N/A'}
                        </p>
                      </div>

                      {/* Column 3: Date & Price with improved formatting */}
                      <div className="sm:col-span-2 space-y-2.5">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-500" />
                          <div className="text-xs md:text-sm text-gray-600" title={`Đặt lúc: ${formatDateTime(event.createdAt)}`}>
                            <p className="leading-snug font-light">{new Date(event.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="leading-snug">{new Date(event.createdAt).toLocaleDateString('vi-VN')}</p>     
                          </div>
                        </div>
                        <p className="text-sm md:text-base font-bold text-gold-600">
                          {Number(event.total_price).toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      {/* Column 4: Status & Actions with enhanced styling */}
                      <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between mt-1 sm:mt-0">
                        {/* Status Badge (Desktop View) */}
                        <div className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                          event.InfoOrderPayment?.status === "PAID" || event.InfoOrderPayment?.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : event.InfoOrderPayment?.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {event.InfoOrderPayment?.status === "PAID" ? "ĐÃ THANH TOÁN" : 
                           event.InfoOrderPayment?.status === "PENDING" ? "ĐANG CHỜ THANH TOÁN" :
                           event.InfoOrderPayment?.status === "CONFIRMED" ? "ĐÃ XÁC NHẬN" : 
                           event.InfoOrderPayment?.status === "CANCELED" ? "ĐÃ HỦY" :
                           event.InfoOrderPayment?.status === "REFUNDED" ? "ĐÃ HOÀN TIỀN" : 
                           "THANH TOÁN THẤT BẠI"}
                        </div>
                        
                        {/* Action Buttons with improved styling */}
                        <div className="flex gap-2 mt-2.5 md:mt-3">
                          <button
                            onClick={() => {
                              localStorage.setItem("previousURL", `${window.location.pathname}?admin=true`);
                              router.replace(`/ve/${event._id}`);
                            }}
                            className="flex items-center justify-center h-9 px-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gold-600 hover:border-gold-400 transition-all duration-200 text-sm font-medium shadow-sm"
                            title="Xem chi tiết"
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="h-3.5 w-3.5 mr-1.5 text-gold-500" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleUpdateDrink(event)}
                            className="flex items-center justify-center h-9 px-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gold-600 hover:border-gold-400 transition-all duration-200 text-sm font-medium shadow-sm"
                            title="Sửa món"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className="h-3.5 w-3.5 mr-1.5 text-gold-500" />
                            <span>Sửa</span>
                          </button>
                          {/* <button
                            onClick={() => handleUpdateSeat()}
                            className="flex items-center justify-center h-9 px-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gold-600 hover:border-gold-400 transition-all duration-200 text-sm font-medium shadow-sm"
                            title="Xếp chỗ"
                          >
                            <FontAwesomeIcon icon={faDiagramSuccessor} className="h-3.5 w-3.5 mr-1.5 text-gold-500" />
                            <span>Xếp chỗ</span>
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination - updated for consistency */}
              <PaginationControls
                page={page}
                limit={limit}
                total={total}
                onPageChange={(newPage) => setPage(newPage)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(0); // Reset to first page when changing limit
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
                className="mt-6"
              />
            </>
          ) : (
            <EmptyState
              title="Chưa có đơn hàng nào"
              subtitle="Bạn chưa có đơn hàng nào trong danh sách hiển thị."
              searchQuery={searchTerm}
              searchSubtitle="Không tìm thấy đơn hàng nào. Thử tìm kiếm với từ khóa khác."
              onActionClick={() => router.replace("/")}
              actionButtonText="Mua ngay"
              minHeight="200px"
              icon={faTicketAlt}
            />
          )}
        </div>
      </div>
      {/* Use the UpdateDrink component directly */}
      {eventSelected && (
        <UpdateDrink
          eventSelected={eventSelected}
          seteventSelected={setEventSelected}
        />
      )}
        {/* {openDialog && (
        <UpdateSeat
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        />
      )} */}
    </div>
  );
}
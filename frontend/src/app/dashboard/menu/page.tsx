"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faEdit, 
  faEye, 
  faImage, 
  faTrash, 
  faFilter,
  faSearch,
  faPlus,
  faTimes,
  faSort,
  faBarsProgress
} from "@fortawesome/free-solid-svg-icons";

// UI Components
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";
import { cn } from "@/lib/utils";

// Local Components
import CreateEditMenuDialog from "./component/CreateEditMenuDialog";
import MenuItemsDialog from "./component/MenuItemsDialog";
import MenuDetailsDialog from "./component/MenuDetailsDialog";

// Types
import { MenuOrder, MenuItem, MenuOrderTypeEnum, Status } from "./types/menu.types";

const MenuPage: React.FC = () => {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuOrder[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuOrder | null>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openDialogMessage, setOpenDialogMessage] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success"
  });

  // Filter states
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("createdAt:desc");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // State for menu items management dialog
  const [openMenuItemsDialog, setOpenMenuItemsDialog] = useState<boolean>(false);
  const [menuForItems, setMenuForItems] = useState<MenuOrder | null>(null);

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuOrder | null>(null);
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initialize
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Load saved preferences on mount
  useEffect(() => {
    // Load view mode preference (but respect mobile constraints)
    const savedViewMode = localStorage.getItem("menuViewMode") as ViewMode | null;
    if (savedViewMode && (savedViewMode === "table" || savedViewMode === "card")) {
      // Only allow table view on non-mobile devices
      if (savedViewMode === "table" && !isMobileView) {
        setViewMode(savedViewMode);
      } else if (isMobileView) {
        // Force card view on mobile
        setViewMode("card");
      } else {
        setViewMode(savedViewMode);
      }
    } else if (isMobileView) {
      // Default to card view on mobile if no preference
      setViewMode("card");
    }
    
    // Load filter panel state
    const savedFilterState = localStorage.getItem("menuFilterExpanded");
    if (savedFilterState) {
      setIsFilterExpanded(savedFilterState === "true");
    }
  }, [isMobileView]);
  
  // Force card view on mobile devices whenever screen size changes
  useEffect(() => {
    if (isMobileView && viewMode === "table") {
      setViewMode("card");
    }
  }, [isMobileView, viewMode]);
  
  // Save view mode preference when changed
  useEffect(() => {
    localStorage.setItem("menuViewMode", viewMode);
  }, [viewMode]);
  
  // Save filter panel state when changed
  useEffect(() => {
    localStorage.setItem("menuFilterExpanded", String(isFilterExpanded));
  }, [isFilterExpanded]);

  // Add useEffect to inject custom xs breakpoint CSS if needed
  useEffect(() => {
    // Check if the xs breakpoint is already defined in Tailwind
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 480px) {
        .xs\\:flex-row { flex-direction: row !important; }
        .xs\\:items-center { align-items: center !important; }
        .xs\\:mb-0 { margin-bottom: 0 !important; }
        .xs\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .xs\\:gap-3 { gap: 0.75rem !important; }
        .xs\\:aspect-\\[4\\/3\\] { aspect-ratio: 4/3 !important; }
        .xs\\:p-3 { padding: 0.75rem !important; }
        .xs\\:table-cell { display: table-cell !important; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch menus with filtering
  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}`;

      if (filterQuery) queryParams += `&query=${filterQuery}`;
      if (filterType) queryParams += `&type=${filterType}`;
      if (filterStatus) queryParams += `&status=${filterStatus}`;
      if (orderBy) queryParams += `&orderBy=${orderBy}`;

      const res = await api.get(`menu_order/GetMyMenuOrderByCondition?${queryParams}`);
      setMenus(res.data.menuOrder);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Error fetching menus", error);
      showNotification("Không thể tải danh sách menu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all menu items for selection
  const fetchAllMenuItems = async () => {
    try {
      const res = await api.get("menu_item/GetMyMenuItem?limit=999999999999");
      setAllMenuItems(res.data.menuItem);
    } catch (error) {
      console.error("Error fetching menu items", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [page, limit, filterType, filterStatus, orderBy]);

  useEffect(() => {
    fetchAllMenuItems();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingMenu(null);
    setImageFile(null);
    setImagePreview(null);
    setSelectedMenuItems([]);
  };

  const handleItemsDialogClose = () => {
    setOpenMenuItemsDialog(false);
    setMenuForItems(null);
    setSelectedMenuItems([]);
  };

  // Handle form submission for creating/updating a menu
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    const menuData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as MenuOrderTypeEnum,
      // status: formData.get('status') as Status,
      items: selectedMenuItems.length > 0 ? selectedMenuItems : undefined,
    };

    try {
      if (editingMenu) {
        // Create a FormData for file upload if we have an image
        if (imageFile) {
          const fileFormData = new FormData();
          fileFormData.append('file', imageFile);

          // Thêm các trường dữ liệu vào FormData
          fileFormData.append('name', formData.get('name') as string);
          fileFormData.append('description', formData.get('description') as string);
          fileFormData.append('type', formData.get('type') as string);

          // Update the menu data first
          // await api.put(`menu_order/Update?id=${editingMenu._id}`, menuData);

          // Then upload the image
          await api.put(`menu_order/Update?id=${editingMenu._id}`, fileFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          showNotification("Menu đã được cập nhật thành công!");
        } else {
          // Just update the menu data
          await api.put(`menu_order/Update?id=${editingMenu._id}`, menuData);
          showNotification("Menu đã được cập nhật thành công!");
        }
      } else {
        // Create new menu
        const fileFormData = new FormData();

        // Thêm các trường dữ liệu vào FormData
        fileFormData.append('name', formData.get('name') as string);
        fileFormData.append('description', formData.get('description') as string);
        fileFormData.append('type', formData.get('type') as string);

        // Thêm danh sách các items nếu có
        if (selectedMenuItems.length > 0) {
          selectedMenuItems.forEach(item => {
            fileFormData.append('items', item);
          });
        }

        // Thêm file hình ảnh nếu có
        if (imageFile) {
          fileFormData.append('file', imageFile);
        }
        // Create menu with file upload in one request
        await api.post('menu_order/Create', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        showNotification("Menu đã được tạo thành công!");
      }

      handleDialogClose();
      fetchMenus();
    } catch (error) {
      console.error("Error saving menu", error);
      showNotification("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (menu: MenuOrder) => {
    setEditingMenu(menu);
    setSelectedMenuItems(menu.items || []);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa menu này?")) {
      setIsLoading(true);
      try {
        await api.delete(`menu_order/Delete?id=${id}`);
        showNotification("Menu đã được xóa thành công!");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu", error);
        showNotification("Có lỗi xảy ra khi xóa menu!", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        "image/png", "image/jpeg", "image/gif", "image/bmp", "image/webp",
        "image/svg+xml", "image/tiff", "image/x-icon", "image/heif", "image/avif", "image/heic"
      ];

      if (!allowedTypes.includes(file.type)) {
        setOpenDialogMessage(true);
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManageMenuItems = (menu: MenuOrder) => {
    const idList = [];
    if (menu.DRINK) {
      for (let i = 0; i < menu.DRINK.length; i++) {
        const e = menu.DRINK[i];
        idList.push(e._id)
      }
    }
    if (menu.FOOD) {
      for (let i = 0; i < menu.FOOD.length; i++) {
        const e = menu.FOOD[i];
        idList.push(e._id)
      }
    }
    setMenuForItems(menu);
    setSelectedMenuItems(idList || []);
    setOpenMenuItemsDialog(true);
  };

  const handleToggleMenuItem = (menuItemId: string) => {
    setSelectedMenuItems(prev => {
      if (prev.includes(menuItemId)) {
        return prev.filter(id => id !== menuItemId);
      } else {
        return [...prev, menuItemId];
      }
    });
  };

  const handleSaveMenuItems = async () => {
    if (!menuForItems) return;
    setIsLoading(true);

    try {
      await api.put(`menu_order/Update?id=${menuForItems._id}`, {
        items: selectedMenuItems
      });
      showNotification("Danh sách món ăn đã được cập nhật!");
      handleItemsDialogClose();
      fetchMenus();
    } catch (error) {
      console.error("Error updating menu items", error);
      showNotification("Có lỗi xảy ra khi cập nhật danh sách món ăn!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMenus();
  };

  const handleResetFilters = () => {
    setPage(1);
    setFilterQuery("");
    setFilterType("");
    setFilterStatus("");
    setOrderBy("createdAt:desc");
    fetchMenus();
  };

  // Add showNotification helper function after the useEffect hooks
  // Show notification with auto-hide
  const showNotification = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  return (
    <div className="container mx-auto mt-2 sm:mt-3 md:mt-4 px-2 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý Menu | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý Menu tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4 mb-2 sm:mb-3 md:mb-0">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Header */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <DashboardHeader 
              title="Quản lý Menu"
              searchEnabled={true}
              searchQuery={filterQuery}
              onSearchChange={(e) => setFilterQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(1);
                fetchMenus();
              }}
              onSearchClear={() => {
                setFilterQuery("");
                setPage(1);
                fetchMenus();
              }}
              filterEnabled={true}
              filterIcon={faFilter}
              onFilterClick={() => setIsFilterExpanded(!isFilterExpanded)}
              addEnabled={true}
              onAddClick={() => setOpenDialog(true)}
              className="mb-0 rounded-b-none"
            />
          </div>

          {/* Filters - Enhanced for better mobile experience */}
          <div 
            className={cn(
              "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300",
              isFilterExpanded ? "mb-3 sm:mb-4 md:mb-5" : "mb-2 sm:mb-3",
              isFilterExpanded ? "max-h-[600px]" : "max-h-[52px] sm:max-h-[56px]"
            )}
          >
            <div 
              className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gold-500 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-800">Bộ lọc dữ liệu</h2>
              </div>
              <FontAwesomeIcon 
                icon={isFilterExpanded ? faTimes : faSort} 
                className={cn(
                  "text-gray-500 transition-all duration-200 h-3.5 w-3.5 sm:h-4 sm:w-4",
                  isFilterExpanded ? "transform rotate-0" : "transform rotate-0"
                )}
              />
            </div>

            {isFilterExpanded && (
              <div className="p-2 sm:p-3 md:p-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  fetchMenus();
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Loại</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm min-h-[42px] sm:min-h-[38px] touch-manipulation"
                      >
                        <option value="">Tất cả</option>
                        <option value={MenuOrderTypeEnum.COMBO}>Combo</option>
                        <option value={MenuOrderTypeEnum.UPSALE}>Upsale</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm min-h-[42px] sm:min-h-[38px] touch-manipulation"
                      >
                        <option value="">Tất cả</option>
                        <option value={Status.ACTIVE}>Kích hoạt</option>
                        <option value={Status.INACTIVE}>Không kích hoạt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                      <select
                        value={orderBy}
                        onChange={(e) => setOrderBy(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm min-h-[42px] sm:min-h-[38px] touch-manipulation"
                      >
                        <option value="createdAt:desc">Mới nhất</option>
                        <option value="createdAt:asc">Cũ nhất</option>
                        <option value="name:asc">Tên A-Z</option>
                        <option value="name:desc">Tên Z-A</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="border-gray-300 text-gray-700 min-h-[42px] sm:min-h-[40px] px-3 sm:px-4 text-sm"
                    >
                      Đặt lại
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-white min-h-[42px] sm:min-h-[40px] px-3 sm:px-4 text-sm"
                    >
                      Tìm kiếm
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* View Mode Switcher area - improved for small screens */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-2 sm:mb-3 md:mb-4 gap-2 xs:gap-0">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 xs:mb-0">
              {menus.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{menus.length}</span> trên tổng số <span className="font-medium">{total}</span> mục</p>
              ) : null}
            </div>
            
            {/* View mode switcher - now visible on all screens */}
            <div className="flex items-center">
              <ViewSwitcher 
                value={viewMode}
                onChange={(mode) => {
                  // Only allow changing to table view on non-mobile devices
                  if (mode === "table" && isMobileView) {
                    return;
                  }
                  setViewMode(mode);
                }}
                className={cn(
                  "self-end xs:self-auto", 
                  isMobileView && "opacity-70"
                )}
                disabled={isMobileView}
              />
              {isMobileView && viewMode === "card" && (
                <span className="text-xs text-gray-500 ml-2">
                  <FontAwesomeIcon icon={faImage} className="mr-1 h-3 w-3" />
                  Chế độ thẻ
                </span>
              )}
            </div>
          </div>

          {/* Mobile swipe instruction - more prominent and easier to notice */}
          {viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 bg-red-50 p-2 rounded-md border border-red-100 animate-pulse opacity-90 mb-3">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 animate-pulse" />
              <span className="ml-1.5">Kéo sang phải để xem thêm</span>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && menus.length === 0 ? (
            <EmptyState 
              title="Không tìm thấy menu nào"
              subtitle="Không có menu nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={filterQuery}
              icon={faImage}
              onActionClick={handleResetFilters}
              actionButtonText="Đặt lại bộ lọc"
            />
          ) : null}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : menus.length === 0 ? (
            null // EmptyState is handled above
          ) : viewMode === "table" ? (
            // Table View - Enhanced for better responsiveness
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full border-collapse table-fixed md:table-auto">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-center w-10 sm:w-12 md:w-14">STT</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-center w-14 sm:w-16 md:w-20 lg:w-24">Hình ảnh</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-left min-w-[110px] sm:min-w-[140px] md:min-w-[180px] lg:min-w-[200px]">Tên</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-left min-w-[120px] sm:min-w-[160px] md:min-w-[200px] hidden sm:table-cell">Mô tả</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-center w-[70px] sm:w-[80px] md:w-[100px]">Loại</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-center whitespace-nowrap hidden xs:table-cell">Trạng thái</th>
                      <th className="py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-xs font-semibold text-gray-700 uppercase text-center w-[75px] sm:w-[80px] md:w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menus.map((menu, index) => (
                      <tr key={menu._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 text-center text-xs sm:text-sm">{index + 1}</td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 text-center align-middle">
                          <div className="flex justify-center items-center h-full">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                              {menu.image ? (
                                <Image
                                  src={getMediaUrl(menu.image)}
                                  alt={menu.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
                                  priority={index < 8} // Priority loading for first page items
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <FontAwesomeIcon icon={faImage} className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4">
                          <div className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[110px] sm:max-w-[140px] md:max-w-full">{menu.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[110px] sm:max-w-[140px] md:max-w-full sm:hidden">{menu.description}</div>
                        </td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 hidden sm:table-cell">
                          <div className="text-xs text-gray-500 truncate max-w-[160px] md:max-w-[200px] lg:max-w-xs">{menu.description}</div>
                        </td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 whitespace-nowrap text-center">
                          {menu.type === MenuOrderTypeEnum.COMBO ? (
                            <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Combo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Up
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 whitespace-nowrap text-center hidden xs:table-cell">
                          {menu.status === Status.ACTIVE ? (
                            <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Không kích hoạt
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4">
                          <div className="flex justify-center">
                            <ActionButtonsGroup
                              onView={() => handleManageMenuItems(menu)}
                              onEdit={() => handleEdit(menu)}
                              onDelete={() => {
                                setSelectedMenu(menu);
                                setDeleteDialogOpen(true);
                              }}
                              viewTooltip="Quản lý món"
                              editTooltip="Chỉnh sửa"
                              deleteTooltip="Xóa"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Card View - Enhanced for better touch interaction and small screens
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 lg:gap-5">
              {menus.map((menu, index) => (
                <div 
                  key={menu._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative w-full aspect-[3/2] xs:aspect-[4/3] bg-gray-50 overflow-hidden group">
                    {menu.image ? (
                      <Image
                        src={getMediaUrl(menu.image)}
                        alt={menu.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 6} // Priority loading for first page items
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FontAwesomeIcon icon={faImage} className="text-gray-300 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                      </div>
                    )}
                    <div className="absolute top-0 right-0 p-2 flex space-x-1">
                      <span 
                        className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                          menu.type === MenuOrderTypeEnum.COMBO 
                            ? "bg-green-100 text-green-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {menu.type === MenuOrderTypeEnum.COMBO ? "Combo" : "Upsale"}
                      </span>
                      <span 
                        className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                          menu.status === Status.ACTIVE 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {menu.status === Status.ACTIVE ? "Kích hoạt" : "Không"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 xs:p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 mb-1">{menu.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{menu.description}</p>
                    
                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        onClick={() => handleManageMenuItems(menu)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px] text-xs sm:text-sm px-1 sm:px-2"
                        aria-label="Quản lý món"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faBarsProgress} className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="whitespace-nowrap">Quản lý món</span>
                      </Button>
                      <Button
                        onClick={() => handleEdit(menu)}
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px] text-xs sm:text-sm px-1 sm:px-2"
                        aria-label="Chỉnh sửa"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="whitespace-nowrap">Chỉnh sửa</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls - optimized for small screens */}
          {menus.length > 0 && (
            <div className="flex flex-col xs:flex-row justify-between xs:items-center mt-4 sm:mt-5 md:mt-6">
              <div className="mb-3 xs:mb-0 flex items-center">
                <span className="text-xs sm:text-sm text-gray-500 mr-1 sm:mr-2">Hiển thị:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // Reset to first page when changing limit
                  }}
                  className="border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-200 focus:border-gold-400 touch-manipulation min-h-[34px]"
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">mục</span>
              </div>
              
              <PaginationControls 
                page={page - 1} // Convert to 0-based for the component
                limit={limit}
                total={total}
                onPageChange={(newPage) => {
                  setPage(newPage + 1); // Convert back to 1-based
                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top when changing page
                }}
                pagesToShow={isMobileView ? 1 : 2} // Show fewer page numbers on mobile
                className="rounded-lg shadow-sm text-xs sm:text-sm" // Enhanced styling for better touch
              />
            </div>
          )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <CreateEditMenuDialog
          editingMenu={editingMenu}
          allMenuItems={allMenuItems}
          selectedMenuItems={selectedMenuItems}
          handleToggleMenuItem={handleToggleMenuItem}
          setSelectedMenuItems={setSelectedMenuItems}
          handleSubmit={handleSubmit}
          handleDialogClose={handleDialogClose}
          isLoading={isLoading}
          imageFile={imageFile}
          imagePreview={imagePreview}
          handleFileChange={handleFileChange}
          setOpenDialogMessage={setOpenDialogMessage}
          openDialogMessage={openDialogMessage}
        />
      )}

      {/* Menu Items Dialog */}
      {openMenuItemsDialog && (
        <MenuItemsDialog
          menuForItems={menuForItems}
          allMenuItems={allMenuItems}
          selectedMenuItems={selectedMenuItems}
          handleToggleMenuItem={handleToggleMenuItem}
          setSelectedMenuItems={setSelectedMenuItems}
          handleSaveMenuItems={handleSaveMenuItems}
          handleItemsDialogClose={handleItemsDialogClose}
          isLoading={isLoading}
        />
      )}

      {/* Menu Details Dialog */}
      {menuForItems && !openMenuItemsDialog && (
        <MenuDetailsDialog
          menuForItems={menuForItems}
          setOpenMenuItemsDialog={setOpenMenuItemsDialog}
          handleItemsDialogClose={handleItemsDialogClose}
        />
      )}

          {/* Delete Confirmation Dialog - Mobile-friendly */}
          <ConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={() => {
              if (selectedMenu) {
                handleDelete(selectedMenu._id);
                setDeleteDialogOpen(false);
                setSelectedMenu(null);
              }
            }}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa menu "${selectedMenu?.name || ''}"? Hành động này không thể hoàn tác.`}
            confirmButtonText="Xóa"
            cancelButtonText="Hủy"
            confirmButtonColor="error"
          />

      {/* Notification Snackbar - Made responsive */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
        autoHideDuration={4000}
        verticalPosition={isMobileView ? "bottom" : "top"}
        horizontalPosition="center"
      />
        </div>
      </div>
    </div>
  );
};

export default MenuPage;

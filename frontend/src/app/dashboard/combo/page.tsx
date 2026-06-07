"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { formatMoney } from "@/utils/money";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import ComboEventTable from "./component/ComboEventTable";
import ComboEventDialog from "./component/ComboEventDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import {
  faArrowRight,
  faEdit,
  faEye,
  faTrash,
  faFilter,
  faSearch,
  faPlus,
  faTimes,
  faSort,
  faSortUp,
  faSortDown,
  faUsers,
  faPizzaSlice,
  faMugHot
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

export interface MenuItemType {
  _id: string;
  name: string;
  price: number;
  type: string;
}

export interface MenuOrderType {
  _id: string;
  items: MenuItemType[];
  [key: string]: any;
}

export interface ComboEventType {
  _id: string;
  name: string;
  size_seat: number;
  size_food: number;
  size_drink: number;
  price: number;
  price_origin: number;
  menu_id: string;
  status: string;
  is_show_upsell?: boolean;
  MenuOrder?: MenuOrderType;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComboEventResponse {
  combo: ComboEventType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface MenuType {
  _id: string;
  name: string;
}

const ComboEventPage: React.FC = () => {
  // State for data
  const [combos, setCombos] = useState<ComboEventType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [menus, setMenus] = useState<MenuType[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCombo, setEditingCombo] = useState<ComboEventType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning"
  });

  // Live preview state
  const [previewName, setPreviewName] = useState<string>("");
  const [previewSizeSeat, setPreviewSizeSeat] = useState<number>(1);
  const [previewSizeFood, setPreviewSizeFood] = useState<number>(0);
  const [previewSizeDrink, setPreviewSizeDrink] = useState<number>(0);
  const [previewPrice, setPreviewPrice] = useState<number>(0);
  const [previewPriceOrigin, setPreviewPriceOrigin] = useState<number>(0);

  // Formatted price state
  const [formattedPrice, setFormattedPrice] = useState<string>('0');
  const [formattedPriceOrigin, setFormattedPriceOrigin] = useState<string>('0');

  // Filter state
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("createdAt:desc");

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboEventType | null>(null);

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
    const savedViewMode = localStorage.getItem("viewMode") as ViewMode | null;
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
    const savedFilterState = localStorage.getItem("comboFilterExpanded");
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

  // Save filter panel state when changed
  useEffect(() => {
    localStorage.setItem("comboFilterExpanded", String(isFilterExpanded));
  }, [isFilterExpanded]);

  // Fetch combo events with filtering
  const fetchComboEvents = async () => {
    setLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}`;

      if (filterQuery) queryParams += `&query=${filterQuery}`;
      if (filterStatus) queryParams += `&status=${filterStatus}`;
      if (orderBy) queryParams += `&orderBy=${orderBy}`;

      const res = await api.get(`combo_event/GetByCondition?${queryParams}`);
      const data: ComboEventResponse = res.data;
      setCombos(data.combo);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching combo events", error);
      showNotification("Có lỗi xảy ra khi tải dữ liệu combo!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch menus for dropdown
  const fetchMenus = async () => {
    try {
      const res = await api.get("menu_order/GetMyMenuOrderByCondition?page=1&limit=999999&status=ACTIVE");
      setMenus(res.data.menuOrder || []);
    } catch (error) {
      console.error("Error fetching menus", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchComboEvents();
    fetchMenus();
  }, [page, limit, filterStatus, orderBy]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingCombo(null);

    // Reset preview state
    setPreviewName("");
    setPreviewSizeSeat(1);
    setPreviewSizeFood(0);
    setPreviewSizeDrink(0);
    setPreviewPrice(0);
    setPreviewPriceOrigin(0);
    setFormattedPrice('0');
    setFormattedPriceOrigin('0');
  };

  // Initialize preview state when editing a combo
  useEffect(() => {
    if (editingCombo) {
      setPreviewName(editingCombo.name);
      setPreviewSizeSeat(editingCombo.size_seat);
      setPreviewSizeFood(editingCombo.size_food);
      setPreviewSizeDrink(editingCombo.size_drink);
      setPreviewPrice(editingCombo.price);
      setPreviewPriceOrigin(editingCombo.price_origin);
      setFormattedPrice(editingCombo.price.toLocaleString('vi-VN'));
      setFormattedPriceOrigin(editingCombo.price_origin.toLocaleString('vi-VN'));
    } else if (openDialog) {
      // Default values for new combo
      setPreviewName("Tên combo mới");
      setPreviewSizeSeat(1);
      setPreviewSizeFood(0);
      setPreviewSizeDrink(0);
      setPreviewPrice(0);
      setPreviewPriceOrigin(0);
      setFormattedPrice('0');
      setFormattedPriceOrigin('0');
    }
  }, [editingCombo, openDialog]);

  // Show notification
  const showNotification = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle form submission for creating/updating a combo event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Convert formatted prices back to numbers
    const priceValue = formattedPrice.replace(/\./g, '').replace(/,/g, '');
    const priceOriginValue = formattedPriceOrigin.replace(/\./g, '').replace(/,/g, '');

    const comboData = {
      name: formData.get("name") as string,
      size_seat: Number(formData.get("size_seat")),
      size_food: Number(formData.get("size_food")),
      size_drink: Number(formData.get("size_drink")),
      price: Number(priceValue),
      price_origin: Number(priceOriginValue),
      menu_id: formData.get("menu_id") as string,
      status: formData.get("status") as string,
      is_show_upsell: formData.get("is_show_upsell") === "true",
    };

    try {
      if (editingCombo) {
        await api.put(`combo_event/Update?id=${editingCombo._id}`, comboData);
        showNotification("Combo đã được cập nhật thành công!");
      } else {
        await api.post("combo_event/Create", comboData);
        showNotification("Combo đã được tạo thành công!");
      }
      handleDialogClose();
      fetchComboEvents();
    } catch (error) {
      console.error("Error saving combo event", error);
      showNotification("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (combo: ComboEventType) => {
    setEditingCombo(combo);
    setOpenDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (combo: ComboEventType) => {
    setSelectedCombo(combo);
    setDeleteDialogOpen(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    if (!selectedCombo) return;

    setLoading(true);
    try {
      await api.delete(`combo_event/Delete?id=${selectedCombo._id}`);
      showNotification("Combo đã được xóa thành công!");
      fetchComboEvents();
    } catch (error) {
      console.error("Error deleting combo event", error);
      showNotification("Có lỗi xảy ra khi xóa combo!", "error");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // Apply search filter
  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when applying new search
    setPage(1);
    fetchComboEvents();
  };

  // Reset filters
  const handleResetFilters = () => {
    setPage(1);
    setFilterQuery("");
    setFilterStatus("");
    setOrderBy("createdAt:desc");
    fetchComboEvents();
  };

  return (
    <div className="container mx-auto mt-4 px-3 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý Combo | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý combo tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4 mb-4 md:mb-0">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Header */}
          <div className="mb-6">
            <DashboardHeader
              title="Quản lý Combo"
              searchEnabled={true}
              searchQuery={filterQuery}
              onSearchChange={(e) => setFilterQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(1);
                fetchComboEvents();
              }}
              onSearchClear={() => {
                setFilterQuery("");
                setPage(1);
                fetchComboEvents();
              }}
              filterEnabled={true}
              filterIcon={faFilter}
              onFilterClick={toggleFilterPanel}
              addEnabled={true}
              addButtonLabel="Thêm Combo"
              onAddClick={() => setOpenDialog(true)}
              className="mb-0 rounded-b-none"
            />
          </div>

          {/* Filters */}
          <div
            className={cn(
              "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 mb-5",
              isFilterExpanded ? "mb-5 sm:mb-6" : "mb-2 sm:mb-3"
            )}
          >
            <div
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={toggleFilterPanel}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gold-500 mr-2 h-4 w-4" />
                <h2 className="text-base sm:text-lg font-medium text-gray-800">Bộ lọc dữ liệu</h2>
              </div>
              <FontAwesomeIcon
                icon={isFilterExpanded ? faTimes : faSort}
                className={cn(
                  "text-gray-500 transition-all duration-200 h-4 w-4",
                  isFilterExpanded ? "transform rotate-0" : "transform rotate-0"
                )}
              />
            </div>

            {isFilterExpanded && (
              <div className="p-3 sm:p-4">
                <form onSubmit={handleApplySearch}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      >
                        <option value="">Tất cả</option>
                        <option value="ACTIVE">Kích hoạt</option>
                        <option value="INACTIVE">Không kích hoạt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                      <select
                        value={orderBy}
                        onChange={(e) => setOrderBy(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      >
                        <option value="createdAt:desc">Mới nhất</option>
                        <option value="createdAt:asc">Cũ nhất</option>
                        <option value="name:asc">Tên A-Z</option>
                        <option value="name:desc">Tên Z-A</option>
                        <option value="price:asc">Giá tăng dần</option>
                        <option value="price:desc">Giá giảm dần</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="border-gray-300 text-gray-700 min-h-[40px] px-3 sm:px-4"
                    >
                      Đặt lại
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-white min-h-[40px] px-3 sm:px-4"
                    >
                      Tìm kiếm
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* View Mode Switcher area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">
              {combos.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{combos.length}</span> trên tổng số <span className="font-medium">{total}</span> combo</p>
              ) : null}
            </div>
            <ViewSwitcher
              value={viewMode}
              onChange={(mode) => {
                // Only allow changing to table view on non-mobile devices
                if (mode === "table" && isMobileView) {
                  // Do nothing if trying to switch to table on mobile
                  return;
                }
                setViewMode(mode);
              }}
              className="self-end sm:self-auto hidden md:inline-flex"
              disabled={isMobileView} // Disable the switcher completely on mobile
            />
          </div>

          {/* Mobile swipe instruction - more prominent and easier to notice */}
          {viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 bg-red-50 p-2 rounded-md border border-red-100 animate-pulse opacity-90 mb-3">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 animate-pulse" />
              <span className="ml-1.5">Kéo sang phải để xem thêm</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && combos.length === 0 ? (
            <EmptyState
              title="Không tìm thấy combo nào"
              subtitle="Không có combo nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={filterQuery}
              icon={faPlus}
              onActionClick={handleResetFilters}
              actionButtonText="Đặt lại bộ lọc"
            />
          ) : null}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : combos.length === 0 ? (
            null // EmptyState is handled above
          ) : viewMode === "table" ? (
            // Table View
            <ComboEventTable
              loading={loading}
              combos={combos}
              total={total}
              page={page}
              limit={limit}
              setPage={setPage}
              handleEdit={handleEdit}
              handleDelete={handleDeleteConfirmation}
            />
          ) : (
            // Card View - Will be implemented later
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {combos.map((combo) => (
                <div
                  key={combo._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
                >
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-base line-clamp-2">{combo.name}</h3>
                      <div className="font-medium text-gold-600 text-sm whitespace-nowrap ml-2">
                        {formatMoney(combo.price)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-500">Số ghế:</span>
                        <div className="font-medium">{combo.size_seat}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-500">Món ăn:</span>
                        <div className="font-medium">{combo.size_food}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-500">Đồ uống:</span>
                        <div className="font-medium">{combo.size_drink}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-500">Giá gốc:</span>
                        <div className="font-medium">{formatMoney(combo.price_origin)}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs truncate max-w-[150px]">
                        {combo.MenuOrder?.name || "N/A"}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${combo.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {combo.status === 'ACTIVE' ? 'Kích hoạt' : 'Không kích hoạt'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        onClick={() => handleEdit(combo)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px]"
                        aria-label="Chỉnh sửa"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Sửa</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteConfirmation(combo)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px]"
                        aria-label="Xóa"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Xóa</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {combos.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between md:items-center mt-6">
              <div className="mb-4 md:mb-0 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Hiển thị:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // Reset to first page when changing limit
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200 focus:border-gold-400"
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 ml-2">combo</span>
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
                className="rounded-lg shadow-sm" // Match customer page styling
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {openDialog && (
        <StandardDialog
          open={openDialog}
          onClose={handleDialogClose}
          disableBackdropClick={true}
          title={editingCombo ? "Cập nhật Combo" : "Thêm Combo mới"}
          maxWidth="xl" // Increased from md to xl for larger screens
          className="w-full max-w-screen-xl mx-auto" // Custom width for larger screens
          actions={
            <>
              <DialogActionButton
                onClick={handleDialogClose}
                variant="outline"
                className="min-h-[44px] px-5 text-base"
              >
                Hủy
              </DialogActionButton>
              <DialogActionButton
                onClick={() => document.getElementById('combo-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                variant="primary"
                className="min-h-[44px] px-6 text-base"
                disabled={loading}
              >
                {editingCombo ? "Cập nhật" : "Thêm mới"}
              </DialogActionButton>
            </>
          }
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-200 to-gold-100 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-gold-300 to-gold-100 rounded-full opacity-10 -z-10"></div>

            {/* Header with icon */}
            <div className="mb-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={editingCombo ? faEdit : faPlus} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{editingCombo ? "Chỉnh sửa thông tin combo" : "Tạo combo mới"}</h3>
                <p className="text-sm text-gray-500">{editingCombo ? "Cập nhật thông tin cho combo hiện có" : "Điền thông tin để tạo combo mới"}</p>
              </div>
            </div>

            <form id="combo-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Two-column layout for larger screens */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Main info section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                      Thông tin cơ bản
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Combo</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingCombo?.name || ""}
                          placeholder="Nhập tên combo"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          required
                          minLength={3}
                          maxLength={50}
                          onChange={(e) => setPreviewName(e.target.value || "Tên combo mới")}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Menu</label>
                          <select
                            name="menu_id"
                            defaultValue={editingCombo?.menu_id || ""}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                          >
                            <option value="">Chọn menu</option>
                            {menus.map((menu) => (
                              <option key={menu._id} value={menu._id}>
                                {menu.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                          <select
                            name="status"
                            defaultValue={editingCombo?.status || 'ACTIVE'}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                          >
                            <option value={'ACTIVE'}>Kích hoạt</option>
                            <option value={'INACTIVE'}>Không kích hoạt</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                      Thông tin giá
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="price"
                            value={formattedPrice}
                            placeholder="Nhập giá bán"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                            onChange={(e) => {
                              // Only allow numbers and format with commas
                              const value = e.target.value.replace(/\D/g, '');
                              if (value === '') {
                                setFormattedPrice('0');
                                setPreviewPrice(0);
                              } else {
                                const numValue = Number(value);
                                setFormattedPrice(numValue.toLocaleString('vi-VN'));
                                setPreviewPrice(numValue);
                              }
                            }}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gold-500 font-medium">₫</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="price_origin"
                            value={formattedPriceOrigin}
                            placeholder="Nhập giá gốc"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            onChange={(e) => {
                              // Only allow numbers and format with commas
                              const value = e.target.value.replace(/\D/g, '');
                              if (value === '') {
                                setFormattedPriceOrigin('0');
                                setPreviewPriceOrigin(0);
                              } else {
                                const numValue = Number(value);
                                setFormattedPriceOrigin(numValue.toLocaleString('vi-VN'));
                                setPreviewPriceOrigin(numValue);
                              }
                            }}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium">₫</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Quantity section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                      Thông tin số lượng
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng ghế</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="size_seat"
                            defaultValue={editingCombo?.size_seat || 1}
                            min="1"
                            placeholder="Số ghế"
                            className="w-full p-3 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                            onChange={(e) => setPreviewSizeSeat(Number(e.target.value) || 1)}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng món ăn</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="size_food"
                            defaultValue={editingCombo?.size_food || 0}
                            min="0"
                            placeholder="Số món ăn"
                            className="w-full p-3 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                            onChange={(e) => setPreviewSizeFood(Number(e.target.value) || 0)}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faPizzaSlice} className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng đồ uống</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="size_drink"
                            defaultValue={editingCombo?.size_drink || 0}
                            min="0"
                            placeholder="Số đồ uống"
                            className="w-full p-3 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            required
                            onChange={(e) => setPreviewSizeDrink(Number(e.target.value) || 0)}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faMugHot} className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">4</span>
                      Tùy chọn bổ sung
                    </h4>

                    <div>
                      <label className="flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200 cursor-pointer hover:bg-gold-50 transition-colors">
                        <input
                          type="checkbox"
                          name="is_show_upsell"
                          defaultChecked={editingCombo?.is_show_upsell !== false}
                          className="h-5 w-5 text-gold-500 rounded border-gray-300 focus:ring-gold-400"
                          value="true"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700 block">Hiển thị Upsell</span>
                          <span className="text-xs text-gray-500">Hiển thị combo này trong phần gợi ý nâng cấp</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Summary section */}
                  {editingCombo && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-700 mb-2">Thông tin bổ sung</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Ngày tạo:</span>
                          <span className="ml-2 text-gray-700">{editingCombo.createdAt ? new Date(editingCombo.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cập nhật lần cuối:</span>
                          <span className="ml-2 text-gray-700">{editingCombo.updatedAt ? new Date(editingCombo.updatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview section - visible only on larger screens */}
              <div className="hidden xl:block bg-gradient-to-r from-gold-50 to-white p-5 rounded-lg border border-gold-100 mt-6">
                <h4 className="font-medium text-gold-700 mb-3 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">5</span>
                  Xem trước Combo
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-gold-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <FontAwesomeIcon icon={faUsers} className="text-gold-500 h-8 w-8" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">{previewName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FontAwesomeIcon icon={faUsers} className="mr-1 h-3 w-3" /> {previewSizeSeat} ghế
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FontAwesomeIcon icon={faPizzaSlice} className="mr-1 h-3 w-3" /> {previewSizeFood} món ăn
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FontAwesomeIcon icon={faMugHot} className="mr-1 h-3 w-3" /> {previewSizeDrink} đồ uống
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline">
                        <span className="text-2xl font-bold text-gold-600">{formatMoney(previewPrice)}</span>
                        {previewPriceOrigin > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">{formatMoney(previewPriceOrigin)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </StandardDialog>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa combo ${selectedCombo?.name || ''}? Hành động này không thể hoàn tác.`}
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />

      {/* Notification */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({...notification, open: false})}
        autoHideDuration={4000}
        verticalPosition={isMobileView ? "bottom" : "top"}
        horizontalPosition="center"
      />
    </div>
  );
};

export default ComboEventPage;
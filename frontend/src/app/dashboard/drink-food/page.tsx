"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import Image from "next/image";
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
  faFileExcel,
  faFileImport,
  faSort,
  faSortUp,
  faSortDown
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
import { cn } from "@/lib/utils";

enum TypeItem {
  FOOD = 'FOOD',
  DRINK = 'DRINK'
}

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETE = 'DELETE'
}

interface Flavor {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  code: string;
  category_id_cukcuk?: string;
  category_name_cukcuk?: string;
}

interface MenuItemType {
  _id: string;
  name: string;
  desc: string;
  ingredient?: string;
  flavor?: Flavor[];
  category_id: CategoryItem;
  type: TypeItem;
  unit: string;
  image?: string;
  status: Status;
  price: number;
  item_id_cukcuk?: string;
  item_name_cukcuk?: string;
  unit_id_cukcuk?: string;
  unit_name_cukcuk?: string;
}

interface MenuItemResponse {
  menuItem: MenuItemType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface FlavorFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const MenuItemPage: React.FC = () => {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDialogMessage, setOpenDialogMessage] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for filters
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTimeFrom, setFilterTimeFrom] = useState<string>("");
  const [filterTimeTo, setFilterTimeTo] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("createdAt:desc");

  // State for flavor management
  const [flavors, setFlavors] = useState<FlavorFormData[]>([]);
  const [showFlavorForm, setShowFlavorForm] = useState<boolean>(false);

  // State for image update
  const [openUpdateImageDialog, setOpenUpdateImageDialog] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<MenuItemType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Dialog states
  const [viewDetailsOpen, setViewDetailsOpen] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState<boolean>(false);

  // Item states
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
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
    const savedFilterState = localStorage.getItem("drinkFoodFilterExpanded");
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
    localStorage.setItem("drinkFoodFilterExpanded", String(isFilterExpanded));
  }, [isFilterExpanded]);

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      // Prepare query parameters for filtering
      let queryParams = new URLSearchParams();

      // Set a large limit to export all items
      // First get the total count of items
      queryParams.append("page", "1");
      queryParams.append("limit", total.toString());

      // Apply current filters if any
      if (filterQuery) queryParams.append("query", filterQuery);
      if (filterType) queryParams.append("type", filterType);
      if (filterCategory) queryParams.append("category_id", filterCategory);
      if (filterStatus) queryParams.append("status", filterStatus);

      const response = await api.post(
        `tool-excel/downloadFileMenuItem?${queryParams.toString()}`,
        {},
        { responseType: "blob" }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `menu-items-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbarMsg("Xuất file Excel thành công!");
      showNotification(`Đã xuất ${total} món ăn/đồ uống ra file Excel`);
    } catch (error) {
      console.error("Error exporting Excel file", error);
      setSnackbarMsg("Xuất file Excel thất bại!");
      showNotification("Xuất file Excel thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setSnackbarMsg("Vui lòng chọn file Excel (.xlsx, .xls)!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("tool-excel/uploadFileMenuItem", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSnackbarMsg(`Nhập dữ liệu thành công! Đã thêm/cập nhật ${response.data.create + response.data.update} món.`);
      fetchMenuItems();
    } catch (error) {
      console.error("Error importing Excel file", error);
      setSnackbarMsg("Nhập file Excel thất bại!");
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Fetch menu items with filtering
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}`;

      if (filterQuery) queryParams += `&query=${filterQuery}`;
      if (filterType) queryParams += `&type=${filterType}`;
      if (filterCategory) queryParams += `&category_id=${filterCategory}`;
      if (filterStatus) queryParams += `&status=${filterStatus}`;
      if (filterTimeFrom) queryParams += `&time_from=${filterTimeFrom}`;
      if (filterTimeTo) queryParams += `&time_to=${filterTimeTo}`;
      if (orderBy) queryParams += `&orderBy=${orderBy}`;

      const res = await api.get(`menu_item/GetMyMenuItem?${queryParams}`);
      const data: MenuItemResponse = res.data;
      setMenuItems(data.menuItem);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching menu items", error);
      setSnackbarMsg("Không thể tải danh sách món ăn/đồ uống");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("category_item/GetMany?page=1&limit=99999");
      setCategories(res.data.category);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [page, limit, filterType, filterCategory, filterStatus, orderBy]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFlavors([]);
    setShowFlavorForm(false);
  };

  // Add default flavors when adding a new item
  const handleAddNewItem = () => {
    // Initialize with default flavor types
    setFlavors([
      { name: "Độ cồn", description: "", icon: "🍸", color: "#FF9800" },
      { name: "Độ ngọt", description: "", icon: "🍬", color: "#E91E63" },
      { name: "Độ chua", description: "", icon: "🍋", color: "#FFEB3B" },
      { name: "Độ dễ uống", description: "", icon: "👌", color: "#4CAF50" }
    ]);
    setOpenDialog(true);
    setShowFlavorForm(true);
  };

  // Edit item with its flavors
  const handleEdit = async (item: MenuItemType) => {
    try {
      // Fetch full item details with populated data
      const res = await api.get(`menu_item/GetById/${item._id}`);
      setEditingItem(res.data);

      // Initialize flavors from the item or with defaults if none exist
      if (res.data.flavor && res.data.flavor.length > 0) {
        setFlavors(res.data.flavor);
      } else {
        setFlavors([
          { name: "Độ cồn", description: "", icon: "🍸", color: "#FF9800" },
          { name: "Độ ngọt", description: "", icon: "🍬", color: "#E91E63" },
          { name: "Độ chua", description: "", icon: "🍋", color: "#FFEB3B" },
          { name: "Độ dễ uống", description: "", icon: "👌", color: "#4CAF50" }
        ]);
      }

      setShowFlavorForm(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error fetching item details", error);
      setSnackbarMsg("Không thể tải thông tin chi tiết");
    }
  };

  // Handle flavor form changes
  const handleFlavorChange = (index: number, field: keyof FlavorFormData, value: string) => {
    const updatedFlavors = [...flavors];
    updatedFlavors[index] = { ...updatedFlavors[index], [field]: value };
    setFlavors(updatedFlavors);
  };

  // Submit form for creating/updating a menu item
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const itemData = {
      name: formData.get('name') as string,
      desc: formData.get('desc') as string,
      category_id: formData.get('category_id') as string,
      type: formData.get('type') as TypeItem,
      unit: formData.get('unit') as string,
      status: formData.get('status') as Status,
      price: Number(formData.get('price')),
      ingredient: formData.get('ingredient') as string || undefined,
      flavor: showFlavorForm ? flavors : undefined,
      item_id_cukcuk: (formData.get('item_id_cukcuk') as string) || undefined,
      item_name_cukcuk: (formData.get('item_name_cukcuk') as string) || undefined,
      unit_id_cukcuk: (formData.get('unit_id_cukcuk') as string) || undefined,
      unit_name_cukcuk: (formData.get('unit_name_cukcuk') as string) || undefined,
    };

    try {
      if (editingItem) {
        // Update existing menu item
        await api.post(`menu_item/Update?id=${editingItem._id}`, itemData);
        setSnackbarMsg("Cập nhật món thành công");
      } else {
        // Create new menu item
        await api.post("menu_item/Create", itemData);
        setSnackbarMsg("Thêm món thành công");
      }
      handleDialogClose();
      fetchMenuItems();
    } catch (error) {
      console.error("Error saving menu item", error);
      setSnackbarMsg("Thao tác thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Update notification handling
  const showNotification = (message: string) => {
    setNotificationMessage(message);
    // Auto-hide after 3 seconds
    setTimeout(() => setNotificationMessage(""), 3000);
  };

  // Update dialog handling
  const handleViewDetails = (item: MenuItemType) => {
    // First set the selected item
    setSelectedItem({...item}); // Make a copy to ensure clean state

    // Initialize flavors from the item or with defaults
    if (item.flavor && item.flavor.length > 0) {
      setFlavors([...item.flavor]); // Make a copy
    } else {
      setFlavors([
        { name: "Độ cồn", description: "", icon: "🍸", color: "#FF9800" },
        { name: "Độ ngọt", description: "", icon: "🍬", color: "#E91E63" },
        { name: "Độ chua", description: "", icon: "🍋", color: "#FFEB3B" },
        { name: "Độ dễ uống", description: "", icon: "👌", color: "#4CAF50" }
      ]);
    }

    // Set the flavor form to be visible
    setShowFlavorForm(true);

    // Open the dialog last, after all state is properly set
    setTimeout(() => {
      setViewDetailsOpen(true);
    }, 0);
  };

  const handleOpenUpdateImage = (item: MenuItemType) => {
    // First set the selected item
    setSelectedItem({...item}); // Make a copy to ensure clean state

    // Reset image state
    setImagePreview(null);
    setImageFile(null);

    // Open the dialog last, after all state is properly set
    setTimeout(() => {
      setImageDialogOpen(true);
    }, 0);
  };

  const handleDeleteConfirmation = (item: MenuItemType) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
      setIsLoading(true);
      try {
      await api.delete(`menu_item/Delete?id=${selectedItem._id}`);
      showNotification("Xóa món thành công");
        fetchMenuItems();
      } catch (error) {
      console.error("Error deleting menu item", error);
      showNotification("Xóa món thất bại");
      } finally {
        setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        "image/png", "image/jpeg", "image/gif", "image/bmp", "image/webp",
        "image/svg+xml", "image/tiff", "image/x-icon", "image/heif", "image/avif", "image/heic"
      ];

      if (!allowedTypes.includes(file.type)) {
        setMessageDialogOpen(true);
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

  const handleUpdateImage = async () => {
    if (!selectedItem || !imageFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      await api.post(`menu_item/UpdateImage?itemId=${selectedItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification("Cập nhật hình ảnh thành công!");

      // Close the dialog and clean up state
      setImageDialogOpen(false);
      setSelectedItem(null);
      setImageFile(null);
      setImagePreview(null);

      // Refresh the data
      fetchMenuItems();
    } catch (error) {
      console.error("Error updating image", error);
      showNotification("Cập nhật hình ảnh thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply search filter
  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when applying new search
    setPage(1);
    fetchMenuItems();
  };

  // Reset filters
  const handleResetFilters = () => {
    setPage(1);
    setFilterQuery("");
    setFilterType("");
    setFilterCategory("");
    setFilterStatus("");
    setFilterTimeFrom("");
    setFilterTimeTo("");
    setOrderBy("createdAt:desc");
    fetchMenuItems();
  };

  // Format flavor display
  const renderFlavor = (flavor?: Flavor[]) => {
    if (!flavor || flavor.length === 0) return "Không có";

    return (
      <div className="flex flex-wrap gap-1">
        {flavor.map((f, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded text-xs"
            style={{ backgroundColor: f.color + '33', color: f.color }}
            title={f.description}
          >
            {f.icon} {f.description}
          </span>
        ))}
      </div>
    );
  };

  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  return (
    <div className="container mx-auto mt-4 px-3 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý Món ăn/ Đồ uống | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý Món ăn/ Đồ uống tại Queen Acoustic." />
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
              title="Quản lý Món Ăn/ Uống"
              searchEnabled={true}
              searchQuery={filterQuery}
              onSearchChange={(e) => setFilterQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(1);
                fetchMenuItems();
              }}
              onSearchClear={() => {
                setFilterQuery("");
                setPage(1);
                fetchMenuItems();
              }}
              filterEnabled={true}
              filterIcon={faFilter}
              onFilterClick={toggleFilterPanel}
              addEnabled={false} // Disabled based on original UI
              extraButtons={
                <div className="flex gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="bg-white text-green-600 hover:bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center transition-colors duration-200 shadow-md"
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="h-4 w-4 mr-1" />
                    Xuất Excel
                  </button>
                  <label className="cursor-pointer">
                    <button
                      className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center transition-colors duration-200 shadow-md"
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faFileImport} className="h-4 w-4 mr-1" />
                      Nhập Excel
                    </button>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleImportExcel}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              }
            />
          </div>

          {/* Filters */}
          <div
            className={cn(
              "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300",
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  fetchMenuItems();
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value={TypeItem.FOOD}>Đồ ăn</option>
                    <option value={TypeItem.DRINK}>Đồ uống</option>
                  </select>
                </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                          setPage(1);
                          setFilterCategory(e.target.value);
                    }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
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
              {menuItems.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{menuItems.length}</span> trên tổng số <span className="font-medium">{total}</span> mục</p>
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
          {!isLoading && menuItems.length === 0 ? (
            <EmptyState
              title="Không tìm thấy món nào"
              subtitle="Không có món nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={filterQuery}
              icon={faImage}
              onActionClick={handleResetFilters}
              actionButtonText="Đặt lại bộ lọc"
            />
          ) : null}

          {/* Menu Items Display (Table or Card) */}
                  {isLoading ? (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                        </div>
            </div>
                  ) : menuItems.length === 0 ? (
            null // EmptyState is handled above
          ) : viewMode === "table" ? (
            // Table View
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full border-collapse table-fixed md:table-auto">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-12 sm:w-14">STT</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-16 sm:w-20 md:w-24">Hình ảnh</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left min-w-[140px] sm:min-w-[180px] md:min-w-[200px]">Tên</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Loại</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center min-w-[100px] sm:min-w-[120px] whitespace-nowrap">Danh mục</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-right min-w-[90px] sm:min-w-[100px]">Giá</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menuItems.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{index + 1}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center align-middle">
                            <div className="flex justify-center items-center h-full">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                              {item.image ? (
                                <Image
                                  src={getMediaUrl(item.image)}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 48px, 64px"
                                  priority={index < 8} // Priority loading for first page items
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <FontAwesomeIcon icon={faImage} className="text-gray-400 h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                          )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[250px] md:max-w-xs">{item.desc}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-center">
                          {item.type === TypeItem.FOOD ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Đồ ăn
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Đồ uống
                            </span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-center text-xs sm:text-sm">
                          {item.category_id?.name || "N/A"}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-xs sm:text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex justify-center">
                            <ActionButtonsGroup
                              onView={() => {
                                handleViewDetails(item);
                              }}
                              onEdit={() => {
                                handleOpenUpdateImage(item);
                              }}
                              showDelete={false}
                              viewTooltip="Xem chi tiết"
                              editTooltip="Cập nhật hình ảnh"
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
            // Card View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {menuItems.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden group">
                    {item.image ? (
                      <Image
                        src={getMediaUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 8} // Priority loading for first page items
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FontAwesomeIcon icon={faImage} className="text-gray-300 h-10 w-10 sm:h-12 sm:w-12" />
            </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                          item.type === TypeItem.FOOD
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.type === TypeItem.FOOD ? "Đồ ăn" : "Đồ uống"}
              </span>
            </div>
          </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{item.name}</h3>
                      <div className="font-medium text-gold-600 text-sm whitespace-nowrap ml-2">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                          .format(item.price)
                          .replace('₫', '')
                          .trim()} đ
                </div>
                        </div>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2">{item.desc}</p>
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs truncate max-w-[150px]">
                        {item.category_id?.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        onClick={() => handleViewDetails(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px]"
                        aria-label="Xem chi tiết"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Xem</span>
                      </Button>
                      <Button
                        onClick={() => handleOpenUpdateImage(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px]"
                        aria-label="Cập nhật hình ảnh"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faImage} className="mr-1 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Ảnh</span>
                      </Button>
                        </div>
                      </div>
                      </div>
              ))}
                      </div>
          )}

          {/* Pagination Controls - updated to match customer page style */}
          {menuItems.length > 0 && (
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
                  {[10, 25, 50, 100, 200].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 ml-2">món</span>
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

          {/* Item Details Dialog - Enhanced for better responsiveness */}
          <StandardDialog
            open={viewDetailsOpen}
            onClose={() => {
              setViewDetailsOpen(false);
              setSelectedItem(null); // Clear the selected item when closing
            }}
            title="Thông tin chi tiết"
            maxWidth="lg"
            actions={
              <>
                <DialogActionButton
                  onClick={() => {
                    setViewDetailsOpen(false);
                    setSelectedItem(null); // Clear the selected item when closing
                  }}
                  variant="outline"
                  className="min-h-[40px] px-4 sm:px-5"
                >
                  Đóng
                </DialogActionButton>
              </>
            }
          >
            {selectedItem && (
              <div className="flex flex-col space-y-5 sm:space-y-6">
                {/* Hero section with image and essential details */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-gray-100">
                  {/* Image container */}
                  <div className="w-full md:w-2/5">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-200">
                      {selectedItem.image ? (
                        <Image
                          src={getMediaUrl(selectedItem.image)}
                          alt={selectedItem.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FontAwesomeIcon icon={faImage} className="text-gray-300 h-12 w-12 sm:h-16 sm:w-16" />
                        </div>
                      )}
                    </div>

                    {/* Price - Moved below image */}
                    <div className="mt-3 bg-gold-50 rounded-lg p-2.5 sm:p-3 border border-gold-100">
                      <p className="text-xs font-medium text-gold-600 mb-1">Giá bán</p>
                      <p className="font-bold text-base sm:text-lg text-gold-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                          .format(selectedItem.price)
                          .replace('₫', '')
                          .trim()} đ
                      </p>
                  </div>
                  </div>

                  {/* Essential details */}
                  <div className="flex flex-col w-full md:w-3/5">
                    {/* Title and type badge */}
                    <div className="flex justify-between items-start mb-3 sm:mb-4 flex-wrap sm:flex-nowrap gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 break-words pr-2">{selectedItem.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                          selectedItem.type === TypeItem.FOOD
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedItem.type === TypeItem.FOOD ? "Đồ ăn" : "Đồ uống"}
                      </span>
                    </div>

                    {/* Category, Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Danh mục</p>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">{selectedItem.category_id?.name || "Chưa phân loại"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Đơn vị</p>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">{selectedItem.unit || "N/A"}</p>
                              </div>
                            </div>

                    {/* Flavor characteristics */}
                    {selectedItem.flavor && selectedItem.flavor.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Đặc điểm</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.flavor.map((f, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all hover:shadow-sm"
                              style={{ backgroundColor: f.color + '15', color: f.color }}
                              title={f.description}
                            >
                              <span className="mr-1.5 text-base sm:text-lg">{f.icon}</span>
                              <span className="font-medium">{f.name}</span>
                              {f.description && <span className="ml-1 hidden sm:inline">: {f.description}</span>}
                            </span>
                          ))}
                                      </div>
                                        </div>
                    )}
                                          </div>
                                        </div>

                {/* Detailed information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Description section */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-700">Mô tả</h4>
                                      </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                        {selectedItem.desc || "Không có mô tả"}
                      </p>
                                    </div>
                                </div>

                  {/* Ingredients section */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-700">Nguyên liệu</h4>
                              </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                        {selectedItem.ingredient ||
                          (selectedItem.desc && selectedItem.desc.includes('\n') && selectedItem.desc.split('\n')[1].length
                          ? selectedItem.desc.split('\n')[1]
                          : "Không có thông tin nguyên liệu")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legacy reference data retained for imported records. */}
                {(selectedItem.item_id_cukcuk || selectedItem.item_name_cukcuk || selectedItem.unit_id_cukcuk || selectedItem.unit_name_cukcuk) && (
                  <div className="mt-1 bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2">Thông tin tham chiếu</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedItem.item_id_cukcuk && (
                                <div>
                          <p className="text-xs font-medium text-blue-500">Mã món CukCuk</p>
                          <p className="text-sm text-gray-700">{selectedItem.item_id_cukcuk}</p>
                                </div>
                      )}
                      {selectedItem.item_name_cukcuk && (
                                <div>
                          <p className="text-xs font-medium text-blue-500">Tên món CukCuk</p>
                          <p className="text-sm text-gray-700">{selectedItem.item_name_cukcuk}</p>
                                </div>
                      )}
                      {selectedItem.unit_id_cukcuk && (
                                <div>
                          <p className="text-xs font-medium text-blue-500">Mã đơn vị CukCuk</p>
                          <p className="text-sm text-gray-700">{selectedItem.unit_id_cukcuk}</p>
                                </div>
                      )}
                      {selectedItem.unit_name_cukcuk && (
                                <div>
                          <p className="text-xs font-medium text-blue-500">Tên đơn vị CukCuk</p>
                          <p className="text-sm text-gray-700">{selectedItem.unit_name_cukcuk}</p>
                                </div>
                      )}
                              </div>
                  </div>
                )}
            </div>
          )}
          </StandardDialog>

          {/* Image Update Dialog */}
          <StandardDialog
            open={imageDialogOpen}
            onClose={() => {
              setImageDialogOpen(false);
              setImageFile(null);
              setImagePreview(null);
            }}
            title={`Cập nhật hình ảnh: ${selectedItem?.name || ''}`}
            maxWidth="md"
            actions={
              <>
                <DialogActionButton
                  onClick={() => {
                    setImageDialogOpen(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  variant="outline"
                >
                  Hủy
                </DialogActionButton>
                <DialogActionButton
                  onClick={handleUpdateImage}
                  disabled={!imageFile || isLoading}
                  isLoading={isLoading}
                >
                  Cập nhật hình ảnh
                </DialogActionButton>
              </>
            }
          >
            <div className="space-y-6">
                    {/* Current image */}
              {selectedItem?.image && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh hiện tại</label>
                  <div className="relative w-full h-64 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={getMediaUrl(selectedItem.image)}
                      alt={selectedItem.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 700px"
                      priority
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload new image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên hình ảnh mới</label>
                      <label
                        htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <FontAwesomeIcon icon={faImage} className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-center">
                      <span className="font-medium text-gold-600">Nhấn để tải ảnh lên</span>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                    </div>
                  </div>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleUpdateImageFileChange}
                        />
                      </label>
                    </div>

                    {/* Image preview */}
                    {imagePreview && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Xem trước</label>
                  <div className="relative w-full h-64 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                            src={imagePreview}
                            alt="Preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 700px"
                          />
                        </div>
                      </div>
                    )}
                  </div>
          </StandardDialog>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa món "${selectedItem?.name}" không? Hành động này không thể hoàn tác.`}
            confirmButtonText="Xóa"
            cancelButtonText="Hủy"
            confirmButtonColor="error"
          />

          {/* Image Type Error Dialog */}
          <StandardDialog
            open={messageDialogOpen}
            onClose={() => setMessageDialogOpen(false)}
            title="Lỗi"
            maxWidth="xs"
            actions={
              <DialogActionButton
                onClick={() => setMessageDialogOpen(false)}
              >
                OK
              </DialogActionButton>
            }
          >
            <p className="text-center">Vui lòng tải ảnh thuộc các định dạng: PNG, JPG, JPEG, GIF,...</p>
          </StandardDialog>

          {/* Notification */}
          {notificationMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
              <span>{notificationMessage}</span>
              <button
                onClick={() => setNotificationMessage("")}
                className="ml-4 text-sm text-gray-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemPage;

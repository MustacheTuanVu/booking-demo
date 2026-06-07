"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { AppContext } from "@/context/AppContext";
import { useContext } from "react";
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

interface Category {
  _id: string;
  image?: string;
  name: string;
  code: string;
  category_id_cukcuk?: string;
  category_name_cukcuk?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryResponse {
  category: Category[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const CategoryItemPage: React.FC = () => {
  const router = useRouter();
  const { userInfo } = useContext(AppContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  
  // New state for modern UI
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState<boolean>(false);
  const [imageDialogOpen, setImageDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<string>("createdAt:desc");

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
    const savedFilterState = localStorage.getItem("categoryFilterExpanded");
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
    localStorage.setItem("categoryFilterExpanded", String(isFilterExpanded));
  }, [isFilterExpanded]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}`;

      if (query) queryParams += `&query=${query}`;
      if (orderBy) queryParams += `&orderBy=${orderBy}`;

      const res = await api.get(
        `category_item/GetMany?${queryParams}`
      );
      const data: CategoryResponse = res.data;
      setCategories(data.category);
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching categories", error);
      showNotification("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit, orderBy]);

  // Update notification handling
  const showNotification = (message: string) => {
    setNotificationMessage(message);
    // Auto-hide after 3 seconds
    setTimeout(() => setNotificationMessage(""), 3000);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleViewDetails = (category: Category) => {
    setSelectedCategory({...category}); // Make a copy to ensure clean state
    setViewDetailsOpen(true);
  };

  const handleOpenUpdateImage = (item: Category) => {
    // First set the selected item
    setSelectedCategory({...item}); // Make a copy to ensure clean state
    
    // Reset image state
    setImagePreview(null);
    setImageFile(null);
    
    // Open the dialog last, after all state is properly set
    setTimeout(() => {
      setImageDialogOpen(true);
    }, 0);
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
    if (!selectedCategory || !imageFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      await api.post(`category_item/UpdateImage?itemId=${selectedCategory._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification("Cập nhật hình ảnh thành công!");
      
      // Close the dialog and clean up state
      setImageDialogOpen(false);
      setSelectedCategory(null);
      setImageFile(null);
      setImagePreview(null);
      
      // Refresh the data
      fetchCategories();
    } catch (error) {
      console.error("Error updating image", error);
      showNotification("Cập nhật hình ảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when applying new search
    setPage(1);
    fetchCategories();
  };

  // Reset filters
  const handleResetFilters = () => {
    setPage(1);
    setQuery("");
    setOrderBy("createdAt:desc");
    fetchCategories();
  };

  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const categoryData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      category_id_cukcuk: formData.get('category_id_cukcuk') as string || undefined,
      category_name_cukcuk: formData.get('category_name_cukcuk') as string || undefined,
      slug: '123'
    };

    try {
      if (editingCategory) {
        await api.put(`category_item/Update?id=${editingCategory._id}`, categoryData);
      } else {
        await api.post("category_item/Create", categoryData);
      }
      handleDialogClose();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category", error);
      alert("Error saving category. Please try again.");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchCategories();
  };

  // Add these to your existing state declarations
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Add these functions to handle delete operations
  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`category_item/Delete?id=${categoryToDelete}`);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting category", error);
      alert("Lỗi khi xóa danh mục. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="container mx-auto mt-4 px-3 sm:px-3 md:px-4 lg:px-6 max-w-screen-2xl">
      <title>Quản lý danh mục Món | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý danh mục món tại Queen Acoustic." />
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
              title="Quản lý Danh mục Món ăn"
              searchEnabled={true}
              searchQuery={query}
              onSearchChange={(e) => setQuery(e.target.value)}
              onSearchSubmit={() => {
                setPage(1);
                fetchCategories();
              }}
              onSearchClear={() => {
                setQuery("");
                setPage(1);
                fetchCategories();
              }}
              filterEnabled={true}
              filterIcon={faFilter}
              onFilterClick={toggleFilterPanel}
              addEnabled={false} // Disabled based on original UI
              className="mb-0 rounded-b-none"
            />
            
          </div>

          {/* Filters panel */}
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
                  fetchCategories();
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all text-sm"
                      />
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
              {categories.length > 0 ? (
                <p>Hiển thị <span className="font-medium">{categories.length}</span> trên tổng số <span className="font-medium">{total}</span> mục</p>
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

          {/* Mobile swipe instruction - only shown for table view */}
          {viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 bg-red-50 p-2 rounded-md border border-red-100 animate-pulse opacity-90 mb-3">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 animate-pulse" />
              <span className="ml-1.5">Kéo sang phải để xem thêm</span>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && categories.length === 0 ? (
            <EmptyState 
              title="Không tìm thấy danh mục nào"
              subtitle="Không có danh mục nào phù hợp với bộ lọc hiện tại"
              searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
              searchQuery={query}
              icon={faImage}
              onActionClick={handleResetFilters}
              actionButtonText="Đặt lại bộ lọc"
            />
          ) : null}

          {/* Categories Display (Table or Card View) */}
          {loading ? (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
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
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left min-w-[140px] sm:min-w-[180px]">Tên danh mục</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Mã</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left min-w-[120px]">Tên CukCuk</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category, index) => (
                      <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{index + 1}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center align-middle">
                          <div className="flex justify-center items-center h-full">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                              {category.image ? (
                                <Image
                                  src={getMediaUrl(category.image)}
                                  alt={category.name}
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
                          <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{category.code}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm">{category.category_name_cukcuk || "N/A"}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex justify-center">
                            <ActionButtonsGroup
                              onView={() => handleViewDetails(category)}
                              onEdit={() => handleOpenUpdateImage(category)}
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
              {categories.map((category, index) => (
                <div 
                  key={category._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative w-full aspect-square bg-gray-50 overflow-hidden group">
                    {category.image ? (
                      <Image
                        src={getMediaUrl(category.image)}
                        alt={category.name}
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
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{category.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Mã: {category.code}</p>
                    </div>
                    
                    {category.category_name_cukcuk && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Tên CukCuk:</span> {category.category_name_cukcuk}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        onClick={() => handleViewDetails(category)}
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
                        onClick={() => handleOpenUpdateImage(category)}
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

          {/* Pagination Controls */}
          {categories.length > 0 && (
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
                <span className="text-sm text-gray-500 ml-2">danh mục</span>
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
                className="rounded-lg shadow-sm" // Match styling
              />
            </div>
          )}
        </div>
      </div>

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

      {/* View Details Modal */}
      <StandardDialog
        open={viewDetailsOpen}
        onClose={() => {
          setViewDetailsOpen(false);
          setSelectedCategory(null); // Clear the selected item when closing
        }}
        title="Thông tin chi tiết danh mục"
        maxWidth="md"
        actions={
          <>
            <DialogActionButton
              onClick={() => {
                setViewDetailsOpen(false);
                setSelectedCategory(null);
              }}
              variant="outline"
              className="min-h-[40px] px-4 sm:px-5"
            >
              Đóng
            </DialogActionButton>
          </>
        }
      >
        {selectedCategory && (
          <div className="flex flex-col space-y-5 sm:space-y-6">
            {/* Hero section with image and essential details */}
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-gray-100">
              {/* Image container */}
              <div className="w-full md:w-2/5">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-200">
                  {selectedCategory.image ? (
                    <Image
                      src={getMediaUrl(selectedCategory.image)}
                      alt={selectedCategory.name}
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
              </div>

              {/* Essential details */}
              <div className="flex flex-col w-full md:w-3/5">
                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{selectedCategory.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Mã danh mục: <span className="font-medium">{selectedCategory.code}</span></p>
                </div>

              {/* Legacy reference data retained for imported records. */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">Thông tin tham chiếu</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-500">Mã CukCuk</p>
                      <p className="text-sm text-gray-700">{selectedCategory.category_id_cukcuk || "Chưa có"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-500">Tên CukCuk</p>
                      <p className="text-sm text-gray-700">{selectedCategory.category_name_cukcuk || "Chưa có"}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCategory.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Ngày tạo</p>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedCategory.createdAt).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {selectedCategory.updatedAt && (
                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Cập nhật lần cuối</p>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedCategory.updatedAt).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
        title={`Cập nhật hình ảnh: ${selectedCategory?.name || ''}`}
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
              disabled={!imageFile || loading}
              isLoading={loading}
            >
              Cập nhật hình ảnh
            </DialogActionButton>
          </>
        }
      >
        <div className="space-y-6">
          {/* Current image */}
          {selectedCategory?.image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh hiện tại</label>
              <div className="relative w-full h-64 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={getMediaUrl(selectedCategory.image)}
                  alt={selectedCategory.name}
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

      {/* Message Dialog for Image Type Error */}
      <ConfirmationDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        title="Thông báo"
        message="Vui lòng tải ảnh thuộc các định dạng: PNG, JPG, JPEG, GIF,..."
        onConfirm={() => setMessageDialogOpen(false)}
        confirmButtonText="OK"
        cancelButtonText=""
      />
    </div>
  );
};

export default CategoryItemPage;

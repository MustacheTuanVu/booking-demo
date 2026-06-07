"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faCalendarPlus,
  faFilter,
  faSearch,
  faImage,
  faArrowRight,
  faCalendar,
  faExclamationTriangle,
  faMapMarkerAlt,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { vi } from "date-fns/locale";

interface Artist {
  _id: string;
  name: string;
}

interface ShowTime {
  _id: string;
  time_start: string;
  time_end: string;
  status: string;
}

interface Event {
  _id: string;
  title: string;
  code: string;
  type_event: string;
  venue: string;
  desc: string;
  slug: string;
  status: string;
  avatar?: string;
  banner?: string;
  createdAt: string;
  updatedAt: string;
  InfoShowTimes: ShowTime[];
  InfoContents: Array<{
    InfoArtist: Artist[];
  }>;
}

interface EventsResponse {
  events: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const EventListPage: React.FC = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");
  const [selectedArtist, setSelectedArtist] = useState<string>("");
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);
  const [imageDialog, setImageDialog] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning"
  });
  
  // View mode state
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
    const savedViewMode = localStorage.getItem("eventViewMode") as ViewMode | null;
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
  }, [isMobileView]);
  
  // Force card view on mobile devices whenever screen size changes
  useEffect(() => {
    if (isMobileView && viewMode === "table") {
      setViewMode("card");
    }
  }, [isMobileView, viewMode]);
  
  // Save view mode preference when changed
  useEffect(() => {
    localStorage.setItem("eventViewMode", viewMode);
  }, [viewMode]);

  // Show notification function
  const showNotification = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Fetch events list
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        queryParams.append("query", searchQuery);
      }

      if (timeFrom) {
        queryParams.append("time_from", new Date(timeFrom).toISOString());
      }

      if (timeTo) {
        queryParams.append("time_to", new Date(timeTo).toISOString());
      }

      if (selectedArtist) {
        queryParams.append("artist_id", selectedArtist);
      }

      const res = await api.get(`events/getEventByCondition?${queryParams}`);
      const data: EventsResponse = res.data;

      setEvents(data.events);
      setTotal(data.total);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, limit]);

  // Handle applying filters
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchEvents();
    setOpenFilterDialog(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTimeFrom("");
    setTimeTo("");
    setSelectedArtist("");
    setPage(1);
    fetchEvents();
    setOpenFilterDialog(false);
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  // Execute delete after confirmation
  const executeDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await api.delete(`events/Delete?eventId=${eventToDelete}`);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchEvents();
      showNotification("Sự kiện đã được xóa thành công", "success");
    } catch (error) {
      console.error("Error deleting event", error);
      showNotification("Không thể xóa sự kiện. Sự kiện đã có người đặt chỗ!", "error");
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 2); // Max 2 files as per backend code
      setImageFiles(filesArray);

      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  // Submit image uploads
  const handleSubmitImages = async () => {
    if (!currentEvent || imageFiles.length === 0) return;

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.put(`events/updateImages?eventId=${currentEvent._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset and close dialog
      setImageFiles([]);
      setPreviewUrls([]);
      setImageDialog(false);

      // Show success notification
      showNotification("Tải lên hình ảnh thành công", "success");

      // Refresh events to show new images
      fetchEvents();
    } catch (error) {
      console.error("Error uploading images", error);
      showNotification("Có lỗi xảy ra khi tải lên hình ảnh", "error");
    }
  };

  // Function to get the first artist name for an event
  const getArtistName = (event: Event): string => {
    if (
      event.InfoContents &&
      event.InfoContents.length > 0 &&
      event.InfoContents[0].InfoArtist &&
      event.InfoContents[0].InfoArtist.length > 0
    ) {
      return event.InfoContents[0].InfoArtist[0].name;
    }
    return "Unknown Artist";
  };

  // Format date display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Navigate to create event page
  const handleCreateEvent = () => {
    router.push("/dashboard/create-event");
  };

  // Navigate to edit event page
  const handleEditEvent = (eventId: string) => {
    router.push(`/dashboard/update-event/${eventId}`);
  };

  // View event details
  const handleViewEventDetails = (eventId: string) => {
    router.push(`/su-kien/${eventId}`);
  };

  // Open image upload dialog
  const handleOpenImageDialog = (event: Event) => {
    setCurrentEvent(event);
    setImageDialog(true);
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quản lý sự kiện | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý sự kiện tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          <DashboardHeader
            title="Quản lý sự kiện"
            searchEnabled={true}
            showSearch={true}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearchClear={() => {
              setSearchQuery("");
              fetchEvents();
            }}
            onSearchSubmit={fetchEvents}
            addEnabled={true}
            onAddClick={handleCreateEvent}
            addButtonLabel="Tạo sự kiện"
            addIcon={faCalendarPlus}
            searchResultText={`Tìm thấy ${events.length} sự kiện`}
            filterEnabled={true}
            onFilterClick={() => setOpenFilterDialog(true)}
            filterIcon={faFilter}
          />

          {/* Loading indicator */}
          {loading && (
            <div className="bg-white rounded-lg shadow flex justify-center items-center py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <EmptyState
              title="Không tìm thấy sự kiện nào"
              subtitle="Hãy thử điều chỉnh các bộ lọc của bạn hoặc tạo một sự kiện mới."
              icon={faCalendar}
              actionButtonText="Tạo sự kiện mới"
              onActionClick={handleCreateEvent}
            />
          )}

          {/* View Mode Switcher area */}
          {!loading && events.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">
                <p>Hiển thị <span className="font-medium">{events.length}</span> trên tổng số <span className="font-medium">{total}</span> sự kiện</p>
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
          )}

          {/* Mobile swipe instruction for table view */}
          {!loading && events.length > 0 && viewMode === "table" && (
            <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 bg-red-50 p-2.5 rounded-md border border-red-100 animate-pulse opacity-95 mb-3 shadow-sm">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
              <span className="font-medium">Kéo sang phải để xem thêm</span>
            </div>
          )}

          {/* Events table view */}
          {!loading && events.length > 0 && viewMode === "table" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-12 sm:w-14">STT</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left min-w-[140px] sm:min-w-[180px] md:min-w-[200px]">Tiêu đề</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[100px] sm:w-[120px]">Trạng thái</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center min-w-[120px] sm:min-w-[140px] whitespace-nowrap">Thời gian</th>
                      <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {events.map((event, index) => (
                      <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{index + 1}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {event.banner && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <Image 
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={getMediaUrl(event.banner)}
                                  alt={event.title} 
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium
                            ${event.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'}
                          `}>
                            {event.status === 'ACTIVE' ? "Kích hoạt" : "Không kích hoạt"}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-center text-xs sm:text-sm text-gray-500">
                          {event.InfoShowTimes && event.InfoShowTimes.length > 0
                            ? format(new Date(event.InfoShowTimes[0].time_start).getTime(), "HH:mm, dd MMM, yyyy", { locale: vi }) : "..."}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex justify-center">
                            <ActionButtonsGroup
                              onEdit={() => handleEditEvent(event._id)}
                              onDelete={() => handleDeleteEvent(event._id)}
                              onView={undefined} // Hide "Xem chi tiết" button by passing undefined
                              editTooltip="Chỉnh sửa sự kiện"
                              deleteTooltip="Xóa sự kiện"
                              viewTooltip="Xem chi tiết"
                              // Hide "Tải ảnh lên" option by passing an empty array
                              moreActions={[]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Events card view */}
          {!loading && events.length > 0 && viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {events.map((event, index) => (
                <div 
                  key={event._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden group">
                    {event.banner ? (
                      <Image
                        src={getMediaUrl(event.banner)}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 8} // Priority loading for first page items
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FontAwesomeIcon icon={faCalendar} className="text-gray-300 h-10 w-10 sm:h-12 sm:w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span 
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'ACTIVE' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.status === 'ACTIVE' ? "Kích hoạt" : "Không kích hoạt"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{event.title}</h3>
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center text-xs text-gray-600 mb-1.5">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-500 mr-1.5" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    )}
                    
                    {event.InfoShowTimes && event.InfoShowTimes.length > 0 && (
                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3 text-gray-500 mr-1.5" />
                        <span>
                          {format(new Date(event.InfoShowTimes[0].time_start).getTime(), "HH:mm, dd MMM, yyyy", { locale: vi })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        onClick={() => handleEditEvent(event._id)}
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 h-9 min-h-[36px]"
                        aria-label="Chỉnh sửa sự kiện"
                        type="button"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1 h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">Sửa</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteEvent(event._id)}
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-red-600 border-gray-300 hover:bg-red-50 hover:border-red-200 h-9 min-h-[36px]"
                        aria-label="Xóa sự kiện"
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

          {/* Pagination */}
          {!loading && events.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between md:items-center mt-6">
              <div className="mb-4 md:mb-0 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Hiển thị:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // Reset to first page when changing limit
                    fetchEvents(); // Fetch events with new limit
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200 focus:border-gold-400"
                >
                  {[12, 24, 48, 96].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 ml-2">sự kiện</span>
              </div>
              
              <PaginationControls
                page={page - 1} // Convert from 1-based to 0-based for component
                total={total}
                limit={limit}
                onPageChange={(newPage) => {
                  setPage(newPage + 1); // Convert from 0-based to 1-based for API
                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
                }}
                className="rounded-lg shadow-sm" // Match customer page styling
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter dialog */}
      <StandardDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        title="Lọc sự kiện theo ngày"
        maxWidth="md"
        className="rounded-xl overflow-hidden"
        headerClassName="bg-gradient-to-r from-blue-50 to-white border-b py-4"
        contentClassName="p-6"
        actions={
          <div className="flex gap-3 justify-end w-full">
            <DialogActionButton
              onClick={handleResetFilters}
              variant="outline"
              className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            >
              Đặt lại bộ lọc
            </DialogActionButton>
            <DialogActionButton
              onClick={() => setOpenFilterDialog(false)}
              variant="outline"
              className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            >
              Hủy
            </DialogActionButton>
            <DialogActionButton
              onClick={handleApplyFilters}
              variant="primary"
              className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 shadow-sm hover:shadow"
            >
              Áp dụng bộ lọc
            </DialogActionButton>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="datetime-local"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="datetime-local"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-700"
              />
            </div>
          </div>
        </div>
      </StandardDialog>

      {/* Image upload dialog */}
      <StandardDialog
        open={imageDialog && currentEvent !== null}
        onClose={() => {
          setImageDialog(false);
          setImageFiles([]);
          setPreviewUrls([]);
        }}
        title={`Tải ảnh lên cho: ${currentEvent?.title || ""}`}
        maxWidth="md"
        className="rounded-xl overflow-hidden"
        headerClassName="bg-gradient-to-r from-green-50 to-white border-b py-4"
        contentClassName="p-6"
        actions={
          <div className="flex gap-3 justify-end w-full">
            <DialogActionButton
              onClick={() => {
                setImageDialog(false);
                setImageFiles([]);
                setPreviewUrls([]);
              }}
              variant="outline"
              className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            >
              Hủy
            </DialogActionButton>
            <DialogActionButton
              onClick={handleSubmitImages}
              variant="primary"
              disabled={imageFiles.length === 0}
              className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-all duration-200 shadow-sm hover:shadow"
            >
              Tải lên
            </DialogActionButton>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-gray-600 text-sm">
            Tải lên logo (file đầu tiên) và banner (file thứ hai) cho sự kiện này.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            <input
              type="file"
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              <FontAwesomeIcon icon={faImage} className="text-gray-400 h-12 w-12 mb-3" />
              <span className="text-sm font-medium text-gray-700 mb-1">Nhấp để chọn ảnh</span>
              <span className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2 file</span>
            </label>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={500}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm font-medium">
                    {index === 0 ? "Logo" : "Banner"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </StandardDialog>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xác nhận xóa sự kiện"
        message={
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Hành động này không thể hoàn tác
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Bạn có chắc chắn muốn xóa sự kiện này? Tất cả dữ liệu liên quan đến sự kiện này có thể sẽ không khôi phục được.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
        confirmButtonClassName="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow"
        dialogClass="rounded-xl overflow-hidden"
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </div>
  );
};

export default EventListPage;

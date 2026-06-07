"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation"; // Uncomment when needed for navigation
import Image from "next/image";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import api from "@/utils/api";
import { getMediaUrl } from "@/utils/mediaUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit, faTrash, faPlus, faTimes, faUpload,
  faCheck, faSearch, faEye, faSort, faInfoCircle,
  faAnglesLeft, faAnglesRight, faChevronRight,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, useMediaQuery, useTheme, Snackbar, Alert,
  Fade, CircularProgress, Tooltip, Tab, Tabs, Box, Badge
} from "@mui/material";
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import ConfirmationDialog from "@/components/Dashboard/ui/ConfirmationDialog";
import ActionButtonsGroup from "@/components/Dashboard/ui/ActionButtonsGroup";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import EmptyState from "@/components/Dashboard/ui/EmptyState";
import NotificationSnackbar from "@/components/Dashboard/ui/NotificationSnackbar";

// Artist table skeleton loader component
const ArtistTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">STT</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Hình ảnh</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">
                <div className="flex items-center">
                  Tên
                  <span className="ml-1 text-gray-400">
                    <FontAwesomeIcon icon={faSort} className="h-3 w-3" />
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-left">Slug</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="py-4 px-4 text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-6"></div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mx-auto"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2 justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
        <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Define interfaces outside of component for better performance
interface ArtistType {
  _id: string;
  name: string;
  bio?: string;
  link: string;
  image?: string;
  performances?: any[];
}

interface ArtistResponse {
  artists: ArtistType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ArtistPage: React.FC = () => {
  // const router = useRouter(); // Uncomment when needed for navigation
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingArtist, setEditingArtist] = useState<ArtistType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
  const [openDialogMessage, setOpenDialogMessage] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quickViewArtist, setQuickViewArtist] = useState<ArtistType | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // State for image cache busting
  const [imageVersion, setImageVersion] = useState<number>(Date.now());

  // State for cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  // State for delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showSnackbar = useCallback((message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
  }, []);

  // Memoized fetch artists function to reduce re-renders
  const fetchArtists = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `artists/GetMany?page=${page + 1}&limit=${limit}`
      );
      const data: ArtistResponse = res.data;
      setArtists(data.artists);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching artists", error);
      showSnackbar("Không thể tải danh sách ca sĩ. Vui lòng thử lại sau.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, showSnackbar]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Filter artists based on search query - client-side filtering
  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    if (!searchQuery) return artists;
    return artists.filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.link.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setTabValue(0);
    setEditingArtist(null);
    setImageFile(null);
    setImagePreview(null);
    setCroppedImage(null);
    setShowCropper(false);
  }, []);

  const handleQuickViewClose = () => {
    setQuickViewArtist(null);
  };

  // Handle form submission for creating/updating an artist
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!croppedImage && !editingArtist?.image) {
      setFormError("Vui lòng chọn hình ảnh trước khi lưu.");
      return;
    }

    // Ảnh hợp lệ => xoá lỗi
    setFormError("");

    setIsLoading(true);
    const form = e.target as any;
    const formData = new FormData();

    // Get form values with proper null checks
    const nameValue = form.name?.value || "";
    const linkValue = form.link?.value || "";

    // For bio, we need to handle the case when the bio tab is not visited
    let bioValue = "";
    try {
      bioValue = form.bio?.value || editingArtist?.bio || "";
    } catch (error) {
      // If there's an error accessing bio, fallback to existing bio or empty string
      bioValue = editingArtist?.bio || "";
    }

    formData.append("name", nameValue);
    formData.append("bio", bioValue);
    formData.append("link", linkValue);

    if (imageFile && croppedImage) {
      // Convert base64 to blob
      const fetchRes = await fetch(croppedImage);
      const blob = await fetchRes.blob();

      // Create a file from blob
      const croppedFile = new File([blob], imageFile.name, {
        type: imageFile.type,
        lastModified: Date.now(),
      });

      formData.append("file", croppedFile);
    }

    try {
      let updatedArtist: any;
      if (editingArtist) {
        const response = await api.put(`artists/Create?id=${editingArtist._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedArtist = response.data;

        // Update the artist in the local state to reflect changes immediately
        setArtists(prevArtists =>
          prevArtists.map(artist =>
            artist._id === editingArtist._id ? updatedArtist : artist
          )
        );

        // Update image version to bust cache
        setImageVersion(Date.now());

        showSnackbar("Ca sĩ đã được cập nhật thành công!", "success");
      } else {
        await api.post("artists/Create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSnackbar("Ca sĩ đã được tạo thành công!", "success");
      }
      handleDialogClose();
      fetchArtists();
    } catch (error) {
      console.error("Error saving artist", error);
      showSnackbar("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((artist: ArtistType) => {
    setEditingArtist(artist);
    setOpenDialog(true);
  }, []);

  const handleQuickView = (artist: ArtistType) => {
    setQuickViewArtist(artist);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa ca sĩ này?")) {
      setIsLoading(true);
      try {
        await api.put(`artists/Delete?id=${id}`);
        showSnackbar("Ca sĩ đã được xóa thành công!", "success");
        fetchArtists();
      } catch (error) {
        console.error("Error deleting artist", error);
        showSnackbar("Có lỗi xảy ra khi xóa ca sĩ!", "error");
      } finally {
        setIsLoading(false);
      }
    }

  };

  // Handle file change for image upload
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
        setShowCropper(true); // Show the cropper when an image is selected
        setCroppedImage(null); // Reset cropped image
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.form) return;

    const nameValue = e.target.value;
    const slugField = e.target.form.elements.namedItem('link') as HTMLInputElement;

    if (slugField) {
      // Only auto-generate if the field is empty or was auto-generated before
      if (!slugField.value || slugField.dataset.autoGenerated === 'true') {
        const slug = nameValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
          .replace(/[^\w\s-]/g, '')         // Remove non-word chars
          .replace(/\s+/g, '-')             // Replace spaces with hyphens
          .replace(/-+/g, '-')              // Replace multiple hyphens with single hyphen
          .trim();

        slugField.value = slug;
        slugField.dataset.autoGenerated = 'true';
      }
    }
  };

  // View artist details - currently unused but kept for future use
  // const handleViewArtist = (slug: string) => {
  //   router.push(`/artists/${slug}`);
  // };

  // Crop complete callback
  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Apply crop
  const applyCrop = async () => {
    if (!imagePreview || !croppedAreaPixels) return;

    setIsLoading(true);
    try {
      const croppedImageUrl = await getCroppedImg(imagePreview, croppedAreaPixels);
      setCroppedImage(croppedImageUrl);
      setShowCropper(false);
      setFormError("");
    } catch (e) {
      console.error("Error applying crop:", e);
      showSnackbar("Lỗi khi cắt ảnh. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel crop
  const cancelCrop = useCallback(() => {
    setShowCropper(false);
    setCroppedImage(null);
    setImagePreview(null);
    setImageFile(null);
  }, []);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Define the tab panel component
  const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`artist-tabpanel-${index}`}
        aria-labelledby={`artist-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-4 px-4 pb-16">
      <title>Quản lý ca sĩ | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý ca sĩ tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Breadcrumb navigation */}
          <div className="text-sm breadcrumbs mb-4">
            <ul className="flex text-gray-500">
              <li className="hover:text-gold-600 transition-colors">
                <a href="/dashboard">Dashboard</a>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <span className="text-gold-600 font-medium">Quản lý Ca sĩ</span>
              </li>
            </ul>
          </div>

          {/* Dashboard Header - Using our reusable component */}
          <DashboardHeader
            title="Quản lý Ca sĩ"
            searchEnabled={true}
            showSearch={showSearch}
            searchQuery={searchQuery}
            onSearchToggle={() => setShowSearch(prev => !prev)}
            onSearchChange={handleSearch}
            onSearchClear={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            addEnabled={true}
            onAddClick={() => setOpenDialog(true)}
            addButtonLabel="Thêm Ca sĩ"
            searchResultText={searchQuery ?
              (filteredArtists.length > 0
                ? `Tìm thấy ${filteredArtists.length} kết quả cho "${searchQuery}"`
                : `Không tìm thấy kết quả nào cho "${searchQuery}"`)
              : undefined
            }
          />

          {/* Quick stats */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gold-500">
                <div className="font-medium text-gray-500">Tổng số ca sĩ</div>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
              </div>
              {/* These are placeholder counts - in a real implementation you'd get these from the API */}
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <div className="font-medium text-gray-500">Ca sĩ có buổi diễn</div>
                <div className="text-2xl font-bold text-gray-800">{Array.isArray(artists) ? artists.filter(a => a.performances && a.performances.length > 0).length : 0}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="font-medium text-gray-500">Ca sĩ mới (30 ngày)</div>
                <div className="text-2xl font-bold text-gray-800">
                  {/* Placeholder - would need created date in API response */}
                  {Math.min(3, total)}
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator - Now uses the skeleton loader */}
          {isLoading && <ArtistTableSkeleton />}

          {/* Table - Now wrapped in a div with min-height to prevent CLS */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[400px]">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full table-fixed md:table-auto">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 uppercase text-center w-[10%]">STT</th>
                      <th className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 uppercase text-center w-[20%]">Hình ảnh</th>
                      <th className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 uppercase text-left w-[35%]">
                        <div className="flex items-center">
                          Tên
                          <button className="ml-1 text-gray-400 hover:text-gray-600">
                            <FontAwesomeIcon icon={faSort} className="h-3 w-3" />
                          </button>
                        </div>
                      </th>
                      <th className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 uppercase text-left hidden sm:table-cell">Slug</th>
                      <th className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 uppercase text-center w-[15%]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredArtists.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center">
                          <EmptyState
                            title="Không tìm thấy ca sĩ nào"
                            searchQuery={searchQuery}
                            subtitle="Thêm ca sĩ để quản lý danh sách ca sĩ của bạn"
                            searchSubtitle="Thử tìm kiếm với từ khóa khác hoặc thêm ca sĩ mới"
                            onActionClick={() => setOpenDialog(true)}
                            actionButtonText="Thêm Ca sĩ Mới"
                            minHeight="300px"
                            iconComponent={
                              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredArtists.map((artist, index) => (
                        <tr key={artist._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">{page * limit + index + 1}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                            {artist.image ? (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mx-auto border-2 border-gold-300 shadow-sm relative">
                                <Image
                                  src={`${getMediaUrl(artist.image)}?v=${imageVersion}`}
                                  alt={artist.name}
                                  fill
                                  sizes="(max-width: 768px) 48px, 64px"
                                  className="object-cover"
                                  key={`${artist.image}-${imageVersion}`}
                                  priority={index < 3}
                                  placeholder="blur"
                                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                                <span className="text-gray-400 text-[10px] md:text-xs">Không có</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium">
                            <div className="flex flex-col">
                              <span className="text-gray-800 font-semibold hover:text-gold-600 cursor-pointer truncate max-w-[150px] md:max-w-none"
                                onClick={() => handleQuickView(artist)}>
                                {artist.name}
                              </span>
                              {artist.performances && artist.performances.length > 0 && (
                                <span className="text-[10px] md:text-xs text-green-600 mt-1">
                                  {artist.performances.length} buổi biểu diễn
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell truncate">{artist.link}</td>
                          <td className="py-1 md:py-2 px-1 md:px-4">
                            <ActionButtonsGroup
                              onView={() => handleQuickView(artist)}
                              onEdit={() => handleEdit(artist)}
                              onDelete={() => setConfirmDeleteId(artist._id)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Using our reusable PaginationControls component */}
              {filteredArtists.length > 0 && total > 0 && (
                <PaginationControls
                  page={page}
                  limit={limit}
                  total={total}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(0); // Reset to first page when changing limit
                  }}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  hasMore={Array.isArray(artists) && artists.length >= limit}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Dialog with improved responsive design */}
      <Dialog
        open={!!quickViewArtist}
        onClose={handleQuickViewClose}
        fullWidth
        maxWidth="sm"
      >
        {quickViewArtist && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
              <div className="flex justify-between items-center">
                <Typography variant="h6" fontWeight="bold" className="text-gray-800 text-base sm:text-lg">
                  {quickViewArtist.name}
                </Typography>
                <button
                  onClick={handleQuickViewClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </DialogTitle>
            <DialogContent sx={{ py: { xs: 2, sm: 3 }, minHeight: { xs: '300px', sm: '400px' } }}>
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full relative mb-3 sm:mb-4">
                  {quickViewArtist.image ? (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 sm:border-4 border-gold-200 shadow-md relative">
                      <Image
                        src={`${getMediaUrl(quickViewArtist.image)}?v=${imageVersion}`}
                        alt={quickViewArtist.name}
                        fill
                        sizes="(max-width: 640px) 80px, 112px"
                        className="object-cover"
                        priority
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-200 flex items-center justify-center border-3 sm:border-4 border-gray-100 shadow-md">
                      <span className="text-gray-400 text-sm sm:text-lg font-medium">Không có</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{quickViewArtist.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Slug: {quickViewArtist.link}</p>
              </div>

              <div className="border-t border-gray-100 py-3 sm:py-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Tiểu sử</h4>
                <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">
                  {quickViewArtist.bio || 'Chưa có thông tin tiểu sử.'}
                </p>
              </div>

              {quickViewArtist.performances && quickViewArtist.performances.length > 0 && (
                <div className="border-t border-gray-100 py-3 sm:py-4">
                  <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Buổi biểu diễn</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Có {quickViewArtist.performances.length} buổi biểu diễn
                  </p>
                </div>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "flex-end", p: { xs: 1.5, sm: 2 }, pt: 0 }}>
              <button
                onClick={handleQuickViewClose}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleEdit(quickViewArtist);
                  handleQuickViewClose();
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
              >
                Chỉnh sửa
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* File type error dialog */}
      <Dialog
        open={openDialogMessage}
        onClose={() => setOpenDialogMessage(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className="flex justify-between items-center">
            <Typography variant="h6" fontWeight="bold">Thông báo</Typography>
            <button
              onClick={() => setOpenDialogMessage(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <div className="text-center">
            <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </div>
            <Typography variant="body1" className="text-gray-800 mb-3">
              Định dạng file không hợp lệ. Vui lòng tải ảnh thuộc các định dạng: PNG, JPG, JPEG, GIF,...
            </Typography>
          </div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <button
            onClick={() => setOpenDialogMessage(false)}
            className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Đã hiểu
          </button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog with improved responsive design */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
          <div className="relative bg-white rounded-xl w-full md:w-2/3 lg:w-1/2 max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-gold-500 rounded-t-xl p-3 sm:p-4 flex justify-between items-center shadow-md z-10">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingArtist ? "Cập nhật Ca sĩ" : "Thêm Ca sĩ Mới"}
              </h2>
              <button
                className="text-white hover:text-gray-200 transition-colors"
                onClick={handleDialogClose}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                  <CircularProgress sx={{ color: 'var(--clr-bg-1)' }} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Image & Basic Info Section */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
                  <div className="md:w-1/3">
                    <div className="text-center">
                      {/* Image Preview/Upload */}
                      {croppedImage || (editingArtist?.image && !showCropper) ? (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-full overflow-hidden bg-gray-100 border-4 border-gold-200 shadow-lg mx-auto">
                          {croppedImage ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={croppedImage}
                                alt={editingArtist?.name || "Preview"}
                                fill
                                sizes="(max-width: 640px) 128px, 160px"
                                className="object-cover"
                                priority
                              />
                            </div>
                          ) : (
                            <Image
                              src={getMediaUrl(editingArtist?.image)}
                              alt={editingArtist?.name || "Preview"}
                              fill
                              sizes="(max-width: 640px) 128px, 160px"
                              className="object-cover"
                              priority
                            />
                          )}
                        </div>
                      ) : (
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full border-4 border-dashed border-gray-300 text-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-gold-500 mb-2">
                            <FontAwesomeIcon icon={faUpload} className="h-6 sm:h-8 w-6 sm:w-8" />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gold-600 mb-1">Chọn hình ảnh</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">PNG, JPG, GIF...</p>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                        </label>
                      )}

                      {/* Show upload button if image already exists */}
                      {(croppedImage || (editingArtist?.image && !showCropper)) && (
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center mt-2 sm:mt-3 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                          <FontAwesomeIcon icon={faUpload} className="mr-1 h-3 w-3" />
                          Thay đổi
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                        </label>
                      )}
                      {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
                    </div>
                  </div>

                  <div className="md:w-2/3 mt-4 md:mt-0">
                    {/* Tabs for form sections */}
                    {!showCropper && (
                      <Tabs value={tabValue} onChange={handleTabChange}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          '.MuiTab-root': { fontSize: { xs: '0.8rem', sm: '0.875rem' }, textTransform: 'none', padding: { xs: '8px 12px', sm: '12px 16px' } },
                          '.Mui-selected': { color: '#b89535', fontWeight: 'medium' },
                          '.MuiTabs-indicator': { backgroundColor: '#b89535' }
                        }}>
                        <Tab label="Thông tin" id="artist-tab-0" aria-controls="artist-tabpanel-0" />
                        {/* <Tab label="Tiểu sử" id="artist-tab-1" aria-controls="artist-tabpanel-1" /> */}
                      </Tabs>
                    )}

                    {/* Basic Info Tab */}
                    {!showCropper && (
                      <TabPanel value={tabValue} index={0}>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Tên ca sĩ <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              defaultValue={editingArtist?.name || ""}
                              placeholder="Tên ca sĩ"
                              className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                              required
                              onChange={handleNameChange}
                            />
                          </div>

                          <div>
                            <div className="flex items-center mb-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Slug <span className="text-red-500">*</span>
                              </label>
                              <Tooltip title="Slug là phần định danh trong URL, chỉ nên chứa chữ cái, số và dấu gạch ngang">
                                <div className="ml-1 text-gray-400 cursor-help">
                                  <FontAwesomeIcon icon={faInfoCircle} className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                                </div>
                              </Tooltip>
                            </div>
                            <input
                              type="text"
                              name="link"
                              defaultValue={editingArtist?.link || ""}
                              placeholder="Slug (URL thân thiện)"
                              className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                              required
                              data-auto-generated="false"
                            />
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">VD: nguyen-van-a</p>
                          </div>
                        </div>
                      </TabPanel>
                    )}

                    {/* Bio Tab */}
                    {!showCropper && (
                      <TabPanel value={tabValue} index={1}>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
                          <textarea
                            name="bio"
                            defaultValue={editingArtist?.bio || ""}
                            placeholder="Nhập tiểu sử của ca sĩ ở đây..."
                            className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg h-32 sm:h-40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all resize-y"
                          />
                        </div>
                      </TabPanel>
                    )}
                  </div>
                </div>

                {/* Image Cropper */}
                {showCropper && imagePreview && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">Crop Hình Ảnh</h3>
                    <div className="relative w-full h-56 sm:h-64 md:h-80 mb-3 sm:mb-4 border rounded-lg overflow-hidden bg-gray-100">
                      <Cropper
                        image={imagePreview}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={true}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    </div>
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                      <label className="text-xs sm:text-sm mr-2 whitespace-nowrap">Zoom: </label>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full mx-2 accent-gold-500"
                      />
                      <span className="text-xs sm:text-sm whitespace-nowrap">{zoom.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-end space-x-2 sm:space-x-3">
                      <button
                        type="button"
                        onClick={cancelCrop}
                        disabled={isLoading}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={applyCrop}
                        disabled={isLoading}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors flex items-center"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                        Xác nhận
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Action Buttons */}
                {!showCropper && (
                  <div>
                    <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
                      <button
                        type="button"
                        onClick={handleDialogClose}
                        disabled={isLoading}
                        className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || (imageFile && !croppedImage) || false}
                        className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg flex items-center transition-colors ${imageFile && !croppedImage
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gold-500 hover:bg-gold-600"
                          }`}
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                        {editingArtist ? "Cập nhật" : "Thêm mới"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Using our reusable NotificationSnackbar component */}
      <NotificationSnackbar
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={!!snackbarMsg}
        onClose={() => setSnackbarMsg("")}
      />

      {/* Delete Confirmation Dialog - Now using our reusable component */}
      <ConfirmationDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa ca sĩ này? Hành động này không thể hoàn tác."
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />
    </div>
  );
};

export default ArtistPage;

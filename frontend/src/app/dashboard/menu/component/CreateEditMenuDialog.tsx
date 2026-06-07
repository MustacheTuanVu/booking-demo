// /components/Menu/CreateEditMenuDialog.tsx
import React, { useState, useMemo } from "react";
import { MenuOrder, MenuItem, MenuOrderTypeEnum, Status } from "../types/menu.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faImage, faUtensils, faCoffee, faList, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getMediaUrl } from "@/utils/mediaUrl";

interface CreateEditMenuDialogProps {
  editingMenu: MenuOrder | null;
  allMenuItems: MenuItem[];
  selectedMenuItems: string[];
  handleToggleMenuItem: (id: string) => void;
  setSelectedMenuItems: (items: string[]) => void;
  handleSubmit: (formData: FormData) => Promise<void>;
  handleDialogClose: () => void;
  isLoading: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setOpenDialogMessage: React.Dispatch<React.SetStateAction<boolean>>;
  openDialogMessage: boolean;
}

const CreateEditMenuDialog: React.FC<CreateEditMenuDialogProps> = ({
  editingMenu,
  allMenuItems,
  selectedMenuItems,
  handleToggleMenuItem,
  setSelectedMenuItems,
  handleSubmit,
  handleDialogClose,
  isLoading,
  imageFile,
  imagePreview,
  handleFileChange,
  openDialogMessage,
  setOpenDialogMessage
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Live preview state
  const [previewName, setPreviewName] = useState<string>(editingMenu?.name || "Tên menu mới");
  const [previewDescription, setPreviewDescription] = useState<string>(editingMenu?.description || "Mô tả menu");
  const [previewType, setPreviewType] = useState<string>(editingMenu?.type || MenuOrderTypeEnum.COMBO);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleSubmit(formData);
  };

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const categoryMap = new Map();
    allMenuItems.forEach(item => {
      if (item.category_id && item.category_id._id) {
        categoryMap.set(item.category_id._id, item.category_id);
      }
    });
    return Array.from(categoryMap.values());
  }, [allMenuItems]);

  // Filter menu items based on search query and selected category
  const filteredItems = useMemo(() => {
    return allMenuItems.filter(item => {
      const matchesSearch = searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === 'all' ||
        (item.category_id && item.category_id._id === selectedCategoryId);
      return matchesSearch && matchesCategory;
    });
  }, [allMenuItems, searchQuery, selectedCategoryId]);

  return (
    <>
      {/* Error Dialog */}
      {openDialogMessage && (
        <StandardDialog
          open={openDialogMessage}
          onClose={() => setOpenDialogMessage(false)}
          title="Thông báo"
          maxWidth="sm"
          actions={
            <DialogActionButton
              onClick={() => setOpenDialogMessage(false)}
              variant="primary"
              className="min-h-[44px] px-6 text-base w-full sm:w-auto"
            >
              Đồng ý
            </DialogActionButton>
          }
        >
          <div className="text-center p-4">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faImage} className="text-red-500 h-6 w-6" />
              </div>
            </div>
            <p className="text-gray-700 text-base">
              Vui lòng tải ảnh thuộc các định dạng: PNG, JPG, JPEG, GIF,...
            </p>
          </div>
        </StandardDialog>
      )}

      {/* Main Dialog */}
      <StandardDialog
        open={true}
        onClose={handleDialogClose}
        disableBackdropClick={true}
        title={editingMenu ? "Cập nhật Menu" : "Thêm Menu mới"}
        maxWidth="xl"
        className="w-full max-w-screen-xl mx-auto"
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
              onClick={() => document.getElementById('menu-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              variant="primary"
              className="min-h-[44px] px-6 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingMenu ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>{editingMenu ? "Cập nhật" : "Thêm mới"}</>
              )}
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
                <FontAwesomeIcon icon={editingMenu ? faEdit : faPlus} className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{editingMenu ? "Chỉnh sửa thông tin menu" : "Tạo menu mới"}</h3>
                <p className="text-sm text-gray-500">{editingMenu ? "Cập nhật thông tin cho menu hiện có" : "Điền thông tin để tạo menu mới"}</p>
              </div>
            </div>

            <form id="menu-form" onSubmit={onSubmit} className="space-y-6">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Menu <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingMenu?.name || ""}
                          required
                          minLength={3}
                          maxLength={50}
                          placeholder="Nhập tên menu"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          onChange={(e) => setPreviewName(e.target.value || "Tên menu mới")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
                        <textarea
                          name="description"
                          defaultValue={editingMenu?.description || ""}
                          required
                          minLength={3}
                          maxLength={300}
                          placeholder="Nhập mô tả chi tiết về menu"
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          onChange={(e) => setPreviewDescription(e.target.value || "Mô tả menu")}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loại <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select
                              name="type"
                              defaultValue={editingMenu?.type || MenuOrderTypeEnum.COMBO}
                              required
                              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm appearance-none"
                              onChange={(e) => setPreviewType(e.target.value)}
                            >
                              <option value={MenuOrderTypeEnum.COMBO}>Combo</option>
                              <option value={MenuOrderTypeEnum.UPSALE}>Upsale</option>
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FontAwesomeIcon icon={faList} className="text-gray-400 h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                          <select
                            name="status"
                            defaultValue={editingMenu?.status || Status.ACTIVE}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          >
                            <option value={Status.ACTIVE}>Kích hoạt</option>
                            <option value={Status.INACTIVE}>Không kích hoạt</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image upload section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                      Hình ảnh Menu {editingMenu ? "" : <span className="text-red-500">*</span>}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        {(editingMenu?.image || imagePreview) ? (
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                            <Image
                              src={imagePreview || getMediaUrl(editingMenu?.image)}
                              alt={editingMenu?.name || "Preview"}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              priority
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200"></div>
                          </div>
                        ) : (
                          <div className="w-full aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <FontAwesomeIcon icon={faImage} className="text-gray-300 h-16 w-16" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg text-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="mb-3">
                            <FontAwesomeIcon icon={faImage} className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gold-600 mb-2">Nhấn để tải ảnh lên</p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF tối đa 10MB</p>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {!editingMenu ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                        Chọn món ăn/đồ uống
                      </h4>

                      {/* Search and filter controls */}
                      <div className="mb-4 space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400 h-4 w-4" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FontAwesomeIcon icon={faFilter} className="text-gold-500 mr-2 h-3.5 w-3.5" />
                            Lọc theo danh mục
                          </label>
                          <select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                          >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map(category => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Selected items summary */}
                      <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-md border border-gray-200">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center text-xs mr-2">
                            {selectedMenuItems.length}
                          </span>
                          Món đã chọn
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Lấy các ID món ăn đã lọc mà chưa được chọn
                              const newItemIds = filteredItems
                                .map(item => item._id)
                                .filter(id => !selectedMenuItems.includes(id));

                              // Tạo mảng mới kết hợp giữa items đã chọn và items mới
                              const updatedSelectedItems = [...selectedMenuItems, ...newItemIds];

                              // Cập nhật state với mảng mới
                              setSelectedMenuItems(updatedSelectedItems);
                            }}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Chọn tất cả
                          </button>
                          {selectedMenuItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedMenuItems([])}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto">
                          {filteredItems.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 px-4">
                              <FontAwesomeIcon icon={faUtensils} className="text-gray-300 h-10 w-10 mb-2" />
                              <p>Không tìm thấy món ăn phù hợp</p>
                              <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                              {filteredItems.map((item) => (
                                <div
                                  key={item._id}
                                  className={cn(
                                    "p-2 border rounded-md flex items-center cursor-pointer transition-all duration-200",
                                    selectedMenuItems.includes(item._id)
                                      ? 'bg-gold-50 border-gold-500 shadow-sm'
                                      : 'hover:bg-gray-50 border-gray-200'
                                  )}
                                  onClick={() => handleToggleMenuItem(item._id)}
                                >
                                  <div className="flex-shrink-0 mr-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedMenuItems.includes(item._id)}
                                      readOnly
                                      className="h-4 w-4 text-gold-500 rounded border-gray-300 focus:ring-gold-400"
                                    />
                                  </div>

                                  {item.image ? (
                                    <div className="w-10 h-10 mr-2 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                      <div className="relative w-full h-full">
                                        <Image
                                          src={getMediaUrl(item.image)}
                                          alt={item.name}
                                          className="object-cover"
                                          fill
                                          sizes="40px"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 mr-2 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                      <FontAwesomeIcon
                                        icon={item.type === 'FOOD' ? faUtensils : faCoffee}
                                        className="text-gray-400 h-4 w-4"
                                      />
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item.name}
                                    </p>
                                    <div className="flex justify-between">
                                      <p className="text-xs text-gray-500 truncate">
                                        {item.category_id?.name || "Không phân loại"}
                                      </p>
                                      <p className="text-xs font-medium text-gold-600">
                                        {item.price.toLocaleString('vi-VN')}đ
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected items preview */}
                      {selectedMenuItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FontAwesomeIcon icon={faList} className="text-gold-500 mr-2 h-3.5 w-3.5" />
                            Món đã chọn
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-md p-3 max-h-[150px] overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {selectedMenuItems.map(id => {
                                const item = allMenuItems.find(item => item._id === id);
                                if (!item) return null;
                                return (
                                  <div
                                    key={id}
                                    className="bg-gold-100 border border-gold-300 rounded-full px-3 py-1.5 text-xs flex items-center"
                                  >
                                    <span className="mr-1.5 font-medium">{item.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleMenuItem(id);
                                      }}
                                      className="text-red-500 hover:text-red-700 h-4 w-4 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                        Thông tin bổ sung
                      </h4>

                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          Bạn có thể quản lý danh sách món ăn/đồ uống sau khi cập nhật thông tin menu.
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <FontAwesomeIcon icon={faList} className="text-blue-500 h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Số món hiện tại</p>
                              <p className="text-xs text-gray-500">{selectedMenuItems.length} món đã được chọn</p>
                            </div>
                          </div>

                          <div className="text-xs text-blue-600">
                            Có thể chỉnh sửa sau
                          </div>
                        </div>
                      </div>

                      {editingMenu && editingMenu.createdAt && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                          <h5 className="text-sm font-medium text-blue-700 mb-2">Thông tin thời gian</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Ngày tạo:</span>
                              <span className="ml-2 text-gray-700">{new Date(editingMenu.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            {editingMenu.updatedAt && (
                              <div>
                                <span className="text-gray-500">Cập nhật lần cuối:</span>
                                <span className="ml-2 text-gray-700">{new Date(editingMenu.updatedAt).toLocaleString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview section - visible only on larger screens */}
                  <div className="hidden xl:block bg-gradient-to-r from-gold-50 to-white p-5 rounded-lg border border-gold-100">
                    <h4 className="font-medium text-gold-700 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">4</span>
                      Xem trước Menu
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-16 h-16 bg-gold-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          {(editingMenu?.image || imagePreview) ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={imagePreview || getMediaUrl(editingMenu?.image)}
                                alt={editingMenu?.name || "Preview"}
                                className="object-cover"
                                fill
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <FontAwesomeIcon icon={faImage} className="text-gold-500 h-8 w-8" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-800">{previewName}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {previewDescription}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {previewType}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {selectedMenuItems.length} món
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>
      </StandardDialog>
    </>
  );
};

export default CreateEditMenuDialog;

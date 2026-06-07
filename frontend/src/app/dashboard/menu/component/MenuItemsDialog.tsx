// /components/Menu/MenuItemsDialog.tsx
import React, { useMemo, useState } from "react";
import { MenuOrder, MenuItem, TypeItem, Status } from "../types/menu.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faImage, faUtensils, faCoffee, faList, faSearch, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getMediaUrl } from "@/utils/mediaUrl";

interface MenuItemsDialogProps {
  menuForItems: MenuOrder | null;
  allMenuItems: MenuItem[];
  selectedMenuItems: string[];
  handleToggleMenuItem: (id: string) => void;
  setSelectedMenuItems: (items: string[]) => void;
  handleSaveMenuItems: () => Promise<void>;
  handleItemsDialogClose: () => void;
  isLoading: boolean;
}

const MenuItemsDialog: React.FC<MenuItemsDialogProps> = ({
  menuForItems,
  allMenuItems,
  selectedMenuItems,
  handleToggleMenuItem,
  setSelectedMenuItems,
  handleSaveMenuItems,
  handleItemsDialogClose,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const filteredMenuItems = allMenuItems.filter(item => {
    const matchesSearch = searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "" || item.type === filterType;
    const matchesCategory = selectedCategoryId === 'all' ||
      (item.category_id && item.category_id._id === selectedCategoryId);
    return matchesSearch && matchesType && matchesCategory;
  });

  // Get categories from menu items
  const categories = useMemo(() => {
    const categoryMap = new Map();
    allMenuItems.forEach(item => {
      if (item.category_id && item.category_id._id) {
        categoryMap.set(item.category_id._id, item.category_id);
      }
    });
    return Array.from(categoryMap.values());
  }, [allMenuItems]);

  return (
    <StandardDialog
      open={true}
      onClose={handleItemsDialogClose}
      title={`Quản lý Món Ăn/Đồ Uống`}
      maxWidth="xl"
      className="w-full max-w-screen-xl mx-auto"
      actions={
        <>
          <DialogActionButton
            onClick={handleItemsDialogClose}
            variant="outline"
            className="min-h-[44px] px-5 text-base"
          >
            Hủy
          </DialogActionButton>
          <DialogActionButton
            onClick={handleSaveMenuItems}
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
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
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
            <FontAwesomeIcon icon={faList} className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Menu: {menuForItems?.name}</h3>
            <p className="text-sm text-gray-500">Chọn các món ăn và đồ uống cho menu này</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Filter section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                Tìm kiếm và lọc
              </h4>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm món ăn/đồ uống..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 h-4 w-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="text-gold-500 mr-2 h-3.5 w-3.5" />
                      Danh mục
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="text-gold-500 mr-2 h-3.5 w-3.5" />
                      Loại món
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                    >
                      <option value="">Tất cả loại</option>
                      <option value={TypeItem.FOOD}>Đồ ăn</option>
                      <option value={TypeItem.DRINK}>Đồ uống</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Item selection section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                Danh sách món ăn/đồ uống
              </h4>

              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div className="sticky top-0 bg-gray-100 p-3 border-b">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-4 text-left">Tên</div>
                    <div className="col-span-2 text-center">Loại</div>
                    <div className="col-span-2 text-center">Đơn vị</div>
                    <div className="col-span-3 text-right">Giá</div>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 px-4">
                      <FontAwesomeIcon icon={faUtensils} className="text-gray-300 h-10 w-10 mb-2" />
                      <p>Không tìm thấy món ăn phù hợp</p>
                      <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <div
                        key={item._id}
                        className={cn(
                          "p-3 border-b hover:bg-gray-50 cursor-pointer transition-all duration-200",
                          selectedMenuItems.includes(item._id) ? 'bg-gold-50 border-gold-500' : ''
                        )}
                        onClick={() => handleToggleMenuItem(item._id)}
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={selectedMenuItems.includes(item._id)}
                              readOnly
                              className="h-4 w-4 text-gold-500 rounded border-gray-300 focus:ring-gold-400"
                            />
                          </div>
                          <div className="col-span-4 flex items-center">
                            {item.image ? (
                              <div className="w-8 h-8 mr-2 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                <div className="relative w-full h-full">
                                  <Image
                                    src={getMediaUrl(item.image)}
                                    alt={item.name}
                                    className="object-cover"
                                    fill
                                    sizes="32px"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="w-8 h-8 mr-2 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <FontAwesomeIcon
                                  icon={item.type === TypeItem.FOOD ? faUtensils : faCoffee}
                                  className="text-gray-400 h-3.5 w-3.5"
                                />
                              </div>
                            )}
                            <div className="truncate font-medium text-sm">{item.name}</div>
                          </div>
                          <div className="col-span-2 text-center">
                            {item.type === TypeItem.FOOD ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Đồ ăn
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Đồ uống
                              </span>
                            )}
                          </div>
                          <div className="col-span-2 truncate text-center text-xs">{item.unit}</div>
                          <div className="col-span-3 text-right font-medium text-xs text-gold-600">
                            {item.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Selected items section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                  Món đã chọn ({selectedMenuItems.length})
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMenuItems(filteredMenuItems.map(item => item._id))}
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
                      Bỏ chọn tất cả
                    </button>
                  )}
                </div>
              </h4>

              {selectedMenuItems.length === 0 ? (
                <div className="bg-white rounded-md border border-gray-200 p-6 text-center">
                  <FontAwesomeIcon icon={faList} className="text-gray-300 h-10 w-10 mb-2" />
                  <p className="text-gray-500">Chưa có món nào được chọn</p>
                  <p className="text-xs text-gray-400 mt-1">Vui lòng chọn món ăn/đồ uống từ danh sách bên trái</p>
                </div>
              ) : (
                <div className="bg-white rounded-md border border-gray-200 p-3">
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedMenuItems.map(id => {
                        const item = allMenuItems.find(item => item._id === id);
                        if (!item) return null;
                        return (
                          <div
                            key={id}
                            className="bg-gold-50 border border-gold-200 rounded-md p-2 flex items-center group hover:bg-gold-100 transition-colors"
                          >
                            {item.image ? (
                              <div className="w-10 h-10 mr-2 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
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
                              <div className="w-10 h-10 mr-2 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <FontAwesomeIcon
                                  icon={item.type === TypeItem.FOOD ? faUtensils : faCoffee}
                                  className="text-gray-400 h-4 w-4"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{item.unit}</span>
                                <span className="text-xs font-medium text-gold-600">{item.price.toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMenuItem(id);
                              }}
                              className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary section */}
            <div className="bg-gradient-to-r from-gold-50 to-white p-4 rounded-lg border border-gold-100">
              <h4 className="font-medium text-gold-700 mb-3 flex items-center">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">4</span>
                Tổng quan
              </h4>

              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <FontAwesomeIcon icon={faList} className="text-gold-500 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{menuForItems?.name}</h3>
                    <p className="text-sm text-gray-500">{menuForItems?.type === 'COMBO' ? 'Combo' : 'Upsale'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                    <div className="text-sm font-medium text-blue-700 mb-1">Đồ ăn</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {selectedMenuItems.filter(id => {
                        const item = allMenuItems.find(item => item._id === id);
                        return item && item.type === TypeItem.FOOD;
                      }).length}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-md p-3 border border-green-100">
                    <div className="text-sm font-medium text-green-700 mb-1">Đồ uống</div>
                    <div className="text-2xl font-bold text-green-800">
                      {selectedMenuItems.filter(id => {
                        const item = allMenuItems.find(item => item._id === id);
                        return item && item.type === TypeItem.DRINK;
                      }).length}
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  Tổng cộng: <span className="font-bold text-gray-700">{selectedMenuItems.length}</span> món được chọn
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardDialog>
  );
};

export default MenuItemsDialog;

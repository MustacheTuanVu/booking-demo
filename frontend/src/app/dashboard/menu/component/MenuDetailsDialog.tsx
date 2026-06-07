// /components/Menu/MenuDetailsDialog.tsx
import React from "react";
import { getMediaUrl } from "@/utils/mediaUrl";
import { MenuOrder, MenuOrderTypeEnum, Status } from "../types/menu.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faImage, faUtensils, faCoffee, faList, faSearch, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MenuDetailsDialogProps {
  menuForItems: MenuOrder;
  setOpenMenuItemsDialog: (open: boolean) => void;
  handleItemsDialogClose: () => void;
}

const MenuDetailsDialog: React.FC<MenuDetailsDialogProps> = ({
  menuForItems,
  setOpenMenuItemsDialog,
  handleItemsDialogClose
}) => {
  return (
    <StandardDialog
      open={true}
      onClose={handleItemsDialogClose}
      title={`Chi tiết Menu`}
      maxWidth="xl"
      className="w-full max-w-screen-xl mx-auto"
      actions={
        <>
          <DialogActionButton
            onClick={() => setOpenMenuItemsDialog(true)}
            variant="primary"
            className="min-h-[44px] px-6 text-base"
          >
            Quản lý món ăn
          </DialogActionButton>
          <DialogActionButton
            onClick={handleItemsDialogClose}
            variant="outline"
            className="min-h-[44px] px-5 text-base"
          >
            Đóng
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
            <h3 className="text-lg font-bold text-gray-800">{menuForItems.name}</h3>
            <p className="text-sm text-gray-500">{menuForItems.type === MenuOrderTypeEnum.COMBO ? 'Combo' : 'Upsale'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Basic info section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                Thông tin cơ bản
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Loại menu:</p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {menuForItems.type === MenuOrderTypeEnum.COMBO ? 'Combo' : 'Upsale'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Trạng thái:</p>
                  <div className="flex items-center">
                    {menuForItems.status === Status.ACTIVE ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Kích hoạt
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Không kích hoạt
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Mô tả:</p>
                <p className="text-sm text-gray-700">{menuForItems.description}</p>
              </div>

              {menuForItems.createdAt && (
                <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Ngày tạo:</span>
                      <span className="ml-2 text-gray-700">{new Date(menuForItems.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {menuForItems.updatedAt && (
                      <div>
                        <span className="text-gray-500">Cập nhật lần cuối:</span>
                        <span className="ml-2 text-gray-700">{new Date(menuForItems.updatedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image section */}
            {menuForItems.image && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                  Hình ảnh
                </h4>

                <div className="bg-white p-2 rounded-md border border-gray-200">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={getMediaUrl(menuForItems.image)}
                        alt={menuForItems.name}
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Menu items section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                  Danh sách món ăn/đồ uống
                </div>

                <button
                  onClick={() => setOpenMenuItemsDialog(true)}
                  className="text-xs text-gold-600 hover:text-gold-800 font-medium flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                  Chỉnh sửa
                </button>
              </h4>

              {(!menuForItems.FOOD && !menuForItems.DRINK) || (menuForItems.items && menuForItems.items.length === 0) ? (
                <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
                  <FontAwesomeIcon icon={faUtensils} className="text-gray-300 h-10 w-10 mb-2" />
                  <p className="text-gray-500">Chưa có món ăn/đồ uống nào</p>
                  <button
                    onClick={() => setOpenMenuItemsDialog(true)}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                    Thêm món
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {menuForItems.FOOD && menuForItems.FOOD.length > 0 && (
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon icon={faUtensils} className="text-green-600 mr-2 h-3.5 w-3.5" />
                        Đồ ăn ({menuForItems.FOOD.length})
                      </h5>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {menuForItems.FOOD.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            {item.image ? (
                              <div className="h-12 w-12 mr-3 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                <div className="relative w-full h-full">
                                  <Image
                                    src={getMediaUrl(item.image)}
                                    alt={item.name}
                                    className="object-cover"
                                    fill
                                    sizes="48px"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="h-12 w-12 mr-3 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                <FontAwesomeIcon icon={faUtensils} className="text-gray-400 h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">{item.unit}</p>
                                <p className="text-xs font-medium text-gold-600">{item.price.toLocaleString('vi-VN')}đ</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menuForItems.DRINK && menuForItems.DRINK.length > 0 && (
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon icon={faCoffee} className="text-blue-600 mr-2 h-3.5 w-3.5" />
                        Đồ uống ({menuForItems.DRINK.length})
                      </h5>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {menuForItems.DRINK.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            {item.image ? (
                              <div className="h-12 w-12 mr-3 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                <div className="relative w-full h-full">
                                  <Image
                                    src={getMediaUrl(item.image)}
                                    alt={item.name}
                                    className="object-cover"
                                    fill
                                    sizes="48px"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="h-12 w-12 mr-3 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                <FontAwesomeIcon icon={faCoffee} className="text-gray-400 h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">{item.unit}</p>
                                <p className="text-xs font-medium text-gold-600">{item.price.toLocaleString('vi-VN')}đ</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-center">
                    <div className="text-sm text-blue-700 mb-2">Tổng cộng</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded-md border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Đồ ăn</div>
                        <div className="text-lg font-bold text-blue-700">{menuForItems.FOOD?.length || 0}</div>
                      </div>
                      <div className="bg-white p-2 rounded-md border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Đồ uống</div>
                        <div className="text-lg font-bold text-blue-700">{menuForItems.DRINK?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StandardDialog>
  );
};

export default MenuDetailsDialog;

// /components/Menu/MenuTable.tsx
import React from "react";
import { MenuOrder, MenuOrderTypeEnum, Status } from "../types/menu.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBarsProgress, faEdit, faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getMediaUrl } from "@/utils/mediaUrl";

interface MenuTableProps {
  menus: MenuOrder[];
  isLoading: boolean;
  total: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  handleEdit: (menu: MenuOrder) => void;
  handleManageMenuItems: (menu: MenuOrder) => void;
  handleDelete: (id: string) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({
  menus,
  isLoading,
  total,
  page,
  setPage,
  limit,
  setLimit,
  handleEdit,
  handleManageMenuItems,
  handleDelete
}) => {
  return (
    <>
      <div className="flex items-center text-red-500 text-xs xl:hidden z-10 my-2 animate-pulse opacity-500">
        <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 animate-pulse" />
        <span className="ml-1">Kéo sang phải để xem thêm</span>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-center">STT</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Hình ảnh</th>
                <th className="py-3 px-4 text-center">Tên</th>
                <th className="py-3 px-4 text-center">Mô tả</th>
                <th className="py-3 px-4 text-center">Loại</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                menus.map((menu, index) => (
                  <tr key={menu._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">{index + 1}</td>
                    <td className="py-3 px-4 w-20 text-center">
                      {menu.image ? (
                        <div className="w-20 h-20 relative rounded overflow-hidden">
                          <img
                            src={getMediaUrl(menu.image)}
                            alt={menu.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold">{menu.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{menu.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {menu.type === MenuOrderTypeEnum.COMBO ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Combo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Upsale
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {menu.status === Status.ACTIVE ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Không kích hoạt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2 justify-center items-center">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                          title="Chỉnh sửa"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleManageMenuItems(menu)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                          title="Quản lý menu"
                        >
                          <FontAwesomeIcon icon={faBarsProgress} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu._id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                          title="Xóa"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="my-4 flex justify-between items-center">
        <div>
          Hiển thị {menus.length} / {total} kết quả
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1 || isLoading}
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2">
            Trang {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / limit) || isLoading}
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuTable;

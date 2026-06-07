import React from 'react';
import { ComboEventType, MenuType } from '../page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import ActionButtonsGroup from '@/components/Dashboard/ui/ActionButtonsGroup';

interface ComboEventTableProps {
  loading: boolean;
  combos: ComboEventType[];
  total: number;
  page: number;
  limit: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleEdit: (combo: ComboEventType) => void;
  handleDelete: (combo: ComboEventType) => void;
}

const getStatusLabel = (status: string) => {
  return status === 'ACTIVE' ? 'Kích hoạt' : 'Không kích hoạt';
};

const ComboEventTable: React.FC<ComboEventTableProps> = ({
  loading,
  combos,
  total,
  page,
  limit,
  setPage,
  handleEdit,
  handleDelete
}) => {
  // Loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  // Empty state
  if (!loading && combos.length === 0) {
    return (
      <div className="bg-gray-100 p-8 text-center rounded-lg">
        <p className="text-gray-600">Không có dữ liệu. Hãy thêm combo mới!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full border-collapse table-fixed md:table-auto">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-12 sm:w-14">STT</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left min-w-[140px] sm:min-w-[180px]">Tên</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Ghế</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Món ăn</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Đồ uống</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-right min-w-[90px] sm:min-w-[100px]">Giá bán</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-right min-w-[90px] sm:min-w-[100px]">Giá gốc</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center min-w-[100px] sm:min-w-[120px]">Menu</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Trạng thái</th>
              <th className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center w-[80px] sm:w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {combos.map((combo, index) => (
              <tr key={combo._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{index + 1}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="font-medium text-gray-900 text-sm">{combo.name}</div>
                  {combo.is_show_upsell !== false && (
                    <div className="text-xs text-green-600 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Upsell
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{combo.size_seat}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{combo.size_food}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm">{combo.size_drink}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-xs sm:text-sm">
                  {combo.price.toLocaleString()} đ
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-500">
                  {combo.price_origin.toLocaleString()} đ
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm">
                  {combo.MenuOrder?.name || "N/A"}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${combo.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {getStatusLabel(combo.status)}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex justify-center">
                    <ActionButtonsGroup
                      onEdit={() => handleEdit(combo)}
                      onDelete={() => handleDelete(combo)}
                      showView={false}
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
  );
};

export default ComboEventTable;
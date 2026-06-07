import React from 'react';
import { ComboEventType, MenuType } from '../page';

interface ComboEventDialogProps {
  open: boolean;
  editingCombo: ComboEventType | null;
  menus: MenuType[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDialogClose: () => void;
}

const ComboEventDialog: React.FC<ComboEventDialogProps> = ({
  open,
  editingCombo,
  menus,
  handleSubmit,
  handleDialogClose
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-11/12 md:w-1/2 p-4">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={() => handleDialogClose()}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {editingCombo ? "Cập nhật Combo" : "Thêm Combo"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Combo</label>
            <input
              type="text"
              name="name"
              defaultValue={editingCombo?.name || ""}
              placeholder="Tên combo"
              className="w-full p-2 border border-gray-300 rounded"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng ghế</label>
              <input
                type="number"
                name="size_seat"
                defaultValue={editingCombo?.size_seat || 1}
                min="1"
                placeholder="Số lượng ghế"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
              <input
                type="number"
                name="price"
                defaultValue={editingCombo?.price || 0}
                min="0"
                placeholder="Giá Bán"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
              <input
                type="number"
                name="price_origin"
                defaultValue={editingCombo?.price_origin || 0}
                min="0"
                placeholder="Giá gốc"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng món ăn</label>
              <input
                type="number"
                name="size_food"
                defaultValue={editingCombo?.size_food || 0}
                min="0"
                placeholder="Số lượng món ăn"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng đồ uống</label>
              <input
                type="number"
                name="size_drink"
                defaultValue={editingCombo?.size_drink || 0}
                min="0"
                placeholder="Số lượng đồ uống"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Menu</label>
              <select
                name="menu_id"
                defaultValue={editingCombo?.menu_id || ""}
                className="w-full p-2 border border-gray-300 rounded"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Hiển thị Upsell</label>
              <select
                name="is_show_upsell"
                defaultValue={editingCombo?.is_show_upsell !== false ? "true" : "false"}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="true">Có</option>
                <option value="false">Không</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                defaultValue={editingCombo?.status || 'ACTIVE'}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value={'ACTIVE'}>Kích hoạt</option>
                <option value={'INACTIVE'}>Không kích hoạt</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
            >
              {editingCombo ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={handleDialogClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComboEventDialog;
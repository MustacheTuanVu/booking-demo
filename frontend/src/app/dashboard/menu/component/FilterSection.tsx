// /components/Menu/FilterSection.tsx
import React from "react";
import { MenuOrderTypeEnum, Status } from "../types/menu.types";

interface FilterSectionProps {
  filterQuery: string;
  setFilterQuery: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  orderBy: string;
  setOrderBy: (value: string) => void;
  handleApplySearch: (e: React.FormEvent) => void;
  handleResetFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filterQuery,
  setFilterQuery,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  orderBy,
  setOrderBy,
  handleApplySearch,
  handleResetFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Bộ lọc dữ liệu</h2>
      <form onSubmit={handleApplySearch}>
        <div className="grid grid-cols-1 xl:grid-cols-4 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Tên menu..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Tất cả</option>
              <option value={MenuOrderTypeEnum.COMBO}>Combo</option>
              <option value={MenuOrderTypeEnum.UPSALE}>Upsale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Tất cả</option>
              <option value={Status.ACTIVE}>Kích hoạt</option>
              <option value={Status.INACTIVE}>Không kích hoạt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sắp xếp theo</label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
              <option value="name:asc">Tên A-Z</option>
              <option value="name:desc">Tên Z-A</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end mx-auto">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
          >
            Tìm kiếm
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterSection;
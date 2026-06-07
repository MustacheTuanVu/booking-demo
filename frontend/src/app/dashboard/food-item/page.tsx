"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";

interface FoodItemType {
  _id: string;
  name: string;
  desc: string;
  price: number;
  ingredients: string;
  alcohol_level?: number;  
  sourness_level?: number;
  sweetness_level?: number;
  drinkability_level?: number;
  image_url?: string;
  status: string;
}

interface FoodItemResponse {
  foodItems: FoodItemType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const FoodItemPage: React.FC = () => {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItemType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [openUpdateImageDialog, setOpenUpdateImageDialog] = useState(false);
  const [updatingFoodItem, setUpdatingFoodItem] = useState<FoodItemType | null>(null);

  // Fetch food items
  const fetchFoodItems = async () => {
    try {
      const res = await api.get(
        `food-item/GetMany?page=${page + 1}&limit=${limit}`
      );
      const data: FoodItemResponse = res.data;
      setFoodItems(data.foodItems);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching food items", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [page, limit]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingFoodItem(null);
    setImageFile(null);
  };

  // Handle form submission for creating/updating a food item
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as any;
    const foodItemData = {
      name: form.name.value,
      desc: form.desc.value,
      price: Number(form.price.value),
      ingredients: form.ingredients.value,
      alcohol_level: Number(form.alcohol_level.value || 0),
      sourness_level: Number(form.sourness_level.value || 0),
      sweetness_level: Number(form.sweetness_level.value || 0),
      drinkability_level: Number(form.drinkability_level.value || 0),
      status: form.status.value,
    };

    try {
      if (editingFoodItem) {
        await api.put(`food-item/Update?id=${editingFoodItem._id}`, foodItemData);
        
        // If we also have an image to upload
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          await api.post(`food-item/UpdateImage?foodItemId=${editingFoodItem._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        
        setSnackbarMsg("Món ăn đã được cập nhật thành công!");
      } else {
        const response = await api.post("food-item/Create", foodItemData);
        
        // If we have an image to upload
        if (imageFile && response.data && response.data._id) {
          const formData = new FormData();
          formData.append("file", imageFile);
          await api.post(`food-item/UpdateImage?foodItemId=${response.data._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        
        setSnackbarMsg("Món ăn đã được tạo thành công!");
      }
      handleDialogClose();
      fetchFoodItems();
    } catch (error) {
      console.error("Error saving food item", error);
      setSnackbarMsg("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleEdit = (foodItem: FoodItemType) => {
    setEditingFoodItem(foodItem);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
      try {
        await api.delete(`food-item/Delete?id=${id}`);
        setSnackbarMsg("Món ăn đã được xóa thành công!");
        fetchFoodItems();
      } catch (error) {
        console.error("Error deleting food item", error);
        setSnackbarMsg("Có lỗi xảy ra khi xóa món ăn!");
      }
    }
  };

  // Handle file change for image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle updating image separately
  const handleOpenUpdateImage = (foodItem: FoodItemType) => {
    setUpdatingFoodItem(foodItem);
    setOpenUpdateImageDialog(true);
  };

  const handleUpdateImage = async () => {
    if (!updatingFoodItem || !imageFile) return;
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      await api.post(`food-item/UpdateImage?foodItemId=${updatingFoodItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnackbarMsg("Cập nhật hình ảnh thành công!");
      setOpenUpdateImageDialog(false);
      setUpdatingFoodItem(null);
      setImageFile(null);
      fetchFoodItems();
    } catch (error) {
      console.error("Error updating image", error);
      setSnackbarMsg("Cập nhật hình ảnh thất bại!");
    }
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-4">
          <DashboardSidebar />
        </div>
        
        {/* Main content */}
        <div className="col-span-1 md:col-span-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Quản lý Món ăn</h1>
            <button
              onClick={() => setOpenDialog(true)}
              className="mt-4 md:mt-0 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
            >
              Thêm Món ăn
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-100 rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 border">Tên</th>
                  <th className="py-2 px-4 border">Mô tả</th>
                  <th className="py-2 px-4 border">Giá</th>
                  <th className="py-2 px-4 border">Thành phần</th>
                  <th className="py-2 px-4 border">Trạng thái</th>
                  <th className="py-2 px-4 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((foodItem) => (
                  <tr key={foodItem._id} className="border-b">
                    <td className="py-2 px-4">{foodItem.name}</td>
                    <td className="py-2 px-4">{foodItem.desc}</td>
                    <td className="py-2 px-4">{foodItem.price.toLocaleString()} đ</td>
                    <td className="py-2 px-4">{foodItem.ingredients}</td>
                    <td className="py-2 px-4">
                      {foodItem.status === 'ACTIVE' ? 'Kích hoạt' : 'Không kích hoạt'}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(foodItem)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h6a2 2 0 012 2v6M4 13v6a2 2 0 002 2h6m-3-3h.01" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(foodItem._id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenUpdateImage(foodItem)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m0 4v12m0-12H3m6 0h6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-70"
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((prev) => (foodItems.length < limit ? prev : prev + 1))}
              disabled={foodItems.length < limit}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-70"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingFoodItem ? "Cập nhật Món ăn" : "Thêm Món ăn"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                defaultValue={editingFoodItem?.name || ""}
                placeholder="Tên món ăn"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <textarea
                name="desc"
                defaultValue={editingFoodItem?.desc || ""}
                placeholder="Mô tả"
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
              <input
                type="number"
                name="price"
                defaultValue={editingFoodItem?.price || 0}
                placeholder="Giá"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <textarea
                name="ingredients"
                defaultValue={editingFoodItem?.ingredients || ""}
                placeholder="Thành phần"
                className="w-full p-2 border border-gray-300 rounded"
                rows={2}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nồng độ cồn (0-10)</label>
                  <input
                    type="number"
                    name="alcohol_level"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={editingFoodItem?.alcohol_level || 0}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Độ chua (0-10)</label>
                  <input
                    type="number"
                    name="sourness_level"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={editingFoodItem?.sourness_level || 0}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Độ ngọt (0-10)</label>
                  <input
                    type="number"
                    name="sweetness_level"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={editingFoodItem?.sweetness_level || 0}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Độ dễ uống (0-10)</label>
                  <input
                    type="number"
                    name="drinkability_level"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={editingFoodItem?.drinkability_level || 0}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <select
                name="status"
                defaultValue={editingFoodItem?.status || "ACTIVE"}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="ACTIVE">Kích hoạt</option>
                <option value="INACTIVE">Không kích hoạt</option>
              </select>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Hình ảnh Món ăn</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  accept="image/*"
                />
                {imageFile && (
                  <p className="mt-2 text-sm text-gray-500">File đã chọn: {imageFile.name}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handleDialogClose}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
                >
                  {editingFoodItem ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Update Dialog */}
      {openUpdateImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-4">
            <h2 className="text-xl font-bold mb-4">Cập nhật hình ảnh Món ăn</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn hình ảnh mới
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full p-2 border border-gray-300 rounded"
                accept="image/*"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-gray-500">File đã chọn: {imageFile.name}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setOpenUpdateImageDialog(false);
                  setUpdatingFoodItem(null);
                  setImageFile(null);
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateImage}
                disabled={!imageFile}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded disabled:opacity-70"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbarMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-2 rounded shadow-lg flex items-center">
          <span>{snackbarMsg}</span>
          <button
            onClick={() => setSnackbarMsg("")}
            className="ml-2 text-sm underline"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodItemPage;
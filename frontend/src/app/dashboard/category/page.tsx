"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import api from "@/utils/api";

interface CategoryType {
  _id: string;
  name: string;
  image_url?: string;
  food_items?: FoodItemType[];
}

interface FoodItemType {
  _id: string;
  name: string;
}

interface CategoryResponse {
  categories: CategoryType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [allFoodItems, setAllFoodItems] = useState<FoodItemType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);

  // State for food item dialog
  const [openFoodItemsDialog, setOpenFoodItemsDialog] = useState<boolean>(false);
  const [categoryForFoodItems, setCategoryForFoodItems] = useState<CategoryType | null>(null);

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [openUpdateImageDialog, setOpenUpdateImageDialog] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState<CategoryType | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get(
        `category/GetMany?page=${page + 1}&limit=${limit}`
      );
      const data: CategoryResponse = res.data;
      setCategories(data.categories);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Fetch all food items for selection
  const fetchAllFoodItems = async () => {
    try {
      const res = await api.get("food-item/GetMany?limit=100");
      setAllFoodItems(res.data.foodItems);
    } catch (error) {
      console.error("Error fetching food items", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllFoodItems();
  }, [page, limit]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setImageFile(null);
  };

  // Handle form submission for creating/updating a category
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as any;
    const categoryData = {
      name: form.name.value,
    };

    try {
      if (editingCategory) {
        await api.put(`category/Update?id=${editingCategory._id}`, categoryData);

        // If we also have an image to upload
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          await api.post(`category/UpdateImage?categoryId=${editingCategory._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        setSnackbarMsg("Danh mục đã được cập nhật thành công!");
      } else {
        const response = await api.post("category/Create", categoryData);

        // If we have an image to upload
        if (imageFile && response.data && response.data._id) {
          const formData = new FormData();
          formData.append("file", imageFile);
          await api.post(`category/UpdateImage?categoryId=${response.data._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        setSnackbarMsg("Danh mục đã được tạo thành công!");
      }
      handleDialogClose();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category", error);
      setSnackbarMsg("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleEdit = (category: CategoryType) => {
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await api.delete(`category/Delete?id=${id}`);
        setSnackbarMsg("Danh mục đã được xóa thành công!");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
        setSnackbarMsg("Có lỗi xảy ra khi xóa danh mục!");
      }
    }
  };

  // Handle file change for image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Open dialog to manage food items for a category
  const handleManageFoodItems = (category: CategoryType) => {
    setCategoryForFoodItems(category);
    // Initialize selected food items from the current category
    setSelectedFoodItems(category.food_items?.map(item => item._id) || []);
    setOpenFoodItemsDialog(true);
  };

  // Handle toggle of food item selection
  const handleToggleFoodItem = (foodItemId: string) => {
    setSelectedFoodItems(prev => {
      if (prev.includes(foodItemId)) {
        return prev.filter(id => id !== foodItemId);
      } else {
        return [...prev, foodItemId];
      }
    });
  };

  // Save the selected food items to the category
  const handleSaveFoodItems = async () => {
    if (!categoryForFoodItems) return;

    try {
      await api.put(`category/UpdateFoodItems?categoryId=${categoryForFoodItems._id}`, {
        foodItemIds: selectedFoodItems
      });
      setSnackbarMsg("Danh sách món ăn đã được cập nhật!");
      setOpenFoodItemsDialog(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating food items", error);
      setSnackbarMsg("Có lỗi xảy ra khi cập nhật danh sách món ăn!");
    }
  };

  // Handle updating image separately
  const handleOpenUpdateImage = (category: CategoryType) => {
    setUpdatingCategory(category);
    setOpenUpdateImageDialog(true);
  };

  const handleUpdateImage = async () => {
    if (!updatingCategory || !imageFile) return;
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      await api.post(`category/UpdateImage?categoryId=${updatingCategory._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnackbarMsg("Cập nhật hình ảnh thành công!");
      setOpenUpdateImageDialog(false);
      setUpdatingCategory(null);
      setImageFile(null);
      fetchCategories();
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
            <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
            <button
              onClick={() => setOpenDialog(true)}
              className="mt-4 md:mt-0 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
            >
              Thêm Danh mục
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-100 rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 border">Tên</th>
                  <th className="py-2 px-4 border">Số món ăn</th>
                  <th className="py-2 px-4 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b">
                    <td className="py-2 px-4">{category.name}</td>
                    <td className="py-2 px-4">{category.food_items?.length || 0}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h6a2 2 0 012 2v6M4 13v6a2 2 0 002 2h6m-3-3h.01" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenUpdateImage(category)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m0 4v12m0-12H3m6 0h6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleManageFoodItems(category)}
                          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
              onClick={() => setPage((prev) => (categories.length < limit ? prev : prev + 1))}
              disabled={categories.length < limit}
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
          <div className="relative bg-white rounded-lg w-11/12 md:w-1/2 p-4">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => handleDialogClose()}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? "Cập nhật Danh mục" : "Thêm Danh mục"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                defaultValue={editingCategory?.name || ""}
                placeholder="Tên danh mục"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Hình ảnh Danh mục</label>
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
                  type="submit"
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
                >
                  {editingCategory ? "Cập nhật" : "Thêm mới"}
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
      )}

      {/* Food Items Dialog */}
      {openFoodItemsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Quản lý món ăn cho danh mục: {categoryForFoodItems?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {allFoodItems.map((foodItem) => (
                <div
                  key={foodItem._id}
                  className={`border p-3 rounded-lg cursor-pointer ${selectedFoodItems.includes(foodItem._id)
                      ? 'bg-gold-100 border-gold-500'
                      : 'bg-white'
                    }`}
                  onClick={() => handleToggleFoodItem(foodItem._id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFoodItems.includes(foodItem._id)}
                      onChange={() => { }}
                      className="mr-2"
                    />
                    <span>{foodItem.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p>Đã chọn {selectedFoodItems.length} món ăn</p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setOpenFoodItemsDialog(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveFoodItems}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Update Dialog */}
      {openUpdateImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-4">
            <h2 className="text-xl font-bold mb-4">Cập nhật hình ảnh Danh mục</h2>
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
                  setUpdatingCategory(null);
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

export default CategoryPage;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"; // Khai báo component chạy ở phía client

// Import các thành phần, thư viện cần thiết
import { AppContext } from "@/context/AppContext";
import api from "@/utils/api";
import { Box, Button, Card, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
// Import SeatSelection with discount code functionality
import DrinksMenu from "@/components/booking/DrinksMenu";

// Component chính hiển thị bản đồ ghế và các dialog liên quan đặt vé
export default function UpdateDrink({eventSelected, seteventSelected}:any) {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(eventSelected ? true : false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tempSeatCount, setTempSeatCount] = useState<{ [key: string]: number }>({});
  const [dialogCombos, setDialogCombos] = useState<{ id: string, show: boolean, combo: any }[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [comboId: string]: { food: any[], drink: any[] } }>({});
  const totalSeatsInCombos = dialogCombos.reduce((total, dialog) => total + dialog.combo.size_seat, 0);
  const [seatQuantities, setSeatQuantities] = useState<any>({
    J: "",
    Q: "",
    K: "",
  });

  const [stepChoiceItem, setStepChoiceItem] = useState('DRINK');

  const totalSeatsSelected: number = Object.values(seatQuantities).reduce(
    (sum: number, value: unknown) => sum + Number(value as string | number),
    0
  );

  const handleDialogClose = () => {
    seteventSelected(null)
    setOpenDialog(false);
  };

  // Khởi tạo danh sách combos
  useEffect(() => {
    if (eventSelected && eventSelected.combos && eventSelected.quantities) {
      // Tìm tất cả combo có trong quantities
      const combosToShow: { id: string, combo: any }[] = [];

      // Lặp qua tất cả các combo trong quantities
      Object.keys(eventSelected.quantities).forEach(key => {
        // Phân tách key để lấy thông tin combo ID (format: "eventId-comboId")
        const parts = key.split('-');
        if (parts.length === 2) {
          const comboId = parts[1];
          // Tìm combo tương ứng trong danh sách combos
          const combo = eventSelected.combos.find((c: any) => c._id === comboId);

          if (combo) {
            // Thêm combo vào số lần tương ứng với số lượng
            const count = eventSelected.quantities[key];
            for (let i = 0; i < count; i++) {
              combosToShow.push({
                id: `${key}-${i}`, // Tạo ID duy nhất cho mỗi combo
                combo: combo
              });
            }
          }
        }
      });

      // Khởi tạo trạng thái dialog cho mỗi combo
      const dialogStates = combosToShow.map(item => ({
        id: item.id,
        show: false,
        combo: item.combo
      }));

      setDialogCombos(dialogStates);
    }
  }, [eventSelected]);

  const handleOpenComboDialog = (index: number) => {
    if (index >= dialogCombos.length) {
      // Nếu đã xử lý hết tất cả combo, mở dialog đồ uống trả phí
    } else {
      // Cập nhật state để hiển thị dialog cho combo tại index
      setDialogCombos(prevState =>
        prevState.map((item, i) =>
          i === index ? { ...item, show: true } : item
        )
      );
    }
  };

  const handleCloseComboDialog = (index: number) => {
    setDialogCombos(prevState =>
      prevState.map((item, i) =>
        i === index ? { ...item, show: false } : item
      )
    );
  };


  // Hàm lấy chi tiết sự kiện và danh sách combo đồ uống từ API
  const getEventDetails = async () => {

    // Gọi API lấy danh sách menu (combo đồ uống)
    const menuItemsResponse = await api.get('/menu_item/GetMyMenuItem');
  };

  // Gọi hàm getEventDetails ngay khi component được mount
  useEffect(() => {
    console.log('eventSelected', eventSelected);
    getEventDetails();
  }, []);

  // State lưu hóa đơn (bill) sau khi tạo order thành công
  const [bill, setBill] = useState<any>(null);

  // Hàm xử lý khi người dùng chọn combo đồ uống miễn phí
  const handleComboSelection = (comboId: string, quantities: { [itemId: string]: number }) => {
    const selectedFood: any[] = [];
    const selectedDrink: any[] = [];

    // Lấy combo hiện tại
    const currentCombo = dialogCombos.find(item => item.id === comboId)?.combo;
    if (!currentCombo) return;

    // Lặp qua số lượng món đã chọn
    Object.keys(quantities).forEach(itemId => {
      const quantity = quantities[itemId];
      if (quantity > 0) {
        const foodItem = currentCombo.MenuOrder.FOOD.find((f: any) => f._id === itemId);
        const drinkItem = currentCombo.MenuOrder.DRINK.find((d: any) => d._id === itemId);

        if (foodItem) {
          selectedFood.push({ ...foodItem, quantity });
        }
        if (drinkItem) {
          selectedDrink.push({ ...drinkItem, quantity });
        }
      }
    });

    // Cập nhật danh sách món đã chọn
    setSelectedItems(prev => ({
      ...prev,
      [comboId]: { food: selectedFood, drink: selectedDrink }
    }));

    // Đóng dialog
    const currentIndex = dialogCombos.findIndex(item => item.id === comboId);
    handleCloseComboDialog(currentIndex);
  };
  const allCombosSelected = dialogCombos.every(dialog => {
    const selected = selectedItems[dialog.id];
    return (
      selected &&
      selected.food.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_food &&
      selected.drink.reduce((sum, item) => sum + item.quantity, 0) === dialog.combo.size_drink
    );
  });
  // Hàm xử lý khi người dùng muốn quay lại dialog trước
  const handleBackDialog = () => {

    // Tìm dialog combo đang mở
    const currentIndex = dialogCombos.findIndex(dialog => dialog.show);
    if (currentIndex > 0) {
      // Đóng dialog hiện tại
      handleCloseComboDialog(currentIndex);
      // Mở lại dialog trước đó
      handleOpenComboDialog(currentIndex - 1);
    }
  };

  // Thêm hàm handleSaveChanges trong component UpdateDrink
const handleSaveChanges = async () => {
    try {
      // Chuẩn bị dữ liệu để gửi đến API
      const requestData = {
        combo_info: dialogCombos.map(dialog => {
          // Lấy thông tin đã chọn cho combo này
          const selected = selectedItems[dialog.id] || { food: [], drink: [] };
          
          // Kết hợp các món ăn và đồ uống thành một mảng items
          const items = [
            ...selected.food,
            ...selected.drink
          ].map(item => ({
            itemId: item._id,
            quantity: item.quantity,
            name: item.name,
            desc: item.desc,
            ingredient: item.ingredient,
            type: item.type,
            unit: item.unit,
            price: item.price,
            code_cukcuk: item.code_cukcuk,
            item_id_cukcuk: item.item_id_cukcuk,
            item_name_cukcuk: item.item_name_cukcuk
          }));
  
          return {
            comboId: dialog.combo._id,
            name: dialog.combo.name,
            price: dialog.combo.price,
            size_seat: dialog.combo.size_seat,
            size_food: dialog.combo.size_food,
            size_drink: dialog.combo.size_drink,
            items: items
          };
        })
      };
  
      // Gọi API để cập nhật chi tiết đơn hàng
      const response = await api.post(`/order_detail/UpdateOrderDetail?orderId=${eventSelected.id}`, requestData);
      
      if (response.status === 200) {
        // Hiển thị thông báo thành công
        alert("Cập nhật thành công!");
        // Đóng dialog
        handleDialogClose();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin đồ uống:", error);
      alert("Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
        // display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--clr-bg)",
      }}
    >
      <div>
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative bg-white rounded-lg w-full lg:w-1/2 max-w-2xl p-4 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row justify-between md:justify-center items-center relative rounded-lg bg-gradient-to-r from-gold-100 to-white p-4 shadow-md">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold-700 text-center md:text-left pr-10">
                  Hãy chọn món yêu thích ngay thôi nào
                </h2>
                <button
                  className="absolute top-6 right-4 text-gray-600 hover:text-gray-900"
                  onClick={() => handleDialogClose()}
                >
                  ✕
                </button>
              </div>
              {dialogCombos.map((dialog, index) => (
                <Card key={dialog.id} sx={{ p: 2, my: 2, borderRadius: 2, boxShadow: 3 }}>
                  <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                    <Typography variant="h6" fontWeight="bold">{dialog.combo.name}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Chọn <span style={{ fontWeight: "bold" }}>{dialog.combo.size_food} món ăn</span> và <span style={{ fontWeight: "bold" }}>{dialog.combo.size_drink} đồ uống</span>
                    </Typography>
                  </Box>
                  {selectedItems[dialog.id] && (
                    <Box sx={{ mt: 1 }}>
                      {selectedItems[dialog.id].food.length > 0 && (
                        <Typography variant="body1" color="textSecondary" mb={1}>
                          🥗 Món ăn: {selectedItems[dialog.id].food.map(item => `${item.name} (${item.quantity})`).join(", ")}
                        </Typography>
                      )}
                      {selectedItems[dialog.id].drink.length > 0 && (
                        <Typography variant="body1" color="textSecondary" mb={1}>
                          🍹 Đồ uống: {selectedItems[dialog.id].drink.map(item => `${item.name} (${item.quantity})`).join(", ")}
                        </Typography>
                      )}
                    </Box>
                  )}
                  <Box display="flex" justifyContent="center">
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        cursor: "pointer",
                        marginTop: 2,
                        border: "1px solid var(--clr-bg-1)",
                        borderRadius: "99999px",
                        color: "#fff",
                        backgroundColor: "var(--clr-bg-1)",
                        textTransform: "none",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "var(--clr-bg-7)",
                          color: "#fff",
                        },
                      }}
                      onClick={() => handleOpenComboDialog(index)}
                    >
                      Chọn món
                    </Button>
                  </Box>
                </Card>
              ))}
              {allCombosSelected && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSaveChanges}
                    sx={{
                      cursor: "pointer",
                      width: "80%",
                      marginTop: 2,
                      borderRadius: "99999px",
                      backgroundColor: "var(--clr-bg-1)",
                      textTransform: "none",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "var(--clr-bg-7)",
                        color: "#fff",
                      },
                    }}
                  >
                    Tiếp tục &rarr;
                  </Button>
                </Box>
              )}
            </div>
          </div>
        )}
      </div>

      {dialogCombos.map((dialog, index) => (
        <DrinksMenu
          key={dialog.id}
          onOpen={dialog.show}
          onClose={() => handleCloseComboDialog(index)}
          menuItems={[]} // Không sử dụng menuItems nữa
          comboMenuOrder={dialog.combo.MenuOrder} // Sử dụng MenuOrder từ combo
          freeDrinkLimit={dialog.combo.size_drink} // Lấy giới hạn đồ uống từ combo
          freeFoodLimit={dialog.combo.size_food}
          onConfirm={(quantities: any) => handleComboSelection(dialog.id, quantities)}
          title={`Hãy chọn món yêu thích ngay thôi nào`}
          isCombo={true}
          onBack={index > 0 ? handleBackDialog : undefined}
          stepChoiceItem={stepChoiceItem}
          setStepChoiceItem={setStepChoiceItem}
        />
      ))}

    </Box >
  );
}
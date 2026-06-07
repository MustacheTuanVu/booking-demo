/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface MyDialogProps {
  open: boolean;
  handleClose: () => void;
  menuItems: any;
  quantities: any;
  setQuantities: any;
  handleCreateOrder: any;
}

interface Quantities {
  [comboId: number]: number;
}

export default function SelectCombo({
  open,
  handleClose,
  menuItems,
  quantities,
  setQuantities,
  handleCreateOrder,
}: MyDialogProps) {
  // Khởi tạo số lượng cho từng combo khi component mount hoặc menuItems thay đổi
  useEffect(() => {
    const initialQuantities: Quantities = {};
    menuItems.forEach((combo: any) => {
      initialQuantities[combo._id] = 0;
    });
    setQuantities(initialQuantities);
  }, [menuItems, setQuantities]);

  // Tính tổng tiền với ưu đãi: miễn phí 1 món đầu tiên có số lượng > 0
  let freeApplied = false;
  const totalPrice = menuItems.reduce((sum: number, combo: any) => {
    const qty = quantities[combo._id] || 0;
    if (!freeApplied && qty > 0) {
      sum += combo.price * (qty - 1);
      freeApplied = true;
    } else {
      sum += combo.price * qty;
    }
    return sum;
  }, 0);

  // Hàm tăng/giảm số lượng
  const incrementQty = (id: number) => {
    setQuantities((prev: any) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrementQty = (id: number) => {
    setQuantities((prev: any) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { borderRadius: 3, p: 2 },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
        Bạn được miễn phí một món đồ uống
      </DialogTitle>
      <DialogContent dividers>
        {menuItems.map((combo: any) => {
          const qty = quantities[combo._id] || 0;
          return (
            <Box
              key={combo._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {combo.image && (
                <Box
                  component="img"
                  src={combo.image}
                  alt={combo.name}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mr: 2,
                  }}
                />
              )}
              <Box flex={1}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {combo.name} - {combo.price.toLocaleString()}đ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {combo.desc}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <IconButton
                    onClick={() => decrementQty(combo._id)}
                    sx={{ border: '1px solid', borderColor: 'grey.400', mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faMinus} style={{ fontSize: 12 }} />
                  </IconButton>
                  <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                    {qty}
                  </Typography>
                  <IconButton
                    onClick={() => incrementQty(combo._id)}
                    sx={{ border: '1px solid', borderColor: 'grey.400', ml: 1 }}
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Tổng cộng
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {totalPrice.toLocaleString()}đ
          </Typography>
        </Box>
        <Button
          onClick={() => {
            handleCreateOrder();
            handleClose();
          }}
          variant="contained"
          sx={{
            width: '100%',
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}

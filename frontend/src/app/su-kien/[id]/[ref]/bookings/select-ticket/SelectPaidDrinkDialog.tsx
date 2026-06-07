import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface PaidDrinkDialogProps {
  open: boolean;
  handleClose: () => void;
  menuItems: any[];
  onConfirm: (paidQuantities: { [key: string]: number }) => void;
}

export default function SelectPaidDrinkDialog({
  open,
  handleClose,
  menuItems,
  onConfirm,
}: PaidDrinkDialogProps) {
  // Khởi tạo state cho số lượng đồ uống trả phí
  const [paidQuantities, setPaidQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const initial: { [key: string]: number } = {};
    menuItems.forEach((item) => {
      initial[item._id] = 0;
    });
    setPaidQuantities(initial);
  }, [menuItems]);

  const increment = (id: string) => {
    setPaidQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id: string) => {
    setPaidQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  // Tính tổng tiền
  const totalPrice = menuItems.reduce((sum, item) => {
    const qty = paidQuantities[item._id] || 0;
    return sum + item.price * qty;
  }, 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: 'white', // Nền dialog trắng
          borderRadius: 2,
          boxShadow: 'none',
          p: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          mb: 2,
          fontSize: 18,
          color: '#000', // Màu chữ đen
        }}
      >
        UPSELL
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'white', p: 2 }}>
        {menuItems.map((item) => {
          const qty = paidQuantities[item._id] || 0;
          return (
            <Box
              key={item._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: '#ddd',
                borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              {item.image && (
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                  {item.name} - {item.price.toLocaleString()}đ
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', opacity: 0.8 }}>
                  {item.desc}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <IconButton
                    onClick={() => decrement(item._id)}
                    sx={{
                      border: '1px solid',
                      borderColor: '#ddd',
                      mr: 1,
                      color: '#000',
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} style={{ fontSize: 12 }} />
                  </IconButton>
                  <Typography
                    sx={{
                      minWidth: 30,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#000',
                    }}
                  >
                    {qty}
                  </Typography>
                  <IconButton
                    onClick={() => increment(item._id)}
                    sx={{
                      border: '1px solid',
                      borderColor: '#ddd',
                      ml: 1,
                      color: '#000',
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          );
        })}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000' }}>
            Tổng cộng
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000' }}>
            {totalPrice.toLocaleString()}đ
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
        <Button
          onClick={() => onConfirm(paidQuantities)}
          variant="contained"
          sx={{
            width: '100%',
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            borderRadius: 2,
            backgroundColor: 'white',
            color: '#000',
            border: '1px solid #ddd',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              color: '#000',
            },
          }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}

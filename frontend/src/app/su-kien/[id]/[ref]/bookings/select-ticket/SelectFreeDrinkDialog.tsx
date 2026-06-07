import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface FreeDrinkDialogProps {
  open: boolean;
  handleClose: () => void;
  menuItems: any[];
  freeDrinkLimit: number;
  onConfirm: (freeQuantities: { [key: string]: number }) => void;
}

export default function SelectFreeDrinkDialog({
  open,
  handleClose,
  menuItems,
  freeDrinkLimit,
  onConfirm,
}: FreeDrinkDialogProps) {
  // Khởi tạo state cho số lượng đồ uống miễn phí
  const [freeQuantities, setFreeQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const initial: { [key: string]: number } = {};
    menuItems.forEach((item) => {
      initial[item._id] = 0;
    });
    setFreeQuantities(initial);
  }, [menuItems]);

  // Tính tổng số lượng đã chọn
  const totalSelected = Object.values(freeQuantities).reduce((a, b) => a + b, 0);

  const increment = (id: string) => {
    if (totalSelected < freeDrinkLimit) {
      setFreeQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    }
  };

  const decrement = (id: string) => {
    setFreeQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

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
          color: '#000', // Đổi thành màu đen cho tiêu đề
        }}
      >
        Chọn đồ uống MIỄN PHÍ (Tối đa {freeDrinkLimit} món)
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'white', p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#000' }}>
          Tổng đồ uống miễn phí đã chọn: {totalSelected}/{freeDrinkLimit}
        </Typography>
        {menuItems.map((item) => {
          const qty = freeQuantities[item._id] || 0;
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
                  {item.name}
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
                    disabled={totalSelected >= freeDrinkLimit}
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
        <Button
          onClick={() => onConfirm(freeQuantities)}
          variant="contained"
          sx={{
            width: '100%',
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            borderRadius: 2,
            backgroundColor: 'white',
            color: '#000', // Nút sử dụng màu chữ đen
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

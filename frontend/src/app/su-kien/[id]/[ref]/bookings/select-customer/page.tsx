/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material';

export default function SelectCustomer({ open, setOpenSelectCustomer, handleFinishCustomer }: any) {
  const [customerInfor, setCustomerInfor] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({ name: false, phone: false, email: false });
  const [errorPhone, seterrorPhone] = useState("");
  const [errorEmail, seterrorEmail] = useState("");
  // Xử lý khi nhập liệu
  const handleInputChange = (field: string, value: string) => {
    setCustomerInfor((prev) => ({ ...prev, [field]: value }));
    if (field === "phone") {
      if (!/^\d*$/.test(value)) {
        seterrorPhone("Số điện thoại chỉ chứa số");
      } else if (value.length < 10) {
        seterrorPhone("Sai định dạng số điện thoại. Ví dụ: 0123456789");
      } else {
        seterrorPhone("");
      }
    } else if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        seterrorEmail("Sai định dạng email. Ví dụ: example@email.com");
      } else {
        seterrorEmail("");
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorPhone, [field]: errorEmail }));
  };
  // Kiểm tra có lỗi không
  const validateFields = () => {
    const newErrors = {
      name: customerInfor.name.trim() === '',
      phone: customerInfor.phone.trim() === '',
      email: customerInfor.email.trim() === '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  // Xử lý khi nhấn "Tiếp tục"
  const handleContinue = () => {
    if (validateFields()) {
      handleFinishCustomer(customerInfor);
      setOpenSelectCustomer(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpenSelectCustomer(false)}
      maxWidth="xs"
      fullWidth
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
          fontSize: 20,
          color: '#000', // Màu chữ đen
          mb: 2,
        }}
      >
        Thông Tin Khách Hàng
        <IconButton
          aria-label="close"
          onClick={() => setOpenSelectCustomer(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#000",
          }}
        >
          ✕
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'white', p: 2 }}>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Tên khách"
            variant="outlined"
            fullWidth
            required
            value={customerInfor.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            helperText={errors.name ? 'Vui lòng nhập tên khách' : ''}
          />
          <TextField
            name='phone'
            label="Số điện thoại"
            variant="outlined"
            fullWidth
            required
            value={customerInfor.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
          />
          {errorPhone && <p className="text-red-500 text-sm mt-1">{errorPhone}</p>}
          <TextField
            name='email'
            label="Email khách"
            variant="outlined"
            fullWidth
            required
            value={customerInfor.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
          />
          {errorEmail && <p className="text-red-500 text-sm mt-1">{errorEmail}</p>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
        <Button
          onClick={handleContinue}
          variant="contained"
          fullWidth
          disabled={Object.values(errors).includes(true) || Object.values(customerInfor).includes('')}
          sx={{
            py: 1,
            cursor: "pointer",
            width: "100%",
            marginTop: 2,
            borderRadius: 2,
            textTransform: "none",
            backgroundColor: "var(--clr-bg-1)",
            fontWeight: "bold",
            fontSize: "1.2rem",
            "&:hover": {
              backgroundColor: "var(--clr-bg-7)",
              color: "#fff",
            },
          }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}

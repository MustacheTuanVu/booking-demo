/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; // Đánh dấu là Client Component

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { AppContext } from '@/context/AppContext';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, TextField, Typography, Box } from '@mui/material';
import { userInfo } from 'os';

const VerifyAccount = () => {
  // const [openExpiredDialog, setOpenExpiredDialog] = useState(true);
  // const { saveUserInfo, userInfo } = useContext(AppContext);
  const [openExpiredDialog, setOpenExpiredDialog] = useState(true);
  const { saveUserInfo, userInfo } = useContext(AppContext);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneToVerify, setPhoneToVerify] = useState('');

  const [errorPhone, setErrorPhone] = useState("");

  const [customerErrors, setCustomerErrors] = useState({
    name: false,
    phone: false,
  });

  useEffect(() => {
    setCustomerInfo({
      name: userInfo?.name || "",
      phone: userInfo?.phone || "",
    });
  }, [userInfo]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));

    let errors = { ...customerErrors };

    if (field === "name") {
      errors.name = !value.trim();
    }

    if (field === "phone") {
      if (!/^\d*$/.test(value)) {
        setErrorPhone("Số điện thoại chỉ chứa số.");
        errors.phone = true;
      } else if (value.length < 10) {
        setErrorPhone("Sai định dạng số điện thoại. Ví dụ: 0123456789");
        errors.phone = true;
      } else {
        setErrorPhone("");
        errors.phone = false;
      }
    }

    setCustomerErrors(errors);
  };

  useEffect(() => {
    const checkUserInfo = async () => {
      const res = await api.get('auth/getUserByJWT');
      if (res.data && res.data.phone && res.data.phone.length > 0 && res.data.isDelete === "ACTIVE") {
        saveUserInfo(res.data)
        router.replace('/');
      }
    }
    checkUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = (e.target as any).phone.value;
    const name = (e.target as any).name.value;
    const password = (e.target as any).password?.value;
    const email = userInfo?.email;
    try {
      const res = await api.post('/demo-otp/send', { phone, name, password, email });
      if (res.status === 200) {
        setPhoneToVerify(phone);
        setOtpCode(res.data.otp);
        setOtpDialogOpen(true); // mở popup nhập OTP
        setOpenExpiredDialog(false);
      }
    } catch (error: any) {
      alert('Gửi mã OTP thất bại. Vui lòng thử lại.');
      console.error(error);
    }
  };
  const handleVerifyOtp = async () => {
    try {
      const emailParam = userInfo?.email ? `&email=${encodeURIComponent(userInfo.email)}` : '';
      const otpRes = await api.post(`/demo-otp/verify?phone=${phoneToVerify}&otp=${otpCode}${emailParam}`);

      if (otpRes.status === 200) {
        alert('Xác thực OTP thành công.');
        // OTP đúng, tiến hành lưu thông tin
        // const response = await api.put('/users/verify-account', {
        //   phone: phoneToVerify,
        //   name: customerInfo.name,
        //   password: usePassword ? (document.querySelector('input[name="password"]') as HTMLInputElement)?.value : undefined,
        // });

        saveUserInfo(otpRes.data.infoUser);
        setOtpDialogOpen(false);
        router.replace('/');
      } else {
        alert('OTP không đúng hoặc đã hết hạn.');
      }
    } catch (error) {
      alert('Xác thực OTP thất bại.');
      console.error(error);
    }
  };

  return (
    <>
      <Dialog
        open={openExpiredDialog}
        disableEscapeKeyDown={true}
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: (theme) => ({
              p: 2,
              textAlign: "center",
              width: "90%",
              [theme.breakpoints.up("md")]: {
                minWidth: "500px",
              },
            }),
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: "bold" }}>Thông tin xác thực</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <TextField
                label="Số điện thoại"
                name="phone"
                value={customerInfo.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép nhập số và tối đa 10 ký tự
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange('phone', value);
                  }
                }}
                fullWidth
                required
                margin="normal"
                error={customerErrors.phone}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                sx={{
                  mt: { xs: 0.5, md: 1 },
                  mb: { xs: 0.5, md: 1 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "& fieldset": {
                      borderColor: customerErrors.phone ? "error.main" : "",
                    },
                    "&:hover fieldset": {
                      borderColor: customerErrors.phone ? "error.main" : "",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: customerErrors.phone ? "error.main" : "",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: { xs: "12px 14px", md: "14px 16px" },
                    height: "1.25rem"
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 14px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)"
                    }
                  }
                }} />
              {errorPhone && (
                <Typography sx={{ fontSize: "0.85rem", justifyContent: "flex-start", color: "error.main", my: 1, textAlign: "left", }}>
                  {errorPhone}
                </Typography>
              )}
            </Box>
            <Box>
              <TextField
                id="outlined-basic" label="Họ Và Tên"
                variant="outlined"
                name="name"
                value={customerInfo.name}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('name', value);
                }}
                error={customerErrors.name}
                fullWidth
                required
                sx={{
                  mt: { xs: 0.5, md: 1 },
                  mb: { xs: 0.5, md: 1 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "& fieldset": {
                      borderColor: customerErrors.name ? "error.main" : "",
                    },
                    "&:hover fieldset": {
                      borderColor: customerErrors.name ? "error.main" : "",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: customerErrors.name ? "error.main" : "",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: { xs: "12px 14px", md: "14px 16px" },
                    height: "1.25rem"
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 14px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)"
                    }
                  }
                }} />
              {customerErrors.name && (
                <Typography sx={{ fontSize: "0.85rem", justifyContent: "flex-start", color: "error.main", my: 1, textAlign: "left", }}>
                  Vui lòng nhập tên
                </Typography>
              )}
            </Box>
            <FormControl fullWidth margin="normal">
              <FormControlLabel
                control={<Checkbox
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  color="primary" />}
                label="Nhập mật khẩu" />

              {usePassword && (
                <TextField
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  required
                  fullWidth
                  margin="dense"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash}
                            className="w-5 h-5" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }} />
              )}
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", width: "100%", }}>
            <Button
              variant="contained"
              type="submit"
              disabled={customerErrors.phone || customerErrors.name || !customerInfo.name.trim()}
              sx={{ backgroundColor: "var(--clr-bg-1)", width: "90%", borderRadius: "20px", "&:hover": { backgroundColor: "var(--clr-bg-7)" } }}
            >
              Xác thực
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={otpDialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setOtpDialogOpen(false);
          }
        }}
        disableEscapeKeyDown={true}
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: (theme) => ({
              p: 2,
              textAlign: "center",
              width: "90%",
              [theme.breakpoints.up("md")]: {
                minWidth: "500px",
              },
            }),
          },
        }}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Xác thực mã OTP demo</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1" sx={{ fontStyle: "italic" }} color='red'>Mã OTP demo đã được tự động điền. <br /> ** Mã OTP chỉ có hiệu lực trong vòng 5 phút ** </Typography>
          <TextField
            label="Mã OTP"
            fullWidth
            value={otpCode}
            onChange={(e) => {
              const value = e.target.value;
              // Chỉ cho phép nhập số
              if (/^\d*$/.test(value)) {
                setOtpCode(value);
              }
            }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            sx={{
              mt: { xs: 0.5, md: 1 },
              mb: { xs: 0.5, md: 1 },
              "& .MuiInputBase-input": {
                padding: { xs: "12px 14px", md: "14px 16px" },
                height: "1.25rem"
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 14px) scale(1)",
                "&.MuiInputLabel-shrink": {
                  transform: "translate(14px, -6px) scale(0.75)"
                }
              }
            }} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", width: "100%", }}>
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={otpCode.trim() === ""}
            sx={{ backgroundColor: "var(--clr-bg-1)", width: "90%", borderRadius: "20px", "&:hover": { backgroundColor: "var(--clr-bg-7)" } }}
          >
            Xác nhận OTP
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VerifyAccount;

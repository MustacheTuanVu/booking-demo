import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import api from "@/utils/api";

interface DiscountCodeDialogProps {
  open: boolean;
  handleClose: () => void;
  onConfirm: (discountCode: string) => void;
}

const goldBorder = "rgb(171 141 89/var(--tw-text-opacity,1))";

export default function DiscountCodeDialog({
  open,
  handleClose,
  onConfirm,
}: DiscountCodeDialogProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Hàm kiểm tra mã giảm giá
  const checkPromotionCode = async (code: string): Promise<boolean> => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/promotion/GetByCode/${code}`
      );
      return res && res.data && res.data._id ? true : false;
    } catch (error) {
      return false;
    }
  };

  const handleApply = async () => {
    const isValid = await checkPromotionCode(discountCode);
    if (isValid) {
      onConfirm(discountCode);
      setDiscountCode("");
      setErrorMessage("");
    } else {
      setErrorMessage(
        "Code này không hợp lệ, vui lòng chọn code khác hoặc bỏ qua"
      );
    }
  };

  const handleSkip = () => {
    onConfirm("");
    setDiscountCode("");
    setErrorMessage("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        elevation: 6,
        sx: {
          p: 4,
          borderRadius: 3,
          backgroundColor: "#fff",
          border: `2px solid ${goldBorder}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 2,
          fontSize: 18,
          color: goldBorder,
        }}
      >
        Nhập mã giảm giá
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: "#fff", p: 2 }}>
        <TextField
          label="Mã giảm giá (Nếu có)"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          fullWidth
          margin="dense"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: 1,
              "& fieldset": {
                borderColor: goldBorder,
              },
              "&:hover fieldset": {
                borderColor: goldBorder,
              },
              "&.Mui-focused fieldset": {
                borderColor: goldBorder,
              },
            },
          }}
        />
        {errorMessage && (
          <Typography variant="body2" sx={{ mt: 1, color: "#ff0000" }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={handleSkip}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.5,
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: 2,
            backgroundColor: "#fff",
            color: goldBorder,
            border: `1px solid ${goldBorder}`,
            "&:hover": {
              backgroundColor: "#f5f5f5",
              color: goldBorder,
            },
          }}
        >
          Bỏ qua
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.5,
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: 2,
            backgroundColor: "#fff",
            color: goldBorder,
            border: `1px solid ${goldBorder}`,
            "&:hover": {
              backgroundColor: "#f5f5f5",
              color: goldBorder,
            },
          }}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

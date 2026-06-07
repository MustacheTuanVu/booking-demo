"use client";
import React, {  useState } from "react";
import { Box, Container, Grid, Step, StepLabel, Stepper, Typography, useMediaQuery, useTheme, TextField, FormControlLabel, Radio, RadioGroup, Divider, Button, Paper, Chip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Countdown from "./CountDown";

interface PaymentMethod {
    value: string;             // Giá trị cho Radio
    label: string;             // Tên phương thức
    chipLabel?: string;        // "New", "Coupon", ...
    chipColor?: "error" | "success" | "primary" | "secondary" | "default";
    description?: string;      // Mô tả
    linkText?: string;         // Text hiển thị cho link (nếu có)
    linkHref?: string;         // URL link
    iconSrc?: string;          // Đường dẫn ảnh
}
export default function PaymentInfo() {
    const theme = useTheme();
    const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));
    const [promoCode, setPromoCode] = useState("");
    const steps = ["Chọn chỗ ngồi", "Thanh toán"];

    // Mảng dữ liệu các phương thức thanh toán (ví dụ)
    const paymentMethods: PaymentMethod[] = [
        {
            value: "mobile_banking",
            label: "Mobile banking app (VNPay)",
            chipLabel: "New",
            chipColor: "error",
            description: "Quét mã, thanh toán bằng ứng dụng ngân hàng và ví VNPAY.",
            iconSrc: "/images/vnpay.png", // Đường dẫn ảnh VNPAY (ví dụ)
        },
        {
            value: "zalopay",
            label: "ZaloPay",
            chipLabel: "Coupon",
            chipColor: "success",
            description: "Xem chi tiết ưu đãi ví ZaloPay.",
            linkText: "Chi tiết",
            linkHref: "#",
            iconSrc: "/images/zalopay.png", // Logo ZaloPay
        },
        {
            value: "credit",
            label: "International Credit/Debit Card",
            description: "Visa, MasterCard, JCB...",
            iconSrc: "/images/creaditcard.png", // 1 ảnh chứa logo Visa/Master/JCB
        },
        {
            value: "atm",
            label: "ATM Card / Internet Banking",
            description: "Thanh toán qua thẻ ATM nội địa hoặc Internet Banking.",
            iconSrc: "/images/atm.png", // Logo ATM (nếu có)
        },
    ];
    return (
        <Box>
            <Box sx={{ maxWidth: "200px", margin: "0 auto", my: 2 }}>
                <Stepper activeStep={1} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel sx={{ color: "#fff" }}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Box sx={{ backgroundColor: "var(--clr-bg-2)", paddingTop: 4, paddingBottom: 4 }}>
                <Container>
                    {/* STEP 2: Thông tin sự kiện + Countdown */}
                    <Grid container spacing={2}>
                        {/* Bên trái: Thông tin thanh toán */}
                        <Grid item xs={12} md={9}>
                            {/* Thông tin sự kiện nằm bên trái */}
                            <Box sx={{ color: "var(--clr-txt-1)" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                    [Nhà Hát THANH NIÊN] Hài kịch: Thanh Xà Bạch Xà ngoại truyện
                                </Typography>
                                <Divider sx={{ my: 2, borderColor: "var(--clr-bg)", width: "100%" }} />
                                <Typography sx={{ display: "flex", alignItems: "center", fontSize: isBelow1028 ? "18px" : "16px", mb: 2 }}>
                                    <FontAwesomeIcon icon={faCalendar} style={{ marginRight: "8px" }} />
                                    19:30 - 22:30, 28 Tháng 02, 2025
                                </Typography>

                                {/* Địa điểm */}
                                <Typography sx={{ display: "flex", alignItems: "center", fontSize: isBelow1028 ? "18px" : "16px", mb: 1 }}>
                                    <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: "8px" }} />
                                    Nhà Hát Kịch IDECAF - TP HCM
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: "center" }}>
                            {/* Countdown nằm bên phải */}
                            <Countdown />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Container sx={{ paddingTop: 4, paddingBottom: 4 }}>
                <Typography variant="h6" sx={{ textTransform: "uppercase" }}>
                    THANH TOÁN
                </Typography>
                {/* STEP 3: Giao diện thanh toán */}
                <Grid container spacing={2}>
                    {/* Bên trái: Thông tin thanh toán */}
                    <Grid item xs={12} md={8}>
                        <Paper
                            sx={{
                                position: "relative",
                                padding: 2,
                                backgroundColor: "var(--clr-bg-3)",
                                boxShadow: "none",
                                borderRadius: 2,
                                marginY: 2,
                            }}
                        >
                            {/* Nút sửa thông tin ở góc trên bên trái */}
                            <Button
                                variant="text"
                                onClick={() => console.log("Sửa thông tin")}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    alignItems: "center",
                                    borderRadius: 2,
                                }}
                            >
                                Sửa thông tin
                            </Button>

                            <Box mt={2}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: "bold",
                                        mb: 2,
                                        color: "var(--clr-txt-4)",
                                        fontSize: "16px",
                                    }}
                                >
                                    Thông tin khách hàng
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Tên khách hàng: <span style={{ fontWeight: "bold" }}>Nguyễn Văn A</span>
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Số điện thoại: <span style={{ fontWeight: "bold" }}>0123456789</span>
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Email: <span style={{ fontWeight: "bold" }}>dG0H1@example.com</span>
                                </Typography>
                            </Box>
                        </Paper>
                        <Paper
                            sx={{
                                padding: 2,
                                backgroundColor: "var(--clr-bg-3)",
                                boxShadow: "none",
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    mb: 2,
                                    color: "var(--clr-txt-4)",
                                    fontSize: "16px",
                                }}
                            >
                                Phương thức thanh toán
                            </Typography>
                            <RadioGroup defaultValue="mobile_banking" name="paymentMethod">
                                {paymentMethods.map((method) => (
                                    <FormControlLabel
                                        key={method.value}
                                        value={method.value}
                                        control={<Radio sx={{ color: "var(--clr-bg-1)" }} />}
                                        sx={{ mb: 2 }}
                                        label={<Box>
                                            {/* Dòng chứa logo + tên phương thức + Chip (nếu có) */}
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {/* Logo nếu có iconSrc */}
                                                {method.iconSrc && (
                                                    <Box
                                                        component="img"
                                                        src={method.iconSrc}
                                                        alt={method.label}
                                                        sx={{ width: 24, height: 24 }} />
                                                )}

                                                <Typography variant="body1" sx={{ color: "var(--clr-txt-2)" }}>
                                                    {method.label}
                                                </Typography>

                                                {/* Hiển thị Chip nếu có chipLabel */}
                                                {method.chipLabel && (
                                                    <Chip
                                                        label={method.chipLabel}
                                                        size="small"
                                                        color={method.chipColor ?? "default"}
                                                        sx={{ fontSize: "10px" }} />
                                                )}
                                            </Box>

                                            {/* Mô tả kèm link (nếu có) */}
                                            {method.description && (
                                                <Typography variant="body2" sx={{ color: "var(--clr-txt-3)", mt: 1 }}>
                                                    {method.description}
                                                    {method.linkText && method.linkHref && (
                                                        <Box>
                                                            {" "}
                                                            <Link href={method.linkHref} style={{ color: "#59adff" }}>
                                                                {method.linkText}
                                                            </Link>
                                                        </Box>
                                                    )}
                                                </Typography>
                                            )}
                                        </Box>} />
                                ))}
                            </RadioGroup>
                        </Paper>
                    </Grid>

                    {/* Bên phải: Tóm tắt đơn hàng */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 2,
                                position: "relative",
                                backgroundColor: "var(--clr-bg-3)",
                                boxShadow: "none",
                                borderRadius: 2,
                                marginY: 2,
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => console.log("Sửa thông tin")}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    alignItems: "center",
                                    borderRadius: 2,
                                }}
                            >
                                Chọn lại chỗ
                            </Button>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    mb: 2,
                                    fontSize: "16px",
                                }}
                            >
                                Thông tin đặt chỗ
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, fontWWeight: "bold" }}>
                                <Typography variant="body2" fontWeight="bold">Loại chỗ ngồi</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    Số lượng
                                </Typography>
                            </Box>
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" sx={{
                                        maxWidth: "100px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>Hạng Regular 23w2232323232323232323232</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        1
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" sx={{
                                        backgroundColor: "var(--clr-bg-1)",
                                        color: "var(--clr-txt-1)",
                                        borderRadius: 2,
                                        px: 1,
                                    }}>L-21</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        200.000 đ
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                        <Paper
                            sx={{
                                p: 2,
                                backgroundColor: "var(--clr-bg-3)",
                                boxShadow: "none",
                                borderRadius: 2,
                                marginY: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    mb: 2,
                                    fontSize: "16px",
                                    textTransform: "none",
                                }}
                            >
                                Mã khuyến mãi
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    label="MÃ GIẢM GIÁ"
                                    sx={{ backgroundColor: "#fff", flex: 1 }}
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)} />
                                <Button
                                    variant="contained"
                                    size="large"
                                    disabled={!promoCode}
                                    sx={{
                                        backgroundColor: "var(--clr-bg-1)",
                                        "&:hover": { backgroundColor: "var(--clr-bg-7)" },
                                    }}
                                >
                                    Áp dụng
                                </Button>
                            </Box>
                        </Paper>
                        <Paper
                            sx={{
                                p: 2,
                                backgroundColor: "var(--clr-bg-3)",
                                boxShadow: "none",
                                borderRadius: 2,
                                marginY: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    mb: 2,
                                    fontSize: "16px",
                                    textTransform: "none",
                                }}
                            >
                                Thông tin đơn hàng
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Tạm tính</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    250.000 đ
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: "#444", borderStyle: "dashed", }} />

                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="body1" fontWeight="bold">
                                    Tổng tiền
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary">
                                    250.000 đ
                                </Typography>

                            </Box>
                            <Typography variant="body1" sx={{ fontStyle: "italic", fontSize: "12px", my: 2 }}>
                                Bằng việc tiến hành đặt mua, bạn đã đồng ý với <span style={{ fontWeight: "bold" }}>Điều Kiện Giao Dịch Chung</span>
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    backgroundColor: "var(--clr-bg-1)",
                                    "&:hover": {
                                        backgroundColor: "var(--clr-bg-7)",
                                    },
                                }}
                            >
                                Thanh toán
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

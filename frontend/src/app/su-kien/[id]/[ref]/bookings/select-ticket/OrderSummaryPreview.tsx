import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    TextField,
    Chip,
    FormControl,
    InputAdornment
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClose,
    faCalendar,
    faLocationDot,
    faUtensils,
    faTag,
    faEye,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import api from "@/utils/api";
import { formatMoney } from "@/utils/money";
import { formatDateTime3 } from "@/utils/date";

const goldBorder = "rgb(171 141 89/var(--tw-text-opacity,1))";

interface OrderSummaryPreviewProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (discountCode: string, customerInfo: CustomerInfo) => void;
    previewOrder: any;
    userInfo: any;
    bill: any;
    handlePay: any
}

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
    password: string;
}

const OrderSummaryPreview: React.FC<OrderSummaryPreviewProps> = ({
    open,
    onClose,
    onConfirm,
    previewOrder,
    userInfo,
    bill,
    handlePay
}) => {
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isValidCode, setIsValidCode] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: "",
        phone: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const [errorPhone, setErrorPhone] = useState("");
    const [errorEmail, setErrorEmail] = useState("");

    const [customerErrors, setCustomerErrors] = useState({
        name: false,
        phone: false,
        email: false,
    });
    const [promotionData, setPromotionData] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
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

        if (field === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrorEmail("Sai định dạng email. Ví dụ: example@gmail.com");
                errors.email = true;
            } else {
                setErrorEmail("");
                errors.email = false;
            }
        }

        setCustomerErrors(errors);
    };

    // Reset states when dialog opens
    useEffect(() => {
        if (open) {
            setDiscountCode(previewOrder?.discountCode || "");
            setErrorMessage("");
            if (previewOrder?.discountCode) {
                setIsValidCode(true);
            } else {
                setIsValidCode(false);
            }

            // Reset customer info if previewOrder has it
            if (previewOrder?.customerInfo) {
                setCustomerInfo(previewOrder.customerInfo);
            } else {
                setCustomerInfo({
                    name: "",
                    phone: "",
                    email: "",
                    password: ""
                });
            }

            setCustomerErrors({
                name: false,
                phone: false,
                email: false
            });
        }
    }, [open, previewOrder]);

    useEffect(() => {
        console.log('Effect đã chạy');

        // Hàm cleanup
        // return () => {
        //     console.log('Cleanup trước khi unmount hoặc trước khi effect chạy lại');
        //     // Dọn dẹp các tài nguyên, unsubscribe, clear interval, etc.
        // };
    }, []);

    // Function to check if promotion code is valid
    const checkPromotionCode = async (code: string): Promise<boolean> => {
        if (!code) return false;

        try {
            const res = await api.get(
                `${process.env.NEXT_PUBLIC_API_URL}/promotion/GetByCode/${code}`
            );

            if (res && res.data && res.data._id) {
                setPromotionData(res.data);

                // Tính toán số tiền giảm giá
                const promo = res.data;
                if (promo.type_price === "PERCENT") {
                    // Giảm theo phần trăm
                    const discount = (previewOrder.totalPrice * promo.price) / 100;
                    setDiscountAmount(discount);
                } else if (promo.type_price === "VND") {
                    // Giảm theo số tiền cố định
                    setDiscountAmount(promo.price);
                }

                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    // Handle discount code change
    const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDiscountCode(e.target.value);
        setErrorMessage("");
        setIsValidCode(false);
    };

    // Handle customer info change
    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        setCustomerErrors(prev => ({
            ...prev,
            [name]: false
        }));
    };

    // Validate discount code
    const validateDiscountCode = async () => {
        if (!discountCode) {
            setErrorMessage("");
            return;
        }

        const isValid = await checkPromotionCode(discountCode);
        if (isValid) {
            setIsValidCode(true);
            setErrorMessage("");
        } else {
            setIsValidCode(false);
            setErrorMessage("Mã giảm giá không hợp lệ");
        }
    };

    // Validate form before submission
    const validateForm = (): boolean => {
        const errors = {
            name: !customerInfo.name,
            phone: !customerInfo.phone,
            email: !customerInfo.email
        };

        setCustomerErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    // Handle confirm button click - pass the discount code and customer info to parent
    const handleConfirm = () => {
        // Vẫn giữ phần xác thực form
        if (!userInfo || (userInfo && (userInfo.role == 'ADMIN' || userInfo.role == 'BOSS'))) {
            if (!validateForm()) {
                // Auto scroll to the customer form on mobile when validation error occurs
                const customerFormElement = document.getElementById('customer-info-form');
                if (customerFormElement) {
                    setTimeout(() => {
                        customerFormElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 100);
                }
                return;
            }
        }

        // Lấy mã giảm giá hợp lệ
        const codeToPass = isValidCode && discountCode ? discountCode : "";

        // Gọi hàm xử lý như trong nút "Thanh toán"
        if (bill) {
            handlePay(bill[0].total_price, bill[0]._id);
        } else {
            onConfirm(codeToPass, customerInfo);
        }
    };

    // Helper function to get item type icon
    const getItemTypeIcon = (type: string) => {
        switch (type) {
            case "FOOD": return <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '5px' }} />;
            case "DRINK": return <span style={{ marginRight: '5px' }}>🥤</span>;
            default: return null;
        }
    };

    if (!previewOrder) return null;

    // Format event date and time
    const formatEventDateTime = () => {
        const event = previewOrder.event;
        if (!event) return "Không có thông tin sự kiện";

        // Format date from ShowTimes
        const showTime = event.InfoShowTimes && event.InfoShowTimes.length > 0
            ? event.InfoShowTimes[0]
            : null;

        if (showTime && showTime.time_start) {
            try {
                // Format date in Vietnamese style with full day name and month name
                // 2025-04-11T02:49:00.000Z
                return formatDateTime3(showTime.time_start);
            } catch {
                return formatDateTime3(showTime.time_start);
            }
        }

        return event.title || "Không có thông tin sự kiện";
    };

    // Format venue address to ensure proper spacing after commas
    const formatVenueAddress = (address: string) => {
        if (!address) return "";
        // Replace combinations of comma+character with comma+space+character
        return address.replace(/,([^\s])/g, ', $1');
    };

    // Calculate total seats
    const totalSeats =
        (previewOrder.orderDetails.j_size || 0) +
        (previewOrder.orderDetails.q_size || 0) +
        (previewOrder.orderDetails.k_size || 0);



    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                display: open ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1300,
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "90%", md: "85%", lg: "75%" },
                    maxHeight: { xs: "90vh", md: "85vh" },
                    overflowY: "auto",
                    margin: 2,
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                }}
            >

                {/* Header with close button */}
                <Box
                    className="sticky top-0 z-50"
                    sx={{
                        position: "relative",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    {/* Gold accent line at the top */}
                    <Box
                        sx={{
                            height: "4px",
                            background: "linear-gradient(90deg, rgb(171, 141, 89) 0%, rgb(211, 187, 141) 50%, rgb(171, 141, 89) 100%)",
                            width: "100%"
                        }}
                    />

                    {/* Header content */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            padding: { xs: "22px 16px", md: "26px" },
                            backgroundColor: "white",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                color: "rgb(171, 141, 89)",
                                position: "relative",
                                paddingBottom: "10px",
                                textAlign: { xs: "center", md: "center" },
                                fontSize: { xs: "1.25rem", md: "1.4rem" },
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    bottom: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "40px",
                                    height: "2px",
                                    backgroundColor: "rgb(171, 141, 89, 0.6)",
                                    borderRadius: "2px",
                                }
                            }}
                        >
                            Xác nhận đặt chỗ
                        </Typography>

                        <IconButton
                            onClick={onClose}
                            aria-label="Đóng"
                            sx={{
                                position: "absolute",
                                top: { xs: "14px", md: "18px" },
                                right: { xs: "14px", md: "18px" },
                                width: "38px",
                                height: "38px",
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                color: "rgb(120, 120, 120)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "rgba(171, 141, 89, 0.08)",
                                    color: "rgb(171, 141, 89)",
                                    transform: "rotate(90deg)",
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faClose} size="sm" />
                        </IconButton>
                    </Box>
                </Box>
                {/* Main content */}
                <Box sx={{ p: { xs: 2, sm: 2, md: 2.5 } }}>
                    <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
                        {/* Left column - Customer Info, Seat Info, Combos, Food Items */}
                        <Grid size={{ xs: 12, md: 7, lg: 8 }} order={{ xs: 1, md: 1 }}>

                            {/* Event time info */}
                            <Paper
                                sx={{
                                    backgroundColor: "white",
                                    boxShadow: "none",
                                    borderRadius: 2,
                                    mb: { xs: 3, md: 2 },
                                    p: { xs: 1.5, md: 1.5 },
                                    border: `1px solid ${goldBorder}`,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
                                    }
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: "rgb(171, 141, 89)",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        mb: 0.75,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}
                                >
                                    Thông tin sự kiện
                                </Typography>

                                <Box sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: { xs: 1, sm: 1.5 },
                                    mt: 0.5
                                }}>
                                    {/* Date/time section */}
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor: "rgba(171, 141, 89, 0.05)",
                                        borderRadius: 1.5,
                                        py: 0.75,
                                        px: 1.25,
                                        flex: 1
                                    }}>
                                        <Box sx={{
                                            mr: 1.25,
                                            color: "rgb(171, 141, 89)",
                                            width: 24,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.9rem"
                                        }}>
                                            <FontAwesomeIcon icon={faCalendar} />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                                color="#555"
                                                sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}
                                            >
                                                Ngày và giờ
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    mt: 0.25,
                                                    fontSize: "0.8rem",
                                                    color: "#333",
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {formatEventDateTime()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Venue section */}
                                    {previewOrder.event.venue && (
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "rgba(171, 141, 89, 0.05)",
                                            borderRadius: 1.5,
                                            py: 0.75,
                                            px: 1.25,
                                            flex: 1
                                        }}>
                                            <Box sx={{
                                                mr: 1.25,
                                                color: "rgb(171, 141, 89)",
                                                width: 24,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.9rem"
                                            }}>
                                                <FontAwesomeIcon icon={faLocationDot} />
                                            </Box>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={500}
                                                    color="#555"
                                                    sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}
                                                >
                                                    Địa điểm
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mt: 0.25,
                                                        fontSize: "0.8rem",
                                                        color: "#333",
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {formatVenueAddress(previewOrder.event.venue)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>

                            {/* Combo Section */}
                            {previewOrder.orderDetails.combo_info && previewOrder.orderDetails.combo_info.length > 0 && (
                                <Paper
                                    sx={{
                                        backgroundColor: "white",
                                        boxShadow: "none",
                                        borderRadius: 2,
                                        mb: { xs: 3, md: 2 },
                                        p: { xs: 1.5, md: 2 },
                                        border: `1px solid ${goldBorder}`,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: "rgb(171, 141, 89)",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            mb: 1.5,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            borderBottom: `1px solid ${goldBorder}4D`,
                                            paddingBottom: 0.75
                                        }}
                                    >
                                        Thông tin đơn hàng
                                    </Typography>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                                        {/* Combos */}
                                        {previewOrder.orderDetails.combo_info.map((combo: any, comboIndex: number) => (
                                            <Box
                                                key={comboIndex}
                                                sx={{
                                                    p: 1.75,
                                                    borderRadius: 1.5,
                                                    backgroundColor: "rgba(171, 141, 89, 0.03)",
                                                    border: "1px solid rgba(171, 141, 89, 0.1)",
                                                    position: "relative",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                {/* Gold accent */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        width: "4px",
                                                        height: "100%",
                                                        backgroundColor: "rgb(171, 141, 89, 0.6)"
                                                    }}
                                                />

                                                {/* Combo header */}
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        mb: 1.25,
                                                        pl: 0.75
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "#333",
                                                            width: "70%",
                                                            lineHeight: 1.3,
                                                            fontSize: "0.95rem",
                                                            display: 'flex',
                                                            flexDirection: { xs: 'column', md: 'row' },
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        {combo.name}
                                                        {combo.count && combo.count > 1 && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.85rem',
                                                                    color: 'rgb(171, 141, 89)',
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                (x{combo.count})
                                                            </span>
                                                        )}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "rgb(171, 141, 89)",
                                                            backgroundColor: "rgba(171, 141, 89, 0.1)",
                                                            borderRadius: 1,
                                                            px: 1,
                                                            py: 0.5,
                                                            fontSize: "0.85rem",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {formatMoney ? formatMoney((combo.price || 0) * (combo.count || 1)) : `${((combo.price || 0) * (combo.count || 1)).toLocaleString()} VND`}
                                                    </Typography>
                                                </Box>

                                                {/* Combo items */}
                                                <Box
                                                    sx={{
                                                        ml: 0.75,
                                                        pl: 1,
                                                        borderLeft: "1px dashed rgba(171, 141, 89, 0.25)"
                                                    }}
                                                >
                                                    {combo.items.map((item: any, itemIndex: number) => (
                                                        <Box
                                                            key={itemIndex}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                mb: itemIndex === combo.items.length - 1 ? 0 : 0.75
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    color: "#555",
                                                                    mr: 0.75
                                                                }}
                                                            >
                                                                {getItemTypeIcon(item.type)}
                                                            </Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "#444",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 0.5,
                                                                    fontSize: "0.85rem",
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                <span>{item.name}</span>
                                                                <Typography
                                                                    component="span"
                                                                    sx={{
                                                                        fontSize: "0.8rem",
                                                                        color: "#666",
                                                                        ml: 0.5,
                                                                        fontWeight: 400
                                                                    }}
                                                                >
                                                                    ({item.quantity} {item.unit})
                                                                </Typography>
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Additional Items */}
                                        {previewOrder.orderDetails.item_upsell && previewOrder.orderDetails.item_upsell.length > 0 && (
                                            <Box
                                                sx={{
                                                    p: 1.75,
                                                    borderRadius: 1.5,
                                                    backgroundColor: "rgba(171, 141, 89, 0.03)",
                                                    border: "1px solid rgba(171, 141, 89, 0.1)",
                                                    position: "relative",
                                                    mt: 0.5
                                                }}
                                            >
                                                {/* Gold accent */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        width: "4px",
                                                        height: "100%",
                                                        backgroundColor: "rgba(171, 141, 89, 0.4)"
                                                    }}
                                                />

                                                {/* Additional items header */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: "#333",
                                                        mb: 1.5,
                                                        pl: 0.75,
                                                        fontSize: "0.95rem",
                                                        position: "relative"
                                                    }}
                                                >
                                                    Món bổ sung
                                                </Typography>

                                                {/* Additional items list */}
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 1.25,
                                                        ml: 0.75,
                                                        pl: 1,
                                                        borderLeft: "1px dashed rgba(171, 141, 89, 0.25)"
                                                    }}
                                                >
                                                    {previewOrder.orderDetails.item_upsell.map((item: any, index: number) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center"
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 1
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "#555"
                                                                    }}
                                                                >
                                                                    {getItemTypeIcon(item.type)}
                                                                </Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: "#444",
                                                                        fontSize: "0.85rem",
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                    <Typography
                                                                        component="span"
                                                                        sx={{
                                                                            fontSize: "0.8rem",
                                                                            color: "#666",
                                                                            ml: 0.5,
                                                                            fontWeight: 400
                                                                        }}
                                                                    >
                                                                        ({item.quantity} {item.unit})
                                                                    </Typography>
                                                                </Typography>
                                                            </Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                                sx={{
                                                                    color: "#333",
                                                                    backgroundColor: "rgba(171, 141, 89, 0.1)",
                                                                    borderRadius: 1,
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    fontSize: "0.85rem",
                                                                    whiteSpace: "nowrap"
                                                                }}
                                                            >
                                                                {formatMoney ? formatMoney(item.price * item.quantity) : `${(item.price * item.quantity).toLocaleString()} VND`}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Order Summary */}
                                    <Box
                                        sx={{
                                            mt: 2.5,
                                            pt: 2,
                                            borderTop: "1px dashed rgba(171, 141, 89, 0.4)",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mb: 1.5,
                                                px: 1.5
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#444",
                                                    fontSize: "0.95rem"
                                                }}
                                            >
                                                Tổng tiền
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "rgb(171, 141, 89)",
                                                    fontSize: "0.95rem"
                                                }}
                                            >
                                                {formatMoney ? formatMoney(previewOrder.totalPrice) : `${previewOrder.totalPrice.toLocaleString()} VND`}
                                            </Typography>
                                        </Box>

                                        {/* Discount Code Section */}
                                        <Box
                                            sx={{
                                                backgroundColor: "rgba(171, 141, 89, 0.04)",
                                                p: 1.75,
                                                borderRadius: 1.5,
                                                mb: 1.75
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#444",
                                                    mb: 1.25,
                                                    fontSize: "0.95rem"
                                                }}
                                            >
                                                Áp mã giảm giá
                                            </Typography>

                                            {isValidCode && discountCode ? (
                                                <Box
                                                    sx={{
                                                        display: {
                                                            xs: 'block',
                                                            sm: 'flex'
                                                        },
                                                        justifyContent: {
                                                            xs: 'space-between'
                                                        },
                                                        alignItems: 'center',
                                                        mb: 1
                                                    }}
                                                >
                                                    <Chip
                                                        icon={<FontAwesomeIcon icon={faTag} />}
                                                        label={discountCode}
                                                        size="small"
                                                        color="success"
                                                        sx={{ 
                                                            fontSize: '0.9rem',
                                                             display: 'flex',
                                                            justifyContent: {
                                                                xs: 'center',
                                                                sm: 'flex-start'
                                                            }
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: {
                                                                xs: 'center',
                                                                sm: 'flex-start'
                                                            },
                                                            mt: {
                                                                xs: 1,
                                                                sm: 0
                                                            }
                                                        }}
                                                    >
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            onClick={() => {
                                                                setDiscountCode("");
                                                                setIsValidCode(false);
                                                            }}
                                                            sx={{
                                                                color: goldBorder,
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Thay đổi
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Grid container spacing={1.5}>
                                                    <Grid size={8}>
                                                        <TextField
                                                            placeholder="Nhập mã giảm giá (nếu có)"
                                                            variant="outlined"
                                                            value={discountCode}
                                                            onChange={handleDiscountCodeChange}
                                                            fullWidth
                                                            error={!!errorMessage}
                                                            helperText={errorMessage}
                                                            size="small"
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": {
                                                                    borderRadius: 1,
                                                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                                    "& fieldset": {
                                                                        borderColor: isValidCode ? "green" : "rgba(171, 141, 89, 0.4)",
                                                                    },
                                                                    "&:hover fieldset": {
                                                                        borderColor: isValidCode ? "green" : goldBorder,
                                                                    },
                                                                    "&.Mui-focused fieldset": {
                                                                        borderColor: isValidCode ? "green" : goldBorder,
                                                                    },
                                                                },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: "0.9rem",
                                                                    padding: "10px 14px"
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={validateDiscountCode}
                                                            sx={{
                                                                height: "40px",
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                                borderRadius: 1,
                                                                backgroundColor: "#fff",
                                                                color: goldBorder,
                                                                border: `1px solid ${goldBorder}`,
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(171, 141, 89, 0.04)",
                                                                    color: goldBorder,
                                                                },
                                                                boxShadow: "none",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            Kiểm tra
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            )}

                                            {isValidCode && discountCode && (
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            mt: 1.5,
                                                            pb: 1.25,
                                                            borderBottom: "1px dashed rgba(0, 0, 0, 0.1)"
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: "60%" }}>
                                                            <FontAwesomeIcon icon={faTag} style={{ color: "#4caf50", fontSize: "0.9rem" }} />
                                                            <Typography variant="body2"
                                                                sx={{
                                                                    color: "#555",
                                                                    fontSize: "0.85rem",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    maxWidth: "100%",
                                                                }}>
                                                                Mã giảm giá {discountCode}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" fontWeight={600} sx={{ color: "#4caf50", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                                                            -{formatMoney ? formatMoney(discountAmount) : `${discountAmount.toLocaleString()} VND`}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontSize: '0.8rem',
                                                            color: '#666',
                                                            fontStyle: 'italic',
                                                            mt: 1.25,
                                                            textAlign: "right"
                                                        }}
                                                    >
                                                        Giảm giá sẽ được tính khi thanh toán
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Final Price */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: "rgba(171, 141, 89, 0.07)",
                                                p: 1.75,
                                                borderRadius: 1.5
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#333",
                                                    fontSize: "0.95rem",
                                                    whiteSpace: "nowrap",
                                                    mr: 1
                                                }}
                                            >
                                                Tổng thanh toán:
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "rgb(171, 141, 89)",
                                                    fontSize: "1.1rem",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatMoney ? formatMoney(previewOrder.totalPrice - discountAmount) : `${(previewOrder.totalPrice - discountAmount).toLocaleString()} VND`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Grid>

                        {/* Right column */}
                        <Grid size={{ xs: 12, md: 5, lg: 4 }} order={{ xs: 2, md: 2 }}>
                            {/* Seat Information Section */}
                            {totalSeats > 0 && (
                                <Paper
                                    sx={{
                                        backgroundColor: "white",
                                        boxShadow: "none",
                                        borderRadius: 2,
                                        mb: 2.5,
                                        p: { xs: 1.5, md: 2 },
                                        border: `1px solid ${goldBorder}`,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: "rgb(171, 141, 89)",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            mb: 1.5,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            borderBottom: `1px solid ${goldBorder}4D`,
                                            paddingBottom: 0.75
                                        }}
                                    >
                                        Thông tin ghế
                                    </Typography>

                                    {/* Enhanced Seat Info layout */}
                                    <Box sx={{ mt: 1.5 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mb: 1.5,
                                                backgroundColor: "rgba(171, 141, 89, 0.05)",
                                                p: 1,
                                                borderRadius: 1.5
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.85rem",
                                                    color: "#555"
                                                }}
                                            >
                                                Tổng ghế đã chọn:
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: "0.95rem",
                                                    color: "rgb(171, 141, 89)"
                                                }}
                                            >
                                                {totalSeats} ghế
                                            </Typography>
                                        </Box>

                                        {/* Enhanced Seat type cards - vertical layout for better visibility */}
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                                            {previewOrder.orderDetails.j_size > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        backgroundColor: "rgba(171, 141, 89, 0.04)",
                                                        borderRadius: "6px",
                                                        py: 1,
                                                        px: 1.5,
                                                        border: "1px solid rgba(171, 141, 89, 0.1)"
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                borderRadius: "50%",
                                                                width: 8,
                                                                height: 8,
                                                                backgroundColor: "#777",
                                                                border: "1px solid rgba(0, 0, 0, 0.08)"
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.85rem",
                                                                color: "#333",
                                                                fontWeight: 600,
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            Khu J - Jack
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: "0.9rem",
                                                            backgroundColor: "rgba(171, 141, 89, 0.1)",
                                                            color: "#333",
                                                            borderRadius: "4px",
                                                            px: 1.5,
                                                            py: 0.5,
                                                            minWidth: "32px",
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {previewOrder.orderDetails.j_size}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {previewOrder.orderDetails.q_size > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        backgroundColor: "rgba(255, 214, 10, 0.08)",
                                                        borderRadius: "6px",
                                                        py: 1,
                                                        px: 1.5,
                                                        border: "1px solid rgba(255, 214, 10, 0.2)"
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                borderRadius: "50%",
                                                                width: 8,
                                                                height: 8,
                                                                backgroundColor: "#FFD60A",
                                                                border: "1px solid rgba(255, 214, 10, 0.3)"
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.85rem",
                                                                color: "#9e7800",
                                                                fontWeight: 600,
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            Khu Q - Queen
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: "0.9rem",
                                                            backgroundColor: "rgba(255, 214, 10, 0.15)",
                                                            color: "#9e7800",
                                                            borderRadius: "4px",
                                                            px: 1.5,
                                                            py: 0.5,
                                                            minWidth: "32px",
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {previewOrder.orderDetails.q_size}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {previewOrder.orderDetails.k_size > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        backgroundColor: "rgba(28, 28, 28, 0.05)",
                                                        borderRadius: "6px",
                                                        py: 1,
                                                        px: 1.5,
                                                        border: "1px solid rgba(28, 28, 28, 0.15)"
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                borderRadius: "50%",
                                                                width: 8,
                                                                height: 8,
                                                                backgroundColor: "#1C1C1C",
                                                                border: "1px solid rgba(0, 0, 0, 0.2)"
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.85rem",
                                                                color: "#333",
                                                                fontWeight: 600,
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            Khu K - King
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: "0.9rem",
                                                            backgroundColor: "rgba(28, 28, 28, 0.75)",
                                                            color: "#DAA520",
                                                            borderRadius: "4px",
                                                            px: 1.5,
                                                            py: 0.5,
                                                            minWidth: "32px",
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {previewOrder.orderDetails.k_size}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {/* Customer Information Section */}
                            {!userInfo || (userInfo && (userInfo.role == 'ADMIN' || userInfo.role == 'BOSS')) ?
                                <Paper
                                    id="customer-info-form"
                                    sx={{
                                        backgroundColor: "white",
                                        boxShadow: "none",
                                        borderRadius: 2,
                                        mb: 2.5,
                                        p: { xs: 2, md: 2.25 },
                                        border: `1px solid ${goldBorder}`,
                                        scrollMarginTop: { xs: '80px', md: '20px' }
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: "rgb(171, 141, 89)",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            mb: { xs: 1.25, md: 1.75 },
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            borderBottom: `1px solid ${goldBorder}4D`,
                                            paddingBottom: 1
                                        }}
                                    >
                                        Thông tin khách hàng
                                    </Typography>

                                    <Grid container spacing={{ xs: 1.5, md: 2 }}>
                                        <Grid size={12}>
                                            <TextField
                                                label="Tên"
                                                name="name"
                                                value={customerInfo.name}
                                                onChange={handleCustomerInfoChange}
                                                fullWidth
                                                margin="normal"
                                                error={customerErrors.name}
                                                sx={{
                                                    mt: { xs: 0.5, md: 1 },
                                                    mb: { xs: 0.5, md: 1 },
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1,
                                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                        "& fieldset": {
                                                            borderColor: customerErrors.name ? "error.main" : goldBorder,
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: customerErrors.name ? "error.main" : goldBorder,
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: customerErrors.name ? "error.main" : goldBorder,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "0.9rem",
                                                        padding: { xs: "12px 14px", md: "14px 16px" },
                                                        height: "1.25rem"
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        fontSize: "0.9rem",
                                                        transform: "translate(14px, 14px) scale(1)",
                                                        "&.MuiInputLabel-shrink": {
                                                            transform: "translate(14px, -6px) scale(0.75)"
                                                        }
                                                    }
                                                }}
                                            />
                                            {customerErrors.name && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "error.main", mt: 0.5, ml: 0.5 }}>
                                                    Vui lòng nhập tên
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid size={12}>
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
                                                            borderColor: customerErrors.phone ? "error.main" : goldBorder,
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: customerErrors.phone ? "error.main" : goldBorder,
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: customerErrors.phone ? "error.main" : goldBorder,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "0.9rem",
                                                        padding: { xs: "12px 14px", md: "14px 16px" },
                                                        height: "1.25rem"
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        fontSize: "0.9rem",
                                                        transform: "translate(14px, 14px) scale(1)",
                                                        "&.MuiInputLabel-shrink": {
                                                            transform: "translate(14px, -6px) scale(0.75)"
                                                        }
                                                    }
                                                }}
                                            />
                                            {errorPhone && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "error.main", mt: 0.5, ml: 0.5 }}>
                                                    {errorPhone}
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid size={12}>
                                            <TextField
                                                label="Email"
                                                name="email"
                                                value={customerInfo.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                fullWidth
                                                margin="normal"
                                                required
                                                error={customerErrors.email}
                                                sx={{
                                                    mt: { xs: 0.5, md: 1 },
                                                    mb: { xs: 0.5, md: 1 },
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1,
                                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                        "& fieldset": {
                                                            borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "0.9rem",
                                                        padding: { xs: "12px 14px", md: "14px 16px" },
                                                        height: "1.25rem"
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        fontSize: "0.9rem",
                                                        transform: "translate(14px, 14px) scale(1)",
                                                        "&.MuiInputLabel-shrink": {
                                                            transform: "translate(14px, -6px) scale(0.75)"
                                                        }
                                                    }
                                                }}
                                            />
                                            {errorEmail && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "error.main", mt: 0.5, ml: 0.5 }}>
                                                    {errorEmail}
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid size={12}>
                                            <TextField
                                                name="password"
                                                label="Mật khẩu"
                                                value={customerInfo.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                type={showPassword ? 'text' : 'password'}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                required
                                                sx={{
                                                    mt: { xs: 0.5, md: 1 },
                                                    mb: { xs: 0.5, md: 1 },
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1,
                                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                        "& fieldset": {
                                                            // borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                        "&:hover fieldset": {
                                                            // borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            // borderColor: customerErrors.email ? "error.main" : goldBorder,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "0.9rem",
                                                        padding: { xs: "12px 14px", md: "14px 16px" },
                                                        height: "1.25rem"
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        fontSize: "0.9rem",
                                                        transform: "translate(14px, 14px) scale(1)",
                                                        "&.MuiInputLabel-shrink": {
                                                            transform: "translate(14px, -6px) scale(0.75)"
                                                        }
                                                    }
                                                }}
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
                                                                    className="w-5 h-5"
                                                                />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                                : <></>}

                            {/* Action Buttons - Desktop */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mt: 2 }}>
                                <Button
                                    onClick={onClose}
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        borderColor: goldBorder,
                                        color: goldBorder,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        "&:hover": {
                                            borderColor: goldBorder,
                                            backgroundColor: "rgba(171, 141, 89, 0.08)",
                                        }
                                    }}
                                >
                                    Chọn lại
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    variant="contained"
                                    disabled={customerErrors.name || customerErrors.phone || customerErrors.email}
                                    sx={{
                                        flex: 1,
                                        backgroundColor: goldBorder,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        "&:hover": {
                                            backgroundColor: "rgba(171, 141, 89, 0.8)",
                                        }
                                    }}
                                >
                                    {/* Thanh toán */}
                                    Xác nhận
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Mobile bottom actions - fixed at bottom */}
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        position: 'sticky',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: '100%',
                        p: 2.25,
                        backgroundColor: 'white',
                        borderTop: `1px solid ${goldBorder}`,
                        gap: 2,
                        zIndex: 20,
                        boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            borderColor: goldBorder,
                            color: goldBorder,
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            whiteSpace: "nowrap",
                            "&:hover": {
                                borderColor: goldBorder,
                                backgroundColor: "rgba(171, 141, 89, 0.08)",
                            }
                        }}
                    >
                        Chọn lại
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        disabled={customerErrors.name || customerErrors.phone || customerErrors.email}
                        sx={{
                            flex: 2,
                            backgroundColor: goldBorder,
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            "&:hover": {
                                backgroundColor: "rgba(171, 141, 89, 0.8)",
                            }
                        }}
                    >
                        {/* Thanh toán */}
                        Xác nhận
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default OrderSummaryPreview;
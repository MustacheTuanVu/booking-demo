"use client";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Box, Container, Typography, useMediaQuery, useTheme, Divider, Button, Paper, Chip, Tooltip, Grid, Fade, CircularProgress, Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faTicket, faTag, faUtensils, faCopy, faShareNodes, faCheck, faArrowLeft, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import { formatMoney } from "@/utils/money";
import { formatDateTime, formatDateTime3 } from "@/utils/date";
import { AppContext } from "@/context/AppContext";
import { keyframes } from "@mui/system";

import Image from 'next/image';

// Create a keyframe for fade-in animation with slight upward movement
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Define success icon animation outside component to prevent recreation on each render
const successIconAnimation = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Add the SimpleLoadingSpinner component before the return statement
const SimpleLoadingSpinner = () => {
    return (
        <Box
            sx={{
                width: '100%',
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
            }}
        >
            <CircularProgress
                size={48}
                sx={{
                    color: 'rgb(171, 141, 89)',
                }}
            />
            <Typography
                variant="body1"
                sx={{
                    mt: 2,
                    color: 'rgb(171, 141, 89)',
                    fontWeight: 500,
                    fontSize: '1rem',
                }}
            >
                Đang tải thông tin...
            </Typography>
        </Box>
    );
};

export default function PaymentInfo() {
    const { userInfo } = useContext(AppContext);
    const router = useRouter();
    const { id } = useParams();
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    
    // Add a ref to track if animations have already played for admin users
    const animationsPlayedRef = useRef(false);
    // Check if user is admin
    const isAdmin = userInfo?.role === 'ADMIN' || userInfo?.role === 'BOSS';
    
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [eventDetails, setEventDetails] = useState<any>(null);
    const [totalBeforeDiscount, setTotalBeforeDiscount] = useState<number>(0);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [copied, setCopied] = useState(false);
    
    // Add new state variables for success dialog
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [loadedSections, setLoadedSections] = useState({
        event: false,
        order: false,
        customer: false
    });

    // Set up a stable version of the orderDetails._id value to use in callbacks
    const orderId = orderDetails?._id;
    
    // Maintain navigation context even if user refreshes the page
    useEffect(() => {
        // Check if we already have a previousURL set
        const existingPrevURL = localStorage.getItem("previousURL");
        
        // If no previousURL is set but we have document referrer, use that information to infer context
        if (!existingPrevURL && document.referrer) {
            const referrer = document.referrer;
            
            // Check if the user came from an admin or customer page
            if (referrer.includes('/dashboard')) {
                localStorage.setItem("previousURL", "/dashboard/ticket-list?admin=true");
            } else if (referrer.includes('/customer')) {
                localStorage.setItem("previousURL", "/customer/my-tickets?customer=true");
            } else if (isAdmin) {
                // Fallback for admin users
                localStorage.setItem("previousURL", "/dashboard/ticket-list?admin=true");
            } else {
                // Fallback for regular users
                localStorage.setItem("previousURL", "/customer/my-tickets?customer=true");
            }
        }
    }, [isAdmin]);
    
    // Mark animations as played when the page loads for admin users
    useEffect(() => {
        if (isAdmin) {
            animationsPlayedRef.current = true;
        }
    }, [isAdmin]);

    const getOrderDetails = async () => {
        try {
            const response = await api.get(`orders/GetById/${id}`);
            console.log("Thông tin đơn hàng", response.data);
            // API returns an array with one object, so we get the first item
            const orderData = response.data[0];
            setOrderDetails(orderData);

            // Calculate discount amount if promotion exists
            if (orderData.promotion) {
                let discountValue = 0;
                if (orderData.promotion.type_price === "PERCENT") {
                    discountValue = (orderData.total_price * orderData.promotion.price) / (100 - orderData.promotion.price);
                } else {
                    discountValue = orderData.promotion.price;
                }
                setDiscountAmount(discountValue);
                setTotalBeforeDiscount(orderData.total_price + discountValue);
            } else {
                setTotalBeforeDiscount(orderData.total_price);
            }
            
            // Mark order data as loaded
            setLoadedSections(prev => ({ ...prev, order: true, customer: true }));
        } catch (error) {
            console.error("Error fetching order details:", error);
            // Even on error, mark as loaded to show error state
            setLoadedSections(prev => ({ ...prev, order: true, customer: true }));
        }
    };

    const getEventDetails = async (eventId: string) => {
        try {
            const eventResponse = await api.get('/events/getDetailEvent?idEvent=' + eventId);
            setEventDetails(eventResponse.data && eventResponse.data.length > 0 ? eventResponse.data[0] : null);
            
            // Mark event data as loaded
            setLoadedSections(prev => ({ ...prev, event: true }));
        } catch (error) {
            console.error("Error fetching event details:", error);
            // Even on error, mark as loaded to show error state
            setLoadedSections(prev => ({ ...prev, event: true }));
        }
    };
    useEffect(() => {
        if (!userInfo) {
            router.replace("/");
            return;
        }
        if (!orderDetails?.InfoUser) return;

        const isOwner = String(userInfo._id) === String(orderDetails.InfoUser._id);
        const isAdmin = ["ADMIN", "BOSS"].includes(userInfo.role?.toUpperCase());

        if (!isOwner && !isAdmin) {
            router.replace("/");
        }
    }, [userInfo, orderDetails?.InfoUser]);

    useEffect(() => {
        getOrderDetails();
    }, []);

    useEffect(() => {
        if (orderDetails && orderDetails.event_id) {
            getEventDetails(orderDetails.event_id);
        }
    }, [orderDetails]);
    
    // Check if all sections are loaded
    useEffect(() => {
        if (loadedSections.event && loadedSections.order && loadedSections.customer) {
            // For admin users, minimize loading delay and avoid re-animation triggers
            const delay = isAdmin ? 100 : 300;
            
            // Add a small delay for smoother transition
            const timer = setTimeout(() => {
                setIsLoading(false);
                
                // For regular users, animations will play normally
                // For admin users, animations will only play on the first render
                if (!isAdmin) {
                    // Reset the animations played flag for non-admin users
                    animationsPlayedRef.current = false;
                }
            }, delay);
            
            return () => clearTimeout(timer);
        }
    }, [loadedSections, isAdmin]);

    const handlePay = async () => {
        if (orderDetails && orderDetails.total_price) {
            try {
                const res = await api.post('payment/create_payment_url', {
                    amount: orderDetails.total_price,
                    orderId: id
                });
                window.location.href = res.data.url;
            } catch (error) {
                console.error("Error creating payment URL:", error);
            }
        }
    };

    // Function to handle dialog close and page reload
    const handleSuccessDialogClose = useCallback(() => {
        setSuccessDialogOpen(false);
        
        // For admin users, reduce delay and ensure animations don't play on reload
        const delay = isAdmin ? 50 : 150;
        
        // Small delay before reloading to allow the dialog close animation to complete
        const timer = setTimeout(() => {
            // For admin users, force a reload that won't trigger animations
            if (isAdmin) {
                animationsPlayedRef.current = true;
            }
            window.location.reload();
        }, delay);
        
        // Cleanup timer to prevent memory leaks
        return () => clearTimeout(timer);
    }, [isAdmin]); // Add isAdmin as dependency

    const handleCashPayment = useCallback(async () => {
        if (orderId) {
            setIsSubmitting(true);
            try {
                // Show the success dialog immediately with loading state
                setSuccessDialogOpen(true);
                
                // For admin users, ensure dialog shows immediately without animation delays
                if (isAdmin) {
                    animationsPlayedRef.current = true;
                }
                
                // Make the API call
                const response = await api.put(`payment/UpdateFor?idOrder=${id}`, {
                    payment_method: "CASH",
                    code: "string",
                    bank: "string",
                    status: "PAID",
                    note: "string"
                });
                
                // No need to check response status, since any error will be caught
                // and we already showed the success dialog optimistically
            } catch (error) {
                console.error("Error processing cash payment:", error);
                // Close the success dialog if there was an error
                setSuccessDialogOpen(false);
                // Show error message
                alert("Có lỗi xảy ra khi thanh toán tiền mặt");
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [orderId, id, setSuccessDialogOpen, setIsSubmitting, isAdmin]); // Added isAdmin to dependencies

    // Helper function to get payment status text
    const getPaymentStatusText = useCallback((status: string) => {
        if (orderDetails?.InfoOrderPayment?.transactionStatus === '00' || orderDetails?.InfoOrderPayment?.status === 'PAID') {
            return "Đã thanh toán"
        } else {
            return "Chưa thanh toán"
        }
    }, [orderDetails]);

    // Helper function to display item type with appropriate icon
    const getItemTypeIcon = useCallback((type: string) => {
        switch (type) {
            case "FOOD": return <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '5px' }} />;
            case "DRINK": return <span style={{ marginRight: '5px' }}>🥤</span>;
            default: return null;
        }
    }, []);

    // Helper function to get seat sizes from orderDetails
    const getSeatSizes = () => {
        if (!orderDetails?.InfoOrderItems || orderDetails.InfoOrderItems.length === 0) {
            return { j_size: 0, q_size: 0, k_size: 0 };
        }

        const orderItem = orderDetails.InfoOrderItems[0];
        return {
            j_size: orderItem.j_size || 0,
            q_size: orderItem.q_size || 0,
            k_size: orderItem.k_size || 0
        };
    };

    // Get seat information from orderDetails
    const seatSizes = getSeatSizes();

    // Component for rendering combined event and seat information section
    const EventAndSeatInformationSection = () => (
        eventDetails && (
            <Paper
                sx={{
                    backgroundColor: "white",
                    boxShadow: "none",
                    borderRadius: 2,
                    mb: { xs: 3, md: 2 },
                    p: { xs: 1.5, md: 2 },
                    border: `1px solid rgb(171, 141, 89)`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
                    }
                }}
            >
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 2, md: 3 } }}>
                    {/* Event Information */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: "rgb(171, 141, 89)",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                mb: 0.75,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                borderBottom: "1px solid rgba(171, 141, 89, 0.3)",
                                paddingBottom: 0.75,
                            }}
                        >
                            Thông tin sự kiện
                        </Typography>

                        {/* Event title */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1.5,
                                backgroundColor: "rgba(171, 141, 89, 0.08)",
                                borderRadius: 1.5,
                                p: 1.25,
                                mb: 1.5,
                            }}
                        >
                            <Box sx={{
                                mr: 1.25,
                                color: "rgb(171, 141, 89)",
                                width: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem"
                            }}>
                                <FontAwesomeIcon icon={faTicket} />
                            </Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    color: "rgb(171, 141, 89)",
                                }}
                            >
                                {eventDetails.title || "Sự kiện"}
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: { xs: 1, sm: 1.5 },
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
                                        {eventDetails.InfoShowTimes && eventDetails.InfoShowTimes.length > 0 ?
                                            formatDateTime3(eventDetails.InfoShowTimes[0].time_start) :
                                            "Không có thông tin thời gian"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Venue section */}
                            {eventDetails.venue && (
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
                                            {eventDetails.venue}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Divider for mobile view */}
                    {(seatSizes.j_size > 0 || seatSizes.q_size > 0 || seatSizes.k_size > 0) && (
                        <Box 
                            sx={{ 
                                display: { xs: "block", md: "none" }, 
                                width: "100%",
                                my: 0.5,
                                borderTop: "1px dashed rgba(171, 141, 89, 0.3)" 
                            }} 
                        />
                    )}

                    {/* Seat Information */}
                    {(seatSizes.j_size > 0 || seatSizes.q_size > 0 || seatSizes.k_size > 0) && (
                        <Box 
                            sx={{ 
                                flex: 1,
                                borderLeft: { xs: "none", md: "1px dashed rgba(171, 141, 89, 0.3)" },
                                pl: { xs: 0, md: 3 }
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
                                    letterSpacing: "0.05em",
                                    borderBottom: "1px solid rgba(171, 141, 89, 0.3)",
                                    paddingBottom: 0.75,
                                }}
                            >
                                Thông tin ghế
                            </Typography>

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
                                        {seatSizes.j_size + seatSizes.q_size + seatSizes.k_size} ghế
                                    </Typography>
                                </Box>

                                {/* Seat type cards */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                                    {seatSizes.j_size > 0 && (
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
                                                {seatSizes.j_size}
                                            </Typography>
                                        </Box>
                                    )}

                                    {seatSizes.q_size > 0 && (
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
                                                {seatSizes.q_size}
                                            </Typography>
                                        </Box>
                                    )}

                                    {seatSizes.k_size > 0 && (
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
                                                {seatSizes.k_size}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>
        )
    );

    // Component for rendering customer information section
    const CustomerInformationSection = () => (
        orderDetails?.InfoUser && (
            <Paper
                sx={{
                    backgroundColor: "white",
                    boxShadow: "none",
                    borderRadius: 2,
                    mb: 2.5,
                    p: { xs: 2, md: 2.25 },
                    border: `1px solid rgb(171, 141, 89)`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
                    }
                }}
            >
                <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    mb: 1.75,
                    borderBottom: "1px solid rgba(171, 141, 89, 0.3)",
                    paddingBottom: 1
                }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "rgb(171, 141, 89)",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Thông tin khách hàng
                    </Typography>
                </Box>

                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1.5, 
                    backgroundColor: "rgba(171, 141, 89, 0.03)",
                    border: "1px solid rgba(171, 141, 89, 0.08)"
                }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 1.5,
                            pb: 1.5,
                            borderBottom: "1px dashed rgba(171, 141, 89, 0.15)"
                        }}>
                            <Box sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                backgroundColor: "rgba(171, 141, 89, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "rgb(171, 141, 89)",
                                flexShrink: 0,
                                position: "relative"
                            }}>
                                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                                    {orderDetails.InfoUser.name.charAt(0).toUpperCase()}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: "#333",
                                            fontSize: "0.95rem",
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {orderDetails.InfoUser.name}
                                    </Typography>
                                    
                                    {orderDetails.InfoUser.customer_type && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                py: 0.25,
                                                px: 0.75,
                                                borderRadius: 1,
                                                ...(orderDetails.InfoUser.customer_type === "K" && {
                                                    background: "rgba(28, 28, 28, 0.08)",
                                                    color: "#1C1C1C",
                                                }),
                                                ...(orderDetails.InfoUser.customer_type === "Q" && {
                                                    background: "rgba(255, 214, 10, 0.1)",
                                                    color: "#9e7800",
                                                }),
                                                ...(orderDetails.InfoUser.customer_type === "J" && {
                                                    background: "rgba(0, 0, 0, 0.05)",
                                                    color: "#555",
                                                }),
                                            }}
                                        >
                                            {orderDetails.InfoUser.customer_type === "K" ? "King" :
                                             orderDetails.InfoUser.customer_type === "Q" ? "Queen" :
                                             orderDetails.InfoUser.customer_type === "J" ? "Jack" : 
                                             orderDetails.InfoUser.customer_type}
                                        </Typography>
                                    )}
                                </Box>
                                
                                <Box sx={{ mt: 0.75, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#666",
                                            fontSize: "0.8rem",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box component="span" sx={{ width: 18, color: "rgba(171, 141, 89, 0.7)" }}>📱</Box>
                                        {orderDetails.InfoUser.phone}
                                    </Typography>
                                    
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#666",
                                            fontSize: "0.8rem",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box component="span" sx={{ width: 18, color: "rgba(171, 141, 89, 0.7)" }}>📧</Box>
                                        {orderDetails.InfoUser.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {orderDetails.InfoUser.address && (
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                <Typography 
                                    variant="body2" 
                                    color="#666" 
                                    sx={{ width: "30%", fontSize: "0.85rem" }}
                                >
                                    Địa chỉ:
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 500, 
                                        color: "#333",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    {orderDetails.InfoUser.address}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Paper>
        )
    );

    // Component for rendering combined payment information and buttons section
    const UnifiedPaymentSection = () => (
        orderDetails && (
            <Paper
                sx={{
                    backgroundColor: "white",
                    boxShadow: "none",
                    borderRadius: 2,
                    mb: 2.5,
                    p: { xs: 2, md: 2.25 },
                    border: `1px solid rgb(171, 141, 89)`,
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
                        mb: 1.75,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid rgba(171, 141, 89, 0.3)",
                        paddingBottom: 1
                    }}
                >
                    Thông tin thanh toán
                </Typography>

                {/* Payment Status Section */}
                <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                        <Typography 
                            variant="body2" 
                            color="#666" 
                            sx={{ fontSize: "0.85rem" }}
                        >
                            Tình trạng:
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                py: 0.5,
                                px: 1.5,
                                borderRadius: 1,
                                ...(orderDetails.InfoOrderPayment?.transactionStatus === '00' ||
                                  orderDetails?.InfoOrderPayment?.status === 'PAID' 
                                  ? { 
                                      backgroundColor: "rgba(0, 128, 0, 0.1)",
                                      color: "green" 
                                    } 
                                  : { 
                                      backgroundColor: "rgba(255, 0, 0, 0.1)",
                                      color: "red" 
                                    })
                            }}
                        >
                            {getPaymentStatusText(orderDetails.InfoOrderPayment?.transactionStatus || orderDetails?.InfoOrderPayment?.status)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                        <Typography 
                            variant="body2" 
                            color="#666" 
                            sx={{ fontSize: "0.85rem" }}
                        >
                            Mã Checkin:
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: "rgb(171, 141, 89)",
                                backgroundColor: "rgba(171, 141, 89, 0.08)",
                                py: 0.5,
                                px: 1.5,
                                borderRadius: 1,
                                fontSize: "0.85rem"
                            }}
                        >
                            {orderDetails.code || "N/A"}
                        </Typography>
                    </Box>

                    {orderDetails.InfoOrderPayment?.bankTranNo && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                            <Typography 
                                variant="body2" 
                                color="#666" 
                                sx={{ fontSize: "0.85rem" }}
                            >
                                Mã hóa đơn:
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: "#333",
                                    fontSize: "0.85rem"
                                }}
                            >
                                {orderDetails.InfoOrderPayment.bankTranNo}
                            </Typography>
                        </Box>
                    )}

                    {orderDetails.InfoOrderPayment?.updatedAt && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography 
                                variant="body2" 
                                color="#666" 
                                sx={{ fontSize: "0.85rem" }}
                            >
                                Thời gian đặt chỗ:
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: "#333",
                                    fontSize: "0.85rem"
                                }}
                            >
                                {formatDateTime(orderDetails.InfoOrderPayment.updatedAt)}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Divider sx={{ 
                    my: 2, 
                    borderColor: "rgba(171, 141, 89, 0.15)",
                    borderStyle: "dashed"
                }} />

                {/* Payment Summary Section */}
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.25}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: "#555", 
                                fontWeight: 500,
                                fontSize: "0.85rem" 
                            }}
                        >
                            Tổng tiền:
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600,
                                color: "#333",
                                fontSize: "0.9rem" 
                            }}
                        >
                            {formatMoney(totalBeforeDiscount)}
                        </Typography>
                    </Box>

                    {/* Promotion Section */}
                    {orderDetails.promotion && (
                        <Box
                            sx={{
                                backgroundColor: "rgba(0, 128, 0, 0.05)",
                                p: 1.5,
                                borderRadius: 1.5,
                                mb: 1.5,
                                border: "1px dashed rgba(0, 128, 0, 0.2)"
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                                <Box display="flex" alignItems="center">
                                    <FontAwesomeIcon 
                                        icon={faTag} 
                                        style={{ 
                                            color: "#4caf50", 
                                            marginRight: "8px",
                                            fontSize: "0.9rem" 
                                        }} 
                                    />
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: "#333",
                                            fontWeight: 500,
                                            fontSize: "0.85rem" 
                                        }}
                                    >
                                        Mã giảm giá:
                                    </Typography>
                                    <Chip
                                        label={orderDetails.promotion.code}
                                        size="small"
                                        color="success"
                                        sx={{ ml: 1, fontSize: '0.75rem', height: "24px" }}
                                    />
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    fontWeight="700" 
                                    sx={{ 
                                        color: "green",
                                        fontSize: "0.85rem" 
                                    }}
                                >
                                    -{formatMoney(discountAmount)}
                                </Typography>
                            </Box>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontSize: '0.75rem', 
                                    color: '#666', 
                                    fontStyle: 'italic',
                                    mt: 0.5,
                                    textAlign: "left"
                                }}
                            >
                                {orderDetails.promotion.name} ({orderDetails.promotion.type_price === "PERCENT" ?
                                    `${orderDetails.promotion.price}%` :
                                    formatMoney(orderDetails.promotion.price)})
                            </Typography>
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "rgba(171, 141, 89, 0.07)",
                            p: 1.5,
                            borderRadius: 1.5
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                color: "#333",
                                fontSize: "0.95rem",
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
                            {formatMoney(orderDetails.total_price || 0)}
                        </Typography>
                    </Box>
                </Box>

                {/* Payment Buttons */}
                {(orderDetails?.InfoOrderPayment?.status !== 'PAID') && (
                    <>
                        <Divider sx={{ 
                            my: 2, 
                            borderColor: "rgba(171, 141, 89, 0.15)",
                            borderStyle: "solid"
                        }} />
                        
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* <Box sx={{ flex: 1 }}> */}
                                {/* Temporarily commented out Thanh toán online button
                                <Button
                                    onClick={handlePay}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: "rgb(171, 141, 89)",
                                        color: "white",
                                        py: 1.5,
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                        fontSize: "0.95rem",
                                        boxShadow: "none",
                                        border: "1px solid rgb(171, 141, 89)",
                                        textTransform: "none",
                                        "&:hover": {
                                            backgroundColor: "rgba(171, 141, 89, 0.9)",
                                            boxShadow: "0 4px 8px rgba(171, 141, 89, 0.2)",
                                        },
                                    }}
                                >
                                    Thanh toán online
                                </Button>
                                */}
                            {/* </Box> */}
                            {userInfo ? <>
                                {userInfo.role == 'ADMIN' || userInfo.role == 'BOSS' ?
                                <Box sx={{ flex: 1 }}>
                                    {/* <Button
                                        onClick={handleCashPayment}
                                        variant="contained"
                                        fullWidth
                                        disabled={isSubmitting}
                                        sx={{
                                            backgroundColor: "#4caf50",
                                            color: "white",
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 1.5,
                                            fontSize: "0.95rem",
                                            boxShadow: "none",
                                            border: "1px solid #43a047",
                                            textTransform: "none",
                                            minHeight: "48px",
                                            position: "relative",
                                            "&:hover": {
                                                backgroundColor: "#43a047",
                                                boxShadow: "0 4px 8px rgba(76, 175, 80, 0.2)",
                                            },
                                            "&:disabled": {
                                                backgroundColor: "rgba(76, 175, 80, 0.7)",
                                                color: "white",
                                            }
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <CircularProgress 
                                                    size={20} 
                                                    sx={{ color: "white", mr: 1 }} 
                                                />
                                                <span>Đang xử lý...</span>
                                            </Box>
                                        ) : "Thanh toán tiền mặt"}
                                    </Button> */}
                                </Box> : ""}
                            </> : <>
                            
                            </>}
                        </Box>
                    </>
                )}
            </Paper>
        )
    );

    // Replace the separate ComboOrdersSection and AdditionalItemsSection with a new combined component
    const CombinedOrderSection = () => {
        const hasCombo = orderDetails?.InfoOrderItems && 
                        orderDetails.InfoOrderItems.length > 0 && 
                        orderDetails.InfoOrderItems[0].combo_info && 
                        orderDetails.InfoOrderItems[0].combo_info.length > 0;
        
        const hasAdditionalItems = orderDetails?.InfoOrderItems && 
                                  orderDetails.InfoOrderItems.length > 0 && 
                                  orderDetails.InfoOrderItems[0].item_upsell && 
                                  orderDetails.InfoOrderItems[0].item_upsell.length > 0;

        if (!hasCombo && !hasAdditionalItems) return null;

        return (
            <Paper
                sx={{
                    backgroundColor: "white",
                    boxShadow: "none",
                    borderRadius: 2,
                    mb: 2.5,
                    p: { xs: 2, md: 2.25 },
                    border: `1px solid rgb(171, 141, 89)`,
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
                        mb: 1.75,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid rgba(171, 141, 89, 0.3)",
                        paddingBottom: 1
                    }}
                >
                    Chi tiết đơn hàng
                </Typography>

                {/* Combo Orders Section */}
                {hasCombo && (
                    <Box sx={{ mb: hasAdditionalItems ? 3 : 0 }}>
                        <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            mb: 1.5,
                            gap: 1
                        }}>
                            <Box
                                sx={{
                                    width: 3,
                                    height: 16,
                                    backgroundColor: "rgb(171, 141, 89, 0.7)",
                                    borderRadius: 1
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "rgb(171, 141, 89)",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Combo đã đặt
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                            {orderDetails.InfoOrderItems[0].combo_info.map((combo: any, comboIndex: number) => (
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
                                                fontSize: "0.95rem"
                                            }}
                                        >
                                            {combo.name}
                                            {combo.count && combo.count > 1 && (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: 'rgb(171, 141, 89)',
                                                    marginLeft: '4px'
                                                }}>
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
                                            {formatMoney(combo.price || 0)}
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
                        </Box>
                    </Box>
                )}

                {/* Divider between sections if both exist */}
                {hasCombo && hasAdditionalItems && (
                    <Divider sx={{ 
                        my: 2, 
                        borderColor: "rgba(171, 141, 89, 0.15)",
                        borderStyle: "dashed" 
                    }} />
                )}

                {/* Additional Items Section */}
                {hasAdditionalItems && (
                    <Box>
                        <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            mb: 1.5,
                            gap: 1
                        }}>
                            <Box
                                sx={{
                                    width: 3,
                                    height: 16,
                                    backgroundColor: "rgb(171, 141, 89, 0.7)",
                                    borderRadius: 1
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "rgb(171, 141, 89)",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Món bổ sung
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 1.75,
                                borderRadius: 1.5,
                                backgroundColor: "rgba(171, 141, 89, 0.02)",
                                border: "1px solid rgba(171, 141, 89, 0.1)",
                                position: "relative",
                                mt: 0.5,
                                borderStyle: "dashed"
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
                                {orderDetails.InfoOrderItems[0].item_upsell.map((item: any, index: number) => (
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
                                                color: "rgb(171, 141, 89)",
                                                backgroundColor: "rgba(171, 141, 89, 0.08)",
                                                borderRadius: 1,
                                                px: 1,
                                                py: 0.5,
                                                fontSize: "0.85rem",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {formatMoney(item.price * item.quantity)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>
        );
    };

    // Create a new animated box component for fade-in animations - memoized to prevent re-creation
    const AnimatedFadeInBox = React.memo(({ delay = 0, children, ...props }: { 
        delay?: number; 
        children: React.ReactNode; 
        sx?: any;
        [key: string]: any; 
    }) => {
        // For admin users, only animate on first render, otherwise just set opacity to 1
        const shouldAnimate = !isAdmin || !animationsPlayedRef.current;
        
        return (
            <Box
                sx={{
                    // If admin and animations already played, don't animate - just set opacity to 1
                    ...(shouldAnimate ? {
                        opacity: 0,
                        animation: `${fadeInUp} 0.5s ease-out forwards`,
                        animationDelay: `${delay}ms`,
                    } : {
                        opacity: 1,
                    }),
                    transform: 'translateZ(0)', // GPU acceleration
                    willChange: shouldAnimate ? 'transform, opacity' : 'auto',
                    ...props.sx
                }}
                {...props}
            >
                {children}
            </Box>
        );
    });
    
    // Add display name for debugging
    AnimatedFadeInBox.displayName = 'AnimatedFadeInBox';

    // Add the SuccessDialog component before the return statement - memoized for performance
    const SuccessDialogContent = () => {
        return (
            <Dialog 
                open={successDialogOpen}
                onClose={!isSubmitting ? handleSuccessDialogClose : undefined} // Prevent closing while submitting
                aria-labelledby="success-dialog-title"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        maxWidth: '350px',
                        width: '100%',
                        m: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ 
                    p: 2, 
                    bgcolor: '#4caf50', 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography 
                        id="success-dialog-title"
                        variant="h6" 
                        sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Thanh toán thành công'}
                    </Typography>
                    {!isSubmitting && (
                        <IconButton 
                            size="small" 
                            onClick={handleSuccessDialogClose}
                            sx={{ color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faTimesCircle} size="sm" />
                        </IconButton>
                    )}
                </Box>
                <DialogContent sx={{ p: 2.5, pt: 2 }}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        py: 0.5
                    }}>
                        <Box 
                            className="success-icon-animation"
                            sx={{ 
                                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                                width: 56, 
                                height: 56, 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                position: 'relative',
                                // Only animate when the dialog is newly opened
                                animation: successDialogOpen && !isAdmin ? `${successIconAnimation} 0.4s ease-out forwards` : 'none',
                                opacity: 1
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress 
                                    size={24} 
                                    thickness={4}
                                    sx={{ color: '#4caf50' }} 
                                />
                            ) : (
                                <FontAwesomeIcon 
                                    icon={faCheck} 
                                    style={{ 
                                        color: '#4caf50', 
                                        fontSize: '24px'
                                    }} 
                                />
                            )}
                        </Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 600, 
                                mb: 1, 
                                color: '#333',
                                fontSize: '1rem'
                            }}
                        >
                            {isSubmitting ? 'Đang xác nhận thanh toán' : 'Đã xác nhận thanh toán'}
                        </Typography>
                        
                        {orderDetails && !isSubmitting && (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    width: '100%',
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(0, 0, 0, 0.02)'
                                }}
                            >
                                <Typography 
                                    variant="body2" 
                                    sx={{ color: '#555', fontWeight: 500 }}
                                >
                                    Mã checkin:
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ color: '#333', fontWeight: 600 }}
                                >
                                    {orderDetails.code || "N/A"}
                                </Typography>
                            </Box>
                        )}
                        
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: '#666', 
                                mb: 0.5,
                                fontSize: '0.85rem' 
                            }}
                        >
                            {isSubmitting 
                                ? 'Đang xác nhận giao dịch tiền mặt...' 
                                : 'Đơn hàng đã được xác nhận thanh toán tiền mặt.'}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2, pt: 0, justifyContent: 'center' }}>
                    <Button 
                        onClick={handleSuccessDialogClose} 
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            bgcolor: '#4caf50',
                            fontWeight: 600,
                            py: 0.75,
                            px: 2.5,
                            borderRadius: 1.5,
                            '&:hover': {
                                bgcolor: '#43a047'
                            },
                            textTransform: 'none',
                            minWidth: '100px',
                            boxShadow: 'none'
                        }}
                    >
                        {isSubmitting ? 'Vui lòng đợi...' : 'Đóng'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
    
    // Create a memoized version of the dialog
    const SuccessDialog = React.memo(SuccessDialogContent);
    
    // Add display name for debugging
    SuccessDialog.displayName = 'SuccessDialog';

    return (
        <Box>
            <title> Thông tin thanh toán | Queen Acoustic</title>
            <meta name="description" content="Trang thông tin thanh toán tại Queen Acoustic." />
            {/* Add SuccessDialog component here */}
            <SuccessDialog />
            <Container sx={{ 
                position: "relative", 
                width: "100%", 
                display: "flex", 
                justifyContent: "center", 
                my: { xs: 4, md: 3 },
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2 } 
            }}>
                {/* Action buttons container - Always visible */}
                <Box
                    sx={{
                        position: "absolute",
                        top: { xs: -8, sm: -12 },
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: { xs: 1, sm: 2, md: 3 },
                        zIndex: 20,
                        maxWidth: { xs: "100%", md: "90%" },
                    }}
                >
                    {/* Back button */}
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={() => {
                            // Get the previous URL from localStorage
                            const prevPage = localStorage.getItem("previousURL");
                            
                            // Check if we have a valid previous URL and handle it intelligently
                            if (prevPage) {
                                // Determine if the user is admin before navigating
                                const isAdminPage = prevPage.includes('/dashboard');
                                const isCustomerPage = prevPage.includes('/customer');
                                
                                // For admin users specifically, ensure we go back to the admin page
                                if (isAdmin && !isAdminPage && !isCustomerPage) {
                                    window.location.href = '/dashboard/ticket-list';
                                    return;
                                }
                                
                                // For regular customer views, go back to customer pages
                                if (!isAdmin && !isCustomerPage && isAdminPage) {
                                    window.location.href = '/customer/my-tickets';
                                    return;
                                }
                                
                                // Otherwise use the stored previous URL
                                window.location.href = prevPage;
                            } else {
                                // If no previous URL, use role to determine default navigation
                                if (isAdmin) {
                                    window.location.href = '/dashboard/ticket-list';
                                } else {
                                    window.location.href = '/customer/my-tickets';
                                }
                            }
                        }}
                        sx={{
                            cursor: "pointer",
                            borderRadius: 1.5,
                            backgroundColor: "rgb(171, 141, 89)",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                            px: { xs: 1.25, sm: 1.75 },
                            py: { xs: 0.5, sm: 0.85 },
                            minWidth: { xs: "32px", sm: "auto" },
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            "&:hover": {
                                backgroundColor: "rgba(171, 141, 89, 0.9)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            },
                        }}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "6px", fontSize: "0.8rem" }} /> 
                        <Box className="d-none d-sm-inline">Quay lại</Box>
                    </Button>

                    {/* Share and copy buttons */}
                    <Box sx={{ 
                        display: "flex", 
                        gap: { xs: 0.75, sm: 1.5 },
                        ml: "auto"
                    }}>
                        <Tooltip title="Sao chép link">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 3000);
                                }}
                                sx={{
                                    cursor: "pointer",
                                    borderRadius: 1.5,
                                    backgroundColor: copied ? "rgba(0, 128, 0, 0.05)" : "rgba(171, 141, 89, 0.05)",
                                    color: copied ? "green" : "rgb(171, 141, 89)",
                                    border: copied ? "1px solid green" : "1px solid rgb(171, 141, 89)",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    px: { xs: 1, sm: 1.75 },
                                    py: { xs: 0.5, sm: 0.85 },
                                    minWidth: { xs: "32px", sm: "auto" },
                                    width: { xs: "32px", sm: "auto" },
                                    height: { xs: "32px", sm: "auto" },
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "none",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: copied ? "rgba(0, 128, 0, 0.1)" : "rgba(171, 141, 89, 0.1)",
                                        borderColor: copied ? "green" : "rgb(171, 141, 89)",
                                    },
                                }}
                            >
                                {copied ? (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} style={{ fontSize: "0.85rem" }} />
                                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 0.75 }}>Đã sao chép</Box>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCopy} style={{ fontSize: "0.85rem" }} />
                                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 0.75 }}>Sao chép</Box>
                                    </>
                                )}
                            </Button>
                        </Tooltip>

                        {/* <Tooltip title="Chia sẻ">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: document.title,
                                            url: window.location.href,
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 3000);
                                        alert("Link đã được sao chép, bạn có thể chia sẻ ngay bây giờ.");
                                    }
                                }}
                                sx={{
                                    cursor: "pointer",
                                    borderRadius: 1.5,
                                    backgroundColor: "rgba(171, 141, 89, 0.05)",
                                    color: "rgb(171, 141, 89)",
                                    border: "1px solid rgb(171, 141, 89)",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    px: { xs: 1, sm: 1.75 },
                                    py: { xs: 0.5, sm: 0.85 },
                                    minWidth: { xs: "32px", sm: "auto" },
                                    width: { xs: "32px", sm: "auto" },
                                    height: { xs: "32px", sm: "auto" },
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "rgba(171, 141, 89, 0.1)",
                                    },
                                }}
                            >
                                <FontAwesomeIcon icon={faShareNodes} style={{ fontSize: "0.85rem" }} />
                                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 0.75 }}>Chia sẻ</Box>
                            </Button>
                        </Tooltip> */}
                    </Box>
                </Box>

                {/* Loading spinner */}
                {isLoading ? (
                    <SimpleLoadingSpinner />
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            position: "relative",
                            mt: { xs: 5, md: 3 },
                            borderRadius: "16px",
                            overflow: "hidden",
                            zIndex: 10,
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundImage: "url('/images/background.jpg')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                opacity: 0.35,
                                zIndex: -1,
                            }}
                        />

                        {/* Gold accent line at the top */}
                        <Box
                            sx={{
                                height: "6px",
                                width: "100%",
                                background: "linear-gradient(90deg, rgb(171, 141, 89) 0%, rgb(211, 187, 141) 50%, rgb(171, 141, 89) 100%)",
                            }}
                        />

                        <Typography variant="h5" sx={{
                            textTransform: "uppercase",
                            textAlign: "center",
                            fontWeight: 700,
                            my: 2.5,
                            pt: 2,
                            px: 3,
                            color: "rgb(171, 141, 89)",
                            position: "relative",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: -8,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "40px",
                                height: "2px",
                                backgroundColor: "rgba(171, 141, 89, 0.6)",
                                borderRadius: "2px",
                            }
                        }}>
                            THÔNG TIN ĐẶT CHỖ
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { md: "1.1rem", xs: "1rem" }, color: "rgb(255, 0, 0)", fontWeight: 600, mb: 2, fontStyle: "italic", textAlign: "center", padding: 2 }}> "Lưu ý: Đơn đặt chỗ đã hủy thanh toán sẽ không thể thanh toán lại. Vui lòng thực hiện đặt chỗ mới nếu quý khách vẫn muốn tham gia chương trình." </Typography>
                        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ p: { xs: 2, md: 3.5 }, pt: { xs: 0, md: 1 } }}>
                            {/* Combined Event and Seat Information at the top */}
                            <Grid item xs={12}>
                                <AnimatedFadeInBox delay={100}>
                                    <EventAndSeatInformationSection />
                                </AnimatedFadeInBox>
                            </Grid>

                            {/* Order Details Section - On mobile appears second, on desktop appears in left column */}
                            <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 2 } }}>
                                <AnimatedFadeInBox delay={200}>
                                    <CombinedOrderSection />
                                </AnimatedFadeInBox>
                            </Grid>

                            {/* Right column container for desktop layout - Contains Customer Info and Payment Info */}
                            <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column" }}>
                                {/* Customer Information Section - On mobile appears first */}
                                <Grid item xs={12} sx={{ order: { xs: 1, md: 1 } }}>
                                    <AnimatedFadeInBox delay={300}>
                                        <CustomerInformationSection />
                                    </AnimatedFadeInBox>
                                </Grid>

                                {/* Payment Section - On mobile appears last, on desktop appears beneath customer info */}
                                <Grid item xs={12} sx={{ order: { xs: 3, md: 2 } }}>
                                    <AnimatedFadeInBox delay={400}>
                                        <UnifiedPaymentSection />
                                    </AnimatedFadeInBox>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
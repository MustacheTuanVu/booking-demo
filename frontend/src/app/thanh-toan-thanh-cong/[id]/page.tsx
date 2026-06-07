"use client";
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Card } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCalendarAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Grid from '@mui/material/Grid2';
import api from '@/utils/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { keyframes } from '@mui/system';

// Simple fade-in animation that's consistent with site style
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export default function PaymentSuccess() {
    const { id } = useParams();
    const router = useRouter();
    const [orderCode, setOrderCode] = useState("");
    const [timeStart, settimeStart] = useState("");
    const [isQrHovered, setIsQrHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get('/orders/GetById/' + id);
                const data = await response.data[0];
                setOrderCode(data.code);
                settimeStart(data.InfoShowTimes?.[0]?.time_start || "");
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchOrder();
    }, [id]);

    // Nếu orderCode có giá trị, tạo URL cho QR Code, ngược lại dùng ảnh mặc định
    const qrCodeUrl = orderCode
        ? `https://api.qrserver.com/v1/create-qr-code/?data=${orderCode}&size=150x150`
        : "/images/qrcode.png";

    return (
        <Container
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                pb: 5,
            }}
        >
            <title>Thanh toán thành công | Queen Acoustic</title>
            <meta name="description" content="Trang thanh toán thành công tại Queen Acoustic." />
            <Box
                sx={{
                    maxWidth: "48rem",
                    textAlign: "center",
                    width: "100%",
                    position: "relative",
                    p: { xs: 3, md: 6 },
                    pb: { xs: 6, md: 8 },
                    mb: 4,
                    zIndex: 1,
                    animation: `${fadeIn} 0.4s ease-out forwards`,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 10,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundImage: "url('/images/background.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        opacity: 0.3,
                        borderRadius: "20px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.8)",
                        borderTop: "8px solid rgb(171 141 89)",
                        zIndex: -1,
                    }}
                />

                {/* Success Icon */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        mt: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faCheck}
                            style={{
                                fontSize: '2.5rem',
                                color: '#22c55e'
                            }}
                        />
                    </Box>
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: 'var(--clr-txt-4)',
                        fontSize: { xs: 30, md: 42 },
                        mb: 2,
                    }}
                >
                    Đặt chỗ thành công
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        my: 2,
                        fontSize: 18,
                        mb: 3,
                    }}
                >
                    Cảm ơn quý khách đã đặt chỗ tại Queen Acoustic
                </Typography>

                <Card
                    sx={{
                        width: { xs: '100%', lg: '100%' },
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        borderRadius: "10px",
                        bgcolor: "transparent",
                        overflow: 'hidden',
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        sx={{
                            display: { xs: "block", md: "flex" },
                            gap: 2,
                            p: { xs: 2, md: 3 },
                        }}
                    >
                        {/* Cột trái: Mã đơn hàng và QR Code */}
                        <Grid size={{ xs: 12, md: 4 }} textAlign="center" my={2}>
                            <Box
                                sx={{
                                    color: "var(--clr-txt-4)",
                                    fontWeight: "bold",
                                    fontSize: 18,
                                    mb: 1,
                                }}
                            >
                                {orderCode}
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 1,
                                    position: 'relative',
                                }}
                                onMouseEnter={() => setIsQrHovered(true)}
                                onMouseLeave={() => setIsQrHovered(false)}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        padding: 2,
                                        border: "4px solid var(--clr-txt-4)",
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        transform: isQrHovered ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isQrHovered ? '0 4px 12px rgba(171, 141, 89, 0.2)' : 'none',
                                    }}
                                >
                                    <Image
                                        src={qrCodeUrl}
                                        alt="QR Code"
                                        width={150}
                                        height={150}
                                        onLoad={() => setImageLoaded(true)}
                                        style={{
                                            opacity: imageLoaded ? 1 : 0.7,
                                            transition: 'opacity 0.3s ease',
                                        }}
                                    />
                                    {!imageLoaded && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 14, color: 'var(--clr-txt-4)' }}>
                                                Đang tải...
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>

                        {/* Cột phải: Thông tin đặt chỗ */}
                        <Grid size={{ xs: 12, md: 8 }} textAlign={{ xs: "center", md: "left" }}>
                            <Typography
                                sx={{
                                    mb: 2,
                                    fontWeight: "bold",
                                    fontSize: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: { xs: 'center', md: 'flex-start' },
                                    gap: 1,
                                }}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: 'var(--clr-txt-4)', fontSize: '1rem' }} />
                                Chi Tiết Đặt Chỗ
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: { xs: 'center', md: 'flex-start' },
                                    mb: 2,
                                }}
                            >
                                <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--clr-txt-4)' }} />
                                <Typography sx={{ color: "var(--clr-txt-4)" }}>
                                    Ngày & giờ: <span style={{ fontWeight: "bold" }}> {timeStart ? format(new Date(timeStart).getTime(), "HH:mm, EEE 'ngày' dd 'tháng' MM, yyyy", { locale: vi }) : "..."}</span>
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'rgba(171, 141, 89, 0.05)',
                                    borderRadius: 2,
                                    mb: 2,
                                }}
                            >
                                <Typography sx={{ color: "#1C2B3A", fontStyle: "italic", fontSize: 14 }}>
                                    Quý khách vui lòng giữ lại thông tin xác nhận này. Nếu có bất kỳ thắc mắc hoặc cần thay đổi thông tin đặt chỗ, xin vui lòng liên hệ với chúng tôi qua số điện thoại 1900 5225 hoặc email queen.acoustic47@gmail.com.
                                </Typography>
                            </Box>

                            <Typography sx={{ fontSize: 15 }}>
                                Vui lòng kiểm tra chi tiết đặt chỗ tại Hộp thư đến hoặc Thư mục Spam hoặc tại{" "}
                                <Link href="/customer/my-tickets">
                                    <span style={{
                                        color: "var(--clr-txt-4)",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        transition: 'color 0.2s ease',
                                    }}>
                                        Chỗ đã đặt
                                    </span>
                                </Link>
                                .
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>

                <Box sx={{ mt: 4 }}>
                    <Typography sx={{ fontSize: 16, mb: 2 }}>
                        Chúng tôi rất mong được đón tiếp quý khách và hy vọng quý khách sẽ có một trải nghiệm tuyệt vời tại Queen Acoustic.
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 18, color: "var(--clr-txt-4)", fontWeight: "bold" }}>
                        Trân trọng
                    </Typography>
                </Box>

                <Button
                    size='large'
                    component="div"
                    variant="contained"
                    sx={{
                        width: "auto",
                        borderRadius: 20,
                        boxShadow: "none",
                        backgroundColor: 'var(--clr-bg-1)',
                        textTransform: 'none',
                        mt: 4,
                        '&:hover': {
                            backgroundColor: 'var(--clr-bg-7)',
                            color: 'var(--clr-txt-1)',
                        },
                    }}
                    onClick={() => {
                        router.replace(`/`);
                    }}
                >
                    Quay về Trang chủ
                </Button>
            </Box>
        </Container>
    );
}

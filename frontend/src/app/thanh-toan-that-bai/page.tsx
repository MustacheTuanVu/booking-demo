"use client";
import { Container, Typography, Button, Box, Card } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

export default function PaymentFailed() {
    const router = useRouter();
    return (
        <Container
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                pb: 5,
            }}
        >
            <title>Thanh toán thất bại | Queen Acoustic</title>
            <meta name="description" content="Trang thanh toán thất bại tại Queen Acoustic." />
            <Box
                sx={{
                    maxWidth: "48rem",
                    textAlign: "center",
                    width: "100%",
                    position: "relative",
                    p: { xs: 3, md: 6 },
                    zIndex: 1,
                    animation: `${fadeIn} 0.4s ease-out forwards`,
                }}
            >
                {/* Background - matched to success page styling */}
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

                {/* Error Icon - simplified */}
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
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faCircleExclamation}
                            style={{
                                fontSize: '2.5rem',
                                color: 'var(--clr-bg-9)' // Using site variable for red
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
                    Thanh toán thất bại
                </Typography>

                <Card
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 4,
                        borderRadius: "10px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        bgcolor: "transparent",
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            fontSize: { xs: 18, md: 22 },
                            mb: 3,
                            color: 'var(--clr-bg-9)', // Using site variable for red
                        }}
                    >
                        Giao dịch không thành công vì lỗi xác thực.
                    </Typography>

                    <Typography sx={{ mb: 3, fontSize: { xs: 15, md: 16 } }}>
                        Mọi thông tin chi tiết, Quý khách vui lòng liên hệ với chúng tôi qua:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2, mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(171, 141, 89, 0.1)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(171, 141, 89, 0.2)',
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--clr-txt-4)' }} />
                            <Typography sx={{ fontWeight: 'medium' }}>1900 5225</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(171, 141, 89, 0.1)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(171, 141, 89, 0.2)',
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--clr-txt-4)' }} />
                            <Typography sx={{ fontWeight: 'medium' }}>queen.acoustic47@gmail.com</Typography>
                        </Box>
                    </Box>
                </Card>

                <Box>
                    <Typography sx={{ mt: 2, fontSize: 16 }}>
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
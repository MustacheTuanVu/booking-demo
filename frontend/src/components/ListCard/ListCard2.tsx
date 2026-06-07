/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { formatDate, formatTime } from '@/utils/date';
import { faAngleRight, faCalendar, faClock, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Card, CardMedia, Container, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import { getMediaUrl } from '@/utils/mediaUrl';
export default function ListCard2({ eventType, eventList }: any) {
    const sliderRef = useRef<Slider | null>(null);
    const [imagesPerSlide, setImagesPerSlide] = useState(4);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1028) {
                setImagesPerSlide(3); // md trở lên: 2 sản phẩm
            } else if (window.innerWidth >= 645) {
                setImagesPerSlide(2);
            } else {
                setImagesPerSlide(1); // xs: 1 sản phẩm
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const settings = {
        // infinite: true, // Vòng lặp vô hạn
        speed: 500, // Tốc độ chuyển slide
        slidesToShow: imagesPerSlide, // Hiển thị 1 slide mỗi lần
        slidesToScroll: 1, // Cuộn 1 slide mỗi lần
        afterChange: (index: number) => setCurrentSlide(index),
        dotsClass: 'slick-dots custom-dots',
        arrows: false
    };
    const goToPrevSlide = () => {
        sliderRef.current?.slickPrev();
    };
    const goToNextSlide = () => {
        sliderRef.current?.slickNext();
    };

    return (
        <Container className="py-5" sx={{
            position: 'relative',
        }}>
            <Button
                variant="text"
                sx={{
                    position: "absolute",
                    top: 18,
                    right: 14,
                    fontSize: 16,
                    textTransform: "none",
                    alignItems: "center",
                    borderRadius: 2,
                    color: "var(--clr-txt-4)"
                }}
            >
                Xem tất cả <FontAwesomeIcon icon={faAngleRight} style={{ marginLeft: '5px' }} />
            </Button>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--clr-txt-2)', marginBottom: '10px', fontSize: '30px' }}>
                {eventType}
            </Typography>
            <Slider ref={sliderRef} {...settings}>
                {eventList.map((evt: any, index: any) => (
                    <Card
                        key={index}
                        sx={{
                            margin: '10px',
                            color: 'var(--clr-txt-2)',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            minHeight: '45px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            boxShadow: "none",
                            // 
                            borderRadius: '15px 15px 0 0',
                            padding: '10px',
                            cursor: 'pointer',
                            backgroundColor: 'var(--clr-bg)',
                        }}
                        onClick={() => router.push(`/su-kien/${evt.slug}/666`)}
                    >
                        <Box sx={{ backgroundColor: 'var(--clr-bg-8)', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: '15px' }}>
                            <Box
                                sx={{
                                    overflow: 'hidden',
                                    borderRadius: '15px 15px 0 0'
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={getMediaUrl(evt.avatar)}
                                    alt={`Slide ${index + 1}`}
                                    sx={{
                                        height: '220px',
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ mx: 2 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginTop: '10px',
                                        color: 'var(--clr-txt-3)',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        minHeight: '45px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        "&:hover": { color: "var(--clr-txt-4)" },
                                    }}
                                >
                                    {evt.title}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginTop: '10px',
                                        color: 'var(--clr-txt-2)',
                                        fontSize: '12px',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCalendar} size="sm" style={{ color: 'var(--clr-txt-4)', marginRight: '5px', fontWeight: 'bold' }} /> {formatDate(evt.createdAt)}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'var(--clr-txt-2)',
                                        fontSize: '12px',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faClock} size="sm" style={{ color: 'var(--clr-txt-4)', marginRight: '5px', fontWeight: 'bold' }} /> {formatTime(evt.createdAt)}
                                </Typography>
                                <Box
                                    sx={{
                                        marginTop: '10px',
                                        color: 'var(--clr-txt-2)',
                                        fontSize: '14px',
                                        fontWeight: 'normal',
                                        height: '45px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: evt.desc }}
                                />
                                <Box display='flex' justifyContent="space-between" alignItems="center" py={2}>
                                    <Link href={`/su-kien/${evt.slug}/666`}>
                                        <Button
                                            variant="contained"
                                            size='small'
                                            sx={{ backgroundColor: '#AA8A5A', color: 'white', borderRadius: '10px', textTransform: 'none', "&:hover": { backgroundColor: "var(--clr-bg-7)" }, }}
                                        >
                                            Đặt chỗ ngay
                                        </Button>
                                    </Link>
                                    <Link href={`/su-kien/${evt.slug}/666`}>
                                        <Typography
                                            sx={{ color: 'var(--clr-txt-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 14 }}
                                        >
                                            Xem Thêm <FontAwesomeIcon icon={faAngleRight} style={{ marginLeft: '5px' }} />
                                        </Typography>
                                    </Link>
                                </Box>
                            </Box>

                        </Box>
                    </Card>
                ))}
            </Slider>
            {/* Nút chuyển slide */}
            {currentSlide > 0 && (
                <button
                    onClick={goToPrevSlide}
                    className="absolute left-9 top-1/2 transform -translate-y-1/2 p-2 rounded-md z-4"
                    style={{
                        fontSize: "25px",
                        backgroundColor: "var(--clr-bg-4)",
                        color: "var(--clr-txt-1)",
                    }}
                >
                    ❮
                </button>
            )}

            {currentSlide < eventList.length - imagesPerSlide && (
                <button
                    onClick={goToNextSlide}
                    className="absolute right-9 top-1/2 transform -translate-y-1/2 p-2 rounded-md z-4"
                    style={{
                        fontSize: "25px",
                        backgroundColor: "var(--clr-bg-4)",
                        color: "var(--clr-txt-1)",
                    }}
                >
                    ❯
                </button>
            )}
        </Container>
    )
}

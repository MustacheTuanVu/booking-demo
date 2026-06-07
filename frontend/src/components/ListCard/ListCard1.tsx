/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardMedia, Container, Typography } from '@mui/material';
import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import { getMediaUrl } from '@/utils/mediaUrl';

export default function ListCard1({ artistTitle, artistList }: any) {
    const sliderRef = useRef<Slider | null>(null);
    const [imagesPerSlide, setImagesPerSlide] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1028) {
                setImagesPerSlide(4); // md trở lên: 2 sản phẩm
            } else if (window.innerWidth >= 645) {
                setImagesPerSlide(3);
            } else {
                setImagesPerSlide(2); // xs: 1 sản phẩm
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
    const totalSlides = artistList.length;
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
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--clr-txt-4)', marginBottom: '10px', fontSize: '20px' }}>
                {artistTitle}
            </Typography>
            <Slider ref={sliderRef} {...settings}>
                {artistList.map((artist: any, index: any) => (
                    <Card
                        key={index}
                        sx={{
                            borderRadius: '15px',
                            boxShadow: 'none',
                            padding: '10px',
                            position: 'relative',
                            backgroundColor: 'var(--clr-bg)',
                        }}
                    >
                        <Link href={`/ca-sy/${artist.link}`} style={{ cursor: 'pointer', border: 'none' }}>
                            <CardMedia component="img" image={getMediaUrl(artist.image)} alt={`Slide ${index + 1}`} sx={{
                                borderRadius: '15px',
                                height: '350px',
                                objectFit: 'cover',
                            }} />
                        </Link>
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

            {currentSlide < totalSlides - imagesPerSlide && (
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

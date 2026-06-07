"use client";

import React, { useEffect, useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Container, Box, Typography, Button, IconButton } from "@mui/material";
import Slider from "react-slick";
import { formatTime } from "@/utils/date";
import Link from "next/link";
import { getMediaUrl } from "@/utils/mediaUrl";

interface Event {
  _id: number;
  title: string;
  avatar: string;
  createdAt: string;
  desc: string;
  banner: string;
  slug: string;
}

interface SlidersProps {
  events: Event[];
}

export default function Sliders({ events }: SlidersProps) {
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    appendDots: (dots: React.ReactNode) => (
      <Box sx={{ position: "absolute", bottom: 20, width: "100%", display: "flex", justifyContent: "center" }}>
        {dots}
      </Box>
    ),
    customPaging: () => <Box sx={{ width: 10, height: 10, backgroundColor: "white", borderRadius: "50%" }} />
  };

  if (!events || events.length === 0) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container sx={{ position: "relative", my: 2, px: 0, overflow: "hidden", }}>
      <Slider ref={sliderRef} {...settings}>
        {events.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: { xs: "400px", lg: "500px" },
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box
              component={"img"}
              src={getMediaUrl(item.avatar)}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                color: "white",
                p: 4,
                width: "100%",
                minWidth: 300,
                backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 20px, rgba(0,0,0,0.9) 100%)",
                textAlign: { xs: "center", md: "left" }, 
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" }, 
              }}
            >
              <Typography variant="caption" sx={{
                bgcolor: "var(--clr-bg-1)", color: "var(--clr-txt-1)", p: 1,
                ml: 4, borderRadius: 1, fontSize: 16
              }}>
                {formatTime(item.createdAt)}
              </Typography>
              <Typography variant="h5" fontWeight="bold" mt={3}>
                {item.title}
              </Typography>
              <Typography variant="body2"
                sx={{
                  marginTop: '10px',
                  color: 'var(--clr-txt-1)',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  height: '85px', // Điều chỉnh chiều cao cố định
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 4, // Số dòng tối đa trước khi hiển thị '...'
                  WebkitBoxOrient: 'vertical',
                }}
                dangerouslySetInnerHTML={{ __html: item.desc }} />

              {/* Đặt nút ở góc phải */}
              <Link href={`/su-kien/${item.slug}/666`}>
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    zIndex: 200,
                    right: 20,
                    bottom: 20,
                    bgcolor: "var(--clr-bg-1)",
                    color: "var(--clr-txt-1)",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "var(--clr-bg-7)" },

                  }}
                >
                  Đặt chỗ ngay
                </Button>
              </Link>
            </Box>
          </Box>
        ))}
      </Slider>
      {/* Navigation buttons */}
      <IconButton onClick={() => sliderRef.current?.slickPrev()} sx={{
        position: "absolute", top: "50%", left: { xs: 30, md: 40 }, borderRadius: "50%", minWidth: { xs: 30, md: 40 }, minHeight: { xs: 30, md: 40 },
        transform: "translateY(-50%)", backgroundColor: "var(--clr-bg-4)", border: " 1px solid var(--clr-bg)",
        fontSize: { xs: 10, md: 16 }, color: "var(--clr-txt-1)", "&:hover": { backgroundColor: "var(--clr-bg-2)" },
      }}>
        ❮
      </IconButton>
      <IconButton onClick={() => sliderRef.current?.slickNext()} sx={{
        position: "absolute", top: "50%", right: { xs: 30, md: 40 }, borderRadius: "50%", minWidth: { xs: 30, md: 40 }, minHeight: { xs: 30, md: 40 },
        transform: "translateY(-50%)", backgroundColor: "var(--clr-bg-4)", border: " 1px solid var(--clr-bg)",
        fontSize: { xs: 10, md: 16 }, color: "var(--clr-txt-1)", "&:hover": { backgroundColor: "var(--clr-bg-2)" },
      }}>
        ❯
      </IconButton>
    </Container>
  );
}

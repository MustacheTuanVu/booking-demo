/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, CardContent, Paper, Typography, } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

export default function Descriptions({ eventDetails }: any) {
    // const theme = useTheme();
    // const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setShowExpandButton(contentRef.current.scrollHeight > 250);
        }
    }, []);
    return (
        <Paper sx={{ paddingBottom: 4, boxShadow: "none", backgroundColor: "var(--clr-bg-8)" }}>
            <Card sx={{ position: "relative", boxShadow: "none", borderRadius: 3 }}>
                <CardContent sx={{ backgroundColor: "var(--clr-bg-3)", }}>
                    <Typography sx={{ fontSize: 18, fontWeight: "bold", color: "var(--clr-txt-2)" }}>
                        Giới Thiệu
                    </Typography>
                    <Box sx={{ borderTop: "1px solid #b9b7b7", margin: 2 }} />
                    <Box
                        sx={{
                            margin: 3,
                            maxHeight: isExpanded ? "none" : 250,
                            transition: "max-height 0.3s ease-in-out",
                            fontSize: '14px',
                            fontWeight: 'normal',     
                            overflow: 'hidden',
                        }}
                        dangerouslySetInnerHTML={{ __html: eventDetails.desc }} // Cho phép hiển thị HTML
                    />
                </CardContent>
                {showExpandButton && (
                    isExpanded ? (
                        // Khi đã mở rộng: chỉ hiển thị icon (không có overlay nền)
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                pointerEvents: "none" // Để tránh che nội dung, nếu cần
                            }}
                        >
                            <Box
                                sx={{
                                    padding: "8px 12px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "auto" // Cho phép click vào icon
                                }}
                                onClick={() => setIsExpanded(prev => !prev)}
                            >
                                <FontAwesomeIcon
                                    icon={faAngleUp}
                                    style={{ color: "#333", fontSize: "20px" }}
                                />
                            </Box>
                        </Box>
                    ) : (
                        // Khi chưa mở rộng: hiển thị overlay nền có gradient kèm icon
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: "100%",
                                height: "100px",
                                background:
                                    "linear-gradient(to top, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Box
                                sx={{
                                    height: "100%",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                onClick={() => setIsExpanded(prev => !prev)}
                            >
                                <FontAwesomeIcon
                                    icon={faAngleDown}
                                    style={{ color: "#333", fontSize: "20px" }}
                                />
                            </Box>
                        </Box>
                    )
                )}
            </Card>
        </Paper>
    )
}

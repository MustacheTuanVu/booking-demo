/* eslint-disable @typescript-eslint/no-explicit-any */
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Card, CardContent, CardMedia, Container, Typography, useTheme } from "@mui/material";
import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { formatDate } from "@/utils/date";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { getMediaUrl } from "@/utils/mediaUrl";
export default function Banner({ eventDetails, sectionRefs }: any) {
    const theme = useTheme();
    const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));
    const handleScroll = (section: string) => {
        if (sectionRefs[section]?.current) {
            sectionRefs[section].current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    return (
        <Box sx={{ backgroundColor: "var(--clr-bg)", paddingTop: 4, paddingBottom: 4 }}>
            <Container >
                <Card
                    sx={{
                        display: "flex",
                        flexDirection: isBelow1028 ? "column" : "row",
                        bgcolor: "var(--clr-bg-2)",
                        color: "white",
                        borderRadius: 3,
                        position: "relative",
                        boxShadow: "none",
                        alignItems: "center", // Căn giữa nội dung trong card
                    }}
                >
                    {/* Phần thông tin */}
                    <CardContent
                        sx={{
                            flex: "1 1 50%",
                            padding: 4,
                            order: isBelow1028 ? 2 : 1,
                            boxShadow: "none",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center", // Căn giữa nội dung theo chiều dọc
                            minHeight: "450px", // Đồng bộ với hình ảnh
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: isBelow1028 ? "22px" : "20px" }}>
                            {eventDetails.title}
                        </Typography>
                        <Typography className="text-gold-400" sx={{ display: "flex", alignItems: "center", fontSize: "16px", fontWeight: "bold", marginTop: 2 }}>
                            <FiCalendar className="mr-2 h-4 w-4 text-gold-400" />
                            {formatDate(eventDetails.createdAt)}
                        </Typography>
                        <Typography mt={1} color="lightgray" sx={{ display: "flex", alignItems: "center", fontSize: "16px", fontWeight: "bold", marginTop: 1 }}>
                            <FiMapPin className="mr-2 h-4 w-4 text-gold-400" />
                            <span className="text-gold-400" style={{ fontWeight: "bold" }}>Sân khấu chính Queen Acoustic</span>
                        </Typography>
                        <Typography color="var(--clr-txt-1)" sx={{ fontSize: "14px", marginTop: 1 }}>
                            {eventDetails.venue}
                        </Typography>
                        <Box sx={{ marginTop: "auto", cursor: "pointer", display: isBelow1028 ? "none" : "block" }}>
                            <Box sx={{ borderTop: "1px solid #b9b7b7", margin: 2 }} />
                            <Button variant="contained"
                                onClick={() => handleScroll("info_list_combo")}
                                sx={{
                                    width: "100%", marginTop: 2, borderRadius: 2,
                                    backgroundColor: 'var(--clr-bg-1)', textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'var(--clr-bg-8)',
                                        color: '#000',
                                    },
                                }}>
                                Đặt chỗ ngay
                            </Button>
                        </Box>
                    </CardContent>

                    {/* Đường nét đứt canh giữa */}
                    <Box
                        sx={{
                            width: "2px",
                            height: "100%",
                            position: "absolute",
                            left: "31.5%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "linear-gradient(to bottom, transparent 10%, white 100%, transparent 70%)",
                            borderRight: "3px dashed white",
                            opacity: 0.5,
                        }}
                    ></Box>

                    {/* Góc bo tròn trên */}
                    <Box
                        sx={{
                            position: "absolute",
                            display: isBelow1028 ? "none" : "block",
                            top: "0",
                            left: "31.5%",
                            width: "50px",
                            height: "50px",
                            backgroundColor: "var(--clr-bg)",
                            borderRadius: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    ></Box>

                    {/* Góc bo tròn dưới */}
                    <Box
                        sx={{
                            position: "absolute",
                            display: isBelow1028 ? "none" : "block",
                            bottom: "0",
                            left: "31.5%",
                            width: "50px",
                            height: "50px",
                            backgroundColor: "var(--clr-bg)",
                            borderRadius: "50%",
                            transform: "translate(-50%, 50%)",
                        }}
                    ></Box>

                    {/* Phần hình ảnh */}
                    <CardMedia
                        component="img"
                        sx={{
                            flex: "1 1 50%",
                            height: "450px",
                            borderRadius: { xs: "12px 12px 0 0", md: "0 12px 12px 0" },
                            objectFit: "cover",
                            order: isBelow1028 ? 1 : 2,
                        }}
                        image={getMediaUrl(eventDetails.avatar)}
                        alt="Poster sự kiện"
                    />
                </Card>

            </Container >
        </Box>
    );
}

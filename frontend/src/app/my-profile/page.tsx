/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Container, Box, Typography, Button, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Divider, Card, CardContent, TextField, Avatar } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar, faTicket, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/date";
import api from "@/utils/api";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";

export default function MyProfile() {
    const router = useRouter();
    const { userInfo } = useContext(AppContext);
    console.log('userInfo', userInfo);

    return (
        <Container sx={{ my: 4, color: "var(--clr-txt-1)" }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
                    <Box>
                        <Link href="/">
                            <Button sx={{ display: "flex", alignItems: "center", mb: 3, textTransform: "none" }}>
                                <FontAwesomeIcon icon={faArrowLeft} style={{ color: "var(--clr-txt-1)", fontSize: 20 }} />
                                <Typography variant="h6" sx={{ fontSize: 16, ml: 2, fontWeight: "bold", color: "var(--clr-txt-1)" }}>Quay lại</Typography>
                            </Button>
                        </Link>

                        <List sx={{ alignItems: "center" }}>
                            <ListItem component="button" sx={{ color: "var(--clr-txt-4)" }}>
                                <ListItemIcon sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",

                                }}>
                                    <FontAwesomeIcon icon={faUserCircle} style={{ color: "var(--clr-txt-4)", fontSize: 25 }} />
                                </ListItemIcon>
                                <ListItemText primary="Thông tin tài khoản" />
                            </ListItem>
                            {userInfo ? 
                                userInfo.role == 'USER' ? 
                                <Link href="/customer/my-tickets">
                                    <ListItem component="button" >
                                        <ListItemIcon sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",

                                        }}>
                                            <FontAwesomeIcon icon={faTicket} style={{ color: "var(--clr-txt-1)", fontSize: 25 }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Chỗ đã đặt 2" />
                                    </ListItem>
                                </Link> 
                                : <></>
                            : <></>
                            }
                        </List>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                            Thông tin tài khoản
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: "var(--clr-bg-2)", width: "100%" }} />

                        {/* Avatar */}
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }} alt={userInfo?.name} src={userInfo?.avatar}></Avatar>
                        </Box>

                        {/* Form */}
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <Typography color="white" sx={{ mb: 1 }}>
                                    <strong><span style={{ color: 'red' }}>* </span>Họ và tên</strong>
                                </Typography>
                                <TextField fullWidth defaultValue={userInfo?.name}
                                    sx={{
                                        mb: 2, backgroundColor: 'white', borderRadius: 3,
                                        '& fieldset': { borderRadius: 2 },
                                        '&:focus-within fieldset': { borderRadius: 2, borderColor: 'var(--clr-txt-4) !important' },
                                    }}
                                />
                            </Grid>

                            <Grid size={12}>
                                <Typography color="white" sx={{ mb: 1 }}>
                                    <strong><span style={{ color: 'red' }}>* </span>Số điện thoại</strong>
                                </Typography>
                                <TextField fullWidth defaultValue={userInfo?.phone}
                                    sx={{
                                        mb: 2, backgroundColor: 'white', borderRadius: 3,
                                        '& fieldset': { borderRadius: 2 },
                                        '&:focus-within fieldset': { borderRadius: 2, borderColor: 'var(--clr-txt-4) !important' },
                                    }}
                                />
                            </Grid>

                            <Grid size={12}>
                                <Typography color="white" sx={{ mb: 1 }}>
                                    <strong><span style={{ color: 'red' }}>* </span>Email</strong>
                                </Typography>
                                <TextField fullWidth defaultValue={userInfo?.email} disabled
                                    sx={{
                                        mb: 2, backgroundColor: 'white', borderRadius: 3,
                                        '& fieldset': { borderRadius: 2 },
                                        '&:focus-within fieldset': { borderRadius: 2, borderColor: 'var(--clr-txt-4) !important' },
                                    }}
                                />
                            </Grid>
                            <Grid size={12} display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    sx={{
                                        backgroundColor: "var(--clr-bg-1)",
                                        width: "90%",
                                        borderRadius: "20px",
                                        "&:hover": { backgroundColor: "var(--clr-bg-7)" },
                                    }}
                                >
                                    Cập nhật thông tin
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

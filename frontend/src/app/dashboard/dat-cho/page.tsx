/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; // Đánh dấu là Client Component

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { AppContext } from '@/context/AppContext';
import { Box, Button, Container, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
const DatCho = () => {
    // const [openExpiredDialog, setOpenExpiredDialog] = useState(true);
    // const { saveUserInfo, userInfo } = useContext(AppContext);
    const [openExpiredDialog] = useState(true);
    const { saveUserInfo } = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {

    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const phone = (e.target as any).phone.value;
        const name = (e.target as any).name.value;

        try {
            const response = await api.put('/users/verify-account', { phone, name });
            if (response.status === 200) {
                saveUserInfo(response.data);
                router.replace('/');
            } else {
                alert('Xác thực không thành công');
            }
            console.log('response', response);
        } catch (error) {
            console.error('Error during verification:', error);
            alert('Xác thực không thành công');
        }
    }

    return (
        <Container sx={{ my: 4, color: "var(--clr-txt-1)" }}>
            <Grid container spacing={2}>
                <DashboardSidebar />
                <Grid size={{ xs: 12, md: 8 }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mt: 2, p: 3, bgcolor: '#1e1e1e', borderRadius: 2 }}>
                            <TextField
                                fullWidth
                                required
                                variant="outlined"
                                name="phone"
                                placeholder="Số điện thoại"
                                sx={{
                                    mb: 2, backgroundColor: 'white', borderRadius: 3,
                                    '& fieldset': { borderRadius: 2 },
                                    '&:focus-within fieldset': { borderRadius: 2, borderColor: 'var(--clr-txt-4) !important' },
                                }}
                            />
                            <TextField
                                fullWidth
                                required
                                variant="outlined"
                                name="name"
                                placeholder="Họ Và Tên"
                                sx={{
                                    mb: 2, backgroundColor: 'white', borderRadius: 3,
                                    '& fieldset': { borderRadius: 2 },
                                    '&:focus-within fieldset': { borderRadius: 2, borderColor: 'var(--clr-txt-4) !important' },
                                }}
                            />
                            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    sx={{ backgroundColor: "var(--clr-bg-1)", width: "90%", borderRadius: "20px", "&:hover": { backgroundColor: "var(--clr-bg-7)" } }}
                                >
                                    Đặt chỗ
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DatCho;

/* eslint-disable @typescript-eslint/no-explicit-any */
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Card, CardContent, Box, Button, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams, useRouter } from 'next/navigation';
import { Accordion, AccordionDetails, AccordionSummary } from '@/utils/customAccordion';

export default function TicketInfor({ eventDetails, sectionRefs }: any) {
    const { ref } = useParams();
    const [expanded, setExpanded] = useState<string | false>(false);
    const router = useRouter();
    const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    // STATE cho Dialog nhập số lượng combo
    const [openDialog, setOpenDialog] = useState(false);
    const [comboQuantity, setComboQuantity] = useState(1);

    const handleDialogContinue = () => {
        setOpenDialog(false);
        // Nếu cần truyền số lượng combo sang trang đặt chỗ,
        // bạn có thể chuyển qua query param hoặc state.
        router.push(`/su-kien/${eventDetails.slug}/${ref}/bookings/select-ticket/${comboQuantity}`);
    };


    return (
        <Paper sx={{ paddingBottom: 4, boxShadow: "none", backgroundColor: "var(--clr-bg-8)" }} ref={sectionRefs["info_list_combo"]}>
            <Card sx={{ position: 'relative', boxShadow: 'none', borderRadius: 3 }}>
                <CardContent sx={{ backgroundColor: 'var(--clr-bg-5)', padding: 0 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: "bold", color: "var(--clr-txt-1)", paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}>
                        Thông tin các Combo (1 ghế + 1 nước)
                    </Typography>
                    <Box sx={{ borderTop: "1px solid #b9b7b7", margin: 2 }} />
                    {eventDetails.InfoSeatSections.map((item: any, index: any) => (
                        <Accordion expanded={expanded === item._id} onChange={handleChange(item._id)} key={index}>
                            <AccordionSummary
                                aria-controls="ticket-panel-content"
                                id="ticket-panel-header"
                            >
                                <Grid
                                    container
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ width: '100%' }}
                                >
                                    <Typography component="span" fontWeight="bold" sx={{ color: "var(--clr-txt-1)", fontSize: 14 }}>
                                        {item.type} (Đã bao gồm 1 phần nước tự chọn)
                                    </Typography>
                                    <Button
                                        component="div"
                                        variant="contained"
                                        sx={{
                                            width: "auto",
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            backgroundColor: 'var(--clr-bg-1)',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: 'var(--clr-bg-8)',
                                                color: '#000',
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDialog(true);
                                            // router.push(`/su-kien/${eventDetails.slug}/bookings/select-ticket`);
                                        }}
                                    >
                                        Đặt chỗ ngay
                                    </Button>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: 'var(--clr-bg-5)', padding: 0 }}>
                                <Box sx={{ width: '100%', margin: '0 auto' }}>
                                    {item.data_seat.map((ticket: any, idx: any) => (
                                        <Grid
                                            container
                                            key={idx}
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{
                                                padding: '8px 24px',
                                                backgroundColor: idx % 2 === 0 ? 'var(--clr-bg-4)' : 'transparent',
                                            }}
                                        >
                                            <Typography component="span" sx={{ color: 'var(--clr-txt-1)' }}>
                                                {ticket.name}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: ticket.soldOut ? 'var(--clr-txt-3)' : 'var(--clr-txt-1)',
                                                }}
                                            >
                                                {ticket.soldOut ?
                                                    <Button
                                                        component="div"
                                                        variant="contained"
                                                        sx={{
                                                            backgroundColor: 'var(--clr-bg-6)',
                                                            boxShadow: 'none',
                                                            textTransform: 'none',
                                                            color: 'red',
                                                            borderRadius: 4,
                                                            pointerEvents: "none",
                                                            cursor: "default",
                                                        }}>
                                                        Hết chỗ
                                                    </Button> : item.price.toLocaleString('vi') + ' đ (Đã bao gồm 1 phần nước tự chọn)'}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </CardContent>
            </Card>
            {/* Dialog nhập số lượng combo */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: 'white', // Nền dialog trắng
                        borderRadius: 2,
                        boxShadow: 'none',
                        p: 2,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#000', // Màu chữ đen
                        textAlign: 'center',
                        mb: 2,
                    }}
                >
                    Nhập số lượng Combo
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'white', p: 2 }}>
                    <TextField
                        type="number"
                        value={comboQuantity}
                        onChange={(e: any) => setComboQuantity(Number(e.target.value))}
                        fullWidth
                        InputProps={{ inputProps: { min: 1 } }}
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid #ddd',
                            '& input': { color: '#000' },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 'none',
                            backgroundColor: 'white',
                            color: '#000',
                            border: '1px solid #ddd',
                            mr: 1,
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDialogContinue}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 'none',
                            backgroundColor: 'white',
                            color: '#000',
                            border: '1px solid #ddd',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        Tiếp tục
                    </Button>
                </DialogActions>
            </Dialog>

        </Paper>
    );
}

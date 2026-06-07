"use client";
import { formatDate } from '@/utils/date';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardMedia, Container, Typography, Button, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { getMediaUrl } from '@/utils/mediaUrl';

export default function ListCard3({ eventType, eventList }: any) {
    const router = useRouter();
    const [visibleCount, setVisibleCount] = useState(8);
    console.log(eventList);

    return (
        <Box sx={{ backgroundColor: 'var(--clr-bg-2)' }}>
            <Container sx={{ position: 'relative', padding: 0, backgroundColor: 'var(--clr-bg-2)', pt: '20px', pb: '20px' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--clr-txt-4)', marginBottom: '20px', fontSize: '24px' }}>
                    {eventType}
                </Typography>
                <Grid container spacing={2}>
                    {eventList.slice(0, visibleCount).map((evt: any, index: number) => (
                        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
                            <Card
                                sx={{
                                    borderRadius: '15px',
                                    boxShadow: 'none',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    marginBottom: '20px',
                                    backgroundColor: 'var(--clr-bg-2)'
                                }}
                                onClick={() => router.push(`/su-kien/${evt.slug}/666`)}
                            >
                                <CardMedia
                                    component="img"
                                    height="330px"
                                    image={getMediaUrl(evt.avatar)}
                                    alt={`Slide ${index + 1}`}
                                    sx={{
                                        borderRadius: '15px',
                                        height: '200px',
                                        objectFit: 'cover',
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginTop: '10px',
                                        color: 'var(--clr-txt-4)',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        minHeight: '45px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {evt.title}
                                </Typography>
                                <Box
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
                                    dangerouslySetInnerHTML={{ __html: evt.desc }} // Cho phép hiển thị HTML
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginTop: '10px',
                                        color: 'var(--clr-txt-1)',
                                        fontSize: '14px',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCalendar} size="sm" style={{ color: 'var(--clr-txt-1)', marginRight: '5px', fontWeight: 'bold' }} /> {formatDate(evt.createdAt)}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                {visibleCount < eventList.length && (
                    <Button
                        variant="contained"
                        sx={{
                            display: 'block',
                            margin: '20px auto',
                            borderRadius: '20px',
                            padding: '10px 20px',
                            backgroundColor: 'var(--clr-bg-1)',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'var(--clr-bg)',
                                color: '#000',
                            },
                        }}
                        onClick={() => setVisibleCount(eventList.length)}
                    >
                        Xem thêm sự kiện
                    </Button>
                )}
            </Container>
        </Box>
    );
}

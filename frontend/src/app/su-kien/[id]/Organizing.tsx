import { Box, Card, CardContent, Paper, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

export default function Organizing() {
    const content = [
        {
            name: 'Karaoke Queen',
            image: '/images/logo-queen.png',
            description: 'Hệ thống dịch vụ Queen,...'
        }
    ]
    return (
        <Paper sx={{ paddingBottom: 4, boxShadow: "none", backgroundColor: "var(--clr-bg-8)" }}>
            <Card sx={{ position: 'relative', boxShadow: 'none', borderRadius: 3, }}>
                <CardContent sx={{ backgroundColor: 'var(--clr-bg-3)',  padding: 0 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: "bold", color: "var(--clr-txt-2)", paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}>
                        Ban tổ chức
                    </Typography>
                    <Box sx={{ borderTop: "1px solid #b9b7b7", margin: 2 }} />
                    {content.map((item, index) => (
                        <Box sx={{ display: 'flex', margin: 2 }} key={index}>
                            {/* Phần hình ảnh chiếm 1/3 */}
                            <Box sx={{ width: '33.33%', maxHeight: '160px', overflow: 'hidden' }}>
                                <Image
                                    src={item.image}
                                    alt="Logo"
                                    width={300}
                                    height={180}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                            {/* Phần nội dung chiếm 2/3 */}
                            <Box sx={{ width: '66.67%', paddingLeft: 2 }}>
                                <Typography
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        color: 'var(--clr-txt-2)',
                                        marginBottom: 1
                                    }}
                                >
                                    {item.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 16,
                                        color: 'var(--clr-txt-2)',
                                    }}
                                >
                                    {item.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Paper>
    )
}

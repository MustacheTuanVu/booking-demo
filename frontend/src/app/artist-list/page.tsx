/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import Grid from '@mui/material/Grid';
import { Box, Card, CardContent, CardMedia,  Typography } from "@mui/material";

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getMediaUrl } from '@/utils/mediaUrl';



export default function ArtistList() {

    const [artistList, setArtistList] = useState([]);

    const getArtistList = async () => {
        const artistsResponse = await api.get('/artists/GetMany')
        setArtistList(artistsResponse.data.artists)
    }

    useEffect(() => {
        getArtistList();
    }, []);

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                    <DatePicker label="Basic date picker" />
                </DemoContainer>
            </LocalizationProvider>
            <Grid container spacing={2}>
                {artistList.map((item: any, index) => (
                    <Grid item xs={3} key={index}>
                        <Card sx={{ display: 'flex' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flex: '1 0 auto' }}>
                                    <Typography component="div" variant="h5">
                                        {item.name}
                                    </Typography>
                                </CardContent>
                            </Box>
                            <CardMedia
                                component="img"
                                sx={{ width: 151 }}
                                image={getMediaUrl(item.image)}
                                alt="Live from space album cover"
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}

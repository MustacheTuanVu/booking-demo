/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Avatar, Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@/utils/date";
import { Accordion, AccordionSummary } from "@/utils/customAccordion";
import { getMediaUrl } from "@/utils/mediaUrl";


export default function artist() {
  const router = useRouter();
  const { slug } = useParams();
  const [artistDetails, setArtistDetails] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | false>(false);
  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };
  const getArtistDetails = async () => {
    const artistResponse = await api.get('/artists/GetBySlug/' + slug)
    setArtistDetails(artistResponse.data)
  }


  useEffect(() => {
    getArtistDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChosseArtist = (eventSlug: any) => {
    router.push('/su-kien/666' + eventSlug);
  }

  return (
    <Box sx={{ backgroundColor: "var(--clr-bg-8)" }}>
      <Container sx={{ py: 4 }}>
        {artistDetails &&
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Avatar
                alt="Remy Sharp"
                src={getMediaUrl(artistDetails.image)}
                sx={{ width: 200, height: 200, margin: '20px auto' }}
              />
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "20px", textAlign: "center", color: "var(--clr-txt-4)" }}>
                {artistDetails.name}
              </Typography>
              <Typography
                sx={{

                  color: "var(--clr-txt-2)",
                  textAlign: "justify",
                  fontSize: "16px",
                  m: 2,
                }}
              >
                <span style={{ fontWeight: "bold" }}>Thông tin Ca sĩ: </span> {artistDetails.bio}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: 3, boxShadow: "none", border: "none" }}>
                <CardContent sx={{ backgroundColor: 'var(--clr-bg-5)', padding: 0, border: "none" }}>
                  <Typography sx={{ fontSize: 18, fontWeight: "bold", color: "var(--clr-txt-1)", paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}>
                    Lịch diễn tại Phòng Trà
                  </Typography>
                  <Box sx={{ borderTop: "1px solid #b9b7b7", margin: 2 }} />
                  {artistDetails.performances.map((item: any, index: number) => (
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
                            {formatDate(item.time)}
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
                            onClick={() => {
                              handleChosseArtist(item.slug);
                            }}
                          >
                            Đặt chỗ ngay
                          </Button>
                        </Grid>
                      </AccordionSummary>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        }
      </Container>
    </Box>
  );
}

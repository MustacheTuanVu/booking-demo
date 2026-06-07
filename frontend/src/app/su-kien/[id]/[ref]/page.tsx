/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, Container, useMediaQuery, useTheme, Box } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Banner from "../Banner";
import Descriptions from "../Description";
import TicketInfor from "./TicketInfor";
import Organizing from "../Organizing";
import { useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import { useParams } from "next/navigation";
import Image from 'next/image';
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import JsonLd from "../../../JsonLd";
import { generateEventStructuredData } from "@/utils/generateEventStructuredData";
import { getMediaUrl } from "@/utils/mediaUrl";

export default function DetailEvent() {
  const { id } = useParams();
  const theme = useTheme();
  const isBelow1028 = useMediaQuery(theme.breakpoints.down(1028));
  const [eventList, setEventList] = useState([]);
  const sectionRefs = {
    "info_list_combo": useRef<HTMLDivElement>(null),
  };
  const [eventDetails, setEventDetails] = useState<any>(null);

  const getEventDetails = async () => {
    const eventResponse = await api.get('/events/getDetailEventBySlug' + '?slug=' + id)
    setEventDetails(eventResponse.data && eventResponse.data.length > 0 ? eventResponse.data[0] : null)
  }
  const getEventList = async () => {
    const eventResponse = await api.get('/events/getEventByCondition')
    setEventList(eventResponse.data.events)
  }

  useEffect(() => {
    getEventDetails();
    getEventList();
  }, []);

  // Generate structured data for the specific event
  const eventStructuredData = eventDetails ? {
    '@context': 'https://schema.org',
    '@graph': [
      ...generateEventStructuredData([eventDetails]),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: 'https://booking.queenacoustic.vn'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sự kiện',
            item: 'https://booking.queenacoustic.vn/#Lịch%20biểu%20diễn'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: eventDetails.title
          }
        ]
      }
    ]
  } : null;

  return (
    <Box sx={{ backgroundColor: "var(--clr-bg-8)" }}>
      {eventStructuredData && <JsonLd customStructuredData={eventStructuredData} />}
      {eventDetails && <>
        <Banner eventDetails={eventDetails} sectionRefs={sectionRefs} />
        <Container sx={{ paddingTop: 4, paddingBottom: 4, px: 0 }}>
          <Grid container spacing={2}>
            <Grid size={isBelow1028 ? 12 : 9}>
              <Descriptions eventDetails={eventDetails} />
              <TicketInfor eventDetails={eventDetails} sectionRefs={sectionRefs} />
              <Organizing />
            </Grid>
            {!isBelow1028 && (
              <Grid size={isBelow1028 ? 12 : 3}>
                <Card sx={{ borderRadius: 3, boxShadow: "none" }}>
                  <Image
                    src={getMediaUrl(eventDetails.avatar)}
                    alt={eventDetails.title}
                    width={400}
                    height={600}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>
       <UpcomingEventsSection eventType={"Sự kiện liên quan"} eventList={eventList}/>
      </>}
    </Box>
  );
}

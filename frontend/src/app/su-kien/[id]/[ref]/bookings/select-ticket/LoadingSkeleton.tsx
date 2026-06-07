import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';

const LoadingSkeleton = ({ isMdUp, isBelow1028 }: { isMdUp: boolean; isBelow1028: boolean }) => {
  return (
    <Box
      sx={{
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--clr-bg)",
      }}
    >
      <Grid container sx={{ width: "100%" }}>
        {/* Left column - Seat map skeleton */}
        <Grid size={{ xs: 12, md: isBelow1028 ? 12 : 8 }} direction="column" alignItems="center">
          <Box sx={{ position: "relative", width: "100%", p: 2 }}>
            {/* Stage area skeleton */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Skeleton variant="rectangular" width="60%" height={40} sx={{ mx: "auto", borderRadius: 2 }} />
            </Box>
            
            {/* Seat map skeleton */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 2,
              minHeight: "400px",
              justifyContent: "center"
            }}>
              {/* King section skeleton */}
              <Box sx={{ width: "100%", maxWidth: "600px" }}>
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="30%" sx={{ mx: "auto" }} />
              </Box>
              
              {/* Queen section skeleton */}
              <Box sx={{ width: "100%", maxWidth: "500px" }}>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="35%" sx={{ mx: "auto" }} />
              </Box>
              
              {/* Jack section skeleton */}
              <Box sx={{ width: "100%", maxWidth: "400px" }}>
                <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="25%" sx={{ mx: "auto" }} />
              </Box>
            </Box>
          </Box>
          
          {/* Legend skeleton */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, my: 2 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: "4px" }} />
                <Skeleton variant="text" width={60} />
              </Box>
            ))}
          </Box>
        </Grid>
        
        {/* Right column - Booking info skeleton */}
        <Grid size={{ xs: 12, md: isBelow1028 ? 12 : 4 }}>
          <Card sx={{ 
            position: { xs: "sticky", md: "relative" }, 
            top: { xs: "auto", md: "auto" },
            bottom: { xs: 0, md: "auto" },
            borderRadius: { xs: "16px 16px 0 0", md: 3 }, 
            boxShadow: { xs: "0px -4px 10px rgba(0, 0, 0, 0.1)", md: 2 }, 
            height: "auto", 
            m: { xs: 0, md: 2 },
            zIndex: { xs: 10, md: 1 }, 
            backgroundColor: "white"
          }}>
            <CardContent sx={{
              flex: "1 1 50%",
              position: "relative",
              padding: { xs: 2, md: 2.5 },
              paddingBottom: { xs: "16px !important", md: "20px !important" },
              order: isBelow1028 ? 2 : 1,
              boxShadow: "none",
              display: "flex",
              flexDirection: "column",
              height: "auto"
            }}>
              {/* Event Details Skeleton */}
              <Box sx={{ 
                mb: 3, 
                p: 2.5, 
                backgroundColor: "rgba(171, 141, 89, 0.04)",
                borderRadius: 2,
                border: "1px solid rgba(171, 141, 89, 0.1)"
              }}>
                {/* Event image and title skeleton */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="text" width="75%" height={28} sx={{ flex: 1 }} />
                </Box>
                
                {/* Event details skeleton */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Date skeleton */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="rectangular" width={16} height={16} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                  
                  {/* Venue skeleton */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="rectangular" width={16} height={16} />
                    <Skeleton variant="text" width="75%" height={20} />
                  </Box>
                  
                  {/* Combo selection skeleton */}
                  <Box sx={{ mt: 1, pt: 1.5, borderTop: "1px solid rgba(171, 141, 89, 0.15)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Skeleton variant="rectangular" width={16} height={16} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                    <Box sx={{ ml: 2.5 }}>
                      <Skeleton variant="text" width="45%" height={18} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="40%" height={18} />
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Seat selection skeleton */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
              </Box>
              
              {/* Discount code skeleton */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
              </Box>
              
              {/* Summary skeleton */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>
              
              {/* Button skeleton */}
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={48} 
                sx={{ 
                  borderRadius: 2,
                  mt: "auto"
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoadingSkeleton; 
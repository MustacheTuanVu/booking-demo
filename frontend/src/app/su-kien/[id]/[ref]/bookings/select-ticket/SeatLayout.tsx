import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

interface SeatLayoutProps {
  eventDetails: any;
  isMdUp: boolean;
  handleOpenPopup: (area: string) => void;
}

// Helper function to get subtitle text and style based on zone
const getZoneSubtitle = (zone: string) => {
  switch (zone) {
    case "K":
      return {
        text: "Góc sân khấu vàng",
        color: "rgb(208, 182, 136)",
        bgColor: "rgba(255, 215, 0, 0.08)",
        borderColor: "rgba(226, 213, 137, 0.3)"
      };
    case "Q":
      return {
        text: "Góc cảm xúc",
        color: "rgb(95, 75, 17)",
        bgColor: "rgba(240, 195, 80, 0.15)",
        borderColor: "rgba(95, 75, 17, 0.25)"
      };
    case "J":
      return {
        text: "Góc lặng",
        color: "rgba(5, 28, 78, 0.85)",
        bgColor: "rgba(71, 97, 125, 0.15)",
        borderColor: "rgba(22, 41, 83, 0.4)"
      };
    default:
      return {
        text: "",
        color: "rgba(0, 0, 0, 0.5)",
        bgColor: "transparent",
        borderColor: "transparent"
      };
  }
};

const SeatLayout: React.FC<SeatLayoutProps> = ({ eventDetails, isMdUp, handleOpenPopup }) => {
  return (
    <Box sx={{ width: "100%", margin: "auto", p: 2, position: "relative" }}>
      {/* Khu J (Jack) - Trên */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={isMdUp ? 2 : 1}>
          {/* Grid trống chiếm 16.67% bên trái */}
          <Grid sx={{ width: "16.66%" }} />

          {/* Grid chính chiếm 83.33% và nằm hoàn toàn bên phải */}
          <Grid spacing={isMdUp ? 4 : 1} sx={{ width: "83.34%", ml: "auto", gap: isMdUp ? 3 : 1 }} display={"flex"}>
            <Grid size={{ xs: 3 }} sx={{ marginLeft: "auto" }} >
              <Box className="bg-blue-100"
                sx={{
                  textAlign: "center",
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: "pointer",
                  height: { xs: 160, sm: 200, md: 260 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  border: "2px solid #A0A0A0",
                  alignItems: "center",
                  transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                  background: "linear-gradient(135deg, #e3eaf6 0%, #b3c6e0 100%)",
                  "&:hover": {
                    transform: "scale(1.01)",
                    border: "2px solid var(--clr-bg-1)",
                    boxShadow: "0px 8px 24px 0px rgba(33,54,100,0.10)",
                    filter: "brightness(1.05)",
                  },
                }}
                onClick={() => handleOpenPopup("J")}
              >
                <Typography fontWeight="bold" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1.3rem" }, }}>
                  Khu J
                </Typography>
                
                {/* Subtitle for Zone J */}
                <Box
                  sx={{
                    mt: 0.5,
                    mb: 1,
                    px: 1,
                    py: 0.3,
                    borderRadius: "4px",
                    borderTop: `1px solid ${getZoneSubtitle("J").borderColor}`,
                    backgroundColor: getZoneSubtitle("J").bgColor,
                    transition: "opacity 200ms ease",
                    opacity: 0.85,
                    ".MuiBox-root:hover &": {
                      opacity: 0.95,
                    }
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      color: getZoneSubtitle("J").color,
                      lineHeight: 1.2
                    }}
                  >
                    {getZoneSubtitle("J").text}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" }, }} >
                  {eventDetails?.remainingSeats?.J} ghế
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 5 }} className="bg-gold-400"
              sx={{
                borderRadius: 2,
                padding: { xs: 2, sm: 3, md: 4 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 2,
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #A0A0A0",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                background: "linear-gradient(135deg, #fff7d6 0%, #f0c350 100%)",
                color: "#5f4b11",
                "&:hover": {
                  transform: "scale(1.01)",
                  border: "2px solid var(--clr-bg-1)",
                  boxShadow: "0px 8px 24px 0px rgba(95,75,17,0.15)",
                  filter: "brightness(1.05)",
                },
              }}
              onClick={() => handleOpenPopup("Q")}
            >
              <Typography fontWeight="bold" sx={{ transform: "none", fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.3rem" }, color: "#5f4b11" }}>
                Khu Q
              </Typography>
              
              {/* Subtitle for Zone Q */}
              <Box
                sx={{
                  mt: 0.5,
                  mb: 1,
                  px: 1,
                  py: 0.3,
                  borderRadius: "4px",
                  borderTop: `1px solid ${getZoneSubtitle("Q").borderColor}`,
                  backgroundColor: getZoneSubtitle("Q").bgColor,
                  transition: "opacity 200ms ease",
                  opacity: 0.85,
                  ".MuiBox-root:hover &": {
                    opacity: 0.95,
                  }
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: getZoneSubtitle("Q").color,
                    lineHeight: 1.2
                  }}
                >
                  {getZoneSubtitle("Q").text}
                </Typography>
              </Box>

              <Typography sx={{ transform: "none", fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" }, color: "#5f4b11" }}>
                {eventDetails?.remainingSeats?.Q} ghế
              </Typography>
            </Grid>
            <Grid size={{ xs: 4 }} sx={{ marginLeft: "auto" }}>
              <Box className="bg-blue-100"
                sx={{
                  textAlign: "center",
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: "pointer",
                  height: { xs: 160, sm: 200, md: 260 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  border: "2px solid #A0A0A0",
                  alignItems: "center",
                  transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                  color: "rgba(19, 47, 107, 0.85)",
                  "&:hover": {
                    transform: "scale(1.01)",
                    border: "2px solid var(--clr-bg-1)",
                    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
                  },
                }}
                onClick={() => handleOpenPopup("J")}
              >
                <Typography fontWeight="bold" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1.3rem" }, }}>
                Khu J
                </Typography>

                {/* Subtitle for Zone J */}
                <Box
                  sx={{
                    mt: 0.5,
                    mb: 1,
                    px: 1,
                    py: 0.3,
                    borderRadius: "4px",
                    borderTop: `1px solid ${getZoneSubtitle("J").borderColor}`,
                    backgroundColor: getZoneSubtitle("J").bgColor,
                    transition: "opacity 200ms ease",
                    opacity: 0.85,
                    ".MuiBox-root:hover &": {
                      opacity: 0.95,
                    }
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      color: getZoneSubtitle("J").color,
                      lineHeight: 1.2
                    }}
                  >
                    {getZoneSubtitle("J").text}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" }, }} >
                  {eventDetails?.remainingSeats?.J} ghế
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={isMdUp ? 2 : 1} sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
          {/* Cửa ra vào & Quầy bar */}
          <Grid size={{ xs: 2 }}>
            {/* Cửa */}
            <Box
              sx={{
                backgroundColor: "#3B82F6", // bg-blue-500
                color: "white", // text-white
                p: { xs: 0, sm: 2 }, // p-2 sm:p-4
                borderRadius: 2, // rounded-lg
                display: "flex", // flex
                alignItems: "center", // items-center
                justifyContent: "center", // justify-center
                fontWeight: 500, // font-medium
                border: "2px solid #2563EB", // border-2 border-blue-600
                boxShadow: 2,
                height: { xs: 64, sm: 80, md: 96 }, // h-16 sm:h-20 md:h-24
                fontSize: { xs: "0.6rem", sm: "0.875rem", md: "1rem" },
              }}
            >
              Cửa
            </Box>

            {/* Quầy Bar */}
            <Box
              sx={{
                backgroundColor: "#3B82F6", // bg-blue-500
                color: "white", // text-white
                p: { xs: 0, sm: 2 }, // p-2 sm:p-4
                borderRadius: 2, // rounded-lg
                display: "flex", // flex
                alignItems: "center", // items-center
                justifyContent: "center", // justify-center
                fontWeight: 500, // font-medium
                border: "2px solid #2563EB", // border-2 border-blue-600
                boxShadow: 2,
                height: { xs: 120, sm: 180, md: 200 }, // h-40 sm:h-50 md:h-60
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                mt: { xs: 1, md: 2 }, // Tạo khoảng cách giữa 2 Box
              }}
            >
              {isMdUp ? "Quầy Bar" : "Bar"}
            </Box>
          </Grid>

          {/* Khu Q (Queen) - Trái */}
          <Grid size={{ xs: 8 }} height="100%">
            {/* Grid trên - 10% height */}
            <Grid container
              width="100%"
              height="10%"
              sx={{
                borderRadius: 2,
                boxShadow: "none",
                p: { xs: 1, sm: 2 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Grid size={{ xs: 4 }} display="flex" justifyContent="end" alignItems="center">
                <Box sx={{
                  width: { xs: 20, sm: 40 },
                  height: { xs: 20, sm: 40 },
                  borderRadius: "50%",
                  border: "2px solid #2563EB",
                  backgroundColor: "#3B82F6",
                }} />
              </Grid>
              <Grid size={{ xs: 5 }} />
              <Grid size={{ xs: 3 }} display="flex" justifyContent="center" alignItems="center">
                <Box sx={{
                  width: { xs: 20, sm: 40 },
                  height: { xs: 20, sm: 40 },
                  borderRadius: "50%",
                  border: "2px solid #2563EB",
                  backgroundColor: "#3B82F6",
                }} />
              </Grid>
            </Grid>

            {/* Grid dưới - 90% height */}
            <Grid container spacing={isMdUp ? 2 : 1} width="100%" height="100%"
              sx={{
                background: "linear-gradient(135deg, #232323 0%, #3a2e13 100%)",
                color: "rgb(208, 182, 136)",
                borderRadius: 2,
                boxShadow: 2,
                padding: { xs: 2, sm: 3, md: 4 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgb(155, 143, 121)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.01)",
                  border: "2px solid rgb(208, 182, 136)",
                  boxShadow: "0px 8px 24px 0px rgba(208,182,136,0.10)",
                  filter: "brightness(1.05)",
                },
              }} onClick={() => handleOpenPopup("K")}
            >
              <Typography fontWeight="bold" sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.3rem" }, }}>
                Khu K
              </Typography>
              
              {/* Subtitle for Zone K */}
              <Box
                sx={{
                  mt: 0.01,
                  mb: 0.01,
                  px: 1.5,
                  py: 0.3,
                  borderRadius: "4px",
                  borderTop: `1px solid ${getZoneSubtitle("K").borderColor}`,
                  backgroundColor: "rgba(131, 120, 57, 0.13)",
                  transition: "opacity 200ms ease",
                  opacity: 0.9,
                  ".MuiGrid-root:hover &": {
                    opacity: 1,
                  }
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: { xs: "0.6rem", sm: "0.8rem", md: "0.9rem" },
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: "rgb(208, 182, 136)",
                    lineHeight: 1.2
                  }}
                >
                  {getZoneSubtitle("K").text}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" }, }} >
                {eventDetails?.remainingSeats?.K} ghế
              </Typography>
            </Grid>
            <Grid size={12} display="flex" justifyContent="center" padding={2}>
              <Box className="bg-purple-500 "
                sx={{
                  width: "50%",
                  color: "white",
                  px: 2,
                  py: { xs: 1, sm: 2 },
                  textAlign: "center",
                  borderRadius: 2,
                  fontWeight: "bold",
                  border: "2px solid #7e22ce",
                  boxShadow: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mx: "auto",
                }}
              >
                <Typography fontWeight="bold">Sân khấu</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Khu J (Jack) - Dọc bên phải */}
          <Grid size={{ xs: 2 }}>
            <Box className="bg-blue-100"
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                padding: { xs: 2, sm: 3, md: 4 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #A0A0A0",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
                color: "rgba(5, 28, 78, 0.85)",
                "&:hover": {
                  transform: "scale(1.01)",
                  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
                },
              }} onClick={() => handleOpenPopup("J")}
            >
              <Typography fontWeight="bold" sx={{ transform: "none", fontSize: { xs: "0.65rem", sm: "0.75rem", md: "1.3rem" }, }}>
                Khu J
              </Typography>
              
              {/* Subtitle for Zone J */}
              <Box
                sx={{
                  mt: 0.5,
                  mb: 1,
                  px: 1,
                  py: 0.3,
                  borderRadius: "4px",
                  borderTop: `1px solid ${getZoneSubtitle("J").borderColor}`,
                  backgroundColor: getZoneSubtitle("J").bgColor,
                  transition: "opacity 200ms ease",
                  opacity: 0.85,
                  ".MuiBox-root:hover &": {
                    opacity: 0.95,
                  }
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.65rem" },
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: getZoneSubtitle("J").color,
                    lineHeight: 1.2
                  }}
                >
                  {getZoneSubtitle("J").text}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: { xs: "0.55rem", sm: "0.65rem", md: "1rem" }, }}>
                {eventDetails?.remainingSeats?.J} ghế
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SeatLayout; 
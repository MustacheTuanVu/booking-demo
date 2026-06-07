import React, { useState, useEffect } from "react";
import { Box, Grid, Paper, TextField, Typography, Button, IconButton } from "@mui/material";
import api from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

const goldBorder = "rgb(171 141 89/var(--tw-text-opacity,1))";

const SeatSelection = ({
  selectedArea,
  seatQuantities,
  handleRemoveArea,
  onDiscountCodeChange,
  remainingSeatsToChoose = 0
}: any) => {
  const [discountCode, setDiscountCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);

  // Calculate total seats
  const totalSeats: number = Object.values(seatQuantities).reduce(
    (sum: number, value: any) => sum + Number(value), 
    0
  );

  // Get a safe string representation of total seats
  const totalSeatsText = `${totalSeats} ghế`;

  // Function to check if promotion code is valid
  const checkPromotionCode = async (code: string): Promise<boolean> => {
    if (!code) return false;

    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/promotion/GetByCode/${code}`
      );
      return res && res.data && res.data._id ? true : false;
    } catch (error) {
      return false;
    }
  };

  // Handle discount code change
  const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(e.target.value);
    setErrorMessage("");
    setIsValidCode(false);
  };

  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode) {
      setErrorMessage("");
      return;
    }

    const isValid = await checkPromotionCode(discountCode);
    if (isValid) {
      setIsValidCode(true);
      setErrorMessage("");
      // Pass the valid discount code to parent component
      if (onDiscountCodeChange) {
        onDiscountCodeChange(discountCode);
      }
    } else {
      setIsValidCode(false);
      setErrorMessage("Mã giảm giá không hợp lệ");
      if (onDiscountCodeChange) {
        onDiscountCodeChange("");
      }
    }
  };

  // Validate on blur
  const handleBlur = () => {
    if (discountCode) {
      validateDiscountCode();
    }
  };

  // Get color config for each area
  const getAreaConfig = (area: string) => {
    switch(area) {
      case 'J':
        return {
          name: 'Jack',
          dotColor: '#777',
          dotBorder: 'rgba(0, 0, 0, 0.08)',
          bgColor: 'rgba(171, 141, 89, 0.04)',
          borderColor: 'rgba(171, 141, 89, 0.1)',
          textColor: '#333',
          badgeBg: 'rgba(171, 141, 89, 0.1)',
          badgeColor: '#333',
          accentColor: 'rgba(119, 119, 119, 0.7)'
        };
      case 'Q':
        return {
          name: 'Queen',
          dotColor: '#FFD60A',
          dotBorder: 'rgba(255, 214, 10, 0.3)',
          bgColor: 'rgba(255, 214, 10, 0.08)',
          borderColor: 'rgba(255, 214, 10, 0.2)',
          textColor: '#9e7800',
          badgeBg: 'rgba(255, 214, 10, 0.15)',
          badgeColor: '#9e7800',
          accentColor: 'rgba(158, 120, 0, 0.7)'
        };
      case 'K':
        return {
          name: 'King',
          dotColor: '#1C1C1C',
          dotBorder: 'rgba(0, 0, 0, 0.2)',
          bgColor: 'rgba(28, 28, 28, 0.05)',
          borderColor: 'rgba(28, 28, 28, 0.15)',
          textColor: '#333',
          badgeBg: 'rgba(28, 28, 28, 0.75)',
          badgeColor: '#DAA520',
          accentColor: 'rgba(218, 165, 32, 0.7)'
        };
      default:
        return {
          name: area,
          dotColor: '#777',
          dotBorder: 'rgba(0, 0, 0, 0.08)',
          bgColor: 'rgba(171, 141, 89, 0.04)',
          borderColor: 'rgba(171, 141, 89, 0.1)',
          textColor: '#333',
          badgeBg: 'rgba(171, 141, 89, 0.1)',
          badgeColor: '#333',
          accentColor: 'rgba(119, 119, 119, 0.7)'
        };
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "white",
        boxShadow: "none",
        borderRadius: 2,
        mb: 2.5,
        p: { xs: 1.5, md: 2 },
        border: `1px solid ${goldBorder}`,
        transition: "all 0.2s ease",
        backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,1))",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(171, 141, 89, 0.1)",
        },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(to right, rgba(171, 141, 89, 0.3), rgba(171, 141, 89, 0.7), rgba(171, 141, 89, 0.3))",
          borderRadius: "2px 2px 0 0"
        }
      }}
    >
      <Typography
        variant="subtitle2"
        component="div"
        sx={{
          color: "rgb(171, 141, 89)",
          fontWeight: 600,
          fontSize: "0.95rem",
          mb: 1.5,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: `1px solid ${goldBorder}4D`,
          paddingBottom: 0.75,
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            display: "inline-block",
            width: "4px",
            height: "14px",
            backgroundColor: goldBorder,
            marginRight: "8px",
            borderRadius: "2px"
          }
        }}
      >
        <span>Khu vực đã chọn</span>
      </Typography>

      {/* Enhanced Seat Info layout */}
      <Box sx={{ mt: 1.5 }}>
        {selectedArea.length > 0 ? (
          <>
            {/* Total seats selected summary */}
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                mb: 1.5,
                backgroundColor: "rgba(171, 141, 89, 0.05)",
                p: 1,
                borderRadius: 1.5
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#555"
                }}
              >
                <span>Tổng ghế đã chọn:</span>
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "rgb(171, 141, 89)"
                }}
              >
                <span>{totalSeatsText}</span>
              </Typography>
            </Box>

            {/* Seat type badges - vertical layout for better visibility */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {selectedArea.map((area: string) => {
                const config = getAreaConfig(area);
                return (
                  <Box
                    key={area}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: config.bgColor,
                      borderRadius: "8px",
                      py: 1.25,
                      px: 1.75,
                      border: `1px solid ${config.borderColor}`,
                      transition: "all 0.15s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 8px ${config.borderColor}`,
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box 
                        sx={{ 
                          borderRadius: "50%", 
                          width: 10, 
                          height: 10, 
                          backgroundColor: config.dotColor,
                          border: `1px solid ${config.dotBorder}`,
                          boxShadow: `0 0 0 2px rgba(255,255,255,0.8)` 
                        }}
                      />
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "1rem",
                          color: config.textColor,
                          fontWeight: 600,
                          lineHeight: 1.2
                        }}
                      >
                        <span>Khu {area} - {config.name}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Box
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          backgroundColor: config.badgeBg,
                          color: config.badgeColor,
                          borderRadius: "6px",
                          px: 1.75,
                          py: 0.75,
                          minWidth: "40px",
                          height: "32px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "3px",
                            height: "70%",
                            backgroundColor: config.dotColor,
                            borderRadius: "2px"
                          }
                        }}
                      >
                        {seatQuantities[area] || 0}
                      </Box>
                      <IconButton 
                        size="small"
                        sx={{ 
                          p: 0.5, 
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          '&:hover': {
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                          }
                        }} 
                        onClick={() => handleRemoveArea(area)}
                      >
                        <FontAwesomeIcon icon={faClose} size="xs" style={{ color: "#d32f2f" }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </>
        ) : (
          <Box
            sx={{ 
              textAlign: "center",
              py: 2.5,
              px: 2,
              backgroundColor: "rgba(171, 141, 89, 0.04)",
              borderRadius: 1.5,
              border: "1px dashed rgba(171, 141, 89, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Decorative elements to convey premium feel */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: "linear-gradient(to right, rgba(171, 141, 89, 0.05), rgba(171, 141, 89, 0.3), rgba(171, 141, 89, 0.05))"
              }}
            />
            
            {remainingSeatsToChoose > 0 ? (
              <>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "rgb(171, 141, 89)"
                  }}
                >
                  <span>Cần chọn thêm {remainingSeatsToChoose} ghế</span>
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontSize: "0.9rem",
                    color: "#666",
                    maxWidth: "90%",
                    lineHeight: 1.4
                  }}
                >
                  <span>Vui lòng nhấp vào khu vực ghế từ sơ đồ phòng để hoàn tất combo của bạn</span>
                </Typography>
                <Box 
                  sx={{ 
                    display: "flex", 
                    gap: 2, 
                    mt: 0.5,
                    fontSize: "0.85rem",
                    color: "#777" 
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: "#777", borderRadius: "50%" }} />
                    <span>Jack</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: "#FFD60A", borderRadius: "50%" }} />
                    <span>Queen</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: "#1C1C1C", borderRadius: "50%" }} />
                    <span>King</span>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#4caf50",
                  py: 1
                }}
              >
                <span>Số lượng ghế đã đủ! Vui lòng tiếp tục.</span>
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SeatSelection;
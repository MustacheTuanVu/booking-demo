import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid, Divider, Chip, TextField, Button } from "@mui/material";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";

const goldBorder = "rgb(171 141 89/var(--tw-text-opacity,1))";

const BookingSummary = ({ quantityCombo, isBelow1028, billData, setOpenDialog }: any) => {
  // State to store event data
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);
  
  // Fetch event data when order is available
  useEffect(() => {
    const fetchEventData = async () => {
      if (billData && billData[0] && billData[0].event_id) {
        setLoading(true);
        try {
          const response = await api.get(`/events/getDetailEvent?idEvent=${billData[0].event_id}`);
          if (response.data && response.data.length > 0) {
            setEventData(response.data[0]);
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEventData();
  }, [billData]);

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
    } else {
      setIsValidCode(false);
      setErrorMessage("Mã giảm giá không hợp lệ");
    }
  };

  // If there's no bill data, don't render anything
  if (!billData) return null;

  // Extract data from the API response
  const order = billData[0]; // Order information: id, code, status, total_price, etc.
  const orderDetails = billData[1]; // Order details: combo_info, item_upsell, sizes

  // Format event date and time
  const formatEventDateTime = () => {
    if (!eventData) return "Không có thông tin sự kiện";
    
    // Format date from ShowTimes
    const showTime = eventData.InfoShowTimes && eventData.InfoShowTimes.length > 0 
      ? eventData.InfoShowTimes[0] 
      : null;
    
    if (showTime && showTime.time_start) {
      const eventDate = format(new Date(showTime.time_start), 'EEE, d MMM, yyyy', { locale: vi });
      const eventTime = format(new Date(showTime.time_start), 'HH:mm');
      return `${eventDate} • ${eventTime}`;
    } 
    
    // Fallback to event title if no date/time available
    return eventData.title || "Không có thông tin sự kiện";
  };

  // Calculate total seats based on j_size, q_size, k_size
  const totalSeats = 
    (orderDetails.j_size || 0) + 
    (orderDetails.q_size || 0) + 
    (orderDetails.k_size || 0);
  
  // Calculate total combo price from combo_info
  const totalComboPrice = orderDetails.combo_info.reduce((total: number, combo: any) => {
    return total + (combo.price || 0);
  }, 0);
  
  // Calculate total upsell price from item_upsell
  const totalUpsellPrice = orderDetails.item_upsell.reduce((total: number, item: any) => 
    total + (item.price * item.quantity), 0);

  return (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        backgroundColor: "#fff",
        border: `2px solid ${goldBorder}`,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: goldBorder, mb: 3, textAlign: "center" }}>
        Chi tiết đặt chỗ
      </Typography>

      <Box>
        {/* Booking code */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: goldBorder }}>
              Mã đặt chỗ:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {order.code}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2, borderColor: `${goldBorder}4D` }} />

        {/* Event Date and Time */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: goldBorder }}>
              Ngày sự kiện:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {loading ? "Đang tải..." : formatEventDateTime()}
            </Typography>
          </Grid>
        </Grid>

        
        <Divider sx={{ my: 2, borderColor: `${goldBorder}4D` }} />

        {/* Booked seats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: goldBorder, mb: 2 }}>
              Ghế đã đặt:
            </Typography>
            
            {orderDetails.j_size > 0 && (
              <Box sx={{ 
                mb: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Phân khu J
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {orderDetails.j_size} ghế
                </Typography>
              </Box>
            )}
            
            {orderDetails.q_size > 0 && (
              <Box sx={{ 
                mb: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Phân khu Q
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {orderDetails.q_size} ghế
                </Typography>
              </Box>
            )}
            
            {orderDetails.k_size > 0 && (
              <Box sx={{ 
                mb: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Phân khu K
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {orderDetails.k_size} ghế
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
        <Divider sx={{ my: 2, borderColor: `${goldBorder}4D` }} />

        {/* Combo information */}
        {orderDetails.combo_info && orderDetails.combo_info.length > 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: goldBorder, mb: 2 }}>
                  Combo đã đặt:
                </Typography>
                
                {orderDetails.combo_info.map((combo: any, index: number) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline',
                      width: '100%',
                      mb: 1
                    }}>
                      <Typography component="span" sx={{ fontWeight: 600, color: '#333' }}>
                        {combo.name}
                      </Typography>
                      <Typography component="span" sx={{ fontWeight: 600, color: '#333' }}>
                        {(combo.price || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {combo.items.map((item: any, itemIndex: number) => (
                      <Typography 
                        key={itemIndex} 
                        component="div" 
                        sx={{ 
                          pl: 2, 
                          color: 'text.secondary', 
                          fontSize: "0.9em",
                          mb: 0.5 
                        }}
                      >
                        + {item.quantity} x {item.name}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderColor: `${goldBorder}4D` }} />
          </>
        )}

        {/* Additional paid items */}
        {orderDetails.item_upsell && orderDetails.item_upsell.length > 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: goldBorder, mb: 2 }}>
                  Đồ ăn/uống bổ sung:
                </Typography>
                
                {/* Header */}
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  px: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isBelow1028 ? "13px" : "14px",
                      width: '60%'
                    }}
                  >
                    Tên món
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: isBelow1028 ? "13px" : "14px",
                      textAlign: 'center',
                      width: '15%'
                    }}
                  >
                    SL
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: isBelow1028 ? "13px" : "14px",
                      textAlign: 'right',
                      width: '25%'
                    }}
                  >
                    Giá
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 1.5, borderColor: `${goldBorder}4D` }} />
                
                {/* Item rows */}
                {orderDetails.item_upsell.map((item: any, index: number) => (
                  <Box key={index} sx={{ 
                    mb: 1.5, 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: isBelow1028 ? "14px" : "16px",
                        width: '60%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: { xs: 'normal', sm: 'nowrap' }
                      }}
                    >
                      {item.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: isBelow1028 ? "14px" : "16px",
                        textAlign: 'center',
                        width: '15%'
                      }}
                    >
                      {item.quantity}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: isBelow1028 ? "14px" : "16px",
                        textAlign: 'right',
                        width: '25%'
                      }}
                    >
                      {(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderColor: `${goldBorder}4D` }} />
          </>
        )}

        {/* Highlight total payment */}
        <Paper
          sx={{
            p: 2,
            mt: 3,
            textAlign: "center",
            backgroundColor: "#fff",
            borderRadius: 2,
            border: `1px solid ${goldBorder}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: goldBorder }}>
            Tổng thanh toán:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {order.total_price.toLocaleString()}
          </Typography>
        </Paper>
        
        {/* Nút chọn lại */}
        {/* <Button
          variant="outlined"
          onClick={()=>setOpenDialog(true)}
          fullWidth
          sx={{
            mt: 3,
            textTransform: "none",
            borderRadius: 2,
            borderColor: goldBorder,
            color: goldBorder,
            "&:hover": {
              borderColor: goldBorder,
              backgroundColor: "rgba(171, 141, 89, 0.08)",
            },
            fontSize: "1rem",
          }}
        >
          <FontAwesomeIcon icon={faArrowRotateLeft} style={{ marginRight: "8px" }} />
          Chọn lại món ăn
        </Button> */}
      </Box>
    </Paper>
  );
};

export default BookingSummary;
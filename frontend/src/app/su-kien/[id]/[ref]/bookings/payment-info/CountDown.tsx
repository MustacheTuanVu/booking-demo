import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Countdown() {
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [openExpiredDialog, setOpenExpiredDialog] = useState(false);

    // Giảm timeLeft mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            setOpenExpiredDialog(true);
        }
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    // const displayTime = `${minutes.toString().padStart(2, "0")} : ${seconds
    //     .toString()
    //     .padStart(2, "0")}`;

    return (
        <Box>
            <Box
                // Hộp ngoài mờ, bo tròn, canh giữa
                sx={{
                    backgroundColor: "var(--clr-bg-2)", // Nền mờ
                    backdropFilter: "blur(20px)",
                    color: "#fff",
                    padding: "16px",
                    borderRadius: "16px",
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid var(--clr-bg)",
                }}
            >
                {/* Dòng chữ phía trên */}
                <Typography sx={{ fontWeight: "bold", mb: 3 }}>
                    Hoàn tất đặt chỗ trong
                </Typography>

                {/* Khu vực hiển thị phút / giây */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Ô hiển thị phút */}
                    <Box
                        sx={{
                            backgroundColor: "#00c17b",
                            width: 50,
                            height: 50,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "20px",
                            color: "#fff",
                        }}
                    >
                        {minutes.toString().padStart(2, "0")}
                    </Box>

                    {/* Dấu hai chấm */}
                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>:</Typography>

                    {/* Ô hiển thị giây */}
                    <Box
                        sx={{
                            backgroundColor: "#00c17b",
                            width: 50,
                            height: 50,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "20px",
                            color: "#fff",
                        }}
                    >
                        {seconds.toString().padStart(2, "0")}
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={openExpiredDialog}
                onClose={() => setOpenExpiredDialog(false)}
                slotProps={{
                    paper: {
                        sx: {
                            p: 2,
                            textAlign: "center",
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>Hết thời gian giữ chỗ!</DialogTitle>
                <DialogContent>
                    <FontAwesomeIcon icon={faBell} style={{ fontSize: "40px", padding: "10px" }} />
                    <Typography sx={{ fontSize: "14px" }}>
                        Đã hết thời gian giữ chỗ. Vui lòng đặt lại chỗ mới.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", width: "100%", }}>
                    <Link href="/event/1/bookings/select-ticket" style={{ width: "100%" }}>
                        <Button
                            variant="contained"
                            onClick={() => setOpenExpiredDialog(false)}
                            sx={{ backgroundColor: "var(--clr-bg-1)", width: "100%", borderRadius: "20px", "&:hover": { backgroundColor: "var(--clr-bg-7)" } }}
                        >
                            Đặt chỗ mới
                        </Button>
                    </Link>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import MicIcon from '@mui/icons-material/Mic';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getMediaUrl } from '@/utils/mediaUrl';

// Configure moment locale
moment.locale('vi');
const localizer = momentLocalizer(moment);

// ----------- Interface mô phỏng dữ liệu trả về -----------
interface IEvent {
  _id: string;
  title: string;
  banner: string;
  avatar: string;
  slug: string;
  InfoShowTimes: Array<{
    _id: string;
    time_start: string; // ISO string
    time_end: string;
  }>;
  InfoContents: Array<{
    _id: string;
    desc: string;
    InfoArtist: Array<{
      _id: string;
      name: string;
      image: string;
    }>;
  }>;
}

// ----------- Dữ liệu sau khi chuyển đổi để hiển thị -----------
interface ScheduleItem {
  dateValue: string; // "YYYY-MM-DD"
  timeLabel: string; // "HH:mm"
  eventTitle: string;
  eventSlug: string;
  artistName: string;
  imageUrl: string;
  startTime: Date;
  endTime: Date;
}

// Calendar Event Interface
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  artistName: string;
  imageUrl: string;
  eventSlug: string;
}

// ----------- Props của trang Schedule -----------
interface ScheduleProps {
  events: IEvent[];
  listArtis?: string;
}

// View mode type
type ViewMode = 'day' | 'calendar';

// Hàm chuyển đổi định dạng ngày: "YYYY-MM-DD" => "Thứ X dd/mm"
function formatDateVietnamese(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${dayName} ${day}/${month}`;
}

// Component calendar event renderer
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', overflow: 'hidden' }}>
    <Avatar
      src={getMediaUrl(event.imageUrl)}
      alt={event.artistName}
      sx={{ width: 24, height: 24 }}
    />
    <Typography variant="caption" sx={{ fontWeight: 'medium', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {event.title}
    </Typography>
  </Box>
);

export default function Schedule({ events, listArtis = "Nghệ sĩ biểu diễn" }: ScheduleProps) {
  const router = useRouter();
  // State to track view mode (day view or calendar view)
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Chuyển đổi dữ liệu API thành mảng ScheduleItem
  const scheduleItems: ScheduleItem[] = [];
  events.forEach((ev) => {
    const defaultImage = ev.banner || ev.avatar || '';

    ev.InfoShowTimes.forEach((showTime) => {
      const startTime = new Date(showTime.time_start);
      const endTime = new Date(showTime.time_end);
      const dateValue = startTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const hours = startTime.getHours().toString().padStart(2, '0');
      const minutes = startTime.getMinutes().toString().padStart(2, '0');
      const timeLabel = `${hours}:${minutes}`;

      let artistName = '';
      let artistImage = '';

      if (ev.InfoContents?.length > 0) {
        const firstContent = ev.InfoContents[0];
        if (firstContent.InfoArtist?.length > 0) {
          artistName = firstContent.InfoArtist[0].name;
          artistImage = firstContent.InfoArtist[0].image;
        }
      }

      const finalImage = artistImage || defaultImage;

      scheduleItems.push({
        dateValue,
        timeLabel,
        eventTitle: ev.title,
        eventSlug: ev.slug || '',
        artistName,
        imageUrl: finalImage,
        startTime,
        endTime
      });
    });
  });

  // Convert to calendar events
  const calendarEvents: CalendarEvent[] = scheduleItems.map((item, index) => ({
    id: `${item.eventSlug}-${index}`,
    title: item.eventTitle,
    start: item.startTime,
    end: item.endTime,
    artistName: item.artistName,
    imageUrl: item.imageUrl,
    eventSlug: item.eventSlug
  }));

  // Tạo danh sách ngày (unique) từ scheduleItems
  const uniqueDates = Array.from(
    new Set(scheduleItems.map((item) => item.dateValue))
  ).sort().reverse();

  // Hàm tính toán ngày biểu diễn gần nhất
  const getInitialDate = (): string => {
    const now = new Date();
    const upcomingDates = uniqueDates.filter(
      (dateStr) => new Date(dateStr) >= now
    );
    return upcomingDates.length > 0 ? upcomingDates[0] : uniqueDates[0] || '';
  };

  // Khởi tạo selectedDate với giá trị hợp lệ
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Nếu chưa chọn ca sĩ thì lọc lịch theo ngày đã chọn
  const itemsByDate = scheduleItems.filter(
    (item) => item.dateValue === selectedDate
  );

  // Nếu đã chọn ca sĩ thì lấy toàn bộ lịch của ca sĩ đó (không phụ thuộc ngày)
  const itemsByArtist = scheduleItems.filter(
    (item) => item.artistName === selectedArtist
  );

  // Lọc calendar events theo nghệ sĩ nếu có chọn nghệ sĩ
  const filteredCalendarEvents = selectedArtist
    ? calendarEvents.filter((event) => event.artistName === selectedArtist)
    : calendarEvents;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // Lấy ngày hiện tại dưới dạng "YYYY-MM-DD"

  const displayScheduleItems = selectedArtist || itemsByArtist.length > 0
    ? itemsByArtist
    : itemsByDate.filter((item: any) => item.dateValue === todayStr);

  // Nhóm các sự kiện theo ngày (dùng khi lọc theo ca sĩ)
  const groupedByDate = selectedArtist
    ? Array.from(
      displayScheduleItems.reduce((acc, item) => {
        if (!acc.has(item.dateValue)) {
          acc.set(item.dateValue, []);
        }
        acc.get(item.dateValue)?.push(item);
        return acc;
      }, new Map<string, ScheduleItem[]>())
    ).sort((a, b) => b[0].localeCompare(a[0]))
    : null;

  // Lấy danh sách nghệ sĩ duy nhất
  const uniqueArtists = Array.from(
    new Map(
      scheduleItems
        .filter(item => item.artistName) // Chỉ lấy các item có tên nghệ sĩ
        .map(item => [item.artistName, item])
    ).values()
  );

  // Handler for view mode change
  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Kiểm tra nếu không có dữ liệu
  if (events.length === 0 || scheduleItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.6 }} />
          <Typography variant="h5" color="text.secondary">
            Không có lịch biểu diễn nào.
          </Typography>
        </Box>
      </Container>
    );
  }

  const [calendarView, setCalendarView] = useState<any>('month');

  const [calendarDate, setCalendarDate] = useState(new Date());

  return (
    <Container sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 2,
          backgroundColor: 'var(--clr-bg)',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            sx={{ mb: 3 }}
          >
            <ToggleButton value="day" aria-label="view by day">
              <TodayIcon sx={{ mr: 1 }} />
              XEM THEO NGÀY
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="view by calendar">
              <CalendarMonthIcon sx={{ mr: 1 }} />
              XEM THEO LỊCH
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* Cột bên trái: Danh sách ca sĩ */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: 24,
                  color: "var(--clr-txt-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Các Nghệ Sĩ Tháng Này
              </Typography>
              {selectedArtist && (
                <Button sx={{ textTransform: "none", color: "var(--clr-txt-4)", }}
                  onClick={() => {
                    setSelectedArtist(null);
                    setSelectedDate(getInitialDate());
                  }}
                > Tắt bộ lọc: {selectedArtist} <FontAwesomeIcon icon={faXmark} style={{ marginLeft: '5px' }} />
                </Button>
              )}
            </Box>
            {uniqueArtists.length > 0 ? (
              <Grid
                container
                spacing={2}
                sx={{
                  flexWrap: { xs: "nowrap", md: "wrap" },
                  overflowX: { xs: "auto", md: "visible" },
                  pb: 1,
                  "&::-webkit-scrollbar": {
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderRadius: "4px",
                  },
                }}
              >
                {uniqueArtists.map((item: any, index) => (
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    key={index}
                    onClick={() => setSelectedArtist(item.artistName)}
                  >
                    <CardMedia
                      component="img"
                      image={getMediaUrl(item.imageUrl)}
                      alt={item.artistName || item.eventTitle}
                      sx={{
                        objectFit: "cover",
                        width: "96px",
                        height: "96px",
                        borderRadius: "50%",
                        transition: "all 0.3s",
                        border: selectedArtist === item.artistName ? "4px solid" : "2px solid",
                        borderColor: selectedArtist === item.artistName ? "var(--clr-bg-1)" : "transparent",
                        boxShadow: selectedArtist === item.artistName ? 3 : 0,
                        "&:hover": {
                          borderColor: "var(--clr-bg-1)",
                        },
                      }}
                    />
                    {selectedArtist === item.artistName && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "var(--clr-bg-1)",
                          color: "white",
                          fontSize: "12px",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%", // Làm tròn icon
                          border: "2px solid white",
                        }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Box>
                    )}

                    {/* Tên nghệ sĩ */}
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: selectedArtist === item.artistName ? "bold" : "medium",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.artistName}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Không có nghệ sĩ nào
              </Typography>
            )}
          </Grid>

          {/* Cột bên phải: Lịch biểu diễn */}
          <Grid size={{ xs: 12, md: 6 }}>
            {selectedArtist && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                  Lịch biểu diễn của: <Box component="span" sx={{ color: 'secondary.main' }}>{selectedArtist}</Box>
                </Typography>

                <Tooltip title="Xóa bộ lọc" arrow>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedArtist(null);
                      setSelectedDate(getInitialDate());
                    }}
                    size="small"
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      p: 1.5
                    }}
                  >
                    <FilterAltOffIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Calendar View
            {viewMode === 'calendar' && (
              <Box sx={{ height: 600, mb: 3 }}>
                <Calendar
                  localizer={localizer}
                  events={filteredCalendarEvents}
                  date={calendarDate} // truyền ngày hiện tại
                  onNavigate={(newDate) => setCalendarDate(newDate)} // cập nhật ngày khi người dùng chuyển đổi
                  view={calendarView}
                  onView={setCalendarView}
                  defaultView="month"
                  messages={{
                    today: 'Hôm nay',
                    previous: 'Trước',
                    next: 'Sau',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    agenda: 'Lịch',
                    date: 'Ngày',
                    time: 'Thời gian',
                    event: 'Sự kiện',
                  }}
                  views={['month', 'week', 'day', 'agenda']}
                  components={{
                    event: EventComponent
                  }}
                  onSelectEvent={(event) => {
                    router.push(`/su-kien/${(event as CalendarEvent).eventSlug}/666`);
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: 'var(--clr-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px'
                    }
                  })}
                />
              </Box>
            )}

            Day View
            {viewMode === 'day' && !selectedArtist && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <EventIcon /> Chọn ngày
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: { xs: "nowrap", md: "wrap" },
                    overflowX: { xs: "auto", md: "visible" },
                    pb: 1,
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                    }
                  }}
                >
                  {uniqueDates.map((date) => {
                    const isToday = (new Date(), "yyyy-MM-dd") === (new Date(date), "yyyy-MM-dd");
                    return (
                      <Chip
                        key={date}
                        label={formatDateVietnamese(date)}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedArtist(null);
                        }}
                        color={isToday ? "primary" : date === selectedDate ? "primary" : "default"}
                        variant={isToday || date === selectedDate ? "filled" : "outlined"}
                        sx={{
                          flexShrink: 0,
                          fontWeight: isToday || date === selectedDate ? 600 : 400,
                          borderRadius: '8px',
                          padding: '8px 0',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )} */}
          </Grid>
        </Grid>
        {viewMode === 'day' && (
          <Stack spacing={2.5}>
            {selectedArtist ? (
              groupedByDate &&
              groupedByDate.map(([date, items]) => (
                <Box key={date}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "var(--clr-txt-3)", my: 2 }}
                  >
                    {selectedArtist
                      ? `Các đêm diễn có ${selectedArtist}`
                      : formatDateVietnamese(selectedDate)}
                    {items.length > 0 && (
                      <span style={{ marginLeft: "8px", color: "var(--clr-txt-4)" }}>
                        ({items.length} sự kiện)
                      </span>
                    )}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: "var(--clr-bg-2)", width: "100%" }} />

                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <Card
                        key={`${item.dateValue}-${index}`}
                        elevation={2}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Grid container>
                          <Grid size={{ xs: 5, sm: 4 }}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "primary.main",
                              color: "white",
                              p: 2,
                            }}
                          >
                            <Box sx={{ textAlign: "center" }}>
                              {/* <AccessTimeIcon sx={{ mb: 0.5 }} />
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {item.timeLabel}
                              </Typography> */}
                              <CardMedia
                                component="img"
                                image={getMediaUrl(item.imageUrl)}
                                alt={`Slide ${index + 1}`}
                                sx={{
                                  height: '220px',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              />
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 7, sm: 8 }}>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {item.eventTitle}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  {item.artistName}
                                </Typography>

                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => router.push(`/su-kien/${item.eventSlug}/666`)}
                                  sx={{
                                    borderRadius: 4,
                                    px: 3,
                                  }}
                                >
                                  Đặt chỗ
                                </Button>
                              </Box>
                            </CardContent>
                          </Grid>
                        </Grid>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", my: 4 }}>
                      Hôm nay không có buổi biểu diễn nào.
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              displayScheduleItems.length > 0 ? (
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "var(--clr-txt-3)", my: 2 }}
                  >
                    {selectedArtist
                      ? `Các đêm diễn có ${selectedArtist}`
                      : formatDateVietnamese(selectedDate)}
                    <span style={{ marginLeft: "8px", color: "var(--clr-txt-4)" }}>
                      ({displayScheduleItems.length} sự kiện)
                    </span>
                  </Typography>
                  {displayScheduleItems.map((item: any, index) => (
                    <Card
                      key={`${item.dateValue}-${index}`}
                      elevation={2}
                      sx={{
                        borderRadius: 2,
                        // overflow: "hidden",
                        // transition: "transform 0.3s, box-shadow 0.3s",
                        // "&:hover": {
                        //   transform: "translateY(-4px)",
                        //   boxShadow: 6,
                        // },
                      }}
                    >
                      <Grid container>
                        <Grid size={{ xs: 3, sm: 2 }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.main",
                            color: "white",
                            p: 2,
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <AccessTimeIcon sx={{ mb: 0.5 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {item.timeLabel}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 9, sm: 10 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {item.eventTitle}
                            </Typography>

                            {item.artistName && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <MicIcon fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  {item.artistName}
                                </Typography>
                              </Box>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => router.push(`/su-kien/${item.eventSlug}/666`)}
                                sx={{
                                  borderRadius: 4,
                                  px: 3,
                                }}
                              >
                                Đặt chỗ
                              </Button>
                            </Box>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", my: 4 }}>
                  Hôm nay không có buổi biểu diễn nào.
                </Typography>
              )
            )}
            {/* Hiển thị thông báo khi không có sự kiện */}
            {/* {displayScheduleItems.length === 0 && viewMode === 'day' && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <EventIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="body1" color="text.secondary">
                  {selectedArtist
                    ? `Không có lịch biểu diễn nào cho nghệ sĩ "${selectedArtist}"`
                    : `Không có sự kiện nào vào ngày ${formatDateVietnamese(selectedDate)}`
                  }
                </Typography>
              </Box>
            )} */}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001';
    const res = await fetch(`${apiUrl}/events/getEventByCondition?page=1&limit=100`);
    const data = await res.json();
    return {
      props: {
        events: data.events || [],
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};

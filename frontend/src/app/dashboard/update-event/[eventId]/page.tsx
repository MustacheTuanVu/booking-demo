"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronRight, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import CreateInfoTicket from '../../create-event/CreateInfoTicket';
import CreateTypeTicket from '../../create-event/CreateTypeTicket';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardHeader from '@/components/Dashboard/ui/DashboardHeader';
import StandardDialog, { StandardDialogProps } from '@/components/ui/dialog/StandardDialog';
import { Button } from '@/components/ui/button';

// Define type for dialog state
type DialogState = {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  type: StandardDialogProps['variant'];
};

// Client component with all React hooks
function UpdateEventClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [logo_sk, setLogoSK] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [logoSKFile, setLogoSKFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoSKError, setLogoSKError] = useState<string | null>(null);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [openError, setOpenError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    title: '',
    message: '',
    type: 'default',
  });

  const steps = ['Thông tin sự kiện', 'Thời gian & Loại chỗ'];
  const [contentEventData, setContentEventData] = useState<any[]>([]);
  const [seatMapId, setSeatMapId] = useState<string>('');

  const [eventData, setEventData] = useState({
    title: "",
    type_event: "Offline",
    venue: "Tầng 1, 15 Lê Đại Cang, P. Thành Công, Tp. Buôn Ma Thuột, Đắk Lắk, Việt Nam",
    category_id: "",
    desc: "",
    seat_map_id: "",
    slug: "",
    status: "ACTIVE",
    show_artists: true,
    custom_artists_text: "",
    showsTimeData: [],
    contentEventData: [],
    seatSelectionData: [],
  });

  const [cateList, setCateList] = useState<any[]>([]);
  const [artistList, setArtistList] = useState<any[]>([]);
  const [comboList, setComboList] = useState<any[]>([]);
  
  const [ticketTypeInfor, setTickerTypeInfor] = useState([
    { price: 0, type: 'J', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
    { price: 0, type: 'Q', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
    { price: 0, type: 'K', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
  ]);
  
  const showDialog = useCallback((type: 'success' | 'error', message: string) => {
    setDialogState({
      open: true,
      title: type === 'success' ? 'Thành công!' : 'Lỗi!',
      message,
      type: type === 'success' ? 'success' : 'danger',
    });
  }, []);

  const fetchEventData = useCallback(async () => {
    try {
      setIsLoading(true);
      const eventResponse = await api.get(`/events/getDetailEvent?idEvent=${eventId}`);
      const eventDetail = eventResponse.data[0];

      if (!eventDetail) {
        showDialog('error', 'Không tìm thấy thông tin sự kiện');
        router.replace('/dashboard/event-list');
        return;
      }

      const serverUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const logoUrl = eventDetail.avatar ? `${serverUrl}/${eventDetail.avatar}` : null;
      const bannerUrl = eventDetail.banner ? `${eventDetail.banner}` : null;

      setLogoSK(logoUrl);
      setBackground(bannerUrl);

      const rawShowsTimeData = eventDetail.InfoShowTimes || [];
      const showsTimeData = rawShowsTimeData.map((item: any) => ({
        showtimeId: item._id,
        time_start: item.time_start,
        time_end: item.time_end,
        status: item.status
      }));

      const rawContentEventData = eventDetail.InfoContents || [];
      const contentEventData = rawContentEventData.map((item: any) => ({
        content_id: item._id,
        artist_id: item.artist_id,
        desc: item.desc,
        time: item.time,
        status: item.status
      }));
      setContentEventData(contentEventData);

      const rawSeatSelectionData = eventDetail.InfoSeatSections || [];
      const seatSelectionData = rawSeatSelectionData.map((item: any) => ({
        seatSectionId: item._id,
        type: item.type,
        price: item.price,
        size: item.size,
        j_booking_start: item.j_booking_start,
        q_booking_start: item.q_booking_start,
        k_booking_start: item.k_booking_start,
        time_end: item.time_end,
        data_seat: item.data_seat
      }));

      setEventData({
        title: eventDetail.title || "",
        type_event: eventDetail.type_event || "Offline",
        venue: eventDetail.venue || "Tầng 1,15 Lê Đại Cang, Thành Công, Buôn Ma Thuột, Đắk Lắk, Việt Nam",
        category_id: eventDetail.category_id || "",
        desc: eventDetail.desc || "",
        seat_map_id: eventDetail.seat_map_id || "",
        slug: eventDetail.slug || "",
        status: eventDetail.status || "ACTIVE",
        show_artists: eventDetail.show_artists !== false,
        custom_artists_text: eventDetail.custom_artists_text || "",
        showsTimeData,
        contentEventData: contentEventData,
        seatSelectionData,
      });

      if (seatSelectionData && seatSelectionData.length > 0) {
        const mappedTickets = [];
        const typeJ = seatSelectionData.find((item: any) => item.type === 'J');
        const typeQ = seatSelectionData.find((item: any) => item.type === 'Q');
        const typeK = seatSelectionData.find((item: any) => item.type === 'K');

        if (typeJ) mappedTickets.push(typeJ);
        if (typeQ) mappedTickets.push(typeQ);
        if (typeK) mappedTickets.push(typeK);

        setTickerTypeInfor(mappedTickets);
      }

      setSeatMapId(eventDetail.seat_map_id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setIsLoading(false);
      showDialog('error', 'Có lỗi xảy ra khi lấy thông tin sự kiện. Vui lòng thử lại.');
    }
  }, [eventId, router, setIsLoading, showDialog]);

  const fetchInitialData = useCallback(async () => {
    try {
      const cateResponse = await api.get('/category_event/GetMany');
      setCateList(cateResponse.data.category);

      const artistsResponse = await api.get('/artists/GetMany?page=1&limit=99999999');
      setArtistList(artistsResponse.data.artists);

      setComboList([]);

      setIsMounted(true);
    } catch (error) {
      console.error(error);
      showDialog('error', 'Không thể tải dữ liệu ban đầu');
    }
  }, [showDialog]);

  useEffect(() => {
    if (eventId) {
      fetchInitialData().then(() => fetchEventData());
    } else {
      showDialog('error', 'Không tìm thấy sự kiện');
      router.replace('/dashboard/event-list');
    }
  }, [eventId, fetchEventData, fetchInitialData, router, showDialog]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo_sk' | 'background'
  ) => {
    if (typeof window === 'undefined') return;
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      let errorMessage = '';
      if (errorMessage) {
        setOpenError(true);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      if (type === 'logo_sk') {
        setLogoSK(objectUrl);
        setLogoSKError(null);
        setLogoSKFile(file);
      } else if (type === 'background') {
        setBackground(objectUrl);
        setBackgroundError(null);
        setBackgroundFile(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  const [ticketTypeSelected, setTicketTypeSelected] = useState<any>(null);

  const handleOpenDialog = (ticketTypeSelected?: any) => {
    const ticketTypeInforList = [...ticketTypeInfor];
    const itemWithType = ticketTypeInforList.find((item: any) => item.type === ticketTypeSelected);
    setTicketTypeSelected(itemWithType);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    router.replace('/dashboard/event-list');
  };

  const handleSaveArtis = (modalArtisChoose: any, modalArtisDesc: any, modalArtisTime: any) => {
    const newContent = [
      ...contentEventData,
      { artist_id: modalArtisChoose, desc: modalArtisDesc, time: modalArtisTime, status: "ACTIVE" }
    ];
    setContentEventData(newContent);
  };

  const handleDeleteArtis = (id: any) => {
    const filtered = contentEventData.filter((item: any) => item.artist_id !== id);
    setContentEventData(filtered);
  };

  const handleSubmit = async () => {
    try {
      // Validate custom_artists_text when show_artists is false
      if (eventData.show_artists === false && !eventData.custom_artists_text?.trim()) {
        showDialog('error', 'Text tùy ý là bắt buộc khi ẩn danh sách ca sỹ.');
        return;
      }

      setSubmitLoading(true);
      const formattedShowsTimeData = eventData.showsTimeData.map((item: any) => {
        const formattedItem: any = {
          time_start: item.time_start,
          time_end: item.time_end
        };
        if (item.showtimeId) {
          formattedItem.showtimeId = item.showtimeId;
        }
        return formattedItem;
      });

      const formattedContentEventData = contentEventData.map((item: any) => {
        const formattedItem: any = {
          artist_id: item.artist_id,
          desc: item.desc,
          time: item.time,
          status: item.status || "ACTIVE"
        };
        if (item.content_id) {
          formattedItem.content_id = item.content_id;
        }
        return formattedItem;
      });

      const formattedSeatSelectionData = ticketTypeInfor.map((item: any) => {
        const formattedItem: any = {
          type: item.type,
          price: item.price || 0,
          size: item.size || 1,
          j_booking_start: item.j_booking_start,
          q_booking_start: item.q_booking_start,
          k_booking_start: item.k_booking_start,
          time_end: item.time_end,
          data_seat: item.data_seat || []
        };
        if (item.seatSectionId) {
          formattedItem.seatSectionId = item.seatSectionId;
        }
        return formattedItem;
      });

      const eventDataRaw: any = {
        ...eventData,
        showsTimeData: formattedShowsTimeData,
        contentEventData: formattedContentEventData,
        seatSelectionData: formattedSeatSelectionData
      };

      await api.put(`/events/Update?eventId=${eventId}`, eventDataRaw);

      if (logoSKFile || backgroundFile) {
        const formData = new FormData();
        if (backgroundFile) {
          formData.append('files', backgroundFile);
          formData.append('files', backgroundFile);
        }
        await api.put(`/events/updateImages?eventId=${eventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      showDialog('success', 'Cập nhật sự kiện thành công!');
      setTimeout(() => {
        router.replace('/dashboard/event-list');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating event:', error);
      if (error.response && error.response.data && error.response.data.message) {
        showDialog('error', `Lỗi: ${error.response.data.message}`);
      } else {
        showDialog('error', 'Có lỗi xảy ra khi cập nhật sự kiện. Vui lòng thử lại.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải dữ liệu</h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 px-4 pb-16">
      <title>Cập nhật sự kiện | Queen Acoustic</title>
      <meta name="description" content="Trang Cập nhật sự kiện tại Queen Acoustic." />
      
      <StandardDialog
        open={dialogState.open}
        title={dialogState.title}
        variant={dialogState.type}
        onClose={() => setDialogState({ ...dialogState, open: false })}
      >
        <div className="text-sm text-gray-700">{dialogState.message}</div>
      </StandardDialog>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          {/* Breadcrumb navigation */}
          <div className="text-sm breadcrumbs mb-4">
            <ul className="flex text-gray-500">
              <li className="hover:text-gold-600 transition-colors">
                <a href="/dashboard">Dashboard</a>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <a href="/dashboard/event-list" className="hover:text-gold-600 transition-colors">
                  Quản lý sự kiện
                </a>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <span className="text-gold-600 font-medium">Cập nhật sự kiện</span>
              </li>
            </ul>
          </div>

          {/* Dashboard Header */}
          <DashboardHeader searchEnabled={false} title="Cập nhật sự kiện" />
          
          <div className="flex-1 overflow-y-auto">
            <div className="my-4 md:my-6">
              {/* Back button moved to top */}
              <div className="mb-4">
                <button 
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-auto"
                  onClick={handleBack}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Quay lại Quản lý sự kiện
                </button>
              </div>
              
              {/* Modern card container */}
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                {/* Improved responsive stepper with animation */}
                <div className="mb-8">
                  <div className="flex justify-between items-center relative">
                    {steps.map((step, index) => (
                      <React.Fragment key={index}>
                        {/* Step item */}
                        <div className="flex flex-col items-center z-10 relative w-1/2">
                          <div 
                            onClick={() => setActiveStep(index)}
                            className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-medium cursor-pointer
                            transition-all duration-300 ${
                              activeStep > index 
                                ? "bg-green-500 text-white" 
                                : activeStep === index 
                                  ? "bg-blue-600 text-white shadow-lg" 
                                  : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {activeStep > index ? "✓" : index + 1}
                          </div>
                          <span className={`mt-2 text-xs md:text-sm ${activeStep >= index ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                            {step}
                          </span>
                        </div>
                        
                        {/* Line between steps */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-4 md:top-6 left-0 right-0 flex justify-center">
                            <div className={`h-0.5 md:h-1 w-full mx-8 md:mx-12 rounded ${activeStep > index ? "bg-blue-500" : "bg-gray-300"}`}></div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Nội dung theo step */}
                {activeStep === 0 && (
                  <CreateInfoTicket
                    logo_sk={logo_sk}
                    background={background}
                    logoSKError={logoSKError}
                    backgroundError={backgroundError}
                    handleImageUpload={handleImageUpload}
                    eventData={eventData}
                    setEventData={setEventData}
                    cateList={cateList}
                    comboList={comboList}
                  />
                )}
                {activeStep === 1 && (
                  <CreateTypeTicket
                    onClose={() => { }}
                    eventData={eventData}
                    setEventData={setEventData}
                    ticketTypeSelected={ticketTypeSelected}
                    ticketTypeInfor={ticketTypeInfor}
                    setTickerTypeInfor={setTickerTypeInfor}
                    artistList={artistList}
                    handleSaveArtis={handleSaveArtis}
                    contentEventData={contentEventData}
                    handleDeleteArtis={handleDeleteArtis}
                    handleOpenDialog={handleOpenDialog}
                  />
                )}
                
                {/* Improved action buttons for better mobile experience */}
                <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
                  <button
                    onClick={activeStep === 0 ? handleBack : () => setActiveStep(prev => prev - 1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors w-full sm:w-auto"
                    disabled={submitLoading}
                  >
                    {activeStep === 0 ? 'Hủy' : 'Quay lại'}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!!logoSKError || !!backgroundError || submitLoading}
                    className={`px-6 py-3 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors flex items-center justify-center w-full sm:w-auto
                      ${(!!logoSKError || !!backgroundError || submitLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span className="flex-1 text-center">Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-center">
                          {activeStep === steps.length - 1 ? 'Cập nhật' : 'Tiếp tục'}
                        </span>
                        {activeStep !== steps.length - 1 && <FontAwesomeIcon icon={faChevronRight} className="ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is the actual page component that Next.js will call
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ eventId: string }> }) {
  // Unwrap the params Promise using React.use() to follow Next.js best practices
  const resolvedParams = use(params);
  return <UpdateEventClient eventId={resolvedParams.eventId} />;
}
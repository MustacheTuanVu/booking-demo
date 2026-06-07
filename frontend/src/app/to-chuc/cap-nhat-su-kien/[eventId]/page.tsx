"use client";
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronRight, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import CreateInfoTicket from '../../tao-su-kien/CreateInfoTicket';
import CreateTypeTicket from '../../tao-su-kien/CreateTypeTicket';


export default function UpdateEvent({ params }: any) {
  const eventId = params.eventId;
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
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);

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
    showsTimeData: [],
    contentEventData: [],
    seatSelectionData: [],
  });

  const [cateList, setCateList] = useState<any[]>([]);
  const [artistList, setArtistList] = useState<any[]>([]);
  const [comboList, setComboList] = useState<any[]>([]);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      const eventResponse = await api.get(`/events/getDetailEvent?idEvent=${eventId}`);
      const eventDetail = eventResponse.data[0];

      if (!eventDetail) {
        showNotification('error', 'Không tìm thấy thông tin sự kiện');
        router.replace('/to-chuc/quan-ly-su-kien');
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
      showNotification('error', 'Có lỗi xảy ra khi lấy thông tin sự kiện. Vui lòng thử lại.');
    }
  };

  const fetchInitialData = async () => {
    try {
      const cateResponse = await api.get('/category_event/GetMany');
      setCateList(cateResponse.data.category);

      const artistsResponse = await api.get('/artists/GetMany');
      setArtistList(artistsResponse.data.artists);

      setComboList([]);

      setIsMounted(true);
    } catch (error) {
      console.error(error);
      showNotification('error', 'Không thể tải dữ liệu ban đầu');
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchInitialData().then(() => fetchEventData());
    } else {
      showNotification('error', 'Không tìm thấy sự kiện');
      router.replace('/to-chuc/quan-ly-su-kien');
    }
  }, [eventId]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const [ticketTypeInfor, setTickerTypeInfor] = useState([
    { price: 0, type: 'J', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
    { price: 0, type: 'Q', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
    { price: 0, type: 'K', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
  ]);

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
    router.replace('/to-chuc/quan-ly-su-kien');
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
        // if (backgroundFile) formData.append('files', backgroundFile);
        // if (logoSKFile) formData.append('files', logoSKFile);

        if (backgroundFile) {
          formData.append('files', backgroundFile);
          formData.append('files', backgroundFile);
        }

        await api.put(`/events/updateImages?eventId=${eventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      showNotification('success', 'Cập nhật sự kiện thành công!');
      setTimeout(() => {
        router.replace('/to-chuc/quan-ly-su-kien');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating event:', error);
      if (error.response && error.response.data && error.response.data.message) {
        showNotification('error', `Lỗi: ${error.response.data.message}`);
      } else {
        showNotification('error', 'Có lỗi xảy ra khi cập nhật sự kiện. Vui lòng thử lại.');
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
    <div className="container mx-auto my-10 px-4">
      <title>Cập nhật sự kiện | Queen Acoustic</title>
      <meta name="description" content="Trang Cập nhật sự kiện tại Queen Acoustic." />
      
      {notification && (
        <div className={`fixed top-6 right-6 w-auto max-w-sm p-4 shadow-lg rounded-lg z-50 transition-all duration-300 flex items-center space-x-3
          ${notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
          <div className={`rounded-full p-2 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faExclamationTriangle} />
          </div>
          <div className="flex-1">
            <h3 className={`font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.type === 'success' ? 'Thành công!' : 'Lỗi!'}
            </h3>
            <p className={`text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {notification.message}
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)} 
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Cập nhật sự kiện</h1>
          <button 
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Quay lại
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center z-10 relative w-1/2">
                  <div 
                    onClick={() => setActiveStep(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-medium cursor-pointer
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
                  <span className={`mt-2 text-sm ${activeStep >= index ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    {step}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-0 right-0 flex justify-center">
                    <div className={`h-1 w-full mx-12 rounded ${activeStep > index ? "bg-blue-500" : "bg-gray-300"}`}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {activeStep === 0 && (
          <CreateInfoTicket
            openError={openError}
            handleCloseError={() => setOpenError(false)}
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
        
        <div className="flex justify-between mt-8">
          <button
            onClick={activeStep === 0 ? handleBack : () => setActiveStep(prev => prev - 1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            disabled={submitLoading}
          >
            {activeStep === 0 ? 'Hủy' : 'Quay lại'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={!!logoSKError || !!backgroundError || submitLoading}
            className={`px-6 py-3 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors flex items-center
              ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                {activeStep === steps.length - 1 ? 'Cập nhật' : 'Tiếp tục'}
                {activeStep !== steps.length - 1 && <FontAwesomeIcon icon={faChevronRight} className="ml-2" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import CreateTypeTicket from './CreateTypeTicket';
import CreateInfoTicket from './CreateInfoTicket';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardHeader from '@/components/Dashboard/ui/DashboardHeader';
import StandardDialog, { StandardDialogProps } from '@/components/ui/dialog/StandardDialog';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded-md"></div>
      <div className="h-12 bg-gray-200 rounded-md"></div>
      <div className="h-32 bg-gray-200 rounded-md"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-md"></div>
        <div className="h-24 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  </div>
);

type DialogState = {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  type: StandardDialogProps['variant'];
};

export default function CreateEvent() {
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [logo_sk, setLogoSK] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [logoSKFile, setLogoSKFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoSKError, setLogoSKError] = useState<string | null>(null);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const steps = ['Thông tin sự kiện', 'Thời gian & Loại chỗ'];
  const [contentEventData, setContentEventData] = useState<any[]>([]);
  const [seatMapId, setSeatMapId] = useState<string>('');
  const [eventData, setEventData] = useState({
    title: "",
    type_event: "Offline",
    venue: "Tầng 1, 15 Lê Đại Cang, Phường Buôn Ma Thuột, Đắk Lắk, Việt Nam",
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
  const [ticketTypeSelected, setTicketTypeSelected] = useState<any>(null);
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: '',
    message: '',
    type: 'default',
  });

  const fetchInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const cateResponse = await api.get('/category_event/GetMany');
      setCateList(cateResponse.data.category);

      const artistsResponse = await api.get('/artists/GetMany?page=1&limit=99999999');
      setArtistList(artistsResponse.data.artists);

      setComboList([]);

      const seatMapResponse = await api.get('/seat_map/GetMany');
      if (seatMapResponse.data.category.length > 0) {
        const seatMap = seatMapResponse.data.category[0];
        setSeatMapId(seatMap._id);
        setEventData(prev => ({
          ...prev,
          seat_map_id: seatMap._id,
          category_id: cateResponse.data.category[0]?._id || ''
        }));
      }

      setIsMounted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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
        setLogoSK(objectUrl);
        setLogoSKError(null);
        setLogoSKFile(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleOpenDialog = (ticketTypeSelected?: any) => {
    const ticketTypeInforList = [...ticketTypeInfor];
    const itemWithType = ticketTypeInforList.find(item => item.type === ticketTypeSelected);
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
    if (!contentEventData || contentEventData.length == 0) {
      setDialog({
        open: true,
        title: 'Thông báo',
        message: 'Danh sách chương trình không được để trống.',
        type: 'warning',
      });
      return;
    }

    // Validate custom_artists_text when show_artists is false
    if (eventData.show_artists === false && !eventData.custom_artists_text?.trim()) {
      setDialog({
        open: true,
        title: 'Thông báo',
        message: 'Text tùy ý là bắt buộc khi ẩn danh sách ca sỹ.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const eventDataSubmit = JSON.parse(JSON.stringify(eventData));

      if (eventDataSubmit.showsTimeData && eventDataSubmit.showsTimeData.length > 0) {
        eventDataSubmit.showsTimeData = eventDataSubmit.showsTimeData.map((item: any) => {
          const { showtimeId, ...rest } = item;
          return rest;
        });
      }

      const eventDataRaw: any = {
        ...eventDataSubmit,
        contentEventData,
        seatSelectionData: ticketTypeInfor,
      };

      let slug = eventDataRaw.title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-');
      eventDataRaw.slug = slug;
      eventDataRaw.combo_ids = [];

      const resEvent = await api.get('/events/getDetailEventBySlug?slug=' + slug)

      if (!resEvent.data._id) {
        slug = slug + "-" + Math.floor(Math.random() * 900) + 100
        eventDataRaw.slug = slug;
      }

      const event = await api.post('/events/Create', eventDataRaw);
      const eventId = event.data[0]._id;

      const formData = new FormData();
      if (logoSKFile) formData.append('files', logoSKFile);
      if (backgroundFile) formData.append('files', backgroundFile);

      await api.put(`/events/updateImages?eventId=${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDialog({
        open: true,
        title: 'Thành công',
        message: 'Tạo sự kiện thành công!',
        type: 'success',
      });

      setActiveStep(0);
      setEventData({
        title: "",
        type_event: "Offline",
        venue: "Tầng 1, 15 Lê Đại Cang, Phường Buôn Ma Thuột, Đắk Lắk, Việt Nam",
        category_id: cateList[0]?._id || '',
        desc: "",
        seat_map_id: seatMapId,
        slug: "",
        status: "ACTIVE",
        show_artists: true,
        custom_artists_text: "",
        showsTimeData: [],
        contentEventData: [],
        seatSelectionData: [],
      });
      setBackground('');
      setLogoSK('');
      setLogoSKFile(null);
      setBackgroundFile(null);
      setTickerTypeInfor([
        { price: 0, type: 'J', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
        { price: 0, type: 'Q', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
        { price: 0, type: 'K', size: 1, j_booking_start: null, q_booking_start: null, k_booking_start: null, time_end: null, data_seat: [] },
      ]);
      setContentEventData([]);

    } catch (error: any) {
      let errorMessage: string | React.ReactNode = 'Đã xảy ra lỗi không mong muốn.';

      if (error?.response?.data?.response?.message) {
        const errorMessages = error.response.data.response.message.map((message: any) => {
          if (message.includes("must be longer than or equal to 3 characters")) {
            if (message.startsWith("title")) {
              return "Tiêu đề phải có độ dài từ 3 ký tự trở lên";
            } else if (message.startsWith("desc")) {
              return "Mô tả phải có độ dài từ 3 ký tự trở lên";
            }
          }
          if (message.includes("time_end must be a string")) {
            const indexMatch = message.match(/seatSelectionData\.(\d+)\.time_end/);
            if (indexMatch && indexMatch[1]) {
              const index = indexMatch[1];
              return `Thời gian kết thúc bán vé cho loại vé thứ ${parseInt(index) + 1} phải là một chuỗi hợp lệ.`;
            }
          }
          return message;
        });
        errorMessage = errorMessages.length > 1 ? (
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((msg: string, index: number) => <li key={index}>{msg}</li>)}
          </ul>
        ) : errorMessages[0];
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setDialog({
        open: true,
        title: 'Lỗi',
        message: errorMessage,
        type: 'danger',
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto mt-4 px-4 pb-16">
        <title>Tạo sự kiện | Queen Acoustic</title>
        <meta name="description" content="Trang Tạo sự kiện tại Queen Acoustic." />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="lg:col-span-3 md:col-span-4">
            <DashboardSidebar />
          </div>

          <div className="col-span-1 lg:col-span-9 md:col-span-8">
            <div className="text-sm breadcrumbs mb-4">
              <ul className="flex text-gray-500">
                <li className="hover:text-gold-600 transition-colors">
                  <a>Dashboard</a>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <span className="text-gold-600 font-medium">Tạo sự kiện</span>
                </li>
              </ul>
            </div>

            <DashboardHeader searchEnabled={false} title="Tạo sự kiện mới" />
            
            <div className="flex-1 overflow-y-auto">
              <div className="my-4 md:my-6">
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FontAwesomeIcon 
                        icon={faSpinner} 
                        className="animate-spin text-gold-500 text-4xl" 
                      />
                      <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isMounted) return null;

  const handleCloseDialog = () => {
    setDialog({ ...dialog, open: false });
  };

  return (
    <div className="container mx-auto mt-4 px-4 pb-16">
      <title>Tạo sự kiện | Queen Acoustic</title>
      <meta name="description" content="Trang Tạo sự kiện tại Queen Acoustic." />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>

        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          <div className="text-sm breadcrumbs mb-4">
            <ul className="flex text-gray-500">
              <li className="hover:text-gold-600 transition-colors">
                <a>Dashboard</a>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <span className="text-gold-600 font-medium">Tạo sự kiện</span>
              </li>
            </ul>
          </div>

          <DashboardHeader searchEnabled={false} title="Tạo sự kiện mới" />
          
          <div className="flex-1 overflow-y-auto">
            <div className="my-4 md:my-6">
              <div className="mb-4">
                <button 
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-auto"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Quay lại Quản lý sự kiện
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 relative">
                {isSubmitting && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-lg">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gold-500 text-4xl" />
                      <p className="mt-4 text-gray-700 font-medium">Đang xử lý...</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">Tạo sự kiện mới</h1>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center relative">
                    {steps.map((step, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center z-10 relative w-1/2">
                          <div 
                            onClick={() => !isSubmitting && setActiveStep(index)}
                            className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-medium
                            transition-all duration-300 ${
                              isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                            } ${
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
                        
                        {index < steps.length - 1 && (
                          <div className="absolute top-4 md:top-6 left-0 right-0 flex justify-center">
                            <div className={`h-0.5 md:h-1 w-full mx-8 md:mx-12 rounded ${activeStep > index ? "bg-blue-500" : "bg-gray-300"}`}></div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
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
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
                  <button
                    onClick={activeStep === 0 ? handleBack : () => setActiveStep(prev => prev - 1)}
                    className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors w-full sm:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {activeStep === 0 ? 'Hủy' : 'Quay lại'}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!!logoSKError || !!backgroundError || isSubmitting}
                    className={`px-6 py-3 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors flex items-center justify-center w-full sm:w-auto ${(!!logoSKError || !!backgroundError || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        <span className="flex-1 text-center">Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-center">
                          {activeStep === steps.length - 1 ? 'Hoàn tất' : 'Tiếp tục'}
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

      <StandardDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        title={dialog.title}
        variant={dialog.type}
        maxWidth="sm"
        actions={
          <Button onClick={handleCloseDialog} variant="outline">
            Đóng
          </Button>
        }
      >
        <div className="text-sm text-gray-700">{dialog.message}</div>
      </StandardDialog>
    </div>
  );
}
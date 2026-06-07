"use client";
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faChair,
  faClock,
  faMicrophone,
  faPen,
  faPlus,
  faTrash,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { formatDateTime, formatDateTime2, formatDateTime3 } from '@/utils/date';

interface CreateTypeTicketProps {
  onClose: () => void;
  eventData: any;
  setEventData: (data: any) => void;
  ticketTypeSelected: any;
  ticketTypeInfor: any[];
  setTickerTypeInfor: (data: any[]) => void;
  artistList: any[];
  handleSaveArtis: (artistId: any, desc: any, time: any) => void;
  contentEventData: any[];
  handleDeleteArtis: (id: any) => void;
  handleOpenDialog: (type: any) => void;
}

export default function CreateTypeTicket({
  onClose,
  eventData,
  setEventData,
  ticketTypeSelected,
  ticketTypeInfor,
  setTickerTypeInfor,
  artistList,
  handleSaveArtis,
  contentEventData,
  handleDeleteArtis,
  handleOpenDialog
}: CreateTypeTicketProps) {
  const [openChooseArtis, setOpenChooseArtis] = useState(false);
  const [openChooseTypeArtis, setOpenChooseTypeArtis] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("");

  const [ticketData, setTicketData] = useState({
    JBookingStart: "",
    QBookingStart: "",
    KBookingStart: "",
  });

  const [modalArtisChoose, setModalArtisChoose] = useState<any>(null);
  const [modalArtisDesc, setModalArtisDesc] = useState<any>("thông tin ca sĩ");
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  const handleTicketChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketData({ ...ticketData, [field]: e.target.value });
  };

  const handleSaveTicket = () => {
    const newTicketTypeInfor = [...ticketTypeInfor];
    const item = newTicketTypeInfor.find((item: any) => item.type === ticketTypeSelected.type);

    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      alert('Vui lòng chọn thời gian sự kiện trước');
      return;
    }

    // Lấy ngày kết thúc sự kiện
    const eventEndDate = new Date(eventData.showsTimeData[0].time_end);

    if (item) {
      // GIỮ NGUYÊN seatSectionId nếu đã có
      // KHÔNG ghi đè data_seat nếu đã có seatSectionId
      if (!item.seatSectionId) {
        // Chỉ tạo danh sách ghế khi là bản ghi mới
        switch (ticketTypeSelected.type) {
          case 'J':
            item.data_seat = Array.from({ length: 114 }, (_, i) => ({
              name: `J.${i + 1}`,
              id: `J.${i + 1}`,
              cukcuk_id: `J.${i + 1}`,
            }));
            break;
          case 'Q':
            item.data_seat = Array.from({ length: 40 }, (_, i) => ({
              name: `Q.${i + 1}`,
              id: `Q.${i + 1}`,
              cukcuk_id: `Q.${i + 1}`,
            }));
            break;
          case 'K':
            item.data_seat = Array.from({ length: 30 }, (_, i) => ({
              name: `K.${i + 1}`,
              id: `K.${i + 1}`,
              cukcuk_id: `K.${i + 1}`,
            }));
            break;
          default:
            break;
        }
      }

      // Lưu thời gian booking
      switch (item.type) {
        case 'J':
          item.j_booking_start = new Date(ticketData.JBookingStart).toISOString();
          break;
        case 'Q':
          item.q_booking_start = new Date(ticketData.QBookingStart).toISOString();
          break;
        case 'K':
          item.k_booking_start = new Date(ticketData.KBookingStart).toISOString();
          break;
      }

      // Thời gian kết thúc bán chỗ trùng với ngày kết thúc sự kiện
      item.time_end = eventEndDate.toISOString();

      setTickerTypeInfor(newTicketTypeInfor);
    }

    // Đóng dialog và reset
    setOpenChooseTypeArtis(false);
    onClose();
    setTicketData({
      JBookingStart: "",
      QBookingStart: "",
      KBookingStart: "",
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value + ':00.000Z';
    const endTime = startTime.split('T')[0] + ":23:00:000Z"

    // Giữ lại showtimeId từ dữ liệu hiện có
    const existingShowtimeId = eventData.showsTimeData &&
      eventData.showsTimeData.length > 0 &&
      eventData.showsTimeData[0].showtimeId;

    setEventData({
      ...eventData,
      showsTimeData: [{
        showtimeId: existingShowtimeId, // Giữ lại ID nếu có
        time_start: startTime,
        time_end: endTime,
      }],
    });
  };

  const handleSaveArtisModal = () => {
    // Validation cho việc thêm nghệ sĩ
    if (!modalArtisChoose) {
      alert('Vui lòng chọn ca sĩ');
      return;
    }

    // Nếu chưa có thời gian sự kiện
    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      alert('Vui lòng chọn thời gian sự kiện trước');
      return;
    }

    // Sử dụng thời gian kết thúc sự kiện làm thời gian biểu diễn
    const eventEndTime = new Date(eventData.showsTimeData[0].time_end);

    handleSaveArtis(modalArtisChoose, modalArtisDesc, eventEndTime.toISOString());

    // Reset modal
    setOpenChooseArtis(false);
    setModalArtisChoose(null);
    setModalArtisDesc("thông tin ca sĩ");
  };

  const initiateDeleteArtist = (id: string) => {
    setConfirmDelete({ show: true, id });
  };
  
  const confirmDeleteArtist = () => {
    if (confirmDelete.id) {
      handleDeleteArtis(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Event Time Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h3 className="text-gray-800 text-lg font-bold mb-4 flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gold-500" />
          Lịch sự kiện
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <span className="text-red-500 mr-1">*</span> 
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              Ngày & giờ bắt đầu
            </label>
            <input
              type="datetime-local"
              value={eventData.showsTimeData && eventData.showsTimeData.length > 0
                ? new Date(eventData.showsTimeData[0].time_start).toISOString().slice(0, 16)
                : ""}
              onChange={handleTimeChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gold-300 focus:border-gold-500 transition-all"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Giờ kết thúc sẽ tự động được thiết lập là 23:00 cùng ngày.
            </p>
          </div>
        </div>

        {/* Program List Section */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800 text-lg font-bold flex items-center">
              <FontAwesomeIcon icon={faMicrophone} className="mr-2 text-gold-500" />
              Danh sách chương trình
            </h3>
            <button
              onClick={() => setOpenChooseArtis(true)}
              className="flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
              disabled={!eventData.showsTimeData || eventData.showsTimeData.length === 0}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Thêm nghệ sĩ
            </button>
          </div>

          {/* Artist Table */}
          {contentEventData.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian biểu diễn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nghệ sĩ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contentEventData.map((content, index) => {
                    const artist = artistList.find((item) => item._id === content.artist_id);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDateTime2(content.time)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-800">
                              {artist ? artist.name : "Nghệ sĩ không xác định"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => initiateDeleteArtist(content.artist_id)}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <FontAwesomeIcon icon={faMicrophone} className="text-3xl text-gray-300 mb-2" />
              <p className="text-gray-500">Chưa có nghệ sĩ nào được thêm. Nhấn nút Thêm nghệ sĩ để thêm người biểu diễn.</p>
            </div>
          )}
        </div>

        {/* Seat Types Section */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-gray-800 text-lg font-bold mb-6 flex items-center">
            <FontAwesomeIcon icon={faChair} className="mr-2 text-gold-500" />
            Loại ghế
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ticketTypeInfor.map((ticket, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h4 className="text-lg font-bold text-gold-600">
                    Loại {ticket.type}
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bắt đầu đặt chỗ:</span>
                    <span className="font-medium text-gray-800">
                      {ticket.j_booking_start || ticket.q_booking_start || ticket.k_booking_start 
                        ? formatDateTime(ticket.j_booking_start || ticket.q_booking_start || ticket.k_booking_start) 
                        : 'Chưa thiết lập'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Kết thúc đặt chỗ:</span>
                    <span className="font-medium text-gray-800">
                      {ticket.time_end 
                        ? formatDateTime3(ticket.time_end) 
                        : 'Chưa thiết lập'}
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setOpenChooseTypeArtis(true);
                        handleOpenDialog(ticket.type);
                      }}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faPen} className="mr-2" />
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Artist Modal */}
      {openChooseArtis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true"></div>
            
            {/* Modal content */}
            <div className="z-50 w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Thêm nghệ sĩ mới</h3>
                <button
                  onClick={() => setOpenChooseArtis(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <span className="text-red-500">*</span> Chọn nghệ sĩ
                  </label>
                  <div className="relative">
                    <select
                      value={modalArtisChoose || ""}
                      onChange={(e) => setModalArtisChoose(e.target.value)}
                      className="block w-full px-4 py-3 pr-10 text-base border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="">Chọn một nghệ sĩ</option>
                      {artistList.map((artist) => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSaveArtisModal}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-gold-600 border border-transparent rounded-md hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                >
                  Thêm vào chương trình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seat Type Modal */}
      {openChooseTypeArtis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true"></div>
            
            {/* Modal content */}
            <div className="z-50 w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Chỉnh sửa loại ghế {ticketTypeSelected?.type}
                </h3>
                <button
                  onClick={() => setOpenChooseTypeArtis(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>
              
              {/* Validation check */}
              {!eventData.showsTimeData || eventData.showsTimeData.length === 0 ? (
                <div className="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
                  Vui lòng thiết lập thời gian sự kiện trước khi cấu hình loại ghế.
                </div>
              ) : (
                <div className="mt-2">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> Ngày bắt đầu đặt chỗ cho loại {ticketTypeSelected?.type}
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        ticketTypeSelected?.type === 'J' ? ticketData.JBookingStart :
                          ticketTypeSelected?.type === 'Q' ? ticketData.QBookingStart :
                            ticketData.KBookingStart
                      }
                      onChange={handleTicketChange(
                        ticketTypeSelected?.type === 'J' ? 'JBookingStart' :
                          ticketTypeSelected?.type === 'Q' ? 'QBookingStart' :
                            'KBookingStart'
                      )}
                      className="block w-full px-4 py-3 border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Lưu ý: Thời gian kết thúc đặt chỗ sẽ tự động được thiết lập là ngày kết thúc sự kiện.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleSaveTicket}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-gold-600 border border-transparent rounded-md hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Artist Deletion */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true"></div>
            
            {/* Modal content */}
            <div className="z-50 w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Xác nhận xóa</h3>
                <button
                  onClick={() => setConfirmDelete({ show: false, id: null })}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa nghệ sĩ này khỏi chương trình? Hành động này không thể hoàn tác.
                </p>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ show: false, id: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteArtist}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
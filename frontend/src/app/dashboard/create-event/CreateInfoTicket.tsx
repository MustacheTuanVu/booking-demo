"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { getMediaUrl } from '@/utils/mediaUrl';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faImage, faPlus, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">Đang tải trình soạn thảo...</div>
});

interface CreateInfoTicketProps {
  logo_sk: string | null;
  background: string | null;
  logoSKError: string | null;
  backgroundError: string | null;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo_sk' | 'background'
  ) => void;
  eventData: any;
  setEventData: (data: any) => void;
  cateList: any[];
  comboList: any[];
}

interface ValidationError {
  show_artists?: string;
  custom_artists_text?: string;
}

export default function CreateInfoTicket({
  logo_sk,
  background,
  logoSKError,
  backgroundError,
  handleImageUpload,
  eventData,
  setEventData,
  cateList,
  comboList,
}: CreateInfoTicketProps) {
  const [selectedCombos, setSelectedCombos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEventData({ ...eventData, [field]: e.target.value });
  };

  const handleComboToggle = (comboId: string) => {
    setSelectedCombos(prev =>
      prev.includes(comboId)
        ? prev.filter(id => id !== comboId)
        : [...prev, comboId]
    );
    setEventData({ ...eventData, combo_ids: selectedCombos });
  };

  const handleSelectCategory = (categoryId: string) => {
    setEventData({ ...eventData, category_id: categoryId });
  };

  const handleShowArtistsChange = (checked: boolean) => {
    const newData = { ...eventData, show_artists: checked };
    
    // Clear custom text validation error if showing artists
    if (checked) {
      setValidationErrors(prev => ({ ...prev, custom_artists_text: undefined }));
      newData.custom_artists_text = '';
    }
    
    setEventData(newData);
  };

  const handleCustomArtistsTextChange = (text: string) => {
    setEventData({ ...eventData, custom_artists_text: text });
    
    // Clear validation error when user types
    if (text.trim()) {
      setValidationErrors(prev => ({ ...prev, custom_artists_text: undefined }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const event = { 
        target: { 
          files: [file] 
        } 
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(event, 'background');
    }
  };

  const defaultLogo = "/images/image.jpg";
  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Upload image section */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
        <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center">
          <FontAwesomeIcon icon={faImage} className="mr-2 text-gold-500" />
          <span className="text-red-500 mr-1">*</span> 
          Tải ảnh lên
        </h3>

        <div className="mb-4 md:mb-6">
          <div 
            className={`relative h-48 sm:h-64 md:h-80 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gold-400 hover:bg-gray-50"}`}
            onClick={() => document.getElementById('background-input')?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="background-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'background')}
              className="hidden"
            />
            
            {background ? (
              <>
                <Image 
                  src={getMediaUrl(background)}
                  alt="Ảnh nền sự kiện" 
                  layout="fill" 
                  objectFit="cover" 
                  className="transition-opacity hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 rounded-full p-3">
                    <FontAwesomeIcon icon={faUpload} className="text-lg text-gray-800" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUpload} className="text-4xl md:text-5xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-center text-sm md:text-base px-4">
                  <span className="font-medium">Nhấp để tải lên</span> hoặc kéo thả<br />
                  Ảnh nền sự kiện (1280x720)
                </p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG hoặc JPEG</p>
              </>
            )}
          </div>
        </div>

        {/* Error message - Improved for responsiveness */}
        {(logoSKError || backgroundError) && (
          <div className="mt-4 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-medium text-sm md:text-base">Lỗi tải lên</p>
              <p className="text-sm">{logoSKError || backgroundError}</p>
            </div>
          </div>
        )}

        {/* Event name input - Improved for touch */}
        <div className="mt-4 md:mt-6">
          <label htmlFor="event-title" className="block text-gray-800 font-semibold mb-2 text-sm md:text-base">
            <span className="text-red-500 mr-1">*</span>
            Tên sự kiện
          </label>
          <input
            id="event-title"
            type="text"
            placeholder="Nhập tên sự kiện"
            value={eventData.title}
            onChange={handleInputChange('title')}
            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gold-300 focus:border-gold-500 transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Event category section */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
        <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4">
          <span className="text-red-500 mr-1">*</span>
          Thể loại sự kiện
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {cateList.map((cate) => (
            <div
              key={cate._id}
              onClick={() => handleSelectCategory(cate._id)}
              className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all flex items-center justify-between
                ${eventData.category_id === cate._id
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gold-400 hover:shadow-sm'
                }`}
            >
              <span className="font-medium text-sm md:text-base">{cate.name}</span>
              {eventData.category_id === cate._id && (
                <FontAwesomeIcon icon={faCheck} className="ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event information section - Improved text editor container */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
        <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4">
          <span className="text-red-500 mr-1">*</span>
          Thông tin sự kiện
        </h3>
        <div className="border rounded-md overflow-hidden">
          <JoditEditor
            value={eventData.desc}
            onBlur={(newContent) => {
              setEventData({ ...eventData, desc: newContent });
            }}
            config={{
              readonly: false,
              toolbarAdaptive: true,
              toolbarSticky: true,
              height: 300,
              style: {
                color: "#333",
              },
              minHeight: 200,
              maxHeight: 500,
            }}
          />
        </div>
      </div>

      {/* Venue section */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
        <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4">
          <span className="text-red-500 mr-1">*</span>
          Địa điểm
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập địa điểm sự kiện"
            value={eventData.venue}
            onChange={handleInputChange('venue')}
            className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed text-sm md:text-base pr-20"
            disabled={true}
          />
          <div className="absolute right-3 top-3">
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Cố định</span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-2">
          Địa điểm này được cố định và không thể thay đổi.
        </p>
      </div>

      {/* Display Artists section */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
        <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4">
          Hiển thị danh sách ca sỹ
        </h3>
        
        {/* Checkbox */}
        <div className="mb-4">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={eventData.show_artists !== false}
              onChange={(e) => handleShowArtistsChange(e.target.checked)}
              className="w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500 focus:ring-2 cursor-pointer"
            />
            <span className="ml-3 text-sm md:text-base text-gray-700 group-hover:text-gray-900">
              Hiển thị danh sách ca sỹ trên slide
            </span>
          </label>
          <p className="text-xs md:text-sm text-gray-500 mt-2 ml-8">
            Khi bật, danh sách ca sỹ sẽ được hiển thị tự động từ chương trình biểu diễn.
          </p>
        </div>

        {/* Custom text input (shown when checkbox is unchecked) */}
        {eventData.show_artists === false && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <label htmlFor="custom-artists-text" className="block text-gray-800 font-semibold mb-2 text-sm md:text-base">
              <span className="text-red-500 mr-1">*</span>
              Text tùy ý thay thế danh sách ca sỹ
            </label>
            <input
              id="custom-artists-text"
              type="text"
              placeholder="VD: Nhiều ca sỹ nổi tiếng, Guest artists, ..."
              value={eventData.custom_artists_text || ''}
              onChange={(e) => handleCustomArtistsTextChange(e.target.value)}
              maxLength={200}
              className={`w-full p-3 rounded-md border transition-all text-sm md:text-base ${
                validationErrors.custom_artists_text
                  ? 'border-red-500 focus:ring-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:ring-gold-300 focus:border-gold-500'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-600">
                Text này sẽ hiển thị thay cho danh sách ca sỹ trên slide sự kiện.
              </p>
              <p className="text-xs text-gray-500">
                {eventData.custom_artists_text?.length || 0}/200
              </p>
            </div>
            {validationErrors.custom_artists_text && (
              <p className="text-xs text-red-600 mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.custom_artists_text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

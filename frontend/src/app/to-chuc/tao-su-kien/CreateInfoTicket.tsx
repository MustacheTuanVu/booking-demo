"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faImage, faPlus, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { getMediaUrl } from '@/utils/mediaUrl';

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
  handleCloseError: () => void;
  openError: boolean;
  eventData: any;
  setEventData: (data: any) => void;
  cateList: any[];
  comboList: any[];
}

export default function CreateInfoTicket({
  logo_sk,
  background,
  logoSKError,
  backgroundError,
  handleImageUpload,
  handleCloseError,
  openError,
  eventData,
  setEventData,
  cateList,
  comboList,
}: CreateInfoTicketProps) {
  const [selectedCombos, setSelectedCombos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="space-y-8">
      {/* Upload image section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h3 className="text-gray-800 text-lg font-bold mb-4 flex items-center">
          <FontAwesomeIcon icon={faImage} className="mr-2 text-gold-500" />
          <span className="text-red-500 mr-1">*</span> 
          Tải ảnh lên
        </h3>

        <div className="mb-6">
          <div 
            className={`relative h-80 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
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
                <FontAwesomeIcon icon={faUpload} className="text-5xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  <span className="font-medium">Nhấp để tải lên</span> hoặc kéo thả<br />
                  Ảnh nền sự kiện (1280x720)
                </p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG hoặc JPEG</p>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {(logoSKError || backgroundError) && openError && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center justify-between">
            <div>
              <p className="font-medium">Lỗi tải lên</p>
              <p>{logoSKError || backgroundError}</p>
            </div>
            <button 
              onClick={handleCloseError} 
              className="text-red-700 hover:text-red-800"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Event name input */}
        <div className="mt-6">
          <label htmlFor="event-title" className="block text-gray-800 font-semibold mb-2">
            <span className="text-red-500 mr-1">*</span>
            Tên sự kiện
          </label>
          <input
            id="event-title"
            type="text"
            placeholder="Nhập tên sự kiện"
            value={eventData.title}
            onChange={handleInputChange('title')}
            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gold-300 focus:border-gold-500 transition-all"
          />
        </div>
      </div>

      {/* Event category section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h3 className="text-gray-800 text-lg font-bold mb-4">
          <span className="text-red-500 mr-1">*</span>
          Thể loại sự kiện
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cateList.map((cate) => (
            <div
              key={cate._id}
              onClick={() => handleSelectCategory(cate._id)}
              className={`p-4 rounded-lg cursor-pointer transition-all flex items-center justify-between
                ${eventData.category_id === cate._id
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gold-400 hover:shadow-sm'
                }`}
            >
              <span className="font-medium">{cate.name}</span>
              {eventData.category_id === cate._id && (
                <FontAwesomeIcon icon={faCheck} className="ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event information section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h3 className="text-gray-800 text-lg font-bold mb-4">
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
              toolbarAdaptive: false,
              toolbarSticky: true,
              height: 400,
              style: {
                color: "#333",
              },
            }}
          />
        </div>
      </div>

      {/* Venue section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h3 className="text-gray-800 text-lg font-bold mb-4">
          <span className="text-red-500 mr-1">*</span>
          Địa điểm
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập địa điểm sự kiện"
            value={eventData.venue}
            onChange={handleInputChange('venue')}
            className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
            disabled={true}
          />
          <div className="absolute right-3 top-3">
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Cố định</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Địa điểm này được cố định và không thể thay đổi.
        </p>
      </div>
    </div>
  );
}

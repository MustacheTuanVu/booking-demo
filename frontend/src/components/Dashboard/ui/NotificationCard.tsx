'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faExternalLinkAlt, faEnvelope, faPhone, faTicketAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationCardProps {
  id: number;
  content: {
    phone: string;
    email: string;
    orderId: string;
    code?: string;
    status?: boolean;
  };
  onDelete: (id: number) => void;
  onClick: (orderId: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  content,
  onDelete,
  onClick,
}) => {
  // Format the timestamp (id is a timestamp in milliseconds)
  const formattedTime = formatDistanceToNow(new Date(id), { 
    addSuffix: true,
    locale: vi 
  });
  
  // Format the exact time
  const exactTime = new Date(id).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = () => {
    if (content?.orderId) {
      onClick(content.orderId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md group"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={`Thông báo từ khách hàng ${content.phone}`}
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-gold-50 to-gold-100 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center mr-3 border border-gold-200">
            <FontAwesomeIcon icon={faTicketAlt} className="text-gold-500" />
          </div>
          <h3 className="font-medium text-gray-800">Đặt chỗ mới</h3>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <FontAwesomeIcon icon={faClock} className="mr-1.5" />
          <span title={exactTime}>{formattedTime}</span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0 text-gray-400">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Số điện thoại</div>
              <div className="text-sm font-medium text-gray-800">{content.phone}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0 text-gray-400">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Email</div>
              <div className="text-sm font-medium text-gray-800 break-all">{content.email}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0 text-gray-400">
              <FontAwesomeIcon icon={faTicketAlt} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Mã đặt chỗ</div>
              <div className="text-sm font-medium text-gray-800">{content.code || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={handleClick}
          className="text-sm text-gold-600 hover:text-gold-700 flex items-center transition-colors"
        >
          <span>Xem chi tiết</span>
          <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1.5 text-xs" />
        </button>
        
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:text-red-600 flex items-center transition-colors"
          aria-label="Xóa thông báo"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;

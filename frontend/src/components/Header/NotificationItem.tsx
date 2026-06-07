'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCircle } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  id: number;
  content: {
    phone: string;
    orderId: string;
    status?: boolean;
    email?: string;
    code?: string;
  };
  isRead?: boolean;
  onRemove: (id: number) => void;
  onClick: (orderId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  content,
  isRead = false,
  onRemove,
  onClick,
}) => {
  // Format the timestamp (id is a timestamp in milliseconds)
  const formattedTime = formatDistanceToNow(new Date(id), { 
    addSuffix: true,
    locale: vi 
  });

  const handleClick = () => {
    if (content?.orderId) {
      onClick(content.orderId);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <div 
      className={`
        mb-3 p-3 rounded-lg transition-all cursor-pointer
        ${isRead 
          ? 'bg-gray-50 hover:bg-gray-100' 
          : 'bg-gold-50 hover:bg-gold-100 border-l-2 border-gold-500'
        }
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Thông báo từ khách hàng ${content.phone}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-2">
          <div className="flex items-center mb-1">
            {!isRead && (
              <FontAwesomeIcon 
                icon={faCircle} 
                className="text-gold-500 mr-1.5" 
                style={{ fontSize: '0.5rem' }} 
              />
            )}
            <span className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              Khách hàng đã đặt chỗ
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            SĐT: {content.phone}
          </p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>{formattedTime}</span>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-gold-600 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Xóa thông báo"
        >
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: '0.875rem' }} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;

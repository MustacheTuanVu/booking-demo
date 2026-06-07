'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

interface EmptyNotificationProps {
  message?: string;
}

const EmptyNotification: React.FC<EmptyNotificationProps> = ({
  message = 'Không có thông báo mới',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <FontAwesomeIcon 
          icon={faBell} 
          className="text-gray-400" 
          style={{ fontSize: '1.25rem' }} 
        />
      </div>
      <p className="text-sm text-gray-500 text-center">{message}</p>
    </div>
  );
};

export default EmptyNotification;

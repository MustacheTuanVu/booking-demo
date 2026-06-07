"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faPlus } from "@fortawesome/free-solid-svg-icons";

export interface EmptyStateProps {
  /**
   * Title text to display
   * @default "Không có dữ liệu"
   */
  title?: string;
  
  /**
   * Subtitle text to display
   */
  subtitle?: string;
  
  /**
   * Alternative subtitle to show when searching
   */
  searchSubtitle?: string;
  
  /**
   * Current search query string - used to determine which subtitle to show
   */
  searchQuery?: string;
  
  /**
   * Handler for the primary action button
   */
  onActionClick?: () => void;
  
  /**
   * Primary action button text
   * @default "Thêm mới"
   */
  actionButtonText?: string;
  
  /**
   * Custom icon component to display
   * @default faPlus
   */
  icon?: IconDefinition;
  
  /**
   * Minimum height for the empty state container
   * @default "300px"
   */
  minHeight?: string;
  
  /**
   * Custom component to use instead of icon
   */
  iconComponent?: React.ReactNode;
  
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * A reusable empty state component to display when a list or table has no items.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Không có dữ liệu",
  subtitle,
  searchSubtitle = "Thử tìm kiếm với từ khóa khác hoặc thêm mới",
  searchQuery = "",
  onActionClick,
  actionButtonText = "Thêm mới",
  icon = faPlus,
  minHeight = "300px",
  iconComponent,
  className = "",
}) => {
  const displaySubtitle = searchQuery 
    ? searchSubtitle 
    : subtitle || "Thêm dữ liệu mới để bắt đầu";
  
  return (
    <div 
      className={`flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${className}`}
      style={{ minHeight }}
    >
      {iconComponent ? (
        iconComponent
      ) : (
        <div className="w-16 h-16 text-gray-200 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="h-8 w-8" />
        </div>
      )}
      
      <p className="text-xl font-medium mb-2 text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        {displaySubtitle}
      </p>
      
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-6 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center font-medium"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-3.5 w-3.5" />
          {actionButtonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
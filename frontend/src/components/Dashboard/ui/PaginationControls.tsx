"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faAnglesLeft, faAnglesRight, 
  faChevronLeft, faChevronRight 
} from "@fortawesome/free-solid-svg-icons";

export interface PaginationControlsProps {
  /**
   * Current page index (0-based)
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Function to handle page changes
   */
  onPageChange: (newPage: number) => void;
  
  /**
   * Function to handle page size changes
   */
  onLimitChange?: (newLimit: number) => void;
  
  /**
   * Options for rows per page selector
   * @default [5, 10, 20, 50]
   */
  rowsPerPageOptions?: number[];
  
  /**
   * Determines if there's more data available (used for infinite scroll or "load more" patterns)
   */
  hasMore?: boolean;
  
  /**
   * Number of page numbers to show around the current page
   * @default 2
   */
  pagesToShow?: number;
  
  /**
   * Class name for the pagination container
   */
  className?: string;
}

/**
 * A reusable pagination controls component with page numbers and rows per page selector.
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [5, 10, 20, 50],
  hasMore = undefined,
  pagesToShow = 2,
  className = "",
}) => {
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = page + 1; // Convert to 1-based for display
  
  // Calculate page range to display
  let startPage = Math.max(1, currentPage - pagesToShow);
  let endPage = Math.min(totalPages, currentPage + pagesToShow);
  
  // Adjust page range when current page is near boundaries
  if (currentPage <= pagesToShow + 1) {
    endPage = Math.min(totalPages, pagesToShow * 2 + 1);
  }
  if (currentPage >= totalPages - pagesToShow) {
    startPage = Math.max(1, totalPages - pagesToShow * 2);
  }
  
  // Generate array of page numbers to display
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  // Use hasMore if provided, otherwise calculate from total
  const isLastPage = hasMore !== undefined 
    ? !hasMore 
    : page >= totalPages - 1;
  
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 gap-4 ${className}`}>
      <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        Hiển thị <span className="font-semibold text-gold-600">{Math.min(limit, total - page * limit)}</span> trên <span className="font-semibold text-gold-600">{total}</span> mục
      </div>
      
      <div className="flex items-center">
        <nav className="flex items-center space-x-1.5" aria-label="Pagination">
          {/* First page */}
          <button
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Trang đầu"
          >
            <FontAwesomeIcon icon={faAnglesLeft} className="h-3.5 w-3.5" />
          </button>
          
          {/* Previous page */}
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Trang trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
          </button>
          
          {/* First page and ellipsis */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(0)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 transition-all"
                aria-label={`Trang 1`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-gray-400 select-none">…</span>
              )}
            </>
          )}
          
          {/* Page numbers */}
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num - 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all focus:outline-none font-medium text-sm ${
                num === currentPage
                  ? 'bg-gold-500 text-white border-gold-500 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400'
              }`}
              aria-current={num === currentPage ? 'page' : undefined}
              aria-label={`Trang ${num}`}
            >
              {num}
            </button>
          ))}
          
          {/* Last page and ellipsis */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-400 select-none">…</span>
              )}
              <button
                onClick={() => onPageChange(totalPages - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 transition-all"
                aria-label={`Trang ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
          
          {/* Next page */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Trang sau"
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
          </button>
          
          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={isLastPage}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gold-600 hover:border-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Trang cuối"
          >
            <FontAwesomeIcon icon={faAnglesRight} className="h-3.5 w-3.5" />
          </button>
        </nav>
        
        {/* Rows per page selector */}
        {onLimitChange && (
          <div className="hidden sm:flex items-center ml-4">
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(0); // Reset to first page when changing limit
              }}
              className="ml-2 text-sm border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all appearance-none pr-8"
              aria-label="Số hàng mỗi trang"
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option} hàng
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginationControls;
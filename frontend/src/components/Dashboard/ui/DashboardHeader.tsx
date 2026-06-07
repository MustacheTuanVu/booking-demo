"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

export interface DashboardHeaderProps {
  /**
   * The main title to display in the header
   */
  title: string;

  /**
   * Whether to include search functionality
   * @default true
   */
  searchEnabled?: boolean;

  /**
   * Whether the search bar is currently visible
   */
  showSearch?: boolean;

  /**
   * The current search query value
   */
  searchQuery?: string;

  /**
   * Handler for toggling search visibility
   */
  onSearchToggle?: () => void;

  /**
   * Handler for search input changes
   */
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Handler for clearing search and hiding input
   */
  onSearchClear?: () => void;

  /**
   * Handler for search submission (when Enter key is pressed)
   */
  onSearchSubmit?: () => void;

  /**
   * Whether to include the "Add" button
   * @default true
   */
  addEnabled?: boolean;

  /**
   * Handler for the add button click
   */
  onAddClick?: () => void;

  /**
   * Label for the add button
   * @default "Thêm Mới"
   */
  addButtonLabel?: string;

  /**
   * Text to display below the header when searching
   */
  searchResultText?: string;

  /**
   * Icon to display for the add button
   * @default faPlus
   */
  addIcon?: typeof faPlus;

  /**
   * Whether to include the filter button
   * @default false
   */
  filterEnabled?: boolean;

  /**
   * Handler for the filter button click
   */
  onFilterClick?: () => void;

  /**
   * Icon to display for the filter button
   */
  filterIcon?: any;

  /**
   * Additional class names to apply to the header
   */
  className?: string;

  /**
   * Extra buttons to display in the header
   */
  extraButtons?: React.ReactNode;
}

/**
 * A reusable header component for dashboard pages with title, search, and action button.
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  searchEnabled = true,
  showSearch = false,
  searchQuery = "",
  onSearchToggle,
  onSearchChange,
  onSearchClear,
  onSearchSubmit,
  addEnabled = true,
  onAddClick,
  addButtonLabel = "Thêm Mới",
  searchResultText,
  addIcon = faPlus,
  filterEnabled = false,
  onFilterClick,
  filterIcon,
  className = "",
  extraButtons,
}) => {
  // Internal state if no external state is provided
  const [internalShowSearch, setInternalShowSearch] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");

  // Use either provided handlers or internal state handlers
  const handleSearchToggle = onSearchToggle || (() => setInternalShowSearch(prev => !prev));
  const handleSearchChange = onSearchChange || ((e: React.ChangeEvent<HTMLInputElement>) => setInternalSearchQuery(e.target.value));
  const handleSearchClear = onSearchClear || (() => {
    setInternalShowSearch(false);
    setInternalSearchQuery("");
  });
  const handleSearchSubmit = onSearchSubmit || (() => {
    console.log("Search submitted:", currentSearchQuery);
  });

  // Use either provided state or internal state
  const isSearchVisible = onSearchToggle ? showSearch : internalShowSearch;
  const currentSearchQuery = onSearchChange ? searchQuery : internalSearchQuery;

  return (
    <div className={`bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg shadow-md p-4 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-white mb-3 md:mb-0">{title}</h1>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {searchEnabled && (
            <>
              {isSearchVisible ? (
                <div className="relative flex-grow md:w-64 mr-2 animate-fadeIn">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full bg-white focus:ring-2 focus:ring-gold-200 focus:border-transparent transition-all text-sm"
                    value={currentSearchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSearchClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="bg-white text-gold-600 hover:bg-gray-100 p-2 rounded-full shadow-md transition-all duration-300 ease-in-out"
                  aria-label="Toggle search"
                >
                  <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {addEnabled && onAddClick && (
            <button
              onClick={onAddClick}
              className="bg-white text-gold-600 hover:bg-gray-100 px-4 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center whitespace-nowrap"
            >
              <FontAwesomeIcon icon={addIcon} className="mr-2" />
              {addButtonLabel}
            </button>
          )}

          {filterEnabled && onFilterClick && (
            <button
              onClick={onFilterClick}
              className="bg-white text-gold-600 hover:bg-gray-100 p-2 rounded-full shadow-md transition-all duration-300 ease-in-out"
              aria-label="Filter"
            >
              <FontAwesomeIcon icon={filterIcon} className="h-5 w-5" />
            </button>
          )}

          {extraButtons}
        </div>
      </div>

      {searchResultText && currentSearchQuery && (
        <div className="text-xs text-white mt-2 md:text-right">
          {searchResultText}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
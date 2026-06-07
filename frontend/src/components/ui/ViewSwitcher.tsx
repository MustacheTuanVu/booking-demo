"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable, faGrip } from "@fortawesome/free-solid-svg-icons";

export type ViewMode = "table" | "card";

interface ViewSwitcherProps {
  /**
   * Current view mode
   */
  value: ViewMode;
  
  /**
   * Callback for when view mode changes
   */
  onChange: (mode: ViewMode) => void;
  
  /**
   * Class to apply to the component
   */
  className?: string;

  /**
   * Whether the switcher is disabled
   */
  disabled?: boolean;
}

/**
 * A toggle component for switching between table and card views
 */
const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  value = "table",
  onChange,
  className = "",
  disabled = false
}) => {
  // Read preference from localStorage on mount
  useEffect(() => {
    // Only load preference if not disabled
    if (disabled) return;
    
    const savedPreference = localStorage.getItem("viewMode") as ViewMode | null;
    if (savedPreference && (savedPreference === "table" || savedPreference === "card")) {
      onChange(savedPreference);
    }
  }, [onChange, disabled]);

  // Save preference to localStorage when changed
  const handleChange = (newMode: ViewMode) => {
    if (disabled) return;
    localStorage.setItem("viewMode", newMode);
    onChange(newMode);
  };

  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group" aria-label="View Switcher">
      <button
        type="button"
        onClick={() => handleChange("table")}
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
          ${value === "table" 
            ? "bg-gold-600 text-white border-gold-700" 
            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
          } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gold-300`}
        aria-pressed={value === "table"}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faTable} className="mr-2" />
        Bảng
      </button>
      <button
        type="button"
        onClick={() => handleChange("card")}
        className={`px-4 py-2 text-sm font-medium rounded-r-lg border 
          ${value === "card" 
            ? "bg-gold-600 text-white border-gold-700" 
            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
          } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gold-300`}
        aria-pressed={value === "card"}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faGrip} className="mr-2" />
        Thẻ
      </button>
    </div>
  );
};

export default ViewSwitcher;
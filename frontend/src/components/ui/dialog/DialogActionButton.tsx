"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DialogActionButtonProps {
  /**
   * Handler for the button click
   */
  onClick: () => void;
  
  /**
   * Button content
   */
  children: React.ReactNode;
  
  /**
   * Button visual style variant
   */
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "outline";
  
  /**
   * Button size
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the button should fill available width
   */
  fullWidth?: boolean;
  
  /**
   * Whether to show a loading spinner
   */
  isLoading?: boolean;
  
  /**
   * Button type
   */
  type?: "button" | "submit" | "reset";
  
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * A standardized action button for dialog footers
 */
const DialogActionButton: React.FC<DialogActionButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  isLoading = false,
  type = "button",
  className,
}) => {
  // Map variants to colors
  const variantClasses = {
    primary: "bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-white focus:ring-gold-300 shadow-sm hover:shadow",
    secondary: "bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-600 hover:to-gray-500 text-white focus:ring-gray-300 shadow-sm hover:shadow",
    danger: "bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white focus:ring-red-300 shadow-sm hover:shadow",
    success: "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white focus:ring-green-300 shadow-sm hover:shadow",
    warning: "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white focus:ring-amber-300 shadow-sm hover:shadow",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gold-300 transition-all duration-200",
  };

  // Map sizes to padding and font sizes
  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-2.5 px-5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        "rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
        className
      )}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default DialogActionButton;
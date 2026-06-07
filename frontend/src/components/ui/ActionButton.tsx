"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@mui/material";
import { cn } from "@/lib/utils";

export interface ActionButtonProps {
  /**
   * Handler for the button click
   */
  onClick: () => void;
  
  /**
   * FontAwesome icon to display in the button
   */
  icon: IconDefinition;
  
  /**
   * Accessible label for the button
   */
  label: string;
  
  /**
   * Optional tooltip text
   */
  tooltip?: string;
  
  /**
   * Button visual style variant
   */
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  
  /**
   * Button size
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * A standardized action button with icon and tooltip
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  tooltip,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}) => {
  // Map variants to colors
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
    secondary: "bg-gold-500 hover:bg-gold-600 focus:ring-gold-300",
    danger: "bg-red-500 hover:bg-red-600 focus:ring-red-300",
    success: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300",
  };

  // Map sizes to dimensions
  const sizeClasses = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "p-2.5 text-base",
  };
  
  // Icon size classes based on button size
  const iconClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const buttonContent = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        `${variantClasses[variant]} ${sizeClasses[size]} text-white rounded-full transition-all 
        shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`,
        className
      )}
      aria-label={label}
      type="button"
    >
      <FontAwesomeIcon icon={icon} className={iconClasses[size]} />
    </button>
  );

  return tooltip ? (
    <Tooltip 
      title={tooltip} 
      arrow 
      placement="top"
    >
      <span>{buttonContent}</span>
    </Tooltip>
  ) : (
    buttonContent
  );
};

export default ActionButton;
"use client";

import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export interface StandardDialogProps {
  /**
   * Controls dialog visibility
   */
  open: boolean;

  /**
   * Handler to close the dialog
   */
  onClose: () => void;

  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog content
   */
  children: React.ReactNode;

  /**
   * Dialog footer actions (buttons)
   */
  actions?: React.ReactNode;

  /**
   * Maximum width of the dialog
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

  /**
   * Whether to hide the close button
   */
  hideCloseButton?: boolean;

  /**
   * Dialog visual style variant (primarily affects icon/text color if implemented)
   * Note: Background color variations removed for a cleaner look.
   */
  variant?: "default" | "warning" | "success" | "danger";

  /**
   * Additional class for the dialog paper
   */
  className?: string;

  /**
   * Additional class for the header section
   */
  headerClassName?: string;

  /**
   * Additional class for the content section
   */
  contentClassName?: string;

  /**
   * If true, clicking the backdrop will not close the dialog
   */
  disableBackdropClick?: boolean;
}

/**
 * A standardized dialog component with consistent styling
 */
const StandardDialog: React.FC<StandardDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "md",
  hideCloseButton = false,
  variant = "default", // Variant prop kept for potential future use (e.g., icons)
  className,
  headerClassName,
  contentClassName,
  disableBackdropClick = false,
}) => {
  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Add keyboard support (ESC to close)
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableBackdropClick) {
      onClose();
    }
  };

  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "full": "max-w-full mx-8", // Full width with margin
  };

  return (
    <div
      // Softer backdrop, centered content
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          // Base styling, rounded corners, shadow, smoother animation
          `w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-xl overflow-hidden`,
          // Animation: fade in, slide up slightly, zoom in slightly
          "animate-in fade-in-90 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 zoom-in-95 duration-300 ease-out",
          className
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
      >
        {/* Header */}
        {/* Removed headerVariants logic, added border */}
        <div className={cn(`px-6 py-4 flex justify-between items-center border-b border-gray-200`, headerClassName)}>
          <h3
            id="dialog-title"
            // Larger, bolder title
            className={`text-xl font-semibold text-gray-900`}
          >
            {title}
          </h3>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              // Slightly larger hit area, softer hover, updated focus ring
              className={`p-2 -m-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gold-500`}
              aria-label="Close dialog"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        {/* Increased padding, adjusted max-height */}
        <div className={cn("px-6 py-5 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto", contentClassName)}>
          {children}
        </div>

        {/* Footer */}
        {actions && (
          // Removed background and border, increased padding, adjusted gap
          <div className="px-6 pt-4 pb-5 flex flex-col sm:flex-row justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardDialog;
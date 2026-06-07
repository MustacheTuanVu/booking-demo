"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ActionItem {
  label: string;
  icon?: IconDefinition;
  iconColor?: string;
  onClick: () => void;
  danger?: boolean;
}

export interface ActionSheetProps {
  /**
   * Controls ActionSheet visibility
   */
  open: boolean;
  
  /**
   * Handler to close the ActionSheet
   */
  onClose: () => void;
  
  /**
   * ActionSheet title (optional)
   */
  title?: string;
  
  /**
   * ActionSheet items
   */
  actions: ActionItem[];
  
  /**
   * ActionSheet cancel button text
   */
  cancelText?: string;
}

/**
 * A mobile-friendly action sheet component that slides up from the bottom of the screen
 */
const ActionSheet: React.FC<ActionSheetProps> = ({
  open,
  onClose,
  title,
  actions,
  cancelText = "Hủy",
}) => {
  const [animationClass, setAnimationClass] = useState<string>("translate-y-full");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Handle animation when opening/closing the ActionSheet
    if (open) {
      setIsVisible(true);
      // Small delay to ensure the DOM is ready for the animation
      setTimeout(() => {
        setAnimationClass("translate-y-0");
      }, 10);
      
      // Lock body scroll when ActionSheet is open
      document.body.style.overflow = "hidden";
    } else {
      setAnimationClass("translate-y-full");
      // Wait for the animation to finish before hiding
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition duration
      
      // Unlock body scroll
      document.body.style.overflow = "";
      
      return () => clearTimeout(timeout);
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

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      style={{ opacity: open ? 1 : 0 }}
    >
      <div 
        className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for drag gesture */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1"></div>

        {/* Title */}
        {title && (
          <div className="px-6 py-3 border-b border-gray-200">
            <h3 className="text-center text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}

        {/* Actions */}
        <div className="p-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`w-full flex items-center px-4 py-4 text-left ${
                action.danger 
                  ? "text-red-600 hover:bg-red-50" 
                  : "text-gray-700 hover:bg-gray-50"
              } rounded-lg transition-colors`}
            >
              {action.icon && (
                <FontAwesomeIcon 
                  icon={action.icon} 
                  className={`w-5 h-5 mr-3 ${action.iconColor || (action.danger ? "text-red-500" : "text-gray-500")}`} 
                />
              )}
              <span className="text-base font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="p-2 pb-safe">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 rounded-lg py-3.5 text-base font-medium text-gray-800 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionSheet;
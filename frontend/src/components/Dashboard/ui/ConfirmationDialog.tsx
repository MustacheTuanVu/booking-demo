"use client";

import React from "react";
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Typography 
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export interface ConfirmationDialogProps {
  /**
   * Controls dialog visibility
   */
  open: boolean;
  
  /**
   * Handler to close the dialog (usually cancels the action)
   */
  onClose: () => void;
  
  /**
   * Handler to execute when the action is confirmed
   */
  onConfirm: () => void;
  
  /**
   * Dialog title
   * @default "Xác nhận"
   */
  title?: string;
  
  /**
   * The confirmation message shown to the user
   */
  message: string | React.ReactNode;
  
  /**
   * Confirm button text
   * @default "Xác nhận"
   */
  confirmButtonText?: string;
  
  /**
   * Cancel button text
   * @default "Hủy"
   */
  cancelButtonText?: string;
  
  /**
   * Color theme for the confirm button
   * @default "error"
   */
  confirmButtonColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  
  /**
   * CSS class for the confirm button
   */
  confirmButtonClassName?: string;
  
  /**
   * CSS class for the cancel button
   */
  cancelButtonClassName?: string;

  /**
   * CSS class for the dialog
   */
  dialogClass?: string;
}

/**
 * A reusable confirmation dialog component for confirming potentially destructive actions.
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmButtonText = "Xác nhận",
  cancelButtonText = "Hủy",
  confirmButtonColor = "error",
  confirmButtonClassName,
  cancelButtonClassName,
  dialogClass,
}) => {
  // Map color theme to tailwind classes
  const getConfirmButtonClasses = () => {
    const baseClasses = "px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-all duration-200";
    let colorClasses = "";
    
    switch (confirmButtonColor) {
      case "primary":
        colorClasses = "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm hover:shadow";
        break;
      case "secondary":
        colorClasses = "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-sm hover:shadow";
        break;
      case "error":
        colorClasses = "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow";
        break;
      case "warning":
        colorClasses = "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-sm hover:shadow";
        break;
      case "info":
        colorClasses = "bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 shadow-sm hover:shadow";
        break;
      case "success":
        colorClasses = "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-sm hover:shadow";
        break;
      default:
        colorClasses = "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow";
    }
    
    return `${baseClasses} ${colorClasses} ${confirmButtonClassName || ""}`;
  };
  
  const cancelButtonClasses = `px-5 py-2.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all duration-200 ${cancelButtonClassName || ""}`;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          ...(dialogClass ? {} : {})
        },
        className: dialogClass || ""
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
        <div className="flex justify-between items-center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3 }}>
        {typeof message === "string" ? (
          <Typography variant="body1" className="text-gray-800">
            {message}
          </Typography>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", pb: 3, pt: 1, px: 3, gap: 1.5 }}>
        <button
          onClick={onClose}
          className={cancelButtonClasses}
        >
          {cancelButtonText}
        </button>
        <button
          onClick={onConfirm}
          className={getConfirmButtonClasses()}
        >
          {confirmButtonText}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
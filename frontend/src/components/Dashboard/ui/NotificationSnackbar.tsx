"use client";

import React from "react";
import { Snackbar, Alert, Fade } from "@mui/material";

export interface NotificationSnackbarProps {
  /**
   * The message to display in the snackbar
   */
  message: string;
  
  /**
   * The severity/type of the notification
   */
  severity: "success" | "error" | "info" | "warning";
  
  /**
   * Controls whether the snackbar is visible
   */
  open: boolean;
  
  /**
   * Handler to close the snackbar
   */
  onClose: () => void;
  
  /**
   * Auto-hide duration in milliseconds
   * @default 5000
   */
  autoHideDuration?: number;
  
  /**
   * Vertical position of the snackbar
   * @default "bottom"
   */
  verticalPosition?: "top" | "bottom";
  
  /**
   * Horizontal position of the snackbar
   * @default "center"
   */
  horizontalPosition?: "left" | "center" | "right";
  
  /**
   * Whether to use the filled variant of Alert
   * @default true
   */
  filled?: boolean;
}

/**
 * A reusable notification snackbar component for displaying feedback messages.
 */
const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  message,
  severity,
  open,
  onClose,
  autoHideDuration = 5000,
  verticalPosition = "bottom",
  horizontalPosition = "center",
  filled = true,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ 
        vertical: verticalPosition, 
        horizontal: horizontalPosition 
      }}
      TransitionComponent={Fade}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        variant={filled ? "filled" : "standard"}
        sx={{ 
          width: '100%', 
          boxShadow: 3, 
          borderRadius: 2 
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
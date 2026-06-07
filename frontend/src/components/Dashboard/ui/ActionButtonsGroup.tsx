"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom"; // Import createPortal
import { faEye, faEdit, faTrash, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionButton from "@/components/ui/ActionButton";
import { cn } from "@/lib/utils";

export interface ActionButtonsGroupProps {
  /**
   * Handler for the view action button
   */
  onView?: () => void;
  
  /**
   * Handler for the edit action button
   */
  onEdit?: () => void;
  
  /**
   * Handler for the delete action button
   */
  onDelete?: () => void;
  
  /**
   * Tooltip text for the view button
   * @default "Xem nhanh"
   */
  viewTooltip?: string;
  
  /**
   * Tooltip text for the edit button
   * @default "Chỉnh sửa"
   */
  editTooltip?: string;
  
  /**
   * Tooltip text for the delete button
   * @default "Xóa"
   */
  deleteTooltip?: string;
  
  /**
   * Whether to show the view button
   * @default true
   */
  showView?: boolean;
  
  /**
   * Whether to show the edit button
   * @default true
   */
  showEdit?: boolean;
  
  /**
   * Whether to show the delete button
   * @default true
   */
  showDelete?: boolean;

  /**
   * Additional actions to show in the more dropdown
   */
  moreActions?: {
    label: string;
    icon?: any;
    onClick: () => void;
    iconColor?: string;
  }[];
  
  /**
   * Additional class names for the container
   */
  className?: string;

  /**
   * Unique identifier for the dropdown
   */
  dropdownId?: string;
}

/**
 * A reusable group of action buttons (View, Edit, Delete) with a More dropdown for additional actions.
 * Uses React Portal for the dropdown to avoid clipping issues.
 */
const ActionButtonsGroup: React.FC<ActionButtonsGroupProps> = ({
  onView,
  onEdit,
  onDelete,
  viewTooltip = "Xem nhanh",
  editTooltip = "Chỉnh sửa",
  deleteTooltip = "Xóa",
  showView = true,
  showEdit = true,
  showDelete = true,
  moreActions = [],
  className = "",
  dropdownId = "dropdown",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null); // Ref for the main container div
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null); // Ref for the dropdown menu itself
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [animationStarted, setAnimationStarted] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Set portal target on mount (client-side only)
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Handle dropdown positioning based on available space
  const updateDropdownPosition = () => {
    // Ensure refs and window exist
    if (dropdownButtonRef.current && dropdownMenuRef.current && typeof window !== 'undefined') {
      const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
      // Use measured height if available, otherwise estimate
      const menuHeight = dropdownMenuRef.current.offsetHeight || (40 * moreActions.length + 8); 
      const menuWidth = dropdownMenuRef.current.offsetWidth || 208; // w-52 = 208px
      
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let newPosition: 'top' | 'bottom' = 'bottom';
      // Prefer bottom, but switch to top if not enough space below AND enough space above
      if (spaceBelow < menuHeight + 8 && spaceAbove > menuHeight + 8) { // Add buffer
        newPosition = 'top';
      }
      
      setDropdownPosition(newPosition);

      // Calculate coordinates for fixed positioning
      let top, left;
      if (newPosition === 'top') {
        top = buttonRect.top - menuHeight - 4; // 4px gap above
        left = buttonRect.right - menuWidth; 
      } else { // 'bottom'
        top = buttonRect.bottom + 4; // 4px gap below
        left = buttonRect.right - menuWidth;
      }
      
      // Adjust if menu goes off-screen horizontally
      if (left < 4) left = 4; 
      if (left + menuWidth > window.innerWidth - 4) left = window.innerWidth - menuWidth - 4;
      
      // Adjust if menu goes off-screen vertically (less likely with top/bottom check)
      if (top < 4) top = 4;
      if (top + menuHeight > window.innerHeight - 4) top = window.innerHeight - menuHeight - 4;

      setDropdownCoords({ top, left });
    }
  };

  // Handle click outside to close dropdown (only listens when open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close if click is outside the button AND outside the portal'd menu
      if (
        dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target as Node) &&
        dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setAnimationStarted(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Trigger item animation after dropdown is open
      setTimeout(() => setAnimationStarted(true), 50); 
    } else {
      setAnimationStarted(false);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Update position when dropdown is opened or window resizes/scrolls
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition(); // Initial position calculation
      
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true); // Use capture phase for scroll

      // Recalculate after a short delay to allow menu to render and be measured
      const timer = setTimeout(updateDropdownPosition, 50);

      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
        clearTimeout(timer);
      };
    }
  }, [isDropdownOpen]); // Rerun only when dropdown opens/closes

  // Show the More button only if there are additional actions
  const showMoreButton = moreActions.length > 0;

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const renderDropdownContent = () => (
    <>
      {/* Backdrop effect with click handler */}
      <div 
        className="fixed inset-0 bg-black/5 z-40" // Ensure backdrop is below menu (z-50)
        aria-hidden="true" 
        onClick={() => {
          setIsDropdownOpen(false);
          setAnimationStarted(false);
        }}
      />
      
      {/* Dropdown menu with animation and fixed positioning */}
      <div 
        ref={dropdownMenuRef} // Add ref for measurement
        id={`dropdown-menu-${dropdownId}`}
        className={cn(
          "fixed z-50 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden", // Use fixed positioning
          "transition-opacity duration-150 ease-out", // Simple fade transition
          isDropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none" // Control visibility with opacity
        )}
        style={{ 
          top: `${dropdownCoords.top}px`,
          left: `${dropdownCoords.left}px`,
          // Removed transformOrigin as scale is no longer used
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
        }}
        role="menu"
        aria-orientation="vertical"
      >
        {/* Removed the visual caret div */}
        <div className="py-1 relative bg-white"> {/* Ensure inner div doesn't interfere */}
          {moreActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsDropdownOpen(false); // Close after action
                setAnimationStarted(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors duration-100", // Faster color transition
                // Removed transform classes for items
              )}
              // Removed style with transitionDelay and duration for items
              role="menuitem"
            >
              {action.icon && (
                <span className={cn("mr-2 flex-shrink-0", action.iconColor)}>
                  <FontAwesomeIcon icon={action.icon} className="h-4 w-4" />
                </span>
              )}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    // Use the container ref here
    <div ref={dropdownContainerRef} className={cn("flex space-x-1.5 items-center justify-center", className)}> 
      {showView && onView && (
        <ActionButton
          onClick={onView}
          icon={faEye}
          label="View"
          tooltip={viewTooltip}
          variant="primary"
          size="md"
        />
      )}
      
      {showEdit && onEdit && (
        <ActionButton
          onClick={onEdit}
          icon={faEdit}
          label="Edit"
          tooltip={editTooltip}
          variant="secondary"
          size="md"
        />
      )}
      
      {showDelete && onDelete && (
        <ActionButton
          onClick={onDelete}
          icon={faTrash}
          label="Delete"
          tooltip={deleteTooltip}
          variant="danger"
          size="md"
        />
      )}

      {showMoreButton && (
        // Keep relative positioning on the button's wrapper if needed, but portal handles breakout
        <div className="relative"> 
          <button
            ref={dropdownButtonRef}
            onClick={handleDropdownToggle}
            className={cn(
              "p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors flex items-center justify-center",
              isDropdownOpen ? "bg-gray-200 ring-2 ring-offset-2 ring-gray-300" : ""
            )}
            aria-label="More Actions"
            title="More Actions"
            aria-expanded={isDropdownOpen}
            aria-controls={`dropdown-menu-${dropdownId}`}
          >
            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
          </button>
          
          {/* Render dropdown via portal */}
          {isDropdownOpen && portalTarget && ReactDOM.createPortal(renderDropdownContent(), portalTarget)}
        </div>
      )}
    </div>
  );
};

export default ActionButtonsGroup;
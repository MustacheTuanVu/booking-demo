'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import api from "@/utils/api";
import { getMediaUrl } from '@/utils/mediaUrl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';

// Define interface for category items
interface CategoryItem {
  _id: string
  code: string
  name: string
  image: string
  category_id_cukcuk: string
  category_name_cukcuk: string
  createdAt?: string
  updatedAt?: string
}

// Define interface for menu items
interface MenuItem {
  _id: string
  name: string
  desc: string
  type: string
  unit: string
  price: number
  status: string
  ingredient?: string
  category_id?: string | CategoryItem
  flavor?: Array<{ name: string, description: string, icon: string, color: string, _id: string }>
  item_id_cukcuk?: string
  item_name_cukcuk?: string
  unit_id_cukcuk?: string
  unit_name_cukcuk?: string
  image?: string
}

interface MenuOrder {
  _id: string
  name: string
  description: string
  type: string
  status: string
  image?: string
  DRINK: MenuItem[]
  FOOD: MenuItem[]
}

interface DrinkMenuProps {
  onOpen: boolean
  onClose: () => void
  menuItems?: MenuItem[]
  freeDrinkLimit?: number
  freeFoodLimit?: number
  onConfirm: (quantities: { [itemId: string]: number }) => void
  title?: string
  isCombo?: boolean
  comboMenuOrder?: MenuOrder
  onBack?: () => void
  totalAmount?: number
  stepChoiceItem: any
  setStepChoiceItem: any
  // Added props for grouped combos
  comboCount?: number
  originalDrinkLimit?: number
  originalFoodLimit?: number
  isPreviewMode?: boolean
}

// Default placeholder image for items without images
const IMAGES = [
  "/images/imagemenu.jpg",
  "/images/imagemenu2.jpg",
  "/images/imagemenu3.jpg",
];

const CATEGORY_IMAGES = IMAGES.slice(1); // Loại bỏ ảnh đầu tiên

const getCategoryImage = (index: number) => CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];

function MenuItemCard({
  item,
  quantity,
  onQuantityChange,
  isCombo,
  freeDrinkLimit,
  freeFoodLimit,
  totalDrinkQuantity,
  totalFoodQuantity,
  isPreviewMode
}: {
  item: MenuItem
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  isCombo: boolean
  freeDrinkLimit: number
  freeFoodLimit: number
  totalDrinkQuantity: number
  totalFoodQuantity: number
  isPreviewMode?: boolean
}) {
  const [showDesc, setShowDesc] = useState(false);
  const [isLongDesc, setIsLongDesc] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descRef.current).lineHeight, 10) || 20;
      setIsLongDesc(descRef.current.scrollHeight > lineHeight * 2);
    }
  }, [item.desc]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDetails && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  // Add keyboard support for closing modal with Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (showDetails && event.key === 'Escape') {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showDetails]);

  const handleIncrement = () => onQuantityChange(quantity + 1);
  const handleDecrement = () => onQuantityChange(quantity > 0 ? quantity - 1 : 0);

  // Get the image URL, using a default if none exists
  const imageUrl = getMediaUrl(item.image, IMAGES[0]);

  // Convert flavor array to display format if it exists
  const tastes = item.flavor || [];

  // Extract item number and name
  const itemNameParts = item.name.match(/^(\d+)\.(.+)$/);
  const itemNumber = itemNameParts ? itemNameParts[1] : '';
  const itemName = itemNameParts ? itemNameParts[2].trim() : item.name;

  // Mobile layout detection with proper state management
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check on initial render
    if (typeof window !== 'undefined') {
      checkIfMobile();

      // Add event listener for window resize
      window.addEventListener('resize', checkIfMobile);

      // Clean up
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  // For screens smaller than sm breakpoint (640px)
  if (isMobile) {
    return (
      <>
        <div
          className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden transform transition duration-200 hover:shadow-md relative flex flex-col h-full"
          onClick={() => setShowDetails(true)}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${itemName}`}
          onKeyDown={(e) => e.key === 'Enter' && setShowDetails(true)}
        >
          {/* Item Number Badge */}
          {itemNumber && (
            <div className="absolute top-1 right-1 z-10">
              <div className="bg-gold-600 text-white px-1 py-0.5 rounded-md shadow-sm flex items-center space-x-0.5">
                <span className="text-[10px] font-medium">No.</span>
                <span className="text-xs font-bold">{itemNumber}</span>
              </div>
            </div>
          )}

          {/* Image at top with smaller height */}
          <div className="relative w-full h-24 flex-shrink-0">
            <Image src={imageUrl} alt={itemName} fill className="object-cover" unoptimized />
          </div>

          {/* Basic info always visible */}
          <div className="p-2 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-bold text-gold-600 leading-tight max-h-10 overflow-hidden">{itemName}</h4>
              
              {/* "Chi tiết" text for preview mode */}
              {isPreviewMode && (item?.desc || (item?.desc?.split('\n')[0] && item?.desc?.split('\n')[1])) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetails(true) }}
                  className="text-[10px] text-gold-600 underline px-1 ml-1 flex-shrink-0"
                  aria-label="View item details"
                >
                  Chi tiết
                </button>
              )}
            </div>
            {!isCombo && <p className="text-xs font-semibold text-gray-700 mt-1">{item.price.toLocaleString()} VND</p>}

            {/* Quantity controls */}
            {!isPreviewMode ? (
              <div className="mt-auto pt-1 flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
                    className="w-7 h-7 flex items-center justify-center border rounded-full text-gray-600 text-sm font-bold disabled:opacity-50 active:bg-gray-100"
                    disabled={quantity === 0}
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-gold-600">{quantity}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                    className="w-7 h-7 flex items-center justify-center border rounded-full text-gray-600 text-sm font-bold disabled:opacity-50 active:bg-gray-100"
                    disabled={
                      isCombo && (
                        (item.type === "FOOD" && totalFoodQuantity >= freeFoodLimit) ||
                        (item.type === "DRINK" && totalDrinkQuantity >= freeDrinkLimit)
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Only show if there's a description or ingredients */}
                {(item?.desc || (item?.desc?.split('\n')[0] && item?.desc?.split('\n')[1])) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDetails(true) }}
                    className="text-[10px] text-gold-600 underline px-1"
                    aria-label="View item details"
                  >
                    Chi tiết
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-auto pt-1">
                {/* Empty space to maintain layout in preview mode */}
              </div>
            )}
          </div>
        </div>

        {/* Details Modal - Using Portal pattern for better rendering */}
        {showDetails && (
          <div
            className="fixed inset-0 z-[9000] bg-black/70 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowDetails(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-${item._id}`}
          >
            <div
              ref={modalRef}
              className="bg-white rounded-xl max-w-xs w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div className="relative w-full h-40 bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={itemName}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                <button
                  className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                  onClick={() => setShowDetails(false)}
                  aria-label="Close modal"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {itemNumber && (
                  <div className="absolute top-2 left-2 bg-gold-600 text-white px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
                    <span className="text-xs font-medium">No.</span>
                    <span className="text-sm font-bold">{itemNumber}</span>
                  </div>
                )}
              </div>

              {/* Modal Content - Scrollable area */}
              <div className="p-4 overflow-y-auto flex-grow">
                <h3 id={`modal-${item._id}`} className="text-xl font-bold text-gold-600 mb-2">{itemName}</h3>

                {/* Price for non-combo items */}
                {!isCombo && (
                  <div className="text-right text-sm font-bold text-gray-700 mb-2">
                    {item.price.toLocaleString()} VND
                  </div>
                )}

                {/* Ingredients Display */}
                {item?.desc?.split('\n')[0] && item?.desc?.split('\n')[0].length > 0 && item?.desc?.split('\n')[1] && (
                  <div className="mt-2 mb-3 flex flex-wrap gap-1">
                    {item.desc.split('\n')[0].split(',').map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-1.5 py-0.5 bg-gold-50 text-gold-700 text-xs font-medium rounded-full border border-gold-200"
                      >
                        {ingredient.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="mt-2 mb-4">
                  <p ref={descRef} className="text-sm text-gray-700 leading-relaxed">
                    {item?.desc?.split('\n')[1] && item?.desc?.split('\n')[1].length
                      ? item?.desc?.split('\n')[1]
                      : item?.desc?.split('\n')[0] || ""}
                  </p>
                </div>
              </div>

              {/* Modal Footer with quantity controls */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDecrement}
                      className="w-9 h-9 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors text-base font-medium"
                      disabled={quantity === 0}
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="w-8 text-center text-lg font-semibold text-gold-600">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="w-9 h-9 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors text-base font-medium"
                      disabled={
                        isCombo && (
                          (item.type === "FOOD" && totalFoodQuantity >= freeFoodLimit) ||
                          (item.type === "DRINK" && totalDrinkQuantity >= freeDrinkLimit)
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop layout (unchanged but with event handler improvements)
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-md overflow-hidden transform transition duration-200 hover:scale-[1.02] hover:shadow-xl relative">
      {/* Item Number Display - Space-optimized ordering reference */}
      {itemNumber && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gold-600 text-white px-2 py-1 rounded-md shadow flex items-center space-x-1">
            <span className="text-xs font-medium">No.</span>
            <span className="text-sm font-bold">{itemNumber}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section - Optimized for mobile */}
        <div className="relative w-full h-36 sm:h-48 sm:w-1/3">
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            {imageUrl.startsWith('./public') ? (
              <div className="text-gray-400 text-sm">Image not available</div>
            ) : (
              <Image src={imageUrl} alt={itemName} fill className="object-cover" unoptimized />
            )}
          </div>
        </div>
        {/* Details Section - Optimized for mobile */}
        <div className="p-3 sm:p-4 w-full sm:w-2/3 flex flex-col h-full">
          {/* Content area - Will expand to fill available space */}
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              {/* Item Name - Without the number prefix */}
              <h4 className="text-xl sm:text-2xl font-bold text-gold-600 pr-10 leading-tight">{itemName}</h4>
              
              {/* "Chi tiết" button for preview mode */}
              {isPreviewMode && (item?.desc || (item?.desc?.split('\n')[0] && item?.desc?.split('\n')[1])) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc) }}
                  className="text-xs text-gold-600 underline px-1 flex-shrink-0"
                  aria-label="View item details"
                >
                  Chi tiết
                </button>
              )}
            </div>

            {/* Ingredients Display - Only shown when ingredients are available */}
            {item?.desc?.split('\n')[0] && item?.desc?.split('\n')[0].length > 0 && item?.desc?.split('\n')[1] && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.desc.split('\n')[0].split(',').map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-1.5 py-0.5 bg-gold-50 text-gold-700 text-xs font-medium rounded-full border border-gold-200"
                  >
                    {ingredient.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Description Section */}
            <div className="mt-2">
              {isLongDesc && (
                <button
                  onClick={() => setShowDesc(!showDesc)}
                  className="text-xs sm:text-sm font-medium text-gold-600 focus:outline-none transition-colors hover:text-gold-800"
                  aria-expanded={showDesc}
                  aria-controls={`desc-${item._id}`}
                >
                  {showDesc ? "Ẩn mô tả" : "Xem mô tả"}
                </button>
              )}

              {/* Animated Description */}
              <div
                id={`desc-${item._id}`}
                className={`transition-all duration-300 ease-out overflow-hidden mt-1 ${showDesc ? "max-h-40 opacity-100" : isLongDesc ? "max-h-0 opacity-0" : "opacity-100"
                  }`}
              >
                <p ref={descRef} className="text-xs sm:text-sm text-gray-700">
                  {item?.desc?.split('\n')[1] && item?.desc?.split('\n')[1].length
                    ? item?.desc?.split('\n')[1]
                    : item?.desc?.split('\n')[0] || ""}
                </p>
              </div>
            </div>

            {/* Price Display for non-combo items */}
            {!isCombo && (
              <div className="mt-2 text-right text-sm font-bold text-gray-700">
                {item.price.toLocaleString()} VND
              </div>
            )}
          </div>

          {/* Bottom Section: Quantity Selector - Fixed at bottom with mt-auto */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            {!isPreviewMode ? (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity === 0}
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-gold-600">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    disabled={
                      isCombo && (
                        (item.type === "FOOD" && totalFoodQuantity >= freeFoodLimit) ||
                        (item.type === "DRINK" && totalDrinkQuantity >= freeDrinkLimit)
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gold-600 italic">
                {/* Empty space to maintain layout in preview mode */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DrinksMenu({
  onOpen,
  onClose,
  menuItems = [],
  freeDrinkLimit = 0,
  freeFoodLimit = 0,
  onConfirm,
  title,
  isCombo,
  comboMenuOrder,
  onBack,
  totalAmount,
  stepChoiceItem,
  setStepChoiceItem,
  // Added props for grouped combos
  comboCount,
  originalDrinkLimit,
  originalFoodLimit,
  isPreviewMode
}: DrinkMenuProps) {
  // Add animation styles when component mounts
  useEffect(() => {
    // Only add styles if they don't already exist
    if (!document.getElementById('drinks-menu-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'drinks-menu-styles';
      styleEl.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Clean up when component unmounts
    return () => {
      const styleEl = document.getElementById('drinks-menu-styles');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  // States for menu data
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<MenuOrder | null>(null);
  // State to track quantities by item ID
  const [orderQuantities, setOrderQuantities] = useState<{ [itemId: string]: number }>({});
  // Fetch menu items and extract categories when not in combo mode
  useEffect(() => {
    if (!isCombo && onOpen) {
      const fetchMenuItems = async () => {
        setIsLoading(true);
        try {
          // const response = await api.get('/menu_item/GetMyMenuItem?page=1&limit=99999999&status=ACTIVE');
          const response = await api.get('/menu_order/GetMyMenuOrderByCondition?page=1&limit=1&type=UPSALE')
          const cateRes = await api.get('/category_item/GetMany?page=1&limit=999999999')
          const cateList = cateRes.data.category;
          if (response.data && response.data.menuOrder && response.data.menuOrder[0]) {
            const itemsRaw = [];
            if (response.data.menuOrder[0].DRINK) {
              itemsRaw.push(...response.data.menuOrder[0].DRINK)
            }

            if (response.data.menuOrder[0].FOOD) {
              itemsRaw.push(...response.data.menuOrder[0].FOOD)
            }


            const items: any = [];

            for (let i = 0; i < itemsRaw.length; i++) {
              const raw = itemsRaw[i];
              for (let z = 0; z < cateList.length; z++) {
                const cate = cateList[z];

                if (cate._id == raw.category_id) {
                  items.push({
                    ...raw,
                    category_id: {
                      ...cate
                    }
                  })
                  break;
                }

              }
            }

            setAllItems(items);
            // setFilteredItems(items.filter((item: any) => item.type === stepChoiceItem));
            // setAllItems(items.filter((item: any) => item.type === stepChoiceItem));

            // Extract unique categories from items
            const uniqueCategories: CategoryItem[] = [];
            const categoryIds = new Set();

            items.filter((item: any) => item.type === stepChoiceItem).forEach((item: MenuItem) => {
              if (item.category_id && typeof item.category_id === 'object' && !categoryIds.has(item.category_id._id)) {
                categoryIds.add(item.category_id._id);
                uniqueCategories.push(item.category_id as CategoryItem);
              }
            });

            setCategories(uniqueCategories);

            // Set a default category if available
            if (uniqueCategories.length > 0) {
              setSelectedCategoryId("");
            }
          }
        } catch (error) {
          console.error('Failed to fetch menu items:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMenuItems();
    }
  }, [isCombo, onOpen]);

  // Initialize available items for combo mode
  // Initialize available items for combo mode
  useEffect(() => {
    if (isCombo && onOpen) {
      const fetchMenuItems = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/menu_item/GetMyMenuItem?page=1&limit=99999999&status=ACTIVE');
          if (response.data && response.data.menuItem) {
            const items = response.data.menuItem;

            let filteredItemsU = [];

            // Nếu có comboMenuOrder, lọc các item theo DRINK và FOOD trong comboMenuOrder
            if (comboMenuOrder) {
              const comboItems = [...(comboMenuOrder.DRINK || []), ...(comboMenuOrder.FOOD || [])];
              const comboItemIds = new Set(comboItems.map(item => item._id));
              const filteredItems = items.filter((item: any) => comboItemIds.has(item._id));
              setAllItems(filteredItems.filter((item: any) => item.type === stepChoiceItem));
              filteredItemsU = filteredItems.filter((item: any) => item.type === stepChoiceItem);
            } else if (menuItems.length > 0) {
              // Tương thích ngược với menuItems
              const menuItemIds = new Set(menuItems.map(item => item._id));
              const filteredItems = items.filter((item: any) => menuItemIds.has(item._id));
              setAllItems(filteredItems.filter((item: any) => item.type === stepChoiceItem));
              filteredItemsU = filteredItems.filter((item: any) => item.type === stepChoiceItem);
            } else {
              // Không có dữ liệu combo, sử dụng tất cả các item
              setAllItems(items.filter((item: any) => item.type === stepChoiceItem));
              filteredItemsU = items.filter((item: any) => item.type === stepChoiceItem);
            }

            // Extract unique categories from items
            const uniqueCategories: CategoryItem[] = [];
            const categoryIds = new Set();

            filteredItemsU.forEach((item: MenuItem) => {
              if (item.category_id && typeof item.category_id === 'object' && !categoryIds.has(item.category_id._id)) {
                categoryIds.add(item.category_id._id);
                uniqueCategories.push(item.category_id as CategoryItem);
              }
            });

            setCategories(uniqueCategories);

            // Set a default category if available
            if (uniqueCategories.length > 0) {
              setSelectedCategoryId("");
            }
          }
        } catch (error) {
          console.error('Failed to fetch menu items for combo:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMenuItems();
    }
  }, [isCombo, onOpen, comboMenuOrder, menuItems]);

  // Update filtered items when selected category or available items change
  useEffect(() => {
    if (!selectedCategoryId) {
      // If no category is selected, show all items sorted by their numeric index
      let itemsToShow = allItems.filter(item => item.type === stepChoiceItem);

      // Sort items by their numeric index extracted from name
      itemsToShow = sortItemsByIndex(itemsToShow);

      setFilteredItems(itemsToShow);
      if (!isCombo) {
        if (itemsToShow.length == 0) {
          setStepChoiceItem('FOOD')
        }
      }
      console.log('lỗi 1', isCombo)
      return;
    }

    // Filter items by selected category
    let filtered = allItems.filter(item => {
      if (typeof item.category_id === 'object' && item.category_id) {
        // For items with category_id as object
        return item.category_id._id === selectedCategoryId;
      } else if (isCombo) {
        // For combo mode, filter by type
        return item.type === selectedCategoryId;
      } else {
        // Default fallback
        console.log('lỗi 2')
        return false;
      }
    });

    // Sort items by their numeric index
    filtered = sortItemsByIndex(filtered.filter(item => item.type === stepChoiceItem));

    console.log('check ahihi')

    setFilteredItems(filtered);
  }, [selectedCategoryId, allItems, isCombo]);

  // Helper function to sort items by their index number
  const sortItemsByIndex = (items: MenuItem[]) => {
    return [...items].sort((a, b) => {
      // Extract number from the name (e.g., "1.Coffee" -> "1")
      const aMatch = a.name.match(/^(\d+)\./);
      const bMatch = b.name.match(/^(\d+)\./);

      // Get the numbers or default to 999 if not found
      const aNum = aMatch ? parseInt(aMatch[1], 10) : 999;
      const bNum = bMatch ? parseInt(bMatch[1], 10) : 999;

      // Compare numbers for sorting
      return aNum - bNum;
    });
  };

  useEffect(() => {
    if (!isCombo && stepChoiceItem == 'FOOD') {
      // Sort items by their index number
      const sortedItems = sortItemsByIndex(allItems.filter(item => item.type === stepChoiceItem));
      setFilteredItems(sortedItems);

      const uniqueCategories: CategoryItem[] = [];
      const categoryIds = new Set();

      allItems.filter(item => item.type === stepChoiceItem).forEach((item: MenuItem) => {
        if (item.category_id && typeof item.category_id === 'object' && !categoryIds.has(item.category_id._id)) {
          categoryIds.add(item.category_id._id);
          uniqueCategories.push(item.category_id as CategoryItem);
        }
      });

      setCategories(uniqueCategories);
    }
  }, [stepChoiceItem]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  }

  // Compute total order amount (sử dụng totalAmount từ props nếu có)
  const totalOrder = allItems.reduce((total, item) => {
    const qty = orderQuantities[item._id] || 0;
    return total + item.price * qty;
  }, 0);
  // Calculate total quantity of items ordered by type
  const totalDrinkQuantity = allItems
    .filter(item => item.type === 'DRINK')
    .reduce((total, item) => total + (orderQuantities[item._id] || 0), 0);

  const totalFoodQuantity = allItems
    .filter(item => item.type === 'FOOD')
    .reduce((total, item) => total + (orderQuantities[item._id] || 0), 0);

  // Check if the selection exceeds the limits
  const exceededDrinkLimit = freeDrinkLimit > 0 && totalDrinkQuantity > freeDrinkLimit;
  const exceededFoodLimit = freeFoodLimit > 0 && totalFoodQuantity > freeFoodLimit;
  const isSelectionValid = !exceededDrinkLimit && !exceededFoodLimit;
  console.log(freeDrinkLimit);

  // Reference for scrolling the categories container
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  // State for pagination indicator
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const newTotalPages = Math.ceil(container.scrollWidth / container.clientWidth);
    setTotalPages(newTotalPages);
    const newPage = Math.round(container.scrollLeft / container.clientWidth);
    setCurrentPage(newPage);
  };

  const handlePrev = () => {
    if (categoriesContainerRef.current) {
      const width = categoriesContainerRef.current.clientWidth;
      categoriesContainerRef.current.scrollBy({ left: -width, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (categoriesContainerRef.current) {
      const width = categoriesContainerRef.current.clientWidth;
      categoriesContainerRef.current.scrollBy({ left: width, behavior: 'smooth' });
    }
  };

  // Handle confirm button click
  // totalDrinkQuantity < freeDrinkLimit || totalFoodQuantity < freeFoodLimit || exceededFoodLimit || exceededDrinkLimit
  const handleConfirm = () => {
    if (stepChoiceItem == 'DRINK') {
      if (isCombo) {
        if (freeFoodLimit == 0) {
          onConfirm(orderQuantities);
        } else {
          setStepChoiceItem('FOOD')
        }
      } else {
        const foodNeedSize = allItems.filter(item => item.type === 'FOOD').length;
        // setStepChoiceItem('FOOD')
        // console.log('foodNeedSize', allItems)
        // console.log('foodNeedSize 2', foodNeedSize)
        if (foodNeedSize > 0) {
          setStepChoiceItem('FOOD')
        } else {
          onConfirm(orderQuantities);
        }
      }
    } else {
      onConfirm(orderQuantities);
    }

  };

  const isInValidChoice = () => {
    if (stepChoiceItem == 'DRINK') {
      return (totalDrinkQuantity < freeDrinkLimit || exceededDrinkLimit)
    } else {
      return (totalFoodQuantity < freeFoodLimit || exceededFoodLimit)
    }
  }

  if (!onOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Fixed header with attached category section */}
        <div className="sticky top-0 z-50 rounded-t-lg shadow-md">
          {/* Title section */}
          <div className="flex flex-col md:flex-row justify-between md:justify-center items-center relative rounded-t-lg rounded-b-none bg-gradient-to-r from-gold-100 to-white p-2 md:p-4">
            <div className="text-md md:text-3xl font-semibold text-gold-700 text-center md:text-left pr-10">
              {isCombo ? (
                <>
                  {title || 'Thực đơn đồ uống'}
                </>
              ) : (
                <>
                  {/* Mobile: Hiển thị hai dòng */}
                  <span className="block md:hidden text-sm">
                    Gọi thêm món
                    <span className="block text-[12px] text-gold-700">Tận hưởng trọn vẹn đêm nhạc</span>
                  </span>

                  {/* MD trở lên: Hiển thị một dòng */}
                  <span className="hidden md:block">Gọi thêm món - tận hưởng trọn vẹn đêm nhạc</span>
                </>
              )}
            </div>
            <button
              className="absolute top-2 md:top-6 right-4 text-gray-600 hover:text-gray-900 font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Category section attached directly to header */}
          {!isLoading && categories.length > 0 && (
            <div className="bg-white border-t border-gray-100 pt-1 px-2 pb-2 shadow-sm rounded-b-lg">
              {/* Header with elegant navigation controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gold-600 focus:outline-none transition-colors flex-shrink-0"
                  aria-label="Previous categories"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Categories Row */}
                <div
                  ref={categoriesContainerRef}
                  onScroll={handleScroll}
                  className="flex space-x-3 overflow-x-auto py-2 px-1 w-full scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div
                    key="all"
                    className={`relative flex-shrink-0 w-14 md:w-28 cursor-pointer transition-all duration-300 ease-in-out ${!selectedCategoryId ? 'scale-[1.03]' : 'opacity-75 grayscale-[30%]'
                      }`}
                    onClick={() => setSelectedCategoryId("")}
                  >
                    <div
                      className={`relative w-14 h-14 md:w-28 md:h-28 rounded-lg overflow-hidden border-4 border-gold-600 ${!selectedCategoryId ? 'shadow-[0_0_10px_rgba(212,175,55,0.5)]' : ''
                        }`}
                    >
                      <Image
                        src={IMAGES[0]}
                        alt="Tất cả"
                        fill
                        className={`object-cover transition-all duration-300 ${!selectedCategoryId ? 'brightness-105 saturate-105' : ''
                          }`}
                        unoptimized
                      />
                      {/* {!selectedCategoryId && (
                         <div className="absolute inset-0 border-2 border-gold-400 rounded-lg"></div>
                      )} */}
                    </div>
                    <p
                      className={`mt-1 text-center font-bold transition-all duration-300 text-xs md:text-sm ${!selectedCategoryId ? 'text-gold-600' : 'text-gray-600'
                        }`}
                    >
                      Tất cả
                    </p>
                    {!selectedCategoryId && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-0.5 bg-gold-600 rounded-full"></div>
                    )}
                  </div>

                  {categories.map((category, index) => {
                    const isSelected = selectedCategoryId === category._id;

                    return (
                      <div
                        key={category._id}
                        className={`relative flex-shrink-0 flex flex-col items-center w-14 md:w-28 cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'scale-[1.03]' : 'opacity-75 grayscale-[30%]'
                          }`}
                        onClick={() => setSelectedCategoryId(category._id)}
                      >
                        <div
                          className={`relative w-14 h-14 md:w-28 md:h-28 rounded-lg overflow-hidden border-4 border-gold-600 ${isSelected ? 'shadow-[0_0_10px_rgba(212,175,55,0.5)] border-gold-700' : ''}`}
                        >
                          <Image
                            src={getMediaUrl(category.image, getCategoryImage(index))}
                            alt={category.name}
                            fill
                            className={`object-cover transition-all duration-300 ${isSelected ? 'brightness-105 saturate-105' : ''}`}
                            unoptimized
                          />
                          {/* {isSelected && (
                            <div className="absolute inset-0 border-2 border-gold-400 rounded-lg"></div>
                          )} */}
                        </div>
                        <p
                          className={`mt-1 text-center font-bold transition-all duration-300 text-xs md:text-sm ${isSelected ? 'text-gold-600' : 'text-gray-600'
                            }`}
                        >
                          {category.name}
                        </p>
                        {isSelected && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-0.5 bg-gold-600 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gold-600 focus:outline-none transition-colors flex-shrink-0"
                  aria-label="Next categories"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Subtle pagination indicator */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-1 py-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${i === Math.min(currentPage, 4) ? 'bg-gold-600 scale-110' : 'bg-gray-300'}`}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-grow p-4 md:px-8 md:py-6 mt-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
            </div>
          ) : (
            <>
              {/* Message when no items are available */}
              {filteredItems.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500 text-lg">Hãy chọn một menu để hiển thị món</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 md:gap-8 transition-all duration-500 ease-in-out">
                  {filteredItems.map((item, index) => (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      quantity={orderQuantities[item._id] || 0}
                      onQuantityChange={(newQty) => handleQuantityChange(item._id, newQty)}
                      isCombo={!!isCombo}
                      freeDrinkLimit={freeDrinkLimit}
                      freeFoodLimit={freeFoodLimit}
                      totalDrinkQuantity={totalDrinkQuantity}
                      totalFoodQuantity={totalFoodQuantity}
                      isPreviewMode={isPreviewMode}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer now at the physical bottom of the modal */}
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 flex items-center shadow-lg">
          {isPreviewMode ? (
            // Preview mode footer - only Đóng button
            <div className="w-full flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-2.5 font-semibold rounded-full shadow-md transition-colors text-md bg-gold-600 text-white hover:bg-gold-700"
              >
                Đóng
              </button>
            </div>
          ) : (
            // Regular mode footer
            <div className="flex justify-between items-center mx-auto w-full">
              <div className="text-md md:text-lg font-bold text-gray-700 md:w-1/2 w-full">
                <div className="flex w-full mx-auto my-1 text-center md:text-left justify-center md:justify-start">
                  {!isCombo && `Tổng đơn: ${(totalOrder + (totalAmount ?? 0)).toLocaleString()} VND`}
                </div>
                {isCombo && (
                  <div className="flex flex-col">
                    <div className="flex md:gap-0 gap-2 w-full mb-1 text-center md:text-left mx-auto">
                      {(freeFoodLimit > 0 && stepChoiceItem == 'FOOD') && (
                        <span className={`${exceededFoodLimit ? "text-red-600" : "text-gray-700"} w-full`}>
                          Đồ ăn: {totalFoodQuantity}/{freeFoodLimit} món
                        </span>
                      )}
                      {(freeDrinkLimit > 0 && stepChoiceItem == 'DRINK') && (
                        <span className={`${exceededDrinkLimit ? "text-red-600" : "text-gray-700"} w-full`}>
                          Đồ uống: {totalDrinkQuantity}/{freeDrinkLimit} món
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={isInValidChoice()}
                  className={`md:px-8 px-4 py-2 md:py-3 flex font-semibold rounded-full shadow-xl transition-colors text-md md:text-lg whitespace-nowrap ${isInValidChoice()
                    ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                    : "bg-gold-600 text-white hover:bg-gold-700"
                    }`}
                >
                  <span className="mr-1">Tiếp tục</span> <span className="hidden md:block"><FontAwesomeIcon icon={faArrowRight} className="mx-1 text-lg" /></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

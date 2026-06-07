import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateString: string | Date | null): string {
  if (!dateString) return 'Chưa xác định';
  
  try {
    const date = new Date(dateString);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return 'Chưa xác định';
    }

    // Định dạng ngày giờ theo locale Việt Nam
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return 'Chưa xác định';
  }
}

import mongoose from "mongoose";

export class StringUtils {
    static generateObjectId(): string {
      return new mongoose.Types.ObjectId().toString();
    }
  
    static ObjectId(str: string) {
      return new mongoose.Types.ObjectId(str);
    }

    static formatDateString(isoString: string): string {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
    
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1); // getMonth trả từ 0-11
      const year = date.getFullYear().toString().slice(-2); // lấy 2 số cuối
    
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    }
    
    static normalizePhoneNumber(phone: string): string {
      // Xoá khoảng trắng, chấm, gạch
      let cleaned = phone.replace(/[\s\.\-]/g, '');
    
      if (cleaned.startsWith('+84')) {
        // Nếu có +84 mà ký tự tiếp theo là '0' thì xóa mẹ số 0
        if (cleaned[3] === '0') {
          cleaned = '+84' + cleaned.slice(4);
        }
        return cleaned;
      }
    
      if (cleaned.startsWith('0')) {
        return '+84' + cleaned.slice(1);
      }
    
      return cleaned; // fallback nếu là định dạng khác
    } 
}
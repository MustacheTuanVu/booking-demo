/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL, // Thay đổi nếu cần
  baseURL: API_URL, 
});

// Thêm interceptor để đính kèm token nếu có
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token'); // Hoặc lấy từ cookie nếu bạn đang sử dụng cookie
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để log response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log('API Response Error:', error.response);
      if (error.response.status == 401) {
        // Xóa token từ localStorage
        localStorage.removeItem('token');
        // Hoặc nếu bạn sử dụng cookies, bạn có thể xóa cookie tại đây
    
        // Chuyển hướng đến trang đăng nhập hoặc home
        window.location.href = '/'; // Thay đổi đường dẫn nếu cần
      }
    } else {
      console.log('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

export const formatDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const formatted = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.replace('tháng', 'Tháng');
};

export const formatDateTime = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  const datePart = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date).replace('tháng', 'Tháng');

  return `${time}, ${datePart}`;
};
export const formatTime = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  // Lấy thứ trong tuần
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);

  // Lấy giờ và phút, sử dụng định dạng 12 giờ
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // Định dạng 12 giờ (AM/PM)
  }).format(date);

  return `${weekday}, ${time}`;
};

export const formattedDateAndTime = (dateRaw: any): string => {
  const date = new Date(dateRaw);
  const formattedDate = date.toLocaleString('vi-VN', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh'
  });

  return formattedDate;
};

export const formatDateTime2 = (dateInput: string): string => {
  const time = dateInput.split('T')

  const time2 = time[0].split('-')

  return `${time2[2]}/${time2[1]}/${time2[0]}`;
};

export const formatDateTime3 = (dateInput: string): string => {
  // Use the same approach as formatDateTime for consistency
  const date = new Date(dateInput);

  // Format time with proper timezone handling
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  // Format date part
  const datePart = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date).replace('tháng', 'Tháng');

  return `${time}, ${datePart}`;
};
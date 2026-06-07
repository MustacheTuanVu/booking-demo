"use client";

import React, { createContext, useContext, useRef, ReactNode, RefObject } from "react";

// 1️⃣ Cập nhật `SectionRefs` để cho phép `null`
interface SectionRefs {
  "Lịch biểu diễn": RefObject<HTMLDivElement | null>;
  "Sự kiện tuần tới": RefObject<HTMLDivElement | null>;
  "Chính sách đặt chỗ và thanh toán": RefObject<HTMLDivElement | null>;
  "Chính sách xử lý khiếu nại": RefObject<HTMLDivElement | null>;
  "Chính sách giao nhận": RefObject<HTMLDivElement | null>;
  "Chính sách hủy": RefObject<HTMLDivElement | null>;
  "Chính sách bảo lưu": RefObject<HTMLDivElement | null>;
  "Chính sách bảo mật thông tin": RefObject<HTMLDivElement | null>;
  "Chính sách tiếp thị liên kết": RefObject<HTMLDivElement | null>;
  "Chính sách thành viên": RefObject<HTMLDivElement | null>;
  "Hướng dẫn đặt chỗ": RefObject<HTMLDivElement | null>;


}

// 2️⃣ Tạo Context với giá trị mặc định là `null`
export const SectionContext = createContext<SectionRefs | null>(null);

interface SectionProviderProps {
  children: ReactNode;
}

// 3️⃣ Cập nhật `useRef` với kiểu dữ liệu mới
export const SectionProvider: React.FC<SectionProviderProps> = ({ children }) => {
  const sectionRefs: SectionRefs = {
    "Lịch biểu diễn": useRef<HTMLDivElement | null>(null),
    "Sự kiện tuần tới": useRef<HTMLDivElement | null>(null),
    "Chính sách đặt chỗ và thanh toán": useRef<HTMLDivElement | null>(null),
    "Chính sách xử lý khiếu nại": useRef<HTMLDivElement | null>(null),
    "Chính sách giao nhận": useRef<HTMLDivElement | null>(null),
    "Chính sách hủy": useRef<HTMLDivElement | null>(null),
    "Chính sách bảo lưu": useRef<HTMLDivElement | null>(null),
    "Chính sách bảo mật thông tin": useRef<HTMLDivElement | null>(null),
    "Chính sách tiếp thị liên kết": useRef<HTMLDivElement | null>(null),
    "Chính sách thành viên": useRef<HTMLDivElement | null>(null),
    "Hướng dẫn đặt chỗ": useRef<HTMLDivElement | null>(null),
  };

  return (
    <SectionContext.Provider value={sectionRefs}>
      {children}
    </SectionContext.Provider>
  );
};

// 4️⃣ Hook để sử dụng
export const useSectionRefs = (): SectionRefs => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSectionRefs must be used within a SectionProvider");
  }
  return context;
};

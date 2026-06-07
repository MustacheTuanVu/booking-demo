"use client";
import React, { useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "@/context/AppContext";

interface CategoriesProps {
  sectionRefs: { [key: string]: React.RefObject<HTMLElement> };
  onItemClick?: () => void;
}

export default function Categories({ sectionRefs, onItemClick }: CategoriesProps) {
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const isHome = pathname === "/";
  const { userInfo } = useContext(AppContext);

  const categories = [
    { id: 1, name: "Lịch biểu diễn", link: "Lịch biểu diễn" },
    { id: 2, name: "Sự kiện tuần tới", link: "Sự kiện tuần tới" },
  ];

  const handleClick = (section: string) => {
    if (isHome) {
      // Ở trang chủ, cuộn đến section
      const sectionElement = document.getElementById(section);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.error("Element not found:", section);
      }
    } else {
      // Nếu không ở trang chủ, chuyển hướng về home và lưu trạng thái
      localStorage.setItem("scrollToSection", section);
      router.push("/");
    }

    if (onItemClick) {
      onItemClick(); // Đóng menu mobile nếu prop được truyền vào
    }
  };

  React.useEffect(() => {
    // Kiểm tra nếu có section cần cuộn khi trang vừa tải
    const section = localStorage.getItem("scrollToSection");
    if (section) {
      localStorage.removeItem("scrollToSection");
      setTimeout(() => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Đợi một chút để đảm bảo DOM đã render xong
    }
  }, []);

  return (
    <>
      {categories.map((item) => (
        <React.Fragment key={item.id}>
          <div className="relative group">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleClick(item.link);
              }}
              className="cursor-pointer flex items-center lg:px-1 lg:py-2 px-3 py-2 text-base font-medium text-gray-800 hover:text-gold-600 transition-colors relative whitespace-nowrap"
            >
              <span>{item.name}</span>
            </a>
          </div>
          <div
            className="hidden lg:block mx-2 h-5 w-px bg-gradient-to-b from-transparent via-gray-300/60 to-transparent"
            aria-hidden="true"
          ></div>
        </React.Fragment>
      ))}

      {/* Admin Navigation Item - Visible for ADMIN and BOSS on desktop only */}
      {userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS') && (
        <React.Fragment>
          <div className="relative group hidden md:block">
            <Link
              href="/dashboard/event-list"
              onClick={onItemClick}
              className="cursor-pointer flex items-center lg:px-1 lg:py-2 px-3 py-2 text-base font-medium text-gray-800 hover:text-gold-600 transition-colors relative whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faLandmark} className="mr-2" />
              <span>Admin</span>
            </Link>
          </div>
          <div
            className="hidden lg:block mx-2 h-5 w-px bg-gradient-to-b from-transparent via-gray-300/60 to-transparent"
            aria-hidden="true"
          ></div>
        </React.Fragment>
      )}
    </>
  );
}

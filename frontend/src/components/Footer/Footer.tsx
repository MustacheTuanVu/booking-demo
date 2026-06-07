'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot, faPhone, faClock } from '@fortawesome/free-solid-svg-icons';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

interface FooterLinkProps {
  href: string;
  label: string;
  onclick?: () => void;
}

// Component hiển thị danh sách link
const FooterLinks: React.FC<{ links: FooterLinkProps[], title: string, columns?: number }> = ({ links, title, columns = 1 }) => {
  if (columns === 1) {
    return (
      <div className="mb-6 md:mb-0">
        <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100 text-gray-900 uppercase">{title}</h3>
        <ul className="space-y-2.5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={link.onclick}
                className="text-sm text-gray-600 hover:text-gold-500 transition-colors inline-block py-1"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  // For multi-column layout
  const midpoint = Math.ceil(links.length / columns);
  const firstColumnLinks = links.slice(0, midpoint);
  const secondColumnLinks = links.slice(midpoint);

  return (
    <div className="mb-6 md:mb-0">
      <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100 text-gray-900 uppercase">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <ul className="space-y-2.5">
          {firstColumnLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={link.onclick}
                className="text-sm text-gray-600 hover:text-gold-500 transition-colors inline-block py-1"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="space-y-2.5 mt-2.5 md:mt-0">
          {secondColumnLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={link.onclick}
                className="text-sm text-gray-600 hover:text-gold-500 transition-colors inline-block py-1"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Social media links component
const SocialLinks = () => {
  // Define social links for consistent usage
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/queenacousticbmt',
      icon: <FaFacebookF className="h-4 w-4" />,
      color: 'hover:bg-[#1877F2] hover:border-[#1877F2]',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/queenacousticbmt/',
      icon: <FaInstagram className="h-4 w-4" />,
      color: 'hover:bg-[#E4405F] hover:border-[#E4405F]',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@queenacousticbmt',
      icon: <FaYoutube className="h-4 w-4" />,
      color: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@phongtraqueen.bmt',
      icon: <FaTiktok className="h-4 w-4" />,
      color: 'hover:bg-black hover:border-black',
    },
  ];

  return (
    <div className="flex items-center space-x-3 mt-6">
      {socialLinks.map((link) => (
        <Link
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className={`flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-600 transition-all duration-300 ${link.color} hover:text-white`}
        >
          {link.icon}
        </Link>
      ))}
    </div>
  );
};

const Footer = () => {
  const handleScroll = (section: string) => {
    localStorage.setItem("scrollToSection", section);
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.error("Element not found:", section);
    }
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            {/* Column 1: Logo and Business Info */}
            <div className="lg:col-span-3">
              <div className="flex items-center mb-4">
                <Image
                  src="/images/logo_queen.png"
                  alt="Queen Acoustic"
                  width={60}
                  height={60}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Queen Acoustic</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Nơi âm nhạc là ngôn ngữ kết nối</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700 font-medium">HKD GIẢI TRÍ QUEEN</p>
                <p className="text-sm text-gray-600">MST: 0306615730-002</p>
                <p className="text-sm text-gray-600">Sở KH và ĐT Tỉnh Đắk Lắk cấp ngày: 31/03/2025</p>
              </div>
              
              <SocialLinks />
            </div>

            {/* Column 2: Contact Information - now wider */}
            <div className="lg:col-span-4">
              <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100 text-gray-900">Thông Tin Liên Hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Địa chỉ:</p>
                    <Link 
                      href="https://maps.app.goo.gl/eRhPeLWjetAER1c87" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col text-sm text-gray-600 hover:text-gold-500 transition-colors"
                    >
                      <span>Tầng 1, 15 Lê Đại Cang</span>
                      <span>Phường Buôn Ma Thuột, Đắk Lắk</span>
                    </Link>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Hotline:</p>
                    <a 
                      href="tel:19005225"
                      className="text-sm text-gray-600 hover:text-gold-500 transition-colors"
                    >
                      1900 5225
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Email:</p>
                    <a 
                      href="mailto:queen.acoustic47@gmail.com"
                      className="text-sm text-gray-600 hover:text-gold-500 transition-colors"
                    >
                      queen.acoustic47@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Giờ mở cửa:</p>
                    <p className="text-sm text-gray-600">19:00 - 24:00 (Thứ 6 - Chủ Nhật)</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 3: Điều khoản và chính sách */}
            <div className="lg:col-span-5">
              <FooterLinks
                title="Điều khoản và chính sách"
                columns={2}
                links={[
                  { href: '/chinh-sach#dat-cho-va-thanh-toan', label: 'Chính sách đặt chỗ và thanh toán', onclick: () => {} },
                  { href: '/chinh-sach#xu-ly-khieu-nai', label: 'Chính sách xử lý khiếu nại', onclick: () => {} },
                  { href: '/chinh-sach#giao-nhan', label: 'Chính sách giao nhận', onclick: () => {} },
                  { href: '/chinh-sach#huy', label: 'Chính sách hủy', onclick: () => {} },
                  { href: '/chinh-sach#bao-luu', label: 'Chính sách bảo lưu', onclick: () => {} },
                  { href: '/chinh-sach#bao-mat-thong-tin', label: 'Chính sách bảo mật thông tin', onclick: () => {} },
                  { href: '/chinh-sach#tiep-thi-lien-ket', label: 'Chính sách tiếp thị liên kết', onclick: () => {} },
                  { href: '/chinh-sach#thanh-vien', label: 'Chính sách thành viên', onclick: () => {} },
                  { href: '/chinh-sach#huong-dan-dat-cho', label: 'Hướng dẫn đặt chỗ', onclick: () => {} },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Copyright and Terms */}
        <div className="border-t border-gray-100 py-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-3 sm:mb-0">© {currentYear} Queen Acoustic. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
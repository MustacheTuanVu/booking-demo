'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaChevronRight, FaBookOpen, FaPrint, FaHandshake } from 'react-icons/fa';
import { BsFileText, BsShieldCheck, BsInfoCircle } from 'react-icons/bs';

// Add icons to policy categories with index signature for TypeScript
const policyIcons: { [key: string]: React.ReactNode } = {
  'dat-cho-va-thanh-toan': <BsFileText className="w-5 h-5" />,
  'xu-ly-khieu-nai': <BsInfoCircle className="w-5 h-5" />,
  'giao-nhan': <FaBookOpen className="w-5 h-5" />,
  'huy': <BsFileText className="w-5 h-5" />,
  'bao-luu': <BsFileText className="w-5 h-5" />,
  'bao-mat-thong-tin': <BsShieldCheck className="w-5 h-5" />,
  'tiep-thi-lien-ket': <FaHandshake className="w-5 h-5" />,
  'thanh-vien': <BsFileText className="w-5 h-5" />,
  'huong-dan-dat-cho': <FaBookOpen className="w-5 h-5" />,
};

// Update the policies content to use larger headers, improved spacing and clearer structure
const policies = [
  {
    id: 'dat-cho-va-thanh-toan',
    title: 'Chính sách đặt chỗ và thanh toán',
    content: `
      <p class="mb-5 text-gray-600">Queen Acoustic cung cấp dịch vụ đặt chỗ trực tuyến với các chính sách sau:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Quy trình đặt chỗ</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Khách hàng có thể đặt chỗ thông qua website hoặc hotline 1900 5225.</li>
        <li>Đặt chỗ chỉ được xác nhận sau khi thanh toán đặt cọc thành công.</li>
        <li>Mỗi đặt chỗ có hiệu lực cho một ngày và sự kiện cụ thể.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Phương thức thanh toán</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Thanh toán online qua thẻ ngân hàng, ví điện tử hoặc chuyển khoản.</li>
        <li>Thanh toán số tiền còn lại trực tiếp tại quầy.</li>
      </ul>
    `
  },
  {
    id: 'xu-ly-khieu-nai',
    title: 'Chính sách xử lý khiếu nại',
    content: `
      <p class="mb-5 text-gray-600">Queen Acoustic cam kết giải quyết mọi khiếu nại của khách hàng một cách nhanh chóng và hiệu quả.</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Quy trình khiếu nại</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Khách hàng có thể gửi khiếu nại qua email: queen.acoustic47@gmail.com hoặc hotline: 1900 5225.</li>
        <li>Chúng tôi cam kết phản hồi khiếu nại trong vòng 24 giờ làm việc.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Giải quyết khiếu nại</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Mọi khiếu nại sẽ được xem xét và giải quyết trong vòng 7 ngày làm việc.</li>
        <li>Trường hợp đặc biệt có thể kéo dài thêm nhưng không quá 15 ngày.</li>
      </ul>
    `
  },
  {
    id: 'giao-nhan',
    title: 'Chính sách giao nhận',
    content: `
      <p class="mb-5 text-gray-600">Quy định về việc gửi vé điện tử và xác nhận đặt chỗ:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Thời gian gửi vé</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Vé điện tử sẽ được gửi ngay sau khi thanh toán thành công.</li>
        <li>Email xác nhận kèm mã QR được gửi trong vòng 5 phút.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Kiểm tra thông tin</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Khách hàng cần kiểm tra kỹ thông tin vé điện tử và liên hệ ngay nếu có sai sót.</li>
        <li>Vé điện tử có giá trị như vé giấy và cần được xuất trình khi check-in.</li>
      </ul>
    `
  },
  {
    id: 'huy',
    title: 'Chính sách hủy',
    content: `
      <p class="mb-5 text-gray-600">Quy định về việc hủy đặt chỗ và hoàn tiền:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Điều kiện hủy</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Hủy trước 48 giờ so với thời gian sự kiện: hoàn tiền 90% giá trị đặt cọc.</li>
        <li>Hủy trong vòng 24-48 giờ: hoàn tiền 50% giá trị đặt cọc.</li>
        <li>Hủy trong vòng 24 giờ: không hoàn tiền.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Quy trình hủy và hoàn tiền</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Gửi yêu cầu hủy qua email hoặc hotline.</li>
        <li>Hoàn tiền trong vòng 7-14 ngày làm việc tùy theo phương thức thanh toán.</li>
      </ul>
    `
  },
  {
    id: 'bao-luu',
    title: 'Chính sách bảo lưu',
    content: `
      <p class="mb-5 text-gray-600">Quy định về việc bảo lưu vé và đổi ngày:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Điều kiện bảo lưu</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Khách hàng có thể yêu cầu bảo lưu vé trước 48 giờ so với thời gian sự kiện.</li>
        <li>Vé được bảo lưu có hiệu lực trong vòng 30 ngày kể từ ngày sự kiện ban đầu.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Quy trình bảo lưu</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Liên hệ với hotline hoặc email để được hướng dẫn.</li>
        <li>Mỗi vé chỉ được bảo lưu một lần duy nhất.</li>
      </ul>
    `
  },
  {
    id: 'bao-mat-thong-tin',
    title: 'Chính sách bảo mật thông tin',
    content: `
      <p class="mb-5 text-gray-600">Queen Acoustic cam kết bảo vệ thông tin cá nhân của khách hàng:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Thu thập thông tin</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Chúng tôi chỉ thu thập những thông tin cần thiết cho việc đặt chỗ, quản lý tài khoản và thanh toán.</li>
        <li>Thông tin cá nhân bao gồm: tên, số điện thoại, email, mật khẩu và thông tin thanh toán.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Bảo mật và sử dụng thông tin</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Thông tin khách hàng được mã hóa và bảo vệ bằng các biện pháp an ninh hiện đại.</li>
        <li>Không chia sẻ thông tin với bên thứ ba trừ khi được sự đồng ý của khách hàng.</li>
      </ul>
    `
  },
  {
    id: 'tiep-thi-lien-ket',
    title: 'Chính sách tiếp thị liên kết',
    content: `
      <p class="mb-5 text-gray-600">Quy định về chương trình liên kết và giới thiệu:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Chương trình giới thiệu</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Khách hàng nhận ưu đãi khi giới thiệu bạn bè sử dụng dịch vụ của Queen Acoustic qua link tiếp thị liên kết của mình. </li>
        <li>Mỗi lượt giới thiệu sẽ được tích điểm tương đương 10% giá trị giao dịch thành công.</li>
        <li>Khách hàng có thể quy đổi điểm để nhận voucher giảm giá cho lần đặt chỗ tiếp theo hoặc các hình thức khác theo chính sách qui đổi của Queen Acoustic tại từng thời điểm.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Đối tác tiếp thị</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Chính sách ưu đãi đặc biệt sẽ được quyết định dựa tên tổng giá trị đơn hàng từ khách hàng do đối tác giới thiệu.</li>
        <li>Đăng ký làm đối tác tiếp thị <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=B-VnGAy_EkOl-fMbSfU8tkElbY0gQLVEvgxB_pxGubRUNUpJSUcwTFNMVVRISzlWQVJORkdFSU9WRyQlQCN0PWcu" target="_blank" rel="noopener noreferrer" class="text-gold-600 hover:text-gold-700 font-medium">Tại đây</a></li>
      </ul>
      <div class="mt-6 flex justify-start">
        <a href="https://www.queenacoustic.vn/affiliate" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 hover:bg-gold-200 text-gold-700 rounded-md transition-colors">
          <FaHandshake className="w-4 h-4" />
          <span>Tìm hiểu thêm về chính sách Affiliate của chúng tôi</span>
        </a>
      </div>
    `
  },
  {
    id: 'thanh-vien',
    title: 'Chính sách thành viên',
    content: `
      <p class="mb-5 text-gray-600">Quyền lợi và điều kiện tham gia chương trình thành viên:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Cấp bậc thành viên</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Thành viên Jack (J): sau 3 lần đặt chỗ thành công.</li>
        <li>Thành viên Queen (Q): sau 10 lần đặt chỗ thành công.</li>
        <li>Thành viên King (K): sau 20 lần đặt chỗ thành công.</li>
      </ul>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Quyền lợi thành viên</h3>
      <ul class="list-disc pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Thành viên Jack (J): giảm 5% giá đặt chỗ, ưu tiên đặt chỗ.</li>
        <li>Thành viên Queen (Q): giảm 10% giá đặt chỗ, ưu tiên bàn đẹp.</li>
        <li>Thành viên King (K): giảm 15% giá đặt chỗ, dịch vụ VIP, quà tặng đặc biệt.</li>
      </ul>
    `
  },
  {
    id: 'huong-dan-dat-cho',
    title: 'Hướng dẫn đặt chỗ',
    content: `
      <p class="mb-5 text-gray-600">Các bước đặt chỗ tại Queen Acoustic:</p>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">1. Đặt chỗ trực tuyến</h3>
      <ol class="list-decimal pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Truy cập website và chọn sự kiện muốn tham dự.</li>
        <li>Chọn ngày và số lượng khách.</li>
        <li>Chọn loại vé và vị trí ngồi (nếu có).</li>
        <li>Nhập thông tin cá nhân và phương thức thanh toán.</li>
        <li>Xác nhận đặt chỗ và hoàn tất thanh toán.</li>
      </ol>
      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-700">2. Đặt chỗ qua hotline</h3>
      <ol class="list-decimal pl-6 mb-6 space-y-2.5 text-gray-600">
        <li>Gọi số 1900 5225 trong giờ làm việc.</li>
        <li>Cung cấp thông tin sự kiện, ngày và số lượng khách.</li>
        <li>Nhận hướng dẫn thanh toán từ nhân viên.</li>
        <li>Hoàn tất thanh toán theo hướng dẫn.</li>
      </ol>
    `
  }
];

// Create a wrapper component that uses useSearchParams
const PolicyPageContent = () => {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  // Initialize refs for each policy section
  useEffect(() => {
    policies.forEach(policy => {
      sectionRefs.current[policy.id] = React.createRef<HTMLDivElement | null>();
    });
  }, []);

  // Handle initial navigation and URL hash changes
  useEffect(() => {
    const section = searchParams.get('section');
    
    if (section) {
      setActiveSection(section);
      
      // Scroll to the selected section with a small delay to ensure refs are set
      setTimeout(() => {
        if (sectionRefs.current[section]?.current) {
          sectionRefs.current[section].current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    } else if (policies.length > 0) {
      // Default to first policy if no section specified
      setActiveSection(policies[0].id);
    }
  }, [searchParams]);

  // Handle direct URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && policies.some(policy => policy.id === hash)) {
        setActiveSection(hash);
        
        setTimeout(() => {
          if (sectionRefs.current[hash]?.current) {
            sectionRefs.current[hash].current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 300);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Check for hash in initial URL
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Add IntersectionObserver to update active section while scrolling
  useEffect(() => {
    if (typeof window !== 'undefined' && window.IntersectionObserver) {
      const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
      };

      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && id !== activeSection) {
              setActiveSection(id);
              // Update URL without causing a scroll jump
              window.history.replaceState(null, '', `#${id}`);
            }
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);
      
      // Observe all section elements
      Object.entries(sectionRefs.current).forEach(([id, ref]) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [activeSection]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb navigation */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <nav className="flex text-sm text-gray-500">
          <a href="/" className="hover:text-gold-500 transition-colors">Trang chủ</a>
          <span className="mx-2"><FaChevronRight className="w-3 h-3 mt-1" /></span>
          <span className="text-gray-700 font-medium">Chính sách & Điều khoản</span>
        </nav>
        
        {/* Print button */}
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600 transition-colors"
          aria-label="In trang này"
        >
          <FaPrint className="w-4 h-4" />
          <span>In trang</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar navigation - enhanced with icons and better styling */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 lg:self-start print:hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-gold-200 flex items-center">
              <BsFileText className="mr-2 text-gold-500" />
              Chính sách & Điều khoản
            </h2>
            <nav>
              <ul className="space-y-2">
                {policies.map(policy => (
                  <li key={policy.id}>
                    <a 
                      href={`#${policy.id}`}
                      className={`flex items-center py-2.5 px-3 rounded text-sm transition-colors ${
                        activeSection === policy.id 
                          ? 'bg-gold-50 text-gold-600 font-medium shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSection(policy.id);
                        if (sectionRefs.current[policy.id]?.current) {
                          sectionRefs.current[policy.id].current?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }
                        // Update URL without full page reload
                        window.history.pushState({}, '', `#${policy.id}`);
                      }}
                    >
                      <span className={`mr-2 ${activeSection === policy.id ? 'text-gold-500' : 'text-gray-400'}`}>
                        {policyIcons[policy.id] || <BsFileText className="w-5 h-5" />}
                      </span>
                      {policy.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content - enhanced with better structure and visual elements */}
        <div className="w-full lg:w-3/4 print:w-full" ref={mainContentRef}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0">
            {/* Page header */}
            <div className="bg-gradient-to-r from-gold-50 to-white p-6 lg:p-8 border-b-2 border-gold-200 print:bg-none print:pt-0">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <Image
                    src="/images/logo_queen.png"
                    alt="Queen Acoustic"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Chính sách & Điều khoản
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Thông tin chi tiết về các chính sách và quy định của Queen Acoustic
                  </p>
                </div>
              </div>
            </div>

            {/* Print date and company info - only visible in print */}
            <div className="hidden print:block p-4 text-sm text-gray-500 border-b">
              <p>Queen Acoustic - Mã số kinh doanh: 0306615730-002</p>
              <p>Địa chỉ: Tầng 1, 15 Lê Đại Cang, P. Thành Công, Tp. Buôn Ma Thuột, Đắk Lắk</p>
              <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            {/* Policy sections */}
            <div className="p-6 lg:p-8">
              <div className="space-y-24">
                {policies.map((policy, index) => (
                  <section 
                    key={policy.id} 
                    id={policy.id}
                    ref={sectionRefs.current[policy.id]}
                    className="scroll-mt-24"
                  >
                    <div className={`bg-white rounded-lg transition-all ${activeSection === policy.id ? 'ring-1 ring-gold-100' : ''}`}>
                      {/* Section header with visual indicator */}
                      <div className={`flex items-center mb-6 py-2 ${
                        activeSection === policy.id ? 'text-gold-700' : 'text-gray-700'
                      }`}>
                        <span className="mr-3 bg-gray-50 p-2 rounded-full">
                          {policyIcons[policy.id] || <BsFileText className="w-5 h-5" />}
                        </span>
                        <h2 className="text-2xl font-bold">{policy.title}</h2>
                      </div>
                      
                      {/* Section content with enhanced styling */}
                      <div 
                        className="policy-content prose prose-headings:text-gray-800 prose-p:text-gray-600 max-w-none"
                        dangerouslySetInnerHTML={{ __html: policy.content }} 
                      />
                      
                      {/* Section divider except for last item */}
                      {index !== policies.length - 1 && (
                        <div className="mt-16 pt-4 border-b-2 border-dashed border-gray-100"></div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a loading fallback
const PolicyPageLoading = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse flex flex-col space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 h-96 bg-gray-200 rounded"></div>
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with suspense boundary
const PolicyPage = () => {
  return (
    <Suspense fallback={<PolicyPageLoading />}>
      <PolicyPageContent />
    </Suspense>
  );
};

export default PolicyPage; 
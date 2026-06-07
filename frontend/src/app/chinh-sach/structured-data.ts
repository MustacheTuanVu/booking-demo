const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chính sách & Điều khoản | Queen Acoustic',
  description: 'Tìm hiểu chi tiết về chính sách đặt chỗ, thanh toán, hủy, bảo lưu và các quy định khác của Queen Acoustic.',
  publisher: {
    '@type': 'Organization',
    name: 'Queen Acoustic',
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/images/logo_queen.png`
    }
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Chính sách đặt chỗ và thanh toán',
        url: 'https://queenacoustic.vn/chinh-sach#dat-cho-va-thanh-toan'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Chính sách xử lý khiếu nại',
        url: 'https://queenacoustic.vn/chinh-sach#xu-ly-khieu-nai'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Chính sách giao nhận',
        url: 'https://queenacoustic.vn/chinh-sach#giao-nhan'
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Chính sách hủy',
        url: 'https://queenacoustic.vn/chinh-sach#huy'
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Chính sách bảo lưu',
        url: 'https://queenacoustic.vn/chinh-sach#bao-luu'
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Chính sách bảo mật thông tin',
        url: 'https://queenacoustic.vn/chinh-sach#bao-mat-thong-tin'
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'Chính sách tiếp thị liên kết',
        url: 'https://queenacoustic.vn/chinh-sach#tiep-thi-lien-ket'
      },
      {
        '@type': 'ListItem',
        position: 8,
        name: 'Chính sách thành viên',
        url: 'https://queenacoustic.vn/chinh-sach#thanh-vien'
      },
      {
        '@type': 'ListItem',
        position: 9,
        name: 'Hướng dẫn đặt chỗ',
        url: 'https://queenacoustic.vn/chinh-sach#huong-dan-dat-cho'
      }
    ]
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: 'https://queenacoustic.vn'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Chính sách & Điều khoản',
        item: 'https://queenacoustic.vn/chinh-sach'
      }
    ]
  }
}; 

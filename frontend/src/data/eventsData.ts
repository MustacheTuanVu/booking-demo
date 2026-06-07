export interface Combo {
  type: string // Changed from 'J' | 'Q' | 'K' to string to support 'A', 'B', 'C', etc.
  name: string
  description: string // Will now contain only the freebies information
  price: number
  // Removed seatInfo field completely
}

export interface Event {
  id: number
  time: string
  title: string
  performer: string
  status: 'available' | 'limited' | 'full'
  genre: string
  banner: string
  date?: string
  description: string
  combos: Combo[]
}

export interface EventsData {
  [date: string]: Event[]
}

// Demo events data - one event per day with Vietnamese content
export const DEMO_EVENTS: EventsData = {
  '2025-03-10': [
    {
      id: 1,
      time: '19:30',
      title: 'Đêm Nhạc Acoustic',
      performer: 'Đen Vâu',
      status: 'available',
      genre: 'Acoustic',
      banner: './public/uploads/demo/events/this-week.jpg',
      description:
        'Đêm nhạc acoustic đặc biệt cùng Đen Vâu với những bản hit quen thuộc được phối lại theo phong cách đầy cảm xúc.',
      combos: [
        {
          type: 'A',
          name: 'Combo A',
          description: 'Bao gồm: 1 nước ngọt + 1 bánh mì kẹp',
          price: 350000,
        },
        {
          type: 'B',
          name: 'Combo B',
          description: 'Bao gồm: 1 cocktail + 1 đĩa finger food',
          price: 550000,
        },
        {
          type: 'C',
          name: 'Combo C',
          description: 'Bao gồm: 1 rượu vang + 1 đĩa tapas đặc biệt',
          price: 750000,
        },
      ],
    },
  ],
  '2025-03-11': [
    {
      id: 2,
      time: '20:00',
      title: 'Đêm Nhạc Trữ Tình',
      performer: 'Hoàng Yến Chibi',
      status: 'limited',
      genre: 'Trữ Tình',
      banner: './public/uploads/demo/events/this-week.jpg',
      description:
        'Một đêm nhạc đầy sâu lắng với những bản tình ca trữ tình đi cùng năm tháng, được thể hiện bởi giọng hát ngọt ngào của Hoàng Yến Chibi.',
      combos: [
        {
          type: 'A',
          name: 'Combo A',
          description: 'Bao gồm: 1 nước trái cây + 1 bánh cuộn',
          price: 300000,
        },
        {
          type: 'B',
          name: 'Combo B',
          description: 'Bao gồm: 1 mocktail + 1 phần bánh ngọt',
          price: 500000,
        },
        {
          type: 'C',
          name: 'Combo C',
          description: 'Bao gồm: 1 rượu sâm panh + 1 đĩa hoa quả tổng hợp',
          price: 700000,
        },
      ],
    },
  ],
  '2025-03-12': [
    {
      id: 3,
      time: '19:00',
      title: 'Đêm Nhạc Pop Ballad',
      performer: 'Sơn Tùng MT-P',
      status: 'limited',
      genre: 'Pop',
      banner: './public/uploads/demo/events/this-week.jpg',
      description:
        'Sơn Tùng MT-P sẽ mang đến những ca khúc hit đình đám và những bản ballad da diết nhất trong sự nghiệp của mình.',
      combos: [
        {
          type: 'A',
          name: 'Combo A',
          description: 'Bao gồm: 1 sinh tố + 1 bánh quy',
          price: 450000,
        },
        {
          type: 'B',
          name: 'Combo B',
          description: 'Bao gồm: 1 cocktail cao cấp + 1 đĩa canapé',
          price: 650000,
        },
        {
          type: 'C',
          name: 'Combo C',
          description: 'Bao gồm: 1 whiskey + 1 đĩa hải sản tổng hợp',
          price: 950000,
        },
      ],
    },
  ],
  '2025-03-13': [
    {
      id: 4,
      time: '20:30',
      title: 'Đêm Nhạc Hip Hop',
      performer: 'HIEUTHUHAI',
      status: 'available',
      genre: 'Hip Hop',
      banner: './public/uploads/demo/events/this-week.jpg',
      description:
        'HIEUTHUHAI sẽ khuấy động không khí với những bản rap sôi động và đầy năng lượng, hứa hẹn một đêm bùng cháy cùng âm nhạc.',
      combos: [
        {
          type: 'A',
          name: 'Combo A',
          description: 'Bao gồm: 1 bia + 1 phần snack',
          price: 400000,
        },
        {
          type: 'B',
          name: 'Combo B',
          description: 'Bao gồm: 1 cocktail + 1 phần gà rán',
          price: 600000,
        },
        {
          type: 'C',
          name: 'Combo C',
          description: 'Bao gồm: 1 rượu mạnh + 1 đĩa BBQ mini',
          price: 850000,
        },
      ],
    },
  ],
  '2025-03-15': [
    {
      id: 5,
      time: '19:00',
      title: 'Đêm Nhạc Rap Việt',
      performer: 'Đen Vâu',
      status: 'available',
      genre: 'Rap',
      banner: './public/uploads/demo/events/this-week.jpg',
      description:
        'Đen Vâu trở lại với đêm nhạc rap đặc sắc, mang đến những bản hit mới nhất cùng phong cách độc đáo của anh.',
      combos: [
        {
          type: 'A',
          name: 'Combo A',
          description: 'Bao gồm: 1 nước ngọt + 1 phần bánh mì',
          price: 380000,
        },
        {
          type: 'B',
          name: 'Combo B',
          description: 'Bao gồm: 1 cocktail + 1 đĩa khoai tây chiên',
          price: 580000,
        },
        {
          type: 'C',
          name: 'Combo C',
          description: 'Bao gồm: 1 rượu vang + 1 set tapas nhỏ',
          price: 780000,
        },
        // Adding more combos to test the layout with many options
        {
          type: 'D',
          name: 'Combo D (Đặc biệt)',
          description: 'Bao gồm: 2 nước ngọt + 2 phần bánh mì + 1 món tráng miệng',
          price: 450000,
        },
        {
          type: 'E',
          name: 'Combo E (Premium)',
          description: 'Bao gồm: 2 cocktail + 1 đĩa khoai tây + 1 món tráng miệng',
          price: 650000,
        },
        {
          type: 'F',
          name: 'Combo F (VIP)',
          description: 'Bao gồm: 1 chai rượu vang + 1 set tapas lớn + 1 món tráng miệng',
          price: 950000,
        },
      ],
    },
  ],
}

// Featured artists data with updated performances array to include the new date
export const FEATURED_ARTISTS = [
  {
    id: 1,
    name: 'Đen Vâu',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-10', '2025-03-15'],
  },
  {
    id: 2,
    name: 'Hoàng Yến Chibi',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-11'],
  },
  {
    id: 3,
    name: 'Sơn Tùng MT-P',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-12'],
  },
  {
    id: 4,
    name: 'HIEUTHUHAI',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-13'],
  },
]

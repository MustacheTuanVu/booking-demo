export interface Drink {
  name: string
  ingredients: string
  tastes: string[]
  description: string
  image: string
  category:
    | 'Cocktail'
    | 'Mocktail'
    | 'Beer'
    | 'Spirits'
    | 'Wine'
    | 'Healthy Drinks'
    | 'Soft Drink'
    | 'Food'
  price: number
}

export const drinks: Drink[] = [
  // ----------------- COCKTAIL -----------------
  {
    name: 'Classic Margarita',
    ingredients: 'Tequila, Triple Sec, Nước cốt chanh, Muối',
    tastes: ['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-pink-400'],
    description: 'Một loại cocktail kinh điển với sự cân bằng hoàn hảo giữa tequila và chanh.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Cocktail',
    price: 120000,
  },
  {
    name: 'Tropical Sunrise Cocktail',
    ingredients: 'Vodka, Nước cam, Grenadine, Nước dứa',
    tastes: ['bg-orange-400', 'bg-red-400', 'bg-yellow-400', 'bg-blue-200'],
    description: 'Một loại cocktail sặc sỡ với hương vị nhiệt đới và sắc màu bình minh tuyệt đẹp.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Cocktail',
    price: 130000,
  },
  {
    name: 'Berry Blast Martini',
    ingredients: 'Gin, Hỗn hợp quả mọng, Vermouth, Nước cốt chanh',
    tastes: ['bg-purple-400', 'bg-red-400', 'bg-pink-400', 'bg-white'],
    description: 'Một chiếc martini sang trọng và đầy hương vị quả mọng.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Cocktail',
    price: 140000,
  },
  // ----------------- MOCKTAIL -----------------
  {
    name: 'Virgin Mojito',
    ingredients: 'Bạc hà, Chanh, Nước soda, Đường',
    tastes: ['bg-green-500', 'bg-white', 'bg-green-400', 'bg-blue-300'],
    description: 'Một loại mocktail tươi mát với hương vị bạc hà và chanh.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Mocktail',
    price: 80000,
  },
  {
    name: 'Sunset Cooler',
    ingredients: 'Đào, Chanh, Nước khoáng có ga, Mật ong',
    tastes: ['bg-orange-300', 'bg-pink-300', 'bg-yellow-300', 'bg-purple-300'],
    description: 'Một loại mocktail dễ chịu với sắc màu của hoàng hôn.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Mocktail',
    price: 85000,
  },
  {
    name: 'Cucumber Fizz',
    ingredients: 'Dưa leo, Chanh, Bạc hà, Soda',
    tastes: ['bg-green-300', 'bg-blue-300', 'bg-white', 'bg-green-400'],
    description: 'Một loại mocktail tươi mát và sảng khoái, lý tưởng cho những ngày hè.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Mocktail',
    price: 80000,
  },
  // ----------------- BEER -----------------
  {
    name: 'Craft Beer',
    ingredients: 'Hoa bia, Mạch nha, Men, Nước',
    tastes: ['bg-yellow-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'],
    description: 'Một loại bia thủ công mát lạnh, sảng khoái, hoàn hảo cho mọi dịp.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Beer',
    price: 50000,
  },
  {
    name: 'Lager Delight',
    ingredients: 'Lúa mạch, Hoa bia, Men, Nước',
    tastes: ['bg-yellow-400', 'bg-blue-400', 'bg-white', 'bg-gray-400'],
    description: 'Một loại lager mượt mà với hậu vị nhẹ nhàng và sảng khoái.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Beer',
    price: 55000,
  },
  {
    name: 'Stout Supreme',
    ingredients: 'Lúa mạch rang, Hoa bia, Men, Nước',
    tastes: ['bg-black', 'bg-gray-800', 'bg-red-500', 'bg-yellow-600'],
    description: 'Một loại stout đậm đà với hương vị sâu sắc và phong phú.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Beer',
    price: 60000,
  },
  // ----------------- SPIRITS -----------------
  {
    name: 'Whiskey Barrel',
    ingredients: 'Rượu whiskey, Gỗ sồi, Than củi',
    tastes: ['bg-brown-500', 'bg-yellow-600', 'bg-gray-500', 'bg-red-500'],
    description: 'Mượt mà và táo bạo, được ủ trong thùng gỗ sồi cho hương vị phong phú.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Spirits',
    price: 150000,
  },
  {
    name: 'Vodka Infusion',
    ingredients: 'Vodka, Cam quýt, Thảo mộc',
    tastes: ['bg-white', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400'],
    description: 'Một loại vodka pha trộn mượt mà với hương vị cam quýt và thảo mộc.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Spirits',
    price: 130000,
  },
  {
    name: 'Rum Runner',
    ingredients: 'Rượu rum, Chuối, Dứa, Dừa',
    tastes: ['bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-red-500'],
    description: 'Một loại cocktail rượu rum nhiệt đới với hương vị táo bạo và phiêu lưu.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Spirits',
    price: 125000,
  },
  // ----------------- WINE -----------------
  {
    name: 'Red Wine',
    ingredients: 'Nho, Men, Gỗ sồi, Thời gian',
    tastes: ['bg-red-600', 'bg-purple-600', 'bg-pink-600', 'bg-indigo-600'],
    description: 'Một loại rượu vang đỏ giàu hương vị và mượt mà, hoàn hảo cho bữa tối.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Wine',
    price: 200000,
  },
  {
    name: 'White Wine',
    ingredients: 'Nho, Men, Gỗ sồi, Thời gian',
    tastes: ['bg-white', 'bg-yellow-300', 'bg-blue-300', 'bg-green-300'],
    description: 'Một loại rượu vang trắng mát lạnh và sảng khoái, lý tưởng cho những bữa ăn nhẹ.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Wine',
    price: 210000,
  },
  {
    name: 'Rose Wine',
    ingredients: 'Nho, Men, Gỗ sồi, Thời gian',
    tastes: ['bg-pink-300', 'bg-red-300', 'bg-purple-300', 'bg-white'],
    description: 'Một loại rượu rosé tinh tế và thơm ngon, hoàn hảo cho một buổi tối mùa hè.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Wine',
    price: 220000,
  },
  // ----------------- HEALTHY DRINKS -----------------
  {
    name: 'Green Smoothie',
    ingredients: 'Rau bina, Cải xoăn, Táo, Chuối',
    tastes: ['bg-green-400', 'bg-green-500', 'bg-blue-300', 'bg-white'],
    description: 'Một thức uống lành mạnh, bổ dưỡng và tươi mát, giàu vitamin.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Healthy Drinks',
    price: 70000,
  },
  {
    name: 'Berry Blast Smoothie',
    ingredients: 'Dâu tây, Việt quất, Sữa chua, Mật ong',
    tastes: ['bg-red-300', 'bg-blue-300', 'bg-purple-300', 'bg-white'],
    description: 'Một ly sinh tố giàu dinh dưỡng với hương vị quả mọng tươi mát.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Healthy Drinks',
    price: 75000,
  },
  {
    name: 'Tropical Detox',
    ingredients: 'Dứa, Nước dừa, Rau bina, Gừng',
    tastes: ['bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-white'],
    description: 'Một thức uống thanh lọc cơ thể với hương vị nhiệt đới và chút cay nồng.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Healthy Drinks',
    price: 80000,
  },
  // ----------------- SOFT DRINK -----------------
  {
    name: 'Cola Soda',
    ingredients: 'Nước có ga, Đường, Hương liệu',
    tastes: ['bg-gray-400', 'bg-black', 'bg-red-600', 'bg-yellow-500'],
    description: 'Một loại nước giải khát cổ điển, tràn đầy sự sảng khoái và ngọt ngào.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Soft Drink',
    price: 30000,
  },
  {
    name: 'Lemonade Fizz',
    ingredients: 'Chanh, Nước có ga, Đường, Đá',
    tastes: ['bg-yellow-300', 'bg-blue-300', 'bg-white', 'bg-green-300'],
    description: 'Một loại nước giải khát sủi bọt với hương vị chua ngọt hài hòa.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Soft Drink',
    price: 35000,
  },
  {
    name: 'Ginger Ale',
    ingredients: 'Gừng, Nước có ga, Đường, Chanh',
    tastes: ['bg-orange-300', 'bg-yellow-300', 'bg-white', 'bg-gray-300'],
    description: 'Một loại nước giải khát giòn tan với chút cay nồng và hậu vị sảng khoái.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Soft Drink',
    price: 32000,
  },
  // ----------------- FOOD -----------------
  {
    name: 'Cheeseburger',
    ingredients: 'Thịt bò, Phô mai, Xà lách, Cà chua, Bánh mì',
    tastes: ['bg-yellow-500', 'bg-red-500', 'bg-orange-500', 'bg-gray-500'],
    description: 'Một chiếc cheeseburger ngon miệng, hoàn hảo cho một bữa ăn no đủ.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Food',
    price: 90000,
  },
  {
    name: 'Pepperoni Pizza',
    ingredients: 'Bột mì, Sốt cà chua, Phô mai, Xúc xích pepperoni',
    tastes: ['bg-red-500', 'bg-yellow-500', 'bg-orange-500', 'bg-green-500'],
    description: 'Một chiếc pizza ngon miệng, đầy ắp xúc xích pepperoni và phô mai tan chảy.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Food',
    price: 100000,
  },
  {
    name: 'Veggie Wrap',
    ingredients: 'Xà lách, Cà chua, Dưa leo, Hummus, Bánh tortilla',
    tastes: ['bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-white'],
    description: 'Một món wrap lành mạnh và ngon miệng, đầy rau củ tươi và hummus mịn màng.',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
    category: 'Food',
    price: 85000,
  },
]

export const categoryPosters: Record<string, { title: string; image: string }> = {
  Cocktail: {
    title: 'Cocktail',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  Mocktail: {
    title: 'Mocktail',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  Beer: {
    title: 'Beer',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  Spirits: {
    title: 'Spirits',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  Wine: {
    title: 'Wine',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  'Healthy Drinks': {
    title: 'Healthy Drinks',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  'Soft Drink': {
    title: 'Soft Drink',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
  Food: {
    title: 'Food',
    image: './public/uploads/demo/menu/cocktail-pair.jpg',
  },
}

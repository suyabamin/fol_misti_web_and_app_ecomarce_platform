import { Product, Category, Coupon, Banner, DeliveryArea, StoreSettings } from '../models';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'fruits',
    name: 'Fresh Fruits',
    nameBn: 'তাজা ফল',
    slug: 'fruits',
    description: 'দেশের সেরা বাগান থেকে সংগৃহীত বিষমুক্ত টাটকা মৌসুমি ফল।',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'sweets',
    name: 'Bengali Sweets',
    nameBn: 'ঐতিহ্যবাহী মিষ্টি',
    slug: 'sweets',
    description: 'খাঁটি ছানা ও গাভীর দুধে তৈরি বাংলার শতবর্ষী ঐতিহ্যের সুস্বাদু মিষ্টি।',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'mango-collection',
    name: 'Mango Specials',
    nameBn: 'আমের মেলা',
    slug: 'mango-specials',
    description: 'রাজশাহী ও চাঁপাইনবাবগঞ্জের বিশ্ববিখ্যাত রসালো মিষ্টি আম।',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'sweet-boxes',
    name: 'Celebration Boxes',
    nameBn: 'উপহার ও মিস্টি বক্স',
    slug: 'celebration-boxes',
    description: 'বিয়ে, জন্মদিন ও উৎসবে প্রিয়জনের জন্য স্পেশাল মিষ্টি উপহারের প্যাক।',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    sortOrder: 4,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-mango-1',
    name: 'Rajshahi Himsagar Mango',
    nameBn: 'রাজশাহীর সেরা হিমসাগর আম',
    slug: 'rajshahi-himsagar-mango',
    category: 'fruits',
    unit: 'প্রতি কেজি',
    price: 140,
    discountPrice: 120,
    stock: 250,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'রাজশাহীর বাগান থেকে সরাসরি তোড়া রাসায়নিকমুক্ত ও অত্যন্ত মিষ্টি হিমসাগর আম। পাতলা চামড়া ও আঁশবিহীন নরম আঁটি।',
    descriptionBn: 'রাজশাহীর বাগান থেকে সরাসরি তোড়া রাসায়নিকমুক্ত ও অত্যন্ত মিষ্টি হিমসাগর আম। ১০০% ফরমালিন মুক্ত।',
    isFeatured: true,
    isSeasonal: true,
    seasonType: 'mango',
    rating: 4.9,
    reviewCount: 38,
    isActive: true
  },
  {
    id: 'prod-mango-2',
    name: 'Amrapali Premium Mango',
    nameBn: 'প্রিমিয়াম আম্রপালি আম',
    slug: 'amrapali-premium-mango',
    category: 'fruits',
    unit: 'প্রতি কেজি',
    price: 130,
    discountPrice: 110,
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',
    description: 'নওগাঁর প্রসিদ্ধ আম্রপালি আম। তীব্র মিষ্টি গন্ধ ও চমৎকার স্বাদযুক্ত।',
    descriptionBn: 'নওগাঁর প্রসিদ্ধ আম্রপালি আম। তীব্র মিষ্টি গন্ধ ও গাঢ় কমলা রঙের সুস্বাদু রসালো শাঁস।',
    isFeatured: true,
    isSeasonal: true,
    seasonType: 'mango',
    rating: 4.8,
    reviewCount: 24,
    isActive: true
  },
  {
    id: 'prod-lychee-1',
    name: 'Dinajpur Bedana Lychee',
    nameBn: 'দিনাজপুরের বেদানা লিচু',
    slug: 'dinajpur-bedana-lychee',
    category: 'fruits',
    unit: 'প্রতি ১০০ পিস',
    price: 750,
    discountPrice: 680,
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=800&q=80',
    description: 'দিনাজপুরের বিখ্যাত রসালো বেদানা লিচু। ছোট আঁটি ও মিষ্টি রসালো শাঁস।',
    descriptionBn: 'দিনাজপুরের ঐতিহ্যবাহী বেদানা লিচু। মিষ্টি রসের ভরপুর ও অত্যন্ত তাজা।',
    isFeatured: true,
    isSeasonal: true,
    seasonType: 'lychee',
    rating: 5.0,
    reviewCount: 19,
    isActive: true
  },
  {
    id: 'prod-sweet-1',
    name: 'Spongy Traditional Roshogolla',
    nameBn: 'ঐতিহ্যবাহী নরম স্পঞ্জ রসগোল্লা',
    slug: 'spongy-traditional-roshogolla',
    category: 'sweets',
    unit: 'প্রতি কেজি (১৬-১৮ পিস)',
    price: 450,
    discountPrice: 390,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    description: 'খাঁটি ছানায় তৈরি ধবধবে সাদা ও নরম রসে টইটম্বুর আসল স্পঞ্জ রসগোল্লা। মুখে দিলেই মিলিয়ে যায়।',
    descriptionBn: 'খাঁটি গরুর দুধের ছানা দিয়ে তৈরি তুলতুলে নরম ও রসে ভরা রসগোল্লা। কোনো প্রকার কৃত্রিম ফ্লেভার নেই।',
    isFeatured: true,
    isSeasonal: false,
    rating: 4.9,
    reviewCount: 42,
    isActive: true
  },
  {
    id: 'prod-sweet-2',
    name: 'Porabari Chomchom',
    nameBn: 'টাঙ্গাইলের পোড়াবাড়ির চমচম',
    slug: 'porabari-chomchom',
    category: 'sweets',
    unit: 'প্রতি কেজি',
    price: 520,
    discountPrice: 480,
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    description: 'টাঙ্গাইলের শত বছরের ঐতিহ্যবাহী পোড়াবাড়ির মাখনের মতো নরম ও মাওয়া জড়ানো চমচম।',
    descriptionBn: 'টাঙ্গাইলের শত বছরের ঐতিহ্যবাহী পোড়াবাড়ির খাঁটি মাওয়া জড়ানো লালচে সুস্বাদু চমচম।',
    isFeatured: true,
    isSeasonal: false,
    rating: 4.8,
    reviewCount: 31,
    isActive: true
  },
  {
    id: 'prod-sweet-3',
    name: 'Bogra Special Mishti Doi',
    nameBn: 'বগুড়ার স্পেশাল ঐতিহ্যবাহী মিষ্টি দই',
    slug: 'bogra-special-mishti-doi',
    category: 'sweets',
    unit: 'মাটির সরা (১ কেজি)',
    price: 360,
    discountPrice: 320,
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80',
    description: 'বগুড়ার খাঁটি মাটির সরায় জমাকৃত সুস্বাদু লালচে মিষ্টি দই। ঘন দুধের স্বাদ ও অতুলনীয় ঘ্রাণ।',
    descriptionBn: 'বগুড়ার আদি কারিগরদের তৈরি খাঁটি সর পড়া মাটির পাত্রের মিষ্টি দই।',
    isFeatured: true,
    isSeasonal: false,
    rating: 4.9,
    reviewCount: 56,
    isActive: true
  },
  {
    id: 'prod-sweet-4',
    name: 'Kashmiri Malai Gulab Jamun',
    nameBn: 'রসালো মালাই কালোজাম',
    slug: 'kashmiri-malai-gulab-jamun',
    category: 'sweets',
    unit: 'প্রতি কেজি',
    price: 480,
    discountPrice: 430,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=800&q=80',
    description: 'নরম তুলতুলে গাঢ় বাদামী মিষ্টি রসের কালোজাম। উপরে হালকা ক্ষীরের পরশ।',
    descriptionBn: 'খাঁটি মাওয়া ও ছানায় সোনালী ভাজা রসালো কালোজাম মিষ্টি।',
    isFeatured: false,
    isSeasonal: false,
    rating: 4.7,
    reviewCount: 18,
    isActive: true
  },
  {
    id: 'prod-fruit-3',
    name: 'Fresh Dragon Fruit Red',
    nameBn: 'নাটোরের লাল ড্রাগন ফল',
    slug: 'fresh-dragon-fruit-red',
    category: 'fruits',
    unit: 'প্রতি কেজি',
    price: 380,
    discountPrice: 340,
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=800&q=80',
    description: 'নাটোরের উন্নত বাগানের সম্পূর্ণ অর্গানিক লাল শাঁসের ড্রাগন ফল। মিষ্টি ও স্বাস্থ্যকর।',
    descriptionBn: 'অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ ও ভিটামিনে ভরপুর নাটোরের বাগান থেকে তোলা ড্রাগন ফল।',
    isFeatured: false,
    isSeasonal: true,
    seasonType: 'general',
    rating: 4.8,
    reviewCount: 15,
    isActive: true
  },
  {
    id: 'prod-fruit-4',
    name: 'Sylhet Sweet Malta / Orange',
    nameBn: 'সিলেটের রসালো মিষ্টি মাল্টা',
    slug: 'sylhet-sweet-malta-orange',
    category: 'fruits',
    unit: 'প্রতি কেজি',
    price: 220,
    discountPrice: 195,
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
    description: 'পাহাড়ের তাজা সবুজ-হলুদ রঙের সুমিষ্ট মাল্টা। ভিটামিন-সি এর উৎকৃষ্ট প্রাকৃতিক উৎস।',
    descriptionBn: 'সিলেটের বাগানের বাছাই করা মিষ্টি ও অত্যন্ত রসালো দেশি মাল্টা।',
    isFeatured: true,
    isSeasonal: true,
    seasonType: 'orange',
    rating: 4.7,
    reviewCount: 22,
    isActive: true
  },
  {
    id: 'prod-fruit-5',
    name: 'Madhabpur Pineapples',
    nameBn: 'মধুপুরের পাহাড়ি জলডুগি আনারস',
    slug: 'madhabpur-pineapples',
    category: 'fruits',
    unit: 'প্রতি জোড়া (২ পিস)',
    price: 160,
    discountPrice: 140,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
    description: 'মধুপুরের সুস্বাদু পাহাড়ি জলডুগি জাতের আনারস। প্রাকৃতিক মিষ্টি ও রসাল।',
    descriptionBn: 'মধুপুরের পাহাড়ি বাগান থেকে বাছাই করা ফরমালিন মুক্ত মিষ্টি জলডুগি আনারস।',
    isFeatured: false,
    isSeasonal: true,
    seasonType: 'general',
    rating: 4.6,
    reviewCount: 12,
    isActive: true
  },
  {
    id: 'prod-sweet-5',
    name: 'Kachagolla Natore Special',
    nameBn: 'নাটোরের খাঁটি কাঁচাগোল্লা',
    slug: 'kachagolla-natore-special',
    category: 'sweets',
    unit: 'প্রতি কেজি',
    price: 580,
    discountPrice: 530,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    description: 'নাটোরের জিআই সনদপ্রাপ্ত বিশ্ববিখ্যাত কাঁচাগোল্লা। খাঁটি তাজা ছানা ও এলাচের সুঘ্রাণ।',
    descriptionBn: 'নাটোরের আসল ও খাঁটি ছানার সুস্বাদু কাঁচাগোল্লা। কোনো ময়দা বা কৃত্রিম উপাদান ছাড়া।',
    isFeatured: true,
    isSeasonal: false,
    rating: 5.0,
    reviewCount: 47,
    isActive: true
  },
  {
    id: 'prod-sweet-6',
    name: 'Royal Kheer Kadam',
    nameBn: 'রাজকীয় ক্ষীরকদম',
    slug: 'royal-kheer-kadam',
    category: 'sweets',
    unit: 'প্রতি কেজি',
    price: 560,
    discountPrice: 510,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=800&q=80',
    description: 'ভিতরে ছোট রসগোল্লা আর বাইরে ঘন দুধের ক্ষীরের স্তর। এক কামড়েই মন ভরবে।',
    descriptionBn: 'রাজকীয় স্বাদের ক্ষীরকদম। ভেতরে রসে ভরা মিষ্টি ও উপরে মাওয়ার মিষ্টি আস্তরণ।',
    isFeatured: false,
    isSeasonal: false,
    rating: 4.8,
    reviewCount: 20,
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'FOL20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 500,
    maxDiscount: 200,
    validFrom: '2026-01-01',
    validUntil: '2027-12-31',
    usageLimit: 1000,
    usageCount: 142,
    isActive: true
  },
  {
    id: 'c2',
    code: 'MISHTI100',
    type: 'fixed',
    value: 100,
    minOrderAmount: 800,
    validFrom: '2026-01-01',
    validUntil: '2027-12-31',
    usageLimit: 500,
    usageCount: 88,
    isActive: true
  },
  {
    id: 'c3',
    code: 'FREESHIP',
    type: 'fixed',
    value: 60,
    minOrderAmount: 1000,
    validFrom: '2026-01-01',
    validUntil: '2027-12-31',
    usageLimit: 500,
    usageCount: 35,
    isActive: true
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'তাজা ফল ও ঐতিহ্যবাহী মিষ্টি',
    subtitle: 'বাগানের ফরমালিনমুক্ত মৌসুমি ফল ও বাংলার খাঁটি মিষ্টিতে ঘরে আনুন আসল স্বাদ।',
    badgeText: '২০% পর্যন্ত বিশেষ ছাড়!',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/shop',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'b2',
    title: 'রাজশাহীর রসালো হিমসাগর আম',
    subtitle: 'গাছপাকা মিষ্টতার গ্যারান্টি সহ পৌঁছে দিচ্ছি আপনার দোরগোড়ায়।',
    badgeText: 'মৌসুমি সেরা অফার',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/fruits',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'b3',
    title: 'শতবর্ষী ঐতিহ্যের ছানার মিষ্টি',
    subtitle: 'বগুড়ার দই ও টাঙ্গাইলের পোড়াবাড়ির চমচম—প্রতিটি উৎসবে সেরা মিষ্টির সমাহার।',
    badgeText: '১০০% খাঁটি দুধের তৈরি',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/sweets',
    sortOrder: 3,
    isActive: true
  }
];

export const INITIAL_DELIVERY_AREAS: DeliveryArea[] = [
  {
    id: 'dhaka-north',
    name: 'Dhaka North (উত্তরা, মিরপুর, গুলশান, বনানী)',
    nameBn: 'ঢাকা উত্তর (উত্তরা, মিরপুর, গুলশান, বনানী)',
    fee: 60,
    estimatedHours: '১২-২৪ ঘণ্টা',
    isActive: true
  },
  {
    id: 'dhaka-south',
    name: 'Dhaka South (ধানমন্ডি, মতিঝিল, পুরান ঢাকা)',
    nameBn: 'ঢাকা দক্ষিণ (ধানমন্ডি, মতিঝিল, পুরান ঢাকা)',
    fee: 60,
    estimatedHours: '১২-২৪ ঘণ্টা',
    isActive: true
  },
  {
    id: 'sub-dhaka',
    name: 'Sub-Dhaka (সাভার, কেরানীগঞ্জ, টঙ্গী, গাজীপুর)',
    nameBn: 'ঢাকা উপশহর (সাভার, কেরানীগঞ্জ, টঙ্গী, গাজীপুর)',
    fee: 90,
    estimatedHours: '২৪-৩৬ ঘণ্টা',
    isActive: true
  },
  {
    id: 'outside-dhaka',
    name: 'All Over Bangladesh (অন্যান্য সকল জেলা)',
    nameBn: 'সমগ্র বাংলাদেশ (অন্যান্য জেলা শহর)',
    fee: 130,
    estimatedHours: '৪৮-৭২ ঘণ্টা',
    isActive: true
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'Fol Mishti',
  storeNameBn: 'ফল মিষ্টি',
  phone: '+880 1712-345678',
  email: 'support@folmishti.com',
  address: 'বাড়ি ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০',
  deliveryFeeInsideDhaka: 60,
  deliveryFeeOutsideDhaka: 130,
  freeDeliveryThreshold: 2000,
  isMaintenanceMode: false
};

export const INITIAL_DELIVERY_PROFILES = [
  {
    id: 'delivery-agent-1',
    uid: 'delivery-agent-1',
    name: 'মোঃ রফিকুল ইসলাম',
    phone: '+880 1812-345678',
    email: 'delivery@folmishti.com',
    status: 'active' as const,
    availability: 'available' as const,
    currentActiveDeliveries: 0,
    currentActiveOrderId: null,
    vehicleType: 'motorbike' as const,
    vehiclePlateNumber: 'ঢাকা মেট্রো-হ ১২-৩৪৫৬',
    totalCompletedDeliveries: 28,
    totalEarnedDeliveryCharge: 1680,
    totalPaidAmount: 1200,
    outstandingPayableAmount: 480,
    schedule: {
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '19:00',
      breakStartTime: '13:00',
      breakEndTime: '14:00',
      isLeaveToday: false,
      maxActiveDeliveries: 3
    },
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'delivery-agent-2',
    uid: 'delivery-agent-2',
    name: 'তানভীর আহমেদ',
    phone: '+880 1912-876543',
    email: 'tanvir@folmishti.com',
    status: 'active' as const,
    availability: 'available' as const,
    currentActiveDeliveries: 0,
    currentActiveOrderId: null,
    vehicleType: 'bicycle' as const,
    vehiclePlateNumber: 'বাইসাইকেল (উত্তরা জোন)',
    totalCompletedDeliveries: 15,
    totalEarnedDeliveryCharge: 900,
    totalPaidAmount: 900,
    outstandingPayableAmount: 0,
    schedule: {
      workingDays: [1, 2, 3, 4, 5, 6],
      startTime: '10:00',
      endTime: '20:00',
      breakStartTime: '14:00',
      breakEndTime: '15:00',
      isLeaveToday: false,
      maxActiveDeliveries: 2
    },
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface RegisteredUserItem {
  uid: string;
  name: string;
  email: string;
  phone: string;
  district?: string;
  role: 'customer' | 'admin' | 'delivery';
  ordersCount?: number;
  totalSpent?: number;
  status: 'active' | 'suspended';
  joinedDate: string;
}

export const INITIAL_REGISTERED_USERS: RegisteredUserItem[] = [
  {
    uid: 'cust-1',
    name: 'তানভীর আহমেদ',
    email: 'tanvir@gmail.com',
    phone: '01712-345678',
    district: 'ঢাকা (ধানমন্ডি)',
    role: 'customer',
    ordersCount: 4,
    totalSpent: 3840,
    status: 'active',
    joinedDate: '2026-02-14'
  },
  {
    uid: 'cust-2',
    name: 'নুসরাত জাহান',
    email: 'nusrat.j@yahoo.com',
    phone: '01819-876543',
    district: 'চট্টগ্রাম (জিইসি)',
    role: 'customer',
    ordersCount: 3,
    totalSpent: 2450,
    status: 'active',
    joinedDate: '2026-03-01'
  },
  {
    uid: 'cust-3',
    name: 'মাহমুদুল হাসান',
    email: 'mahmud.h@gmail.com',
    phone: '01911-223344',
    district: 'রাজশাহী (বোয়ালিয়া)',
    role: 'customer',
    ordersCount: 6,
    totalSpent: 6200,
    status: 'active',
    joinedDate: '2026-01-20'
  },
  {
    uid: 'cust-4',
    name: 'ফারহানা আক্তার',
    email: 'farhana.akter@outlook.com',
    phone: '01677-998877',
    district: 'সিলেট (জিন্দাবাজার)',
    role: 'customer',
    ordersCount: 2,
    totalSpent: 1850,
    status: 'active',
    joinedDate: '2026-04-10'
  },
  {
    uid: 'customer-demo-1',
    name: 'আহমেদ সাদিক',
    email: 'customer@folmishti.com',
    phone: '01711-223344',
    district: 'ঢাকা (মিরপুর)',
    role: 'customer',
    ordersCount: 5,
    totalSpent: 4200,
    status: 'active',
    joinedDate: '2026-01-15'
  },
  {
    uid: 'delivery-agent-1',
    name: 'মোঃ রফিকুল ইসলাম',
    email: 'delivery@folmishti.com',
    phone: '+880 1812-345678',
    district: 'ঢাকা (উত্তরা)',
    role: 'delivery',
    ordersCount: 0,
    totalSpent: 0,
    status: 'active',
    joinedDate: '2026-01-05'
  },
  {
    uid: 'delivery-agent-2',
    name: 'তানভীর আহমেদ (রাইডার)',
    email: 'tanvir@folmishti.com',
    phone: '+880 1912-876543',
    district: 'ঢাকা (মিরপুর)',
    role: 'delivery',
    ordersCount: 0,
    totalSpent: 0,
    status: 'active',
    joinedDate: '2026-02-01'
  }
];



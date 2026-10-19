export type ThemeId = 'default' | 'mango' | 'orange' | 'lychee' | 'mishti';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  category: string; // 'fruits' | 'sweets' or category id
  unit: string; // e.g. '১ কেজি', '১ বক্স (১২ পিস)', '৫০০ গ্রাম'
  price: number; // in BDT
  discountPrice?: number; // in BDT
  stock: number;
  imageUrl: string;
  galleryImages?: string[];
  description: string;
  descriptionBn: string;
  isFeatured?: boolean;
  isSeasonal?: boolean;
  seasonType?: 'mango' | 'orange' | 'lychee' | 'general';
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod';

export interface OrderItem {
  productId: string;
  name: string;
  nameBn: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  total: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  alternativePhone?: string;
  district: string;
  city: string;
  address: string;
  deliveryNotes?: string;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  currency: 'BDT';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryAddress: DeliveryAddress;
  deliveryAreaId: string;
  appliedCoupon?: string | null;
  statusHistory: StatusHistoryItem[];
  stockRestored?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: DeliveryAddress[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  badgeText?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  status: 'open' | 'assigned' | 'closed';
  assignedToAdminId?: string;
  lastMessageText: string;
  lastMessageTimestamp: any;
  unreadCountAdmin: number;
  unreadCountUser: number;
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  read: boolean;
  createdAt: any;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  phone: string;
  email: string;
  address: string;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
  freeDeliveryThreshold: number;
  isMaintenanceMode: boolean;
}

export interface AppearanceSettings {
  activeTheme: ThemeId;
  themeVersion: number;
  updatedAt: any;
  updatedBy: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  nameBn: string;
  fee: number;
  estimatedHours: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

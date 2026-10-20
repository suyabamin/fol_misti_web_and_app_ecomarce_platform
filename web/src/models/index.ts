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

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'preparing'
  | 'ready_for_dispatch'
  | 'assigned'
  | 'shipped'
  | 'out_for_delivery'
  | 'handed_over'
  | 'receipt_confirmed'
  | 'delivered'
  | 'delivery_issue'
  | 'cancelled';
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
  assignedDeliveryPersonId?: string | null;
  assignedDeliveryPersonName?: string | null;
  assignedDeliveryPersonPhone?: string | null;
  deliveryAssignedAt?: any;
  startedAt?: any;
  handedOverAt?: any;
  receiptConfirmedAt?: any;
  deliveryIssueReported?: boolean;
  deliveryIssueDetails?: string;
  isArchived?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'delivery';
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

// -------------------------------------------------------------
// Delivery Management & Tracking Types
// -------------------------------------------------------------

export type DeliveryAvailabilityStatus = 'available' | 'in_order' | 'unavailable' | 'on_break';
export type DeliveryAccountStatus = 'active' | 'suspended' | 'inactive';

export interface DeliverySchedule {
  workingDays: number[]; // 0: Sun, 1: Mon, ... 6: Sat
  startTime: string; // 'HH:mm' e.g. '09:00'
  endTime: string; // 'HH:mm' e.g. '19:00'
  breakStartTime?: string; // '13:00'
  breakEndTime?: string; // '14:00'
  isLeaveToday?: boolean;
  maxActiveDeliveries: number; // default 1 or 2
}

export interface DeliveryProfile {
  id: string; // matches User UID
  uid: string;
  name: string;
  phone: string;
  email: string;
  status: DeliveryAccountStatus;
  availability: DeliveryAvailabilityStatus;
  currentActiveDeliveries: number;
  currentActiveOrderId?: string | null;
  schedule: DeliverySchedule;
  vehicleType?: 'bicycle' | 'motorbike' | 'van' | 'walking';
  vehiclePlateNumber?: string;
  totalCompletedDeliveries: number;
  totalEarnedDeliveryCharge: number;
  totalPaidAmount: number;
  outstandingPayableAmount: number;
  createdAt: any;
  updatedAt: any;
}

export interface ReassignmentHistoryItem {
  previousDeliveryPersonId: string;
  previousDeliveryPersonName: string;
  reason: string;
  timestamp: any;
  reassignedBy: string;
}

export interface DeliveryAssignment {
  id: string; // orderId
  orderId: string;
  orderNumber: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  deliveryPersonPhone: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  deliveryFee: number;
  assignedAt: any;
  assignedBy: string;
  startedAt?: any;
  handedOverAt?: any;
  receiptConfirmedAt?: any;
  reassignmentHistory?: ReassignmentHistoryItem[];
}

export interface DeliveryLocation {
  orderId: string;
  deliveryPersonId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: any;
  status: 'live' | 'stale' | 'offline' | 'ended';
}

export interface OrderArchive {
  id: string; // orderId
  orderId: string;
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
  deliveryAddress: DeliveryAddress;
  deliveryPersonInternalId: string;
  deliveryPersonName: string;
  orderDate: any;
  handoverTimestamp: any;
  receiptConfirmedTimestamp: any;
  archivedAt: any;
  isRated: boolean;
  productRating?: number;
  deliveryRating?: number;
  reviewComment?: string;
}

export interface DeliveryEarningsEntry {
  id: string; // e.g. 'earn_{orderId}'
  orderId: string;
  orderNumber: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  amount: number; // in BDT
  currency: 'BDT';
  status: 'eligible' | 'paid' | 'disputed' | 'reversed';
  earnedAt: any;
  paymentId?: string;
}

export interface DeliveryPayment {
  id: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  amount: number; // in BDT
  paymentDate: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cash';
  transactionReference: string;
  notes?: string;
  ledgerEntryIds: string[];
  status: 'paid' | 'reversed';
  recordedBy: string;
  createdAt: any;
}

export interface DeliveryIssue {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  issueType: 'damaged_product' | 'missing_item' | 'wrong_order' | 'not_delivered' | 'delayed' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: any;
  resolvedAt?: any;
}

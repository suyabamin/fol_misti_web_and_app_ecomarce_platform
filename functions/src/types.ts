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

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 'cod';

export interface OrderItem {
  productId: string;
  name: string;
  nameBn: string;
  price: number; // in BDT integer
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

export interface CreateOrderRequest {
  idempotencyKey: string;
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  deliveryAreaId: string;
  couponCode?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage or BDT
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export type ThemeId =
  | 'default'
  | 'mango'
  | 'orange'
  | 'lychee'
  | 'mishti';

export type DeliveryAvailabilityStatus = 'available' | 'in_order' | 'unavailable' | 'on_break';
export type DeliveryAccountStatus = 'active' | 'suspended' | 'inactive';

export interface DeliverySchedule {
  workingDays: number[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isLeaveToday?: boolean;
  maxActiveDeliveries: number;
}

export interface AssignDeliveryRequest {
  orderId: string;
  deliveryPersonId: string;
  reason?: string;
}

export interface UpdateLocationRequest {
  orderId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface ConfirmReceiptRequest {
  orderId: string;
}

export interface ReportIssueRequest {
  orderId: string;
  issueType: string;
  description: string;
}

export interface RecordPaymentRequest {
  deliveryPersonId: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cash';
  transactionReference: string;
  notes?: string;
  ledgerEntryIds: string[];
}

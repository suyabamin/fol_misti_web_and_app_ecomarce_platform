export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
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

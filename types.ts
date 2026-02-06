
export type GiftCardType = string;
export type UserRole = 'ADMIN' | 'VENDOR';

export interface GiftCard {
  id: string;
  type: GiftCardType;
  value: number;
  stock: number;
  color: string;
  codes: string[]; // Códigos registados manualmente no stock global
}

export type PaymentMethod = 'CASH' | 'CARD';
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Sale {
  id: string;
  vendorId: string;
  giftCardId: string;
  type: GiftCardType;
  value: number;
  status: SaleStatus;
  timestamp: string;
  paymentMethod: PaymentMethod;
  generatedCode?: string;
}

export interface StockLog {
  id: string;
  giftCardId: string;
  type: string;
  value: number;
  quantity: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  idCardNumber: string;
  balance: number;
  role: UserRole;
  isOwner?: boolean;
  password?: string;
  isBlocked?: boolean;
  iban?: string;
  bankName?: string;
  inventory?: GiftCard[]; // Stock individual atribuído a este utilizador
  stockLogs?: StockLog[]; // Histórico de abastecimento
}

export interface AppNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: string;
}

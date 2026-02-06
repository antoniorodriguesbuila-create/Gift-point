
import { GiftCard } from './types';

export const INITIAL_INVENTORY: GiftCard[] = [
  { id: '1', type: 'Netflix', value: 5000, stock: 0, color: 'bg-rose-600', codes: [] },
  { id: '2', type: 'Netflix', value: 10000, stock: 0, color: 'bg-rose-700', codes: [] },
  { id: '3', type: 'Amazon', value: 15000, stock: 0, color: 'bg-amber-500', codes: [] },
  { id: '4', type: 'Google Play', value: 2500, stock: 0, color: 'bg-emerald-600', codes: [] },
  { id: '5', type: 'Google Play', value: 5000, stock: 0, color: 'bg-emerald-700', codes: [] },
  { id: '6', type: 'Spotify', value: 3500, stock: 0, color: 'bg-green-500', codes: [] },
  { id: '7', type: 'PlayStation', value: 20000, stock: 0, color: 'bg-blue-700', codes: [] },
  { id: '8', type: 'Xbox', value: 12500, stock: 0, color: 'bg-green-700', codes: [] },
];

export const VENDOR_KEY = 'giftpoint_vendor_data';
export const SALES_KEY = 'giftpoint_sales_history';
export const INVENTORY_KEY = 'giftpoint_inventory_stock';
export const MASTER_ADMIN_EMAIL = "bu.ila@hotmail.com";
export const MASTER_ADMIN_PASSWORD = "Aurio@bianca-1";
// Suporte Técnico para contato
export const SUPPORT_NUMBER = "900000000";

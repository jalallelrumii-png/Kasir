
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  timestamp: number;
  receivedAmount?: number;
  changeAmount?: number;
}

export type ViewType = 'POS' | 'INVENTORY' | 'HISTORY' | 'REPORTS';

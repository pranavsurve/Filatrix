export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    thumbnail: string;
    modelFile?: string;
  };
  quantity: number;
  price: number;
  isDownloaded?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  buyer: any;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentId?: string;
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}
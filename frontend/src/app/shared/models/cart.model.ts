export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    thumbnail: string;
  };
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
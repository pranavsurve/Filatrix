export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  category: 'art' | 'toys' | 'home' | 'tools' | 'jewelry' | 'other';
  modelFile: string;
  previewImages: string[];
  thumbnail: string;
  seller: any;
  status: 'pending' | 'approved' | 'rejected';
  fileType: 'stl' | 'obj' | 'both';
  dimensions?: { width: number; height: number; depth: number };
  printSettings?: { layerHeight: string; infill: string; material: string };
  downloadCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
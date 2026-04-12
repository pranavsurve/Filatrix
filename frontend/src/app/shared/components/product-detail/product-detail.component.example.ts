/**
 * USAGE EXAMPLE
 *
 * In your parent component or template:
 */

// Parent Component (.ts)
import { Component } from '@angular/core';
import { ProductDetailComponent, ProductDetail, Review } from './product-detail.component';

@Component({
  selector: 'app-product-page',
  template: `
    <app-product-detail
      [product]="product"
      [reviews]="reviews"
      [loading]="isLoading"
      [isAuthenticated]="isLoggedIn"
      [isInWishlist]="isWishlisted"
      [isInCart]="isInCart"
      (addToCart)="onAddToCart($event)"
      (toggleWishlist)="onToggleWishlist($event)"
      (submitReview)="onSubmitReview($event)">
    </app-product-detail>
  `
})
export class ProductPageComponent {
  isLoading = false;
  isLoggedIn = true;
  isWishlisted = false;
  isInCart = false;

  product: ProductDetail = {
    id: '1',
    title: 'Geometric Planter Pot - Modern Succulent Planter',
    price: 24.99,
    description: 'A beautifully designed geometric planter pot perfect for succulents and small plants. This modern design features clean lines and a minimalist aesthetic that complements any home decor. Printed with high-quality PLA material for durability.',
    imageUrl: 'https://example.com/planter.jpg',
    images: [
      'https://example.com/planter.jpg',
      'https://example.com/planter-angle.jpg',
      'https://example.com/planter-detail.jpg'
    ],
    rating: 4.5,
    reviewCount: 128,
    category: 'Home & Decor',
    tags: ['planter', 'geometric', 'modern', 'succulent'],
    seller: {
      id: 'seller1',
      name: 'MakerDesigns',
      avatar: 'https://example.com/seller-avatar.jpg',
      rating: 4.8,
      productCount: 45
    },
    dimensions: { width: 80, height: 100, depth: 80 },
    printSettings: {
      layerHeight: '0.2mm',
      infill: '20%',
      material: 'PLA'
    },
    inStock: true,
    fileTypes: ['stl', 'obj']
  };

  reviews: Review[] = [
    {
      id: '1',
      userName: 'Jane Smith',
      userAvatar: 'https://example.com/user1.jpg',
      rating: 5,
      comment: 'Perfect for my small succulents! The quality is amazing and it looks great on my desk.',
      date: '2024-01-15',
      isVerifiedPurchase: true
    },
    {
      id: '2',
      userName: 'Mike Johnson',
      rating: 4,
      comment: 'Great print quality. Slight adjustment needed in slicer settings but overall very happy.',
      date: '2024-01-10',
      isVerifiedPurchase: true
    },
    {
      id: '3',
      userName: 'Sarah Wilson',
      rating: 5,
      comment: 'Beautiful design! Exactly as pictured.',
      date: '2024-01-05',
      isVerifiedPurchase: false
    }
  ];

  onAddToCart(product: ProductDetail): void {
    console.log('Added to cart:', product.title);
    this.isInCart = true;
  }

  onToggleWishlist(product: ProductDetail): void {
    console.log('Wishlist toggled:', product.title);
    this.isWishlisted = !this.isWishlisted;
  }

  onSubmitReview(review: { rating: number; comment: string }): void {
    console.log('Review submitted:', review);
  }
}


// Sample Data for Testing
const sampleProduct: ProductDetail = {
  id: 'prod_123',
  title: 'Sample 3D Printed Product',
  price: 49.99,
  description: 'This is a sample product description.',
  imageUrl: '',
  rating: 4.2,
  reviewCount: 25,
  category: 'Art',
  tags: ['sample', 'test'],
  seller: {
    id: 'seller_123',
    name: 'Test Seller'
  },
  inStock: true,
  fileTypes: ['stl']
};

const sampleReviews: Review[] = [
  {
    id: 'rev_1',
    userName: 'Test User',
    rating: 5,
    comment: 'Great product!',
    date: new Date().toISOString()
  }
];
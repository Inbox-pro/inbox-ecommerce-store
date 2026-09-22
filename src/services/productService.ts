import { Product, ProductReview } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

const PRODUCTS_STORAGE_KEY = 'inbox_products_data_v1';
const REVIEWS_STORAGE_KEY = 'inbox_reviews_data_v1';

export const productService = {
  // Get all products (with fallback to INITIAL_PRODUCTS)
  async getProducts(): Promise<Product[]> {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize if empty
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Error fetching products:', e);
      return INITIAL_PRODUCTS;
    }
  },

  // Get product by id
  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  // Add new product (Admin)
  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-custom-${Date.now()}`,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    return newProduct;
  },

  // Update product (Admin)
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    return updatedProduct;
  },

  // Delete product (Admin)
  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Reset to initial mock data
  async resetProducts(): Promise<Product[]> {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  // Reviews operations
  async getReviewsForProduct(productId: string): Promise<ProductReview[]> {
    try {
      const stored = localStorage.getItem(`${REVIEWS_STORAGE_KEY}_${productId}`);
      if (stored) return JSON.parse(stored);

      // Default mock reviews
      const initialReviews: ProductReview[] = [
        {
          id: `rev-${productId}-1`,
          userName: 'Alex Morgan',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          rating: 5,
          date: '3 days ago',
          title: 'Exceeded all my expectations!',
          comment: 'The craftsmanship and attention to detail is remarkable. Arrived fast in sturdy packaging. Would definitely recommend to anyone!',
          verifiedPurchase: true,
          helpfulCount: 24,
        },
        {
          id: `rev-${productId}-2`,
          userName: 'David Kumar',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          rating: 4,
          date: '1 week ago',
          title: 'Great product and value for money',
          comment: 'Works exactly as described. Battery life and finish are spot on. One small point is the manual could be clearer, but setup is intuitive.',
          verifiedPurchase: true,
          helpfulCount: 12,
        },
      ];
      localStorage.setItem(`${REVIEWS_STORAGE_KEY}_${productId}`, JSON.stringify(initialReviews));
      return initialReviews;
    } catch {
      return [];
    }
  },

  async addReview(productId: string, review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount' | 'verifiedPurchase'>): Promise<ProductReview> {
    const reviews = await this.getReviewsForProduct(productId);
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      verifiedPurchase: true,
      helpfulCount: 0,
    };
    const updated = [newReview, ...reviews];
    localStorage.setItem(`${REVIEWS_STORAGE_KEY}_${productId}`, JSON.stringify(updated));

    // Update product average rating & review count
    const products = await this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const sum = updated.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / updated.length).toFixed(1));
      await this.updateProduct(productId, { rating: avg, reviewCount: updated.length });
    }

    return newReview;
  },
};

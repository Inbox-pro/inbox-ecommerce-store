import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Product, Order } from './types';
import { productService } from './services/productService';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Load products from localStorage or initial seed
  const refreshProducts = () => {
    productService.getProducts().then((data) => setProducts(data));
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Navigation handler
  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setCurrentParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    handleNavigate('product-details', productId);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Primary Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        products={products}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            products={products}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'products' && (
          <Products
            products={products}
            initialCategory={currentParam}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        )}

        {currentTab === 'product-details' && currentParam && (
          <ProductDetails
            productId={currentParam}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'cart' && (
          <Cart onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />
        )}

        {currentTab === 'wishlist' && (
          <Wishlist
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        )}

        {currentTab === 'checkout' && (
          <Checkout
            onNavigate={handleNavigate}
            onOrderPlaced={(order) => {
              setLastPlacedOrder(order);
            }}
          />
        )}

        {currentTab === 'order-success' && (
          <OrderSuccess order={lastPlacedOrder} onNavigate={handleNavigate} />
        )}

        {currentTab === 'orders' && (
          <Orders onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />
        )}

        {currentTab === 'order-tracking' && (
          <OrderTracking
            orderId={currentParam}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'profile' && <Profile onNavigate={handleNavigate} />}

        {currentTab === 'admin' && (
          <AdminDashboard
            allProducts={products}
            onProductsUpdate={refreshProducts}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFullDetails={(id) => {
            setQuickViewProduct(null);
            handleSelectProduct(id);
          }}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

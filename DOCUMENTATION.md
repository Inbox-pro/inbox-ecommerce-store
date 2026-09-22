# 🛒 Inbox Infotech E-Commerce Platform — Master Documentation

> **Version:** 1.0.0  
> **Target Audience:** Developers, Project Reviewers, College Evaluators, and Technical Stakeholders  
> **Application Type:** Production-Ready Single-Page E-Commerce Web Application (SPA)  

---

## 📋 Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Technology Stack & Specifications](#2-technology-stack--specifications)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Directory & File Organization](#4-directory--file-organization)
5. [Data Models & TypeScript Interfaces](#5-data-models--typescript-interfaces)
6. [State Management & Context Providers](#6-state-management--context-providers)
7. [Service Layer & Local Persistence Engine](#7-service-layer--local-persistence-engine)
8. [Detailed Page & Feature Specifications](#8-detailed-page--feature-specifications)
   - [8.1 Navigation Bar & Global Header](#81-navigation-bar--global-header)
   - [8.2 Home Page (Landing & Discovery)](#82-home-page-landing--discovery)
   - [8.3 Product Catalog & Faceted Search](#83-product-catalog--faceted-search)
   - [8.4 Product Details & Interactive Reviews](#84-product-details--interactive-reviews)
   - [8.5 Cart & "Save for Later" System](#85-cart--save-for-later-system)
   - [8.6 Wishlist Manager](#86-wishlist-manager)
   - [8.7 Multi-Step Checkout & Simulated Payment Gateway](#87-multi-step-checkout--simulated-payment-gateway)
   - [8.8 Order Confirmation & Printable Invoice](#88-order-confirmation--printable-invoice)
   - [8.9 Order History & Filtering](#89-order-history--filtering)
   - [8.10 Live Order Tracking with Presentation Simulator](#810-live-order-tracking-with-presentation-simulator)
   - [8.11 User Profile & Address Management](#811-user-profile--address-management)
   - [8.12 Admin Dashboard & Catalog Management](#812-admin-dashboard--catalog-management)
   - [8.13 Authentication & Role Switching](#813-authentication--role-switching)
9. [Design System, UX & Accessibility](#9-design-system-ux--accessibility)
10. [Presentation & Evaluation Demo Guide](#10-presentation--evaluation-demo-guide)
11. [Installation, Build & Production Deployment](#11-installation-build--production-deployment)

---

## 1. Executive Summary & Purpose

**Inbox Infotech E-Commerce** is an end-to-end modern e-commerce web application engineered to demonstrate the full lifecycle of an online retail platform. Built with modern web standards, it delivers a client experience comparable to modern commercial platforms (e.g., Amazon, Flipkart, Shopify) while incorporating built-in simulation tools specifically tailored for college vivas, client demonstrations, and technical presentations.

### Key Capabilities:
- **Full Commerce Funnel:** Product discovery -> Faceted filtering -> Variant selection -> Cart & Coupons -> Multi-step Checkout -> Payment simulation -> Live order tracking -> Invoice generation.
- **Dual-Persona Architecture:** Seamless toggle between **Customer** (Shopper) and **Store Admin** roles without requiring mock backend setups.
- **Real-Time Interactive Tracking:** Live 6-stage order timeline with an integrated **"Simulate Next Stage"** action to demonstrate state progression live.
- **Robust Local Persistence:** Automatic synchronization of products, users, cart, wishlist, addresses, and order histories across sessions via browser storage.

---

## 2. Technology Stack & Specifications

| Layer / Domain | Technology / Library | Version | Role & Justification |
|---|---|---|---|
| **Core Framework** | React | `19.0.1` | Declarative UI rendering, component reusability, custom hooks |
| **Language** | TypeScript | `7.0.2` | Strict compile-time typing, eliminating runtime null-pointer defects |
| **Bundler & Dev Server** | Vite | `8.3.0` | Ultra-fast HMR, optimized production rollup bundling |
| **Styling** | Tailwind CSS | `4.3.3` | Modern utility-first CSS engine with zero CSS runtime overhead |
| **Animation Engine** | Motion (`motion/react`) | `12.23.24` | Smooth transitions, modal entry/exit, layout animations |
| **Iconography** | Lucide React | `0.546.0` | Unified, lightweight vector SVG icons for all UI elements |
| **Delight & Micro-FX** | Canvas Confetti | `1.9.4` | Particle explosion upon order placement completion |
| **Typography** | Plus Jakarta Sans | Google Fonts | Modern geometric humanist typeface optimized for legibility |

---

## 3. System Architecture & Data Flow

```
+-------------------------------------------------------------------------------+
|                               React 19 Application Root                       |
|                                                                               |
|  +-------------------+  +-------------------+  +----------------------------+ |
|  |   ToastProvider   |  |   AuthProvider    |  |       CartProvider         | |
|  |  (Notification UI)|  | (User, Auth, RBAC)|  | (Cart, Coupons, Subtotals) | |
|  +-------------------+  +-------------------+  +----------------------------+ |
|                                       |                                       |
|                         +----------------------------+                        |
|                         |      WishlistProvider      |                        |
|                         |    (Saved Wishlist Items)  |                        |
|                         +----------------------------+                        |
|                                       |                                       |
|  +-------------------------------------------------------------------------+  |
|  |                          App Shell Router (App.tsx)                     |  |
|  |  - Navbar (Search, Cart Badge, Role Switcher, Mega Category Bar)        |  |
|  |  - Active View Render:                                                  |  |
|  |    * Home           * Products Catalog     * Product Details            |  |
|  |    * Cart           * Checkout             * Order Success              |  |
|  |    * Orders List    * Order Tracking       * User Profile               |  |
|  |    * Admin Portal   * Quick View Modal     * Auth Modal                 |  |
|  |  - Footer (Site links, guarantees, newsletter, trust badges)            |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------|---------------------------------------+
                                        v
+-------------------------------------------------------------------------------+
|                               Service Layer                                   |
|   - productService: Product CRUD, Review submissions, Stock updates          |
|   - orderService: Order creation, Status progression, Live timeline tracking |
|   - authService: User sessions, Address book, Role management                |
+---------------------------------------|---------------------------------------+
                                        v
+-------------------------------------------------------------------------------+
|                       Browser LocalStorage Persistence Engine                 |
|   - inbox_products_v1   - inbox_orders_v1    - inbox_auth_user_v1            |
|   - inbox_cart_v1       - inbox_saved_v1     - inbox_wishlist_v1             |
+-------------------------------------------------------------------------------+
```

---

## 4. Directory & File Organization

```
/
├── index.html                  # HTML entry point with metadata, viewport, and typography
├── metadata.json               # AI Studio project configuration and capabilities
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite configuration with React and Tailwind plugins
├── DOCUMENTATION.md            # Comprehensive project documentation
└── src/
    ├── main.tsx                # Application bootstrapping into root DOM
    ├── App.tsx                 # Main layout, view routing, modals orchestration
    ├── index.css               # Global Tailwind CSS imports and utility overrides
    ├── types.ts                # Master TypeScript schemas and interfaces
    │
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.tsx          # Sticky header, search bar, category strip, user menu
    │   │   ├── Footer.tsx          # Brand footer, newsletter, trust guarantees, footer links
    │   │   ├── BrandLogo.tsx       # Vector brand logo with custom typography
    │   │   ├── RatingStars.tsx     # Accessible fractional star rating visualizer & selector
    │   │   └── QuickViewModal.tsx  # Fast-preview product lightbox modal
    │   ├── product/
    │   │   ├── ProductCard.tsx     # Standard product grid & list item presentation
    │   │   └── FilterSidebar.tsx   # Faceted filter panel (Price, Category, Brand, Rating)
    │   └── auth/
    │       └── AuthModal.tsx       # Modal for Sign In, Sign Up, and 1-click Demo Accounts
    │
    ├── context/
    │   ├── AuthContext.tsx         # User authentication, addresses, RBAC switching
    │   ├── CartContext.tsx         # Cart line items, quantities, coupon logic, totals
    │   ├── WishlistContext.tsx     # Saved favorite products state
    │   └── ToastContext.tsx        # Toast alert system with automatic dismissal
    │
    ├── services/
    │   ├── productService.ts       # Product queries, review submissions, catalog mutations
    │   ├── orderService.ts         # Order placement, status tracking, demo simulation
    │   └── authService.ts          # Authentication routines, address book persistence
    │
    ├── data/
    │   ├── products.ts             # Initial curated seed products catalog (20+ items)
    │   └── coupons.ts              # Available promo coupons and discount rules
    │
    └── pages/
        ├── Home.tsx                # Homepage featuring hero slider, deals, bestsellers
        ├── Products.tsx            # Catalog page with sorting, filtering, grid/list switch
        ├── ProductDetails.tsx      # Rich product view with variants, tabs, review form
        ├── Cart.tsx                # Cart management, coupon codes, "Save for Later"
        ├── Wishlist.tsx            # Saved items showcase with "Move to Cart"
        ├── Checkout.tsx            # 3-step checkout with address selection & payment simulation
        ├── OrderSuccess.tsx        # Order confirmation card with invoice print button
        ├── Orders.tsx              # Order history list with status badges & filter tabs
        ├── OrderTracking.tsx       # Live delivery tracking timeline with milestone simulator
        ├── Profile.tsx             # User profile, address manager, account settings
        └── AdminDashboard.tsx      # Admin dashboard with KPIs, order update & product CRUD
```

---

## 5. Data Models & TypeScript Interfaces

All domain models are strictly typed in `src/types.ts`.

### 5.1 Product & Review Models
```typescript
export interface Review {
  id: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  badge?: 'Best Seller' | 'New' | 'Sale' | 'Featured' | 'Limited';
  isFeatured?: boolean;
  reviews?: Review[];
}
```

### 5.2 Cart & Wishlist Models
```typescript
export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface SavedItem {
  id?: string;
  product: Product;
  savedAt: string;
  selectedColor?: string;
  selectedSize?: string;
}
```

### 5.3 Order & Tracking Models
```typescript
export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;                      // e.g. "INB-82914"
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: Address;
  deliveryMethod: 'Standard' | 'Express';
  paymentMethod: PaymentMethod;    // Card, UPI, COD, Net Banking
  paymentStatus: 'Paid' | 'Pending';
  transactionId: string;
  status: OrderStatus;
  trackingNumber: string;          // e.g. "BD-8839201IN"
  carrier: string;                 // e.g. "BlueDart Logistics"
  estimatedDeliveryDate: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}
```

### 5.4 User & Address Models
```typescript
export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  addresses: Address[];
}
```

---

## 6. State Management & Context Providers

The application manages global state using React Context with custom hooks for predictable, reactive updates.

### 6.1 `AuthContext` (`useAuth`)
- **State:** `user` (User | null), `isAuthenticated`, `isAdmin`, `defaultAddress`.
- **Functions:**
  - `login(email, password)`: Authenticates customer or admin.
  - `logout()`: Clears active user session.
  - `updateProfile(updates)`: Modifies current user profile fields.
  - `addAddress(address)`: Appends an address to the user profile and updates storage.
  - `deleteAddress(id)`: Removes a specified address.
  - `setDefaultAddress(id)`: Sets an address as the default shipping destination.
  - `switchDemoRole('customer' | 'admin')`: Quick toggle for demonstration purposes.

### 6.2 `CartContext` (`useCart`)
- **State:** `cart` (items), `savedItems` (save for later), `appliedCoupon`, `deliveryMethod`.
- **Calculations:**
  - `subtotal`: $\sum (\text{item.price} \times \text{item.quantity})$
  - `discount`: Calculated from applied percentage or flat coupon, capped by coupon's `maxDiscount`.
  - `deliveryFee`: Free above $99.00 or with free-shipping coupons; otherwise $4.99 ($9.99 for Express).
  - `tax`: Calculated at standard 8% rate on taxable subtotal.
  - `total`: $\text{subtotal} - \text{discount} + \text{deliveryFee} + \text{tax}$.
- **Functions:** `addToCart`, `updateQuantity`, `removeFromCart`, `saveForLater`, `moveToCart`, `applyCoupon`, `removeCoupon`, `clearCart`.

### 6.3 `WishlistContext` (`useWishlist`)
- **State:** `wishlist` (Product[]).
- **Functions:**
  - `addToWishlist(product)`: Appends product if not present.
  - `removeFromWishlist(productId)`: Removes product.
  - `isInWishlist(productId)`: Boolean predicate check.
  - `moveToCart(product)`: Adds item to cart and removes it from wishlist in a single step.

### 6.4 `ToastContext` (`useToast`)
- **State:** List of active notifications with unique IDs, messages, and styles (`success`, `error`, `info`).
- **Functions:** `showToast(message, options)` with automatic 3.5s auto-dismiss and manual close button.

---

## 7. Service Layer & Local Persistence Engine

| Service | File Path | Key Responsibilities & Storage Key |
|---|---|---|
| **Product Service** | `src/services/productService.ts` | Handles catalog listing, search queries, category filters, review postings, stock level adjustments, and admin CRUD operations. Cached in `inbox_products_v1`. |
| **Order Service** | `src/services/orderService.ts` | Manages order creation, lookup by Order ID or tracking code, status advancement, and KPI calculations. Pre-populated with historical mock orders and cached in `inbox_orders_v1`. |
| **Auth Service** | `src/services/authService.ts` | Handles user authentication, profile details, multiple shipping addresses, and demo accounts. Cached in `inbox_auth_user_v1`. |

---

## 8. Detailed Page & Feature Specifications

### 8.1 Navigation Bar & Global Header
- **Top Utility Bar:** Displays currency, shipping guarantee announcement ("Free Delivery on orders over $99"), and quick demo role switch badge ("Customer" vs "Store Admin").
- **Main Header:**
  - Brand Logo linking to Home.
  - Interactive Search Input with real-time suggestion dropdown showing product thumbnail, name, category, and price.
  - Customer Profile / Sign In trigger with authenticated dropdown.
  - Wishlist icon with dynamic counter badge.
  - Cart trigger with dynamic total item counter badge.
- **Category Navigation Strip:** Direct access to Electronics, Fashion, Home & Living, Footwear, Books, and Sports.

### 8.2 Home Page (Landing & Discovery)
- **Hero Carousel Banner:** High-impact promotions with CTA buttons linking to catalog categories.
- **Value Proposition Bar:** Trust badges highlighting Free Shipping, 24/7 Support, 30-Day Easy Returns, and 100% Secure Checkout.
- **Popular Categories Grid:** Visual category cards with product counters and hover transitions.
- **Flash Sale Banner:** Live simulated countdown timer displaying hours, minutes, and seconds remaining with discounted products.
- **Featured & Best Seller Tabs:** Filterable product grids with instant Add-to-Cart and Quick-View buttons.
- **Testimonials Section:** Verified customer reviews with star ratings and feedback.
- **Newsletter Subscription:** Email input with client-side validation and toast confirmation.

### 8.3 Product Catalog & Faceted Search
- **Faceted Filter Sidebar:**
  - **Category Filter:** Multiple selection checkboxes.
  - **Price Range Slider:** Interactive dual slider from $0 to $1,500.
  - **Brand Filter:** Checkboxes for Apple, Nike, Sony, Samsung, Bose, Adidas, etc.
  - **Minimum Star Rating:** 4★ & above, 3★ & above, 2★ & above.
  - **Availability Toggles:** "In Stock Only" and "On Sale Only".
  - **Active Filter Chips:** Clickable pill tags with a "Clear All" button.
- **Catalog Toolbar:**
  - Result count indicators.
  - Grid View (3 or 4 columns) vs List View switcher.
  - Sorting dropdown: Featured, Price: Low to High, Price: High to Low, Customer Rating, Newest Arrivals.
- **Pagination Controls:** Next/Previous page buttons and numbered page links.
- **Quick View Modal:** Lightbox previewing product images, price, short description, variant choices, and direct cart addition without navigating away.

### 8.4 Product Details & Interactive Reviews
- **Media Gallery:** Main high-resolution image with interactive thumbnail gallery and zoom preview.
- **Product Overview:** Title, brand, category, SKU, stock status badge ("In Stock: 14 left" or "Out of Stock"), and star rating with review count.
- **Variant Selectors:**
  - Interactive color circles with selected indicator.
  - Size selection chips with stock detection.
- **Purchase Actions:** Quantity stepper (1 to max available stock), "Add to Cart" button with cart icon, "Buy Now" button (directly launches checkout), and Wishlist heart button.
- **Tabbed Information Panel:**
  - **Description:** Formatted product overview and key feature bullet points.
  - **Specifications:** Technical key-value specifications table.
  - **Customer Reviews:** Real-time star rating breakdown bar chart, verified buyer reviews list, and an **interactive review submission form** allowing users to select star ratings and submit text comments that immediately append to the product.
- **Related Products:** Carousel of complementary products within the same category.

### 8.5 Cart & "Save for Later" System
- **Cart Line Items:** Product image, title, variant specs (color/size), unit price, dynamic quantity stepper, line total, and action buttons.
- **Save for Later Section:** Items can be moved out of the active cart into a saved list with one click, and restored to cart anytime.
- **Coupon System:**
  - Input field for entering discount codes.
  - Quick-apply tags for active codes: `INBOX50` (50% off up to $50), `SAVE10` (10% off), `FREESHIP` (Free shipping).
  - Validation: Minimum spend requirements, discount caps, and clear error toast feedback.
- **Order Summary Card:**
  - Subtotal calculation.
  - Discount amount highlighted in green.
  - Delivery Fee with a progress indicator toward the $99 Free Shipping threshold.
  - Estimated Tax (8%).
  - Final Total amount with bold callout.
  - "Proceed to Checkout" primary CTA button.

### 8.6 Wishlist Manager
- Grid view of all items favorited across the website.
- Stock availability indicator.
- Single-click "Move to Cart" action.
- "Remove from Wishlist" button.
- Empty state with "Explore Products" CTA button.

### 8.7 Multi-Step Checkout & Simulated Payment Gateway
- **Step 1: Shipping Address:**
  - Select from existing saved addresses in user profile with radio buttons.
  - Or fill out a new address form (Full Name, Phone, Street, City, State, Postal Code, Country).
- **Step 2: Shipping Speed:**
  - Standard Delivery (3–5 business days, Free over $99 or $4.99).
  - Express Delivery (1–2 business days, +$9.99).
- **Step 3: Payment Method Simulation:**
  - **Credit / Debit Card:** Cardholder Name, Card Number (with card brand detection), Expiry Date, CVV.
  - **UPI / QR Code:** Dynamic QR code display and VPA ID input (e.g., `user@upi`) with simulated app request.
  - **Net Banking:** Popular bank selection dropdown.
  - **Cash on Delivery (COD):** Pay upon parcel arrival.
- **Security Assurances:** 256-bit SSL encryption badge and payment security guarantee icons.
- **Execution:** Clicking "Place Order & Pay" triggers a realistic 1.4-second simulated banking network latency, generates a unique Order ID and Tracking Number, triggers a confetti celebration animation, and routes to Order Confirmation.

### 8.8 Order Confirmation & Printable Invoice
- Confirmation banner with customer name and recipient email.
- Order ID, Tracking Code, and Estimated Delivery Date cards.
- Complete itemized breakdown with pricing.
- **"Print Official Invoice" Button:** Uses `window.print()` with print-optimized styles.
- **"Track Package Live" Button:** Navigates directly to the live parcel tracking page.

### 8.9 Order History & Filtering
- Displays all customer purchases in chronological order.
- Status Filter Tabs: **All Orders**, **Active & In Transit**, and **Delivered**.
- Search bar to look up specific orders by Order ID.
- Each order card displays placement date, total price, recipient, status badge, item thumbnails, and direct action buttons to "Track Package" or "View Invoice".

### 8.10 Live Order Tracking with Presentation Simulator
- **Live Search / Lookup:** Allows entering any Order ID or AWB Tracking Code to view status.
- **Visual 6-Milestone Stepper Timeline:**
  1. `Order Placed` — Initial order receipt.
  2. `Confirmed` — Payment verified & inventory allocated.
  3. `Packed` — Securely packaged with quality seal.
  4. `Shipped` — Dispatched via courier express hub.
  5. `Out for Delivery` — With local delivery driver.
  6. `Delivered` — Safely delivered to customer address.
- **Courier Logistics Card:** Displays partner (e.g. BlueDart), AWB Tracking ID, and expected delivery date.
- **Dispatch Checkpoint Logs:** Detailed timestamps and location activity checkpoints.
- 🎯 **"Simulate Next Stage" Fast-Forward Button:** An interactive control built for presentations that allows the user or evaluator to click and immediately advance the parcel to its next operational stage with animated feedback.

### 8.11 User Profile & Address Management
- **Personal Details:** View and edit full name, email, phone number, and avatar.
- **Address Book Manager:**
  - View all saved addresses with "Home", "Work", or "Other" badges.
  - Add new delivery addresses.
  - Set an address as Default for 1-click checkout.
  - Delete unused addresses.
- **Account Overview:** Total orders placed count, active addresses count, and role badge.

### 8.12 Admin Dashboard & Catalog Management
*(Accessible via the top navigation bar or role switcher)*
- **Executive Metrics:**
  - **Gross Sales Revenue:** Calculated in real-time from active orders.
  - **Total Orders:** Real-time order volume counter.
  - **Low Stock Warning:** Highlighting products with stock $\le 10$.
  - **Active Catalog Products:** Total active SKUs in the catalog.
- **Order Management Console:**
  - Search orders by ID or customer name.
  - View order date, customer, payment status, and order total.
  - **Live Status Dropdown:** Admin can change any order's status (`Order Placed` $\to$ `Confirmed` $\to$ `Packed` $\to$ `Shipped` $\to$ `Delivered`).
- **Product Catalog Management:**
  - Search and filter products by category and stock level.
  - **Add New Product Modal:** Complete form to create new catalog products with name, brand, category, price, original price, stock, description, and images.
  - **Edit Product Modal:** Real-time mutation of existing product prices, descriptions, and stock quantities.
  - **Delete Product Action:** Soft delete with confirmation toast.

### 8.13 Authentication & Role Switching
- **Sign In / Sign Up Tabs:** Clean modal with email, password, and name inputs.
- **1-Click Presentation Demo Buttons:**
  - `Login as Customer (Demo)`: Instantly populates and signs in as `riddhi@example.com`.
  - `Login as Admin (Demo)`: Instantly signs in as `admin@inboxinfotech.com` with access to the Admin Dashboard.
- **Top Bar Quick Toggle:** Instant pill button in the top navigation bar allowing seamless switching between roles during live demonstrations.

---

## 9. Design System, UX & Accessibility

- **Color Palette:**
  - Brand Primary: `#E84A27` (Inbox Vibrant Coral/Orange)
  - Brand Dark: `#1E293B` (Slate 900)
  - Neutral Backgrounds: `#F8FAFC` (Slate 50) and `#FFFFFF`
  - Status Success: `#10B981` (Emerald)
  - Status Alert: `#F59E0B` (Amber)
  - Status Error: `#EF4444` (Rose)
- **Typography:**
  - Font Family: `'Plus Jakarta Sans', sans-serif`
  - Strictly adhering to high contrast (minimum WCAG AA compliance $\ge 4.5:1$ ratio).
- **Responsive Layouts:**
  - Mobile: Single-column layouts, slide-over filter drawers, touch-friendly 44px+ hit targets.
  - Tablet & Desktop: Multi-column bento grids, sticky sidebars, and desktop mega-navigation.
- **DOM & Hydration Integrity:** Semantic HTML without nested button issues or layout shifts.

---

## 10. Presentation & Evaluation Demo Guide

Follow this sequential walkthrough during a live viva, project review, or demonstration:

1. **Discovery & Catalog Exploration:**
   - Open the **Home page**; showcase the hero carousel, flash deal timer, and trust guarantees.
   - Navigate to **Products**; demonstrate the faceted sidebar:
     - Filter by category (e.g., *Electronics*).
     - Move the price range slider.
     - Toggle minimum 4-star rating.
     - Switch between **Grid** and **List** view.
2. **Product Details & Customer Engagement:**
   - Click any product to open **Product Details**.
   - Switch color and size variants.
   - Scroll down to the **Customer Reviews** tab; write a quick review with a 5-star rating and click **Submit Review** — demonstrate that the new review immediately appears in the list!
3. **Cart & Coupons:**
   - Click **Add to Cart**, then navigate to the **Cart** page.
   - Adjust quantities with the `+` / `-` buttons.
   - Click **Save for Later** on an item, then click **Move to Cart** to demonstrate the secondary storage engine.
   - Apply the coupon code `INBOX50` — show the instant discount and updated totals.
4. **Checkout & Payment Simulation:**
   - Click **Proceed to Checkout**.
   - Select a saved address or enter shipping details.
   - Select **Express Delivery** (observe total updating).
   - Select **Credit Card** or **UPI QR Code**.
   - Click **Place Order & Pay** — observe the simulated bank verification latency, followed by the **confetti celebration**!
5. **Invoice & Live Parcel Tracking:**
   - On the Order Success page, click **Print Invoice** to demonstrate print styling.
   - Click **Track Package Live** to open the **Order Tracking** timeline.
   - Point out the 6-stage milestone tracker.
   - Click the **"Simulate Next Stage"** button multiple times — watch the progress bar advance from *Order Placed* all the way to *Delivered* in real-time!
6. **Order History & User Profile:**
   - Navigate to **Orders** to showcase the searchable purchase history.
   - Navigate to **Profile** to demonstrate managing multiple delivery addresses.
7. **Admin Dashboard Capabilities:**
   - Click the **Switch to Admin** button in the top bar.
   - Open the **Admin Dashboard**; review real-time revenue metrics, low-stock warnings, and order counts.
   - In the Orders table, change an order's status from the dropdown.
   - In the Product Inventory table, click **Add Product** to create a new item or edit existing stock.

---

## 11. Installation, Build & Production Deployment

### 11.1 Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 11.2 Local Development Setup
```bash
# Clone or navigate to the project directory
cd inbox-infotech-ecommerce

# Install dependencies
npm install

# Launch the development server (binds to port 3000)
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 11.3 Production Build
```bash
# Run TypeScript compilation and build production assets
npm run build

# Preview production bundle locally
npm run preview
```

### 11.4 Type Checking & Linting
```bash
# Verify all TypeScript types and exports
npm run lint
```

---

*Authored for Inbox Infotech E-Commerce Platform. All rights reserved.*

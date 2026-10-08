import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, ProductCategory } from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/LanguageContext';
import { CATEGORIES } from '../components/common/Navbar';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  TrendingUp,
  Search,
  Filter,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  allProducts: Product[];
  onProductsUpdate: () => void;
  onNavigate: (tab: string, param?: string) => void;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allProducts,
  onProductsUpdate,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, tCategory, tStatus, tRole } = useTranslation();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);

  // Product CRUD modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('Electronics');
  const [pPrice, setPPrice] = useState('199.99');
  const [pOriginalPrice, setPOriginalPrice] = useState('249.99');
  const [pStock, setPStock] = useState('25');
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Search in tables
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    const ords = orderService.getOrders();
    setOrders(ords);
  }, []);

  // Compute analytics
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = allProducts.filter((p) => p.stock <= 10);

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await orderService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(t('toast.orderStatusUpdated', { id: orderId, status: tStatus(newStatus) }), { type: 'success' });
    }
  };

  // Open add product modal
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setPName('');
    setPBrand('');
    setPCategory('Electronics');
    setPPrice('99.99');
    setPOriginalPrice('129.99');
    setPStock('30');
    setPImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    setPDesc('High-performance demo product with premium materials and warranty.');
    setIsProductModalOpen(true);
  };

  // Open edit product modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPBrand(prod.brand);
    setPCategory(prod.category);
    setPPrice(String(prod.price));
    setPOriginalPrice(String(prod.originalPrice));
    setPStock(String(prod.stock));
    setPImage(prod.images[0] || '');
    setPDesc(prod.description);
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(pPrice) || 0;
    const origNum = parseFloat(pOriginalPrice) || priceNum;
    const discountPct = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

    if (editingProductId) {
      // Edit
      await productService.updateProduct(editingProductId, {
        name: pName,
        brand: pBrand,
        category: pCategory,
        price: priceNum,
        originalPrice: origNum,
        discount: discountPct,
        stock: parseInt(pStock) || 0,
        images: [pImage],
        description: pDesc,
      });
      showToast(t('toast.productUpdated'), { type: 'success' });
    } else {
      // Add
      await productService.addProduct({
        name: pName,
        brand: pBrand,
        category: pCategory,
        price: priceNum,
        originalPrice: origNum,
        discount: discountPct,
        stock: parseInt(pStock) || 0,
        images: [pImage],
        description: pDesc,
        rating: 4.8,
        reviewCount: 1,
        isNewArrival: true,
        specifications: { Model: '2026 Edition', Warranty: '1 Year Brand Warranty' },
      });
      showToast(t('toast.productCreated'), { type: 'success' });
    }

    setIsProductModalOpen(false);
    onProductsUpdate();
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    showToast(t('toast.productDeleted'), { type: 'info' });
    onProductsUpdate();
  };

  // Filtered lists
  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-700 cursor-pointer">{t('profile.breadcrumbHome')}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800">{t('admin.dashboardTitle')}</span>
      </div>

      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
              {t('role.admin')}
            </span>
            <span className="text-xs text-slate-400">{t('admin.dashboardTitle')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{t('admin.dashboardTitle')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('admin.dashboardSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2 bg-[#E84A27] hover:bg-[#d43f1f] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('admin.addProduct')}
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
        {[
          { id: 'overview', label: `📊 ${t('admin.tabOverview')}` },
          { id: 'products', label: `📦 ${t('admin.tabProducts')} (${allProducts.length})` },
          { id: 'orders', label: `🚚 ${t('admin.tabOrders')} (${orders.length})` },
          { id: 'customers', label: `👥 ${t('admin.tabCustomers')}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">{t('admin.totalRevenue')}</span>
                <span className="text-2xl font-black text-slate-900">${totalSales.toFixed(2)}</span>
                <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">+18.4%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">{t('admin.totalOrders')}</span>
                <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
                <span className="text-[11px] text-blue-600 font-bold block mt-0.5">{t('admin.quickStatCompleted')}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">{t('admin.catalogItems')}</span>
                <span className="text-2xl font-black text-slate-900">{allProducts.length}</span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{CATEGORIES.length} {t('footer.categories').toLowerCase()}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">{t('admin.lowStockAlerts')}</span>
                <span className="text-2xl font-black text-amber-600">{lowStockProducts.length}</span>
                <span className="text-[11px] text-amber-700 font-bold block mt-0.5">≤ 10 {t('admin.stock')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('admin.totalRevenue')} ($)</h3>
                  <p className="text-xs text-slate-400">Quarterly performance simulation</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  +24% YoY
                </span>
              </div>

              {/* Responsive SVG Bar Graph */}
              <div className="h-52 w-full pt-4">
                <div className="flex items-end justify-between h-40 gap-3 px-2 border-b border-slate-100">
                  {[
                    { month: 'Nov', val: 3200, height: '40%' },
                    { month: 'Dec', val: 5800, height: '75%' },
                    { month: 'Jan', val: 4100, height: '52%' },
                    { month: 'Feb', val: 4900, height: '64%' },
                    { month: 'Mar', val: 7600, height: '95%' },
                    { month: 'Apr (Est)', val: 6800, height: '85%' },
                  ].map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${d.val}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-[#E84A27] rounded-t-lg group-hover:from-orange-500 group-hover:to-orange-400 transition-all duration-300"
                        style={{ height: d.height }}
                      />
                      <span className="text-[11px] font-semibold text-slate-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Share Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('admin.category')}</h3>
                  <p className="text-xs text-slate-400">{t('admin.catalogItems')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {CATEGORIES.slice(0, 5).map((cat: ProductCategory, idx: number) => {
                  const count = allProducts.filter((p) => p.category === cat).length;
                  const pct = Math.round((count / allProducts.length) * 100);
                  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{tCategory(cat)}</span>
                        <span className="text-slate-400 font-mono">{count} items ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Table */}
          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold">{t('admin.lowStockAlerts')}</h3>
                </div>
                <span className="text-xs text-amber-700 font-semibold">
                  {lowStockProducts.length} items
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.brand} • {tCategory(p.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                        {p.stock} {t('admin.stock')}
                      </span>
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        {t('admin.edit')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t('admin.searchProducts')}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-[#E84A27] hover:bg-[#d63f1f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> {t('admin.addProduct')}
            </button>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">{t('admin.productName')}</th>
                  <th className="py-3 px-4">{t('admin.category')}</th>
                  <th className="py-3 px-4">{t('admin.price')}</th>
                  <th className="py-3 px-4">{t('admin.stock')}</th>
                  <th className="py-3 px-4">{t('admin.rating')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="max-w-[220px]">
                          <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">{prod.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{tCategory(prod.category)}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">${prod.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          prod.stock <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">★ {prod.rating}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title={t('admin.edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title={t('admin.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <div className="relative max-w-sm">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder={t('admin.searchOrders')}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">{t('admin.orderId')}</th>
                  <th className="py-3 px-4">{t('admin.customer')}</th>
                  <th className="py-3 px-4">{t('orders.title')}</th>
                  <th className="py-3 px-4">{t('admin.amount')}</th>
                  <th className="py-3 px-4">{t('admin.status')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">#{ord.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ord.items.length} item(s)</td>
                    <td className="py-3 px-4 font-black text-slate-900">${ord.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {/* Status select dropdown with translated labels */}
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1 text-xs rounded-lg font-bold border border-slate-200 bg-white focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        {ORDER_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {tStatus(st)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('order-tracking', ord.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] cursor-pointer"
                      >
                        {t('orders.trackPackage')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUSTOMERS DIRECTORY TAB */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">{t('admin.customerList')}</h3>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Alex Sharma (Logged In)</p>
                  <p className="text-slate-400">alex.sharma@example.com • +91 98765 43210</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {tRole('customer')}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Karthik Rao</p>
                  <p className="text-slate-400">karthik.rao@example.com • +91 98765 11223</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                {tRole('customer')}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Meera Patel</p>
                  <p className="text-slate-400">meera.patel@example.com • +91 98765 99887</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                {tRole('admin')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingProductId ? t('admin.modalEditProduct') : t('admin.modalAddProduct')}
            </h3>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-3 text-xs mt-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('admin.inputName')}</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('admin.inputBrand')}</label>
                  <input
                    type="text"
                    required
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('admin.inputCategory')}</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((c: ProductCategory) => (
                      <option key={c} value={c}>
                        {tCategory(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('admin.inputPrice')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('admin.inputOrigPrice')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('admin.inputStock')}</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('admin.inputImageUrl')}</label>
                <input
                  type="url"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('admin.inputDescription')}</label>
                <textarea
                  rows={3}
                  required
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E84A27] hover:bg-[#d63f1f] text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  {t('admin.saveProduct')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

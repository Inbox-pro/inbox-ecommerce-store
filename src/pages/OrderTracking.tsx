import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Search,
  ChevronRight,
  FastForward,
} from 'lucide-react';

interface OrderTrackingProps {
  orderId?: string;
  onNavigate: (tab: string, param?: string) => void;
  onSelectProduct: (id: string) => void;
}

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', description: 'We received your order' },
  { status: 'Confirmed', label: 'Confirmed', description: 'Payment verified & inventory allocated' },
  { status: 'Packed', label: 'Packed', description: 'Item securely boxed with quality seal' },
  { status: 'Shipped', label: 'Shipped', description: 'Handed over to courier express hub' },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'With local driver for final delivery' },
  { status: 'Delivered', label: 'Delivered', description: 'Package safely delivered' },
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderId: initialOrderId,
  onNavigate,
  onSelectProduct,
}) => {
  const { showToast } = useToast();

  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial order or first available order
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      if (initialOrderId) {
        const found = orderService.getOrderById(initialOrderId);
        if (found) {
          setOrder(found);
          setSearchId(found.id);
          setLoading(false);
          return;
        }
      }

      // Fallback to most recent order
      const orders = orderService.getOrders();
      if (orders.length > 0) {
        setOrder(orders[0]);
        setSearchId(orders[0].id);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    const found = orderService.getOrderById(searchId.trim());
    if (found) {
      setOrder(found);
    } else {
      showToast(`Order #${searchId} not found`, { type: 'error' });
    }
    setLoading(false);
  };

  // Demo fast-forward status step for presentation
  const handleSimulateNextStep = async () => {
    if (!order) return;
    const statusOrder: OrderStatus[] = [
      'Order Placed',
      'Confirmed',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      const updated = await orderService.updateOrderStatus(order.id, nextStatus);
      if (updated) {
        setOrder({ ...updated });
        showToast(`Simulated Progress: ${nextStatus.toUpperCase()}`, {
          type: 'success',
        });
      }
    } else {
      showToast('Order is already marked as Delivered!', { type: 'info' });
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-700 cursor-pointer">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => onNavigate('orders')} className="hover:text-slate-700 cursor-pointer">Orders</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800">Live Package Tracking</span>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order ID (e.g. INB-82914) or Courier Tracking Code..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Track Parcel
          </button>
        </form>
      </div>

      {order ? (
        <div className="flex flex-col gap-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Courier Express: BlueDart Logistics
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                  #{order.id}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  AWB Tracking Code:{' '}
                  <strong className="text-slate-800 font-mono">{order.trackingNumber || 'BD8839201IN'}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Presentation Fast-Forward Simulator Button */}
                <button
                  onClick={handleSimulateNextStep}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E84A27] border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Fast forward status for demo"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  Simulate Next Stage
                </button>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-right">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    Expected Arrival
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    {order.estimatedDeliveryDate || 'Tomorrow by 6:00 PM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-8">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                {STEPS.map((s, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={s.status} className="flex flex-col items-center text-center relative">
                      {/* Connecting line (desktop) */}
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 z-0 ${
                            currentStepIndex > idx ? 'bg-orange-500' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      {/* Icon circle */}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#E84A27] text-white shadow-sm ring-4 ring-orange-100'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <span
                        className={`text-xs mt-2.5 font-bold ${
                          isCurrent ? 'text-orange-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                        {s.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Checkpoint Logs */}
            <div className="mt-4 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                Live Dispatch & Transit Activity Logs
              </h3>

              <div className="flex flex-col gap-3">
                {order.statusHistory.map((sh, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{sh.status}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sh.note}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{sh.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Shipping Address & Order Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                Delivery Address
              </h3>
              <p className="text-xs font-bold text-slate-800">{order.customerName}</p>
              <p className="text-xs text-slate-600 mt-1">{order.shippingAddress.street}</p>
              <p className="text-xs text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-xs text-slate-600">{order.shippingAddress.country}</p>
              {order.customerPhone && (
                <p className="text-xs text-slate-500 mt-2">Phone: {order.customerPhone}</p>
              )}
            </div>

            {/* Package Contents */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-600" />
                Items In This Shipment ({order.items.length})
              </h3>
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {order.items.map((it, idx) => (
                  <div
                    key={`${it.productId}-${idx}`}
                    onClick={() => onSelectProduct(it.productId)}
                    className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 p-1 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-8 h-8 object-cover rounded-md border border-slate-200"
                      />
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {it.name}
                      </span>
                    </div>
                    <span className="text-slate-500">Qty: {it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-xs text-slate-500">Enter an Order ID above to track delivery milestones.</p>
          </div>
        )
      )}
    </div>
  );
};

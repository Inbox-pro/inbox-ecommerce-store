import { Order, OrderStatus } from '../types';

const ORDERS_STORAGE_KEY = 'inbox_orders_data_v1';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'INB-82914',
    userId: 'user-cust-1',
    customerName: 'Pooja Sharma',
    customerEmail: 'user@inbox.com',
    customerPhone: '+91 98765 43210',
    date: '2026-09-18T14:30:00.000Z',
    items: [
      {
        productId: 'prod-elec-1',
        name: 'AuraSound Pro Active Noise Cancelling Headphones',
        price: 249.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        selectedColor: 'Midnight Black',
      },
      {
        productId: 'prod-acc-3',
        name: 'RidgeFold RFID-Blocking Slim Leather Wallet',
        price: 45.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        selectedColor: 'Cognac Tan',
      },
    ],
    subtotal: 294.99,
    discount: 29.50,
    deliveryFee: 0,
    tax: 21.24,
    total: 286.73,
    couponCode: 'SAVE10',
    shippingAddress: {
      id: 'addr-1',
      fullName: 'Pooja Sharma',
      phone: '+91 98765 43210',
      street: 'Flat 402, Skyline Residency, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      isDefault: true,
      type: 'Home',
    },
    deliveryMethod: 'Standard',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    transactionId: 'TXN-UPI-9948271',
    status: 'Shipped',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-09-18 14:30', note: 'Order successfully verified and payment confirmed' },
      { status: 'Confirmed', timestamp: '2026-09-18 16:15', note: 'Inventory reserved at Bengaluru Central Fulfillment Center' },
      { status: 'Packed', timestamp: '2026-09-19 09:40', note: 'Carefully packaged with tamper-proof security seals' },
      { status: 'Shipped', timestamp: '2026-09-19 18:20', note: 'Dispatched via BlueDart Express Logistics (AWB: BD8839201)' },
    ],
    trackingNumber: 'BD8839201IN',
    estimatedDeliveryDate: '2026-09-22',
  },
  {
    id: 'INB-74192',
    userId: 'user-cust-1',
    customerName: 'Pooja Sharma',
    customerEmail: 'user@inbox.com',
    customerPhone: '+91 98765 43210',
    date: '2026-09-02T10:15:00.000Z',
    items: [
      {
        productId: 'prod-groc-1',
        name: 'Estate Reserve Single Origin Ethiopian Whole Coffee Beans (1kg)',
        price: 28.50,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 57.00,
    discount: 0,
    deliveryFee: 0,
    tax: 4.56,
    total: 61.56,
    shippingAddress: {
      id: 'addr-1',
      fullName: 'Pooja Sharma',
      phone: '+91 98765 43210',
      street: 'Flat 402, Skyline Residency, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      isDefault: true,
      type: 'Home',
    },
    deliveryMethod: 'Standard',
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    transactionId: 'TXN-CARD-4418293',
    status: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-09-02 10:15', note: 'Order placed' },
      { status: 'Confirmed', timestamp: '2026-09-02 11:00', note: 'Confirmed by merchant' },
      { status: 'Packed', timestamp: '2026-09-02 15:30', note: 'Package prepared' },
      { status: 'Shipped', timestamp: '2026-09-03 08:00', note: 'In transit' },
      { status: 'Out for Delivery', timestamp: '2026-09-04 09:30', note: 'Courier out for delivery' },
      { status: 'Delivered', timestamp: '2026-09-04 14:10', note: 'Handed over to customer' },
    ],
    trackingNumber: 'INB-DEL-102948',
    estimatedDeliveryDate: '2026-09-04',
  },
];

export const orderService = {
  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    return orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase()) || null;
  },

  getUserOrders(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter((o) => o.userId === userId);
  },

  async createOrder(orderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory' | 'trackingNumber' | 'estimatedDeliveryDate'>): Promise<Order> {
    const orders = this.getOrders();
    const orderId = `INB-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const deliveryDays = orderData.deliveryMethod === 'Express' ? 2 : 4;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + deliveryDays);

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toLocaleString(),
          note: 'Order successfully placed. Verification in progress.',
        },
      ],
      trackingNumber,
      estimatedDeliveryDate: estDate.toISOString().split('T')[0],
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return newOrder;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<Order> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    const defaultNotes: Record<OrderStatus, string> = {
      'Order Placed': 'Order verified',
      'Confirmed': 'Order accepted and confirmed by store warehouse',
      'Packed': 'Items gathered, boxed, and quality checked',
      'Shipped': 'Package handed over to courier partner',
      'Out for Delivery': 'Delivery executive is out for delivery to your doorstep',
      'Delivered': 'Order successfully delivered and signed for',
    };

    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toLocaleString(),
      note: note || defaultNotes[newStatus],
    };

    order.status = newStatus;
    // Don't duplicate status in history if already there
    if (!order.statusHistory.some((h) => h.status === newStatus)) {
      order.statusHistory.push(historyEntry);
    }

    orders[index] = order;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return order;
  },
};

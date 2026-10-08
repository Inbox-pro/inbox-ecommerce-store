import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/LanguageContext';
import { orderService } from '../services/orderService';
import { Order, PaymentMethod, CartItem, Address, OrderItem } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  MapPin,
  Lock,
  ChevronRight,
  Building2,
  Wallet,
  QrCode,
  Banknote,
  Sparkles,
} from 'lucide-react';

interface CheckoutProps {
  onNavigate: (tab: string, param?: string) => void;
  onOrderPlaced: (order: Order) => void;
}

type CheckoutStep = 'address' | 'shipping' | 'payment';

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate, onOrderPlaced }) => {
  const { items, subtotal, discount, shipping, tax, total, clearCart } = useCart();
  const { user, defaultAddress } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [isProcessing, setIsProcessing] = useState(false);

  // Address Form state
  const [fullName, setFullName] = useState(user?.name || 'Alex Sharma');
  const [email, setEmail] = useState(user?.email || 'alex.sharma@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [street, setStreet] = useState(defaultAddress?.street || '402, Skyline Heights, MG Road');
  const [city, setCity] = useState(defaultAddress?.city || 'Bengaluru');
  const [state, setState] = useState(defaultAddress?.state || 'Karnataka');
  const [postalCode, setPostalCode] = useState(defaultAddress?.pincode || '560001');
  const [country, setCountry] = useState(defaultAddress?.country || 'India');

  // Shipping Speed option
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Credit Card Form mock states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Alex Sharma');

  // UPI VPA state
  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      // Don't immediately redirect if we are processing order completion
    }
  }, [items.length, isProcessing]);

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t('checkout.emptyTitle')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('checkout.emptyDesc')}</p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-4 px-6 py-2.5 bg-[#E84A27] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {t('checkout.browseProducts')}
        </button>
      </div>
    );
  }

  // Address step submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !street || !city || !postalCode) {
      showToast(t('toast.requiredFields'), { type: 'error' });
      return;
    }
    setCurrentStep('shipping');
  };

  // Shipping step submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  // Place Order Simulation
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate bank network latency (1.4s)
      await new Promise((res) => setTimeout(res, 1400));

      const orderItems: OrderItem[] = items.map((it: CartItem) => ({
        productId: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        image: it.product.images[0],
        selectedColor: it.selectedColor,
        selectedSize: it.selectedSize,
      }));

      const shippingAddr: Address = {
        id: `addr-${Date.now()}`,
        fullName,
        phone,
        street,
        city,
        state,
        pincode: postalCode,
        country: country || 'India',
        type: 'Home',
      };

      const newOrder = await orderService.createOrder({
        userId: user?.id || 'guest',
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        items: orderItems,
        subtotal,
        discount,
        deliveryFee: shipping + (shippingMethod === 'express' ? 9.99 : 0),
        tax,
        total: total + (shippingMethod === 'express' ? 9.99 : 0),
        shippingAddress: shippingAddr,
        deliveryMethod: shippingMethod === 'express' ? 'Express' : 'Standard',
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : paymentMethod === 'upi'
            ? 'UPI / QR'
            : paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : 'Net Banking',
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      });

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E84A27', '#009FE3', '#10B981', '#F59E0B'],
        });
      } catch (err) {
        // Safe fallback if canvas not available
      }

      showToast(t('orderSuccess.confirmedBadge'), { type: 'success' });
      clearCart();
      onOrderPlaced(newOrder);
      onNavigate('order-success', newOrder.id);
    } catch (err) {
      showToast('Failed to process payment. Please retry.', { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalShippingCost = shipping + (shippingMethod === 'express' ? 9.99 : 0);
  const finalPayableTotal = total + (shippingMethod === 'express' ? 9.99 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-700 cursor-pointer">{t('cart.breadcrumbHome')}</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => onNavigate('cart')} className="hover:text-slate-700 cursor-pointer">{t('cart.breadcrumbCart')}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800">{t('checkout.title')}</span>
      </div>

      {/* Stepper Progress Header */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 'address'
                  ? 'bg-[#E84A27] text-white ring-4 ring-orange-100'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {currentStep !== 'address' ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 'address' ? 'text-orange-600' : 'text-slate-700'
              }`}
            >
              {t('checkout.step1')}
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 'shipping'
                  ? 'bg-[#E84A27] text-white ring-4 ring-orange-100'
                  : currentStep === 'payment'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep === 'payment' ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 'shipping' ? 'text-orange-600' : 'text-slate-500'
              }`}
            >
              {t('checkout.step2')}
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 'payment'
                  ? 'bg-[#E84A27] text-white ring-4 ring-orange-100'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 'payment' ? 'text-orange-600' : 'text-slate-500'
              }`}
            >
              {t('checkout.step3')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Steps (Cols 1-8) & Order Review (Cols 9-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          {currentStep === 'address' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">{t('checkout.shippingHeading')}</h2>
              </div>

              <form onSubmit={handleAddressSubmit} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.fullName')} *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Sharma"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.email')} *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('checkout.phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('checkout.street')} *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Apt No., Building Name, Street"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.city')} *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.state')} *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.postalCode')} *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.country')} *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 py-3 px-6 bg-[#E84A27] hover:bg-[#d63f1f] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 self-end cursor-pointer"
                >
                  <span>{t('checkout.continueShipping')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {currentStep === 'shipping' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">{t('checkout.deliveryHeading')}</h2>
              </div>

              <form onSubmit={handleShippingSubmit} className="flex flex-col gap-4">
                {/* Standard Shipping */}
                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-orange-500 bg-orange-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t('checkout.standardTitle')}</p>
                      <p className="text-[11px] text-slate-500">{t('checkout.standardSub')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {shipping === 0 ? t('cart.free') : `$${shipping.toFixed(2)}`}
                  </span>
                </label>

                {/* Express Priority Shipping */}
                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-orange-500 bg-orange-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{t('checkout.expressTitle')}</span>
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          FASTEST
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">{t('checkout.expressSub')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">+$9.99</span>
                </label>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('address')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← {t('checkout.back')}
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-6 bg-[#E84A27] hover:bg-[#d63f1f] text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t('checkout.continuePayment')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: PAYMENT & CONFIRMATION */}
          {currentStep === 'payment' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('checkout.paymentHeading')}</h2>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Demo Sandbox Mode
                </span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('checkout.cardTitle')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t('checkout.upiTitle')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t('checkout.netbankingTitle')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t('checkout.codTitle')}</span>
                </button>
              </div>

              {/* Payment Specific Forms */}
              <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4 text-xs">
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">{t('checkout.cardNumber')} (Simulated)</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">{t('checkout.cardExpiry')}</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">{t('checkout.cardCvv')}</label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">{t('checkout.cardHolder')}</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3 text-center">
                    <p className="text-xs text-slate-600">
                      {t('checkout.upiSub')}
                    </p>
                    <div className="w-32 h-32 bg-white border border-slate-200 rounded-xl p-2 mx-auto flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-slate-800" />
                    </div>
                    <div className="text-left">
                      <label className="font-bold text-slate-700 block mb-1">{t('checkout.upiId')}</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@bank"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                    <label className="font-bold text-slate-700 block mb-1">{t('checkout.selectBank')}</label>
                    <select className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <p className="font-bold mb-1">{t('checkout.codTitle')}</p>
                    <p>{t('checkout.codNotice')}</p>
                  </div>
                )}

                {/* Bottom confirmation actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← {t('checkout.back')}
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="py-3 px-8 bg-[#E84A27] hover:bg-[#d63f1f] text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('checkout.processing')}</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('checkout.completePayment', { amount: finalPayableTotal.toFixed(2) })}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Order Review / Summary (Cols 9-12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              {t('checkout.orderSummary', { count: items.length })}
            </h3>

            {/* Items review snippet */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 my-3">
              {items.map((it: CartItem, idx: number) => (
                <div key={it.id || `${it.product.id}-${idx}`} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="max-w-[130px]">
                      <p className="font-bold text-slate-800 truncate">{it.product.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${(it.product.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.subtotal', { count: items.length })}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t('cart.discount')}</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.deliveryFee')}</span>
                <span>{finalShippingCost === 0 ? t('cart.free') : `$${finalShippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.estimatedTax')}</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">{t('cart.total')}</span>
                <span className="text-xl font-black text-slate-900">
                  ${finalPayableTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

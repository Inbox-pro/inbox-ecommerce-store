import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { useToast } from '../../context/ToastContext';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, Headphones, Send } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', { type: 'error' });
      return;
    }
    showToast('Subscribed to newsletter!', {
      message: 'Exclusive discounts and product releases will be sent to your inbox.',
      type: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20">
      {/* Guarantees Strip */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#E84A27] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Free Express Shipping</p>
              <p className="text-xs text-slate-400 mt-0.5">On orders above $75</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#009FE3] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">7-Day Easy Returns</p>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free instant refund</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100% Genuine Brands</p>
              <p className="text-xs text-slate-400 mt-0.5">Direct verified suppliers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">24/7 Dedicated Support</p>
              <p className="text-xs text-slate-400 mt-0.5">Live chat & phone hotline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 rounded-xl p-3 inline-block shadow-sm">
              <BrandLogo size="md" />
            </div>
            <p className="text-slate-400 mt-4 leading-relaxed text-xs max-w-sm">
              Inbox Infotech Pvt. Ltd. delivers an elevated digital commerce experience with an expansive catalog spanning modern electronics, contemporary fashion, home essentials, and lifestyle products.
            </p>

            <div className="flex flex-col gap-2 mt-5 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E84A27] shrink-0" />
                <span>Inbox Infotech Tower, Outer Ring Rd, Bengaluru, Karnataka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#009FE3] shrink-0" />
                <span>+91 (080) 4567-8900 / 1800-INBOX-EMPORIUM</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@inboxinfotech.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'deals')} className="hover:text-white transition-colors">
                  Flash Deals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cart')} className="hover:text-white transition-colors">
                  Shopping Cart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-blue-400 hover:text-blue-300 font-semibold">
                  Admin Demo Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <button onClick={() => onNavigate('products', 'Electronics')} className="hover:text-white transition-colors">
                  Electronics & Audio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'Fashion')} className="hover:text-white transition-colors">
                  Men & Women Fashion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'Home & Kitchen')} className="hover:text-white transition-colors">
                  Home & Smart Kitchen
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'Sports')} className="hover:text-white transition-colors">
                  Fitness & Outdoor Sports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'Beauty')} className="hover:text-white transition-colors">
                  Beauty & Skincare
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', 'Books')} className="hover:text-white transition-colors">
                  Books & Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Deals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              Subscribe to unlock 15% off coupon code <strong className="text-orange-400">WELCOME15</strong> and receive flash deal alerts.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#E84A27] hover:bg-[#d63f1f] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Subscribe to Newsletter
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Payment Methods, Presentation Notice */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} <strong>Inbox Infotech Pvt. Ltd.</strong> All rights reserved. Built as a comprehensive, responsive full-stack capable demo presentation.
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Accepted Demo Payments:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">Visa</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">Paytm / GPay</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

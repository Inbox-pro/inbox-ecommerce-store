import { Coupon } from '../types';

export const DEMO_COUPONS: Coupon[] = [
  {
    code: 'SAVE10',
    description: 'Get 10% off on all orders above $30',
    discountPercentage: 10,
    minSpend: 30,
    maxDiscount: 25,
  },
  {
    code: 'SAVE20',
    description: 'Get 20% off on orders above $100',
    discountPercentage: 20,
    minSpend: 100,
    maxDiscount: 60,
  },
  {
    code: 'WELCOME15',
    description: 'Special 15% welcome discount for new members',
    discountPercentage: 15,
    minSpend: 40,
    maxDiscount: 40,
  },
  {
    code: 'FREESHIP',
    description: 'Enjoy 100% free standard and express delivery',
    discountPercentage: 0,
    minSpend: 25,
    freeShipping: true,
  },
  {
    code: 'INBOX50',
    description: 'Inbox Infotech Launch Special — 25% off up to $75',
    discountPercentage: 25,
    minSpend: 150,
    maxDiscount: 75,
  },
];

export const AVAILABLE_COUPONS = DEMO_COUPONS;


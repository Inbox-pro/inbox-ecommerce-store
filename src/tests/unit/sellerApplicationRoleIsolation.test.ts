// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  sellerApplication: { findFirst: vi.fn(), create: vi.fn() },
  cartItem: { findMany: vi.fn() },
  product: { findMany: vi.fn() },
  createSession: vi.fn(),
}));
vi.mock('../../../server/db/prisma.js', () => ({ prisma: mocks }));
vi.mock('../../../server/middleware/auth.js', () => ({
  SESSION_COOKIE_NAME: 'session',
  createSession: mocks.createSession,
  revokeSession: vi.fn(),
  optionalAuth: (req: any, _res: unknown, next: () => void) => {
    if (req.get('x-test-role') === 'SUPER_ADMIN') {
      req.user = { id: 'super-admin-id', email: 'superadmin@gmail.com', role: Role.SUPER_ADMIN };
    } else if (req.get('x-test-role') === 'ADMIN') {
      req.user = { id: 'admin-id', email: 'merchant@store.com', role: Role.ADMIN };
    }
    next();
  },
  requireAuth: (req: any, res: any, next: () => void) => {
    if (!req.get('x-test-user')) return res.status(401).json({ error: { code: 'AUTH_REQUIRED' } });
    req.user = { id: 'owner', email: 'owner@example.test', role: Role.CUSTOMER };
    next();
  },
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireSuperAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { createApp } from '../../../server/app.js';

describe('Seller Application Role Isolation & Boundary Guard', () => {
  const app = createApp();

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.sellerApplication.findFirst.mockResolvedValue(null);
  });

  it('rejects seller application when an active Super Admin session calls seller-apply', async () => {
    const res = await request(app)
      .post('/api/super-admin/seller-apply')
      .set('Origin', 'http://localhost:3000')
      .set('x-requested-with', 'XMLHttpRequest')
      .set('x-test-role', 'SUPER_ADMIN')
      .send({
        storeName: 'Super Admin Shop',
        legalName: 'Super Admin LLC',
        phone: '+1 555 123 4567',
        businessAddress: '100 Platform Rd',
        category: 'Electronics',
      });

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe('ROLE_PORTAL_MISMATCH');
    expect(res.body.error?.message).toContain('Super Admin');
  });

  it('rejects seller application when an active Merchant Admin session calls seller-apply', async () => {
    const res = await request(app)
      .post('/api/super-admin/seller-apply')
      .set('Origin', 'http://localhost:3000')
      .set('x-requested-with', 'XMLHttpRequest')
      .set('x-test-role', 'ADMIN')
      .send({
        storeName: 'Second Store Attempt',
        legalName: 'Second Store LLC',
        phone: '+1 555 123 4567',
        businessAddress: '100 Merchant Rd',
        category: 'Sports',
      });

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe('ALREADY_MERCHANT');
  });

  it('rejects seller application when submitted with email of an existing Super Admin account', async () => {
    mocks.user.findUnique.mockResolvedValue({
      id: 'super-id',
      email: 'superadmin@gmail.com',
      role: Role.SUPER_ADMIN,
    });

    const res = await request(app)
      .post('/api/super-admin/seller-apply')
      .set('Origin', 'http://localhost:3000')
      .set('x-requested-with', 'XMLHttpRequest')
      .send({
        storeName: 'Test Super Store',
        legalName: 'Test Legal Super LLC',
        email: 'superadmin@gmail.com',
        phone: '+1 555 999 8888',
        businessAddress: '123 Enterprise Rd, Suite 400',
        category: 'Electronics',
        taxId: 'US-TAX-9988',
        description: 'Should be rejected',
      });

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe('ROLE_PORTAL_MISMATCH');
  });

  it('rejects seller application when submitted with email of an existing Merchant Admin account', async () => {
    mocks.user.findUnique.mockResolvedValue({
      id: 'admin-id',
      email: 'existingadmin@store.com',
      role: Role.ADMIN,
    });

    const res = await request(app)
      .post('/api/super-admin/seller-apply')
      .set('Origin', 'http://localhost:3000')
      .set('x-requested-with', 'XMLHttpRequest')
      .send({
        storeName: 'Test Duplicate Admin Store',
        legalName: 'Test Legal Admin LLC',
        email: 'existingadmin@store.com',
        phone: '+1 555 999 7777',
        businessAddress: '456 Commercial Blvd',
        category: 'Sports',
        taxId: 'US-TAX-7766',
        description: 'Should be rejected',
      });

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe('ALREADY_MERCHANT');
  });
});

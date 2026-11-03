import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { superAdminService } from '../../services/superAdminService';
import { apiClient } from '../../services/apiClient';

describe('superAdminService.updateCredentials', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends PUT request to /api/super-admin/credentials with valid payload', async () => {
    const mockResponse = {
      message: 'Super Admin credentials updated successfully.',
      user: {
        id: 'super-123',
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        role: 'superadmin',
      },
    };

    (apiClient.put as any).mockResolvedValueOnce(mockResponse);

    const payload = {
      currentPassword: 'CurrentPassword123!',
      newEmail: 'newadmin@gmail.com',
      newPassword: 'NewPassword2026!',
    };

    const result = await superAdminService.updateCredentials(payload);

    expect(apiClient.put).toHaveBeenCalledWith('/api/super-admin/credentials', payload);
    expect(result).toEqual(mockResponse);
  });

  it('handles password-only update payload', async () => {
    const mockResponse = {
      message: 'Super Admin credentials updated successfully.',
      user: {
        id: 'super-123',
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        role: 'superadmin',
      },
    };

    (apiClient.put as any).mockResolvedValueOnce(mockResponse);

    const payload = {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'BrandNewPassword123!',
    };

    const result = await superAdminService.updateCredentials(payload);

    expect(apiClient.put).toHaveBeenCalledWith('/api/super-admin/credentials', payload);
    expect(result.message).toBe('Super Admin credentials updated successfully.');
  });
});


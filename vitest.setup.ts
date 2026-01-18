import { vi } from 'vitest';

// Mock fs-extra
vi.mock('fs-extra', () => import('./__mocks__/fs-extra.js'));

// Mock update-notifier to prevent network calls that may hang
vi.mock('update-notifier', () => ({
  default: () => ({ notify: () => {} }),
}));

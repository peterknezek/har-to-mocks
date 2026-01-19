import { vi } from 'vitest';

// Mock fs-extra
vi.mock('fs-extra', async () => {
  const actual = await vi.importActual<typeof import('fs-extra')>('fs-extra');
  const ensureDirSyncMock = vi.fn();
  const writeFileSyncMock = vi.fn();
  const readJsonMock = vi.fn(async (filepath: string) => {
    // For package.json, return a mock package
    if (filepath.includes('package.json')) {
      return {
        name: 'har-to-mocks',
        version: '0.0.0',
      };
    }
    // For actual .har files, use the real readJson
    return actual.readJson(filepath);
  });

  return {
    default: {
      ...actual,
      ensureDirSync: ensureDirSyncMock,
      writeFileSync: writeFileSyncMock,
      readJson: readJsonMock,
    },
    ensureDirSync: ensureDirSyncMock,
    writeFileSync: writeFileSyncMock,
    readJson: readJsonMock,
  };
});

// Mock update-notifier to prevent network calls that may hang
vi.mock('update-notifier', () => ({
  default: () => ({ notify: () => {} }),
}));

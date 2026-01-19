import { Config } from '@oclif/core';
import HarToMocks from '../src/index.js';
import fsExtra from 'fs-extra';

// Lazy-load config once for all tests
let config: Config | undefined;

async function getConfig(): Promise<Config> {
  if (!config) {
    const originalEmitWarning = process.emitWarning;
    process.emitWarning = () => {};
    try {
      config = await Config.load();
    } finally {
      process.emitWarning = originalEmitWarning;
    }
  }
  return config;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Integration Tests', () => {
  it('without any flag show all requests in .har', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
  });

  it('with url flag should filter requests based on url with case sensitive', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', '--url=/user'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
  });

  it('should render result table with folder tree without writing files', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--dry-run'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
  });

  it('should write files to fs', async () => {
    const cfg = await getConfig();
    const writeFileSpy = vi.mocked(fsExtra.writeFileSync);
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    expect(writeFileSpy).toHaveBeenCalledTimes(3);
  });

  it('should render with GET and POST requests', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--method=GET', '--method=POST'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
  });
});

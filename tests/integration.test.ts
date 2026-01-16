import { Config } from '@oclif/core';
import HarToMocks from '../src/index.js';
import fsExtra from 'fs-extra';

let config: Config;

beforeAll(async () => {
  // Suppress process.emitWarning during config load
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = () => {};
  try {
    config = await Config.load();
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

describe('Defined path to .har', () => {
  it('without any flag show all requests in .har', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har'], config);
    await expect(cmd.run()).resolves.not.toThrow();
  });

  it('with url flag should filter requests based on url with case sensitive', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', '--url=/user'], config);
    await expect(cmd.run()).resolves.not.toThrow();
  });
});

describe('Defined path to .har and target path', () => {
  it('should render result table with folder tree without writing files', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--dry-run'], config);
    await expect(cmd.run()).resolves.not.toThrow();
  });

  it('should write files to fs', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks'], config);
    await expect(cmd.run()).resolves.not.toThrow();
    expect(fsExtra.writeFileSync).toHaveBeenCalledTimes(3);
  });
});

describe('Check multiple `--method` options', () => {
  it('should render with GET and POST requests', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--method=GET', '--method=POST'], config);
    await expect(cmd.run()).resolves.not.toThrow();
  });
});

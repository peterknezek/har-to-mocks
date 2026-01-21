import { Config } from '@oclif/core';
import HarToMocks from '../src/commands/index.js';
import fsExtra from 'fs-extra';
import type { MockInstance } from 'vitest';

// Lazy-load config once for all tests
let config: Config | undefined;
let stdoutSpy: MockInstance;
let consoleLogSpy: MockInstance;

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

  // Spy on stdout and console.log to capture output
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  stdoutSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

const captureOutput = () => {
  const stdoutCalls = stdoutSpy.mock.calls
    .map(call => typeof call[0] === 'string' ? call[0] : '')
    .join('');
  const consoleCalls = consoleLogSpy.mock.calls
    .map(call => String(call[0]))
    .join('\n');
  return stdoutCalls + (consoleCalls ? '\n' + consoleCalls : '');
};

describe('Integration Tests', () => {
  it('without any flag show all requests in .har', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });

  it('with url flag should filter requests based on url with case sensitive', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', '--url=/user'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });

  it('should render result table with folder tree without writing files', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--dry-run'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });

  it('should write files to fs', async () => {
    const cfg = await getConfig();
    const writeFileSpy = vi.mocked(fsExtra.writeFileSync);
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    expect(writeFileSpy).toHaveBeenCalledTimes(3);
  });

  it('should render with GET and POST requests', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--method=GET', '--method=POST'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });
});

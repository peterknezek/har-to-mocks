import { Config } from '@oclif/core';
import HarToMocks from '../src/index.js';
import fsExtra from 'fs-extra';

let config: Config;
let stdoutSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;
let stderrSpy: jest.SpyInstance;

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

  // Spy on stdout and stderr to capture output
  stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

const captureOutput = () => {
  const stdoutCalls = stdoutSpy.mock.calls
    .map(call => typeof call[0] === 'string' ? call[0] : '')
    .join('');
  const consoleCalls = consoleLogSpy.mock.calls
    .map(call => call[0])
    .join('\n');
  return stdoutCalls + (consoleCalls ? '\n' + consoleCalls : '');
};

describe('Defined path to .har', () => {
  it('without any flag show all requests in .har', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har'], config);
    await cmd.run();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });

  it('with url flag should filter requests based on url with case sensitive', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', '--url=/user'], config);
    await cmd.run();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });
});

describe('Defined path to .har and target path', () => {
  it('should render result table with folder tree without writing files', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--dry-run'], config);
    await cmd.run();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });

  it('should write files to fs', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks'], config);
    await cmd.run();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    expect(fsExtra.writeFileSync).toHaveBeenCalledTimes(3);
  });
});

describe('Check multiple `--method` options', () => {
  it('should render with GET and POST requests', async () => {
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './mocks', '--method=GET', '--method=POST'], config);
    await cmd.run();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
  });
});

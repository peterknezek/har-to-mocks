import { Config } from '@oclif/core';
import HarToMocks from '../src/index.js';
import type { MockInstance } from 'vitest';
import type { ChoiceWithPreview } from '../src/har-to-mocks/features/interactive-select/checkbox-with-preview.js';

// Mock only writeFileSync and mkdirSync
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Interactive prompts are answered by the tests
vi.mock('../src/har-to-mocks/features/interactive-select/checkbox-with-preview.js', () => ({
  checkboxWithPreview: vi.fn(),
}));
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
}));

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
    const { writeFileSync } = await import('node:fs');
    const writeFileSpy = vi.mocked(writeFileSync);
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

  it('should display query strings in the Query column for duplicate routes', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    // Verify that both search queries are shown
    expect(output).toContain('?q=javascript');
    expect(output).toContain('?q=python');
  });

  it('should filter by url including query string', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har', '--url=?q=javascript'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    // Should only include the javascript query
    expect(output).toContain('?q=javascript');
    expect(output).not.toContain('?q=python');
  });

  it('should filter by url with path and query string', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har', '--url=/complete/search?q=python'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    // Should only include the python query
    expect(output).toContain('?q=python');
    expect(output).not.toContain('?q=javascript');
  });
});

describe('Chrome overrides format', () => {
  it('should render folder tree with one file per URL without writing files', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(
      ['./tests/mocks/sample-with-query.har', './overrides', '--format=chrome-overrides', '--dry-run'],
      cfg,
    );
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    // Query strings are part of the file name, so both searches are written
    expect(output).toContain('search?q=javascript');
    expect(output).toContain('search?q=python');
    expect(output).not.toContain('skip');
  });

  it('should write files to host and path folders', async () => {
    const cfg = await getConfig();
    const { writeFileSync } = await import('node:fs');
    const writeFileSpy = vi.mocked(writeFileSync);
    const cmd = new HarToMocks(
      ['./tests/mocks/sample.har', './overrides', '-f', 'chrome-overrides', '--method=GET', '--method=POST'],
      cfg,
    );
    await expect(cmd.run()).resolves.not.toThrow();
    expect(writeFileSpy).toHaveBeenCalledTimes(4);
    expect(writeFileSpy).toHaveBeenCalledWith('overrides/sample.com/api/service/userRoles', expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith('overrides/sample.com/api/service/send', expect.any(String));
  });

  it('should explain when a file and a folder would have the same path', async () => {
    const cfg = await getConfig();
    const { writeFileSync } = await import('node:fs');
    vi.mocked(writeFileSync).mockImplementationOnce(() => {
      throw Object.assign(new Error('EISDIR: illegal operation on a directory'), { code: 'EISDIR' });
    });
    const cmd = new HarToMocks(['./tests/mocks/sample.har', './overrides', '--format=chrome-overrides'], cfg);
    await expect(cmd.run()).rejects.toThrow('Failed to write 1 out of 3 file(s)');
    expect(captureOutput()).toContain('A file and a folder would have the same path');
  });
});

describe('Select requests', () => {
  it('should show only selected requests with their row numbers', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har', '--select=2,4'], cfg);
    await expect(cmd.run()).resolves.not.toThrow();
    const output = captureOutput();
    expect(output).toMatchSnapshot();
    expect(output).toContain('Selected requests:');
    expect(output).not.toContain('?q=javascript');
  });

  it('should write only selected requests in the chosen format', async () => {
    const cfg = await getConfig();
    const { writeFileSync } = await import('node:fs');
    const writeFileSpy = vi.mocked(writeFileSync);
    const cmd = new HarToMocks(
      ['./tests/mocks/sample-with-query.har', '-s', '1', '-s', '3-4', './overrides', '-f', 'chrome-overrides'],
      cfg,
    );
    await expect(cmd.run()).resolves.not.toThrow();
    expect(writeFileSpy).toHaveBeenCalledTimes(3);
    expect(writeFileSpy).toHaveBeenCalledWith('overrides/sample.com/complete/search?q=javascript', expect.any(String));
    expect(writeFileSpy).not.toHaveBeenCalledWith('overrides/sample.com/complete/search?q=python', expect.any(String));
  });

  it('should show friendly error for invalid selection', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har', '--select=1,x'], cfg);
    await expect(cmd.run()).rejects.toThrow('Invalid --select value "x"');
  });

  it('should show friendly error for selection out of range', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/sample-with-query.har', '--select=5'], cfg);
    await expect(cmd.run()).rejects.toThrow('Row 5 does not exist in --select. There are 4 filtered requests.');
  });

  it('should pre-select requests in interactive mode and print the same selection', async () => {
    const cfg = await getConfig();
    const { writeFileSync } = await import('node:fs');
    const { confirm } = await import('@inquirer/prompts');
    const { checkboxWithPreview } = await import(
      '../src/har-to-mocks/features/interactive-select/checkbox-with-preview.js'
    );
    const writeFileSpy = vi.mocked(writeFileSync);
    // Accept the pre-selected choices as they are
    const acceptPreselected = (config: { choices: ReadonlyArray<ChoiceWithPreview<number>> }) =>
      Promise.resolve(config.choices.filter((choice) => choice.checked).map((choice) => choice.value));
    vi.mocked(checkboxWithPreview).mockImplementationOnce(acceptPreselected as never);
    vi.mocked(confirm).mockResolvedValueOnce(true);

    const cmd = new HarToMocks(
      ['./tests/mocks/sample-with-query.har', './overrides', '-f', 'chrome-overrides', '-i', '--select=2'],
      cfg,
    );
    await expect(cmd.run()).resolves.not.toThrow();
    expect(captureOutput()).toContain('use: --select=2');
    expect(writeFileSpy).toHaveBeenCalledTimes(1);
    expect(writeFileSpy).toHaveBeenCalledWith('overrides/sample.com/complete/search?q=python', expect.any(String));
  });
});

describe('Error handling', () => {
  it('should show friendly error when file does not exist', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/does-not-exist.har'], cfg);
    await expect(cmd.run()).rejects.toThrow('File not found: ./tests/mocks/does-not-exist.har');
  });

  it('should show friendly error when file is not valid JSON', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/invalid-json.har'], cfg);
    await expect(cmd.run()).rejects.toThrow('File is not valid JSON: ./tests/mocks/invalid-json.har');
  });

  it('should show friendly error when JSON is not a HAR file', async () => {
    const cfg = await getConfig();
    const cmd = new HarToMocks(['./tests/mocks/not-har.har'], cfg);
    await expect(cmd.run()).rejects.toThrow(
      'File is not a valid HAR file (missing "log.entries"): ./tests/mocks/not-har.har',
    );
  });

  it('should skip entries with invalid request URL and warn instead of crashing', async () => {
    const cfg = await getConfig();
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const cmd = new HarToMocks(['./tests/mocks/sample-invalid-url.har'], cfg);
      await expect(cmd.run()).resolves.not.toThrow();
      const output = captureOutput();
      // Valid entry is still listed, invalid one is skipped
      expect(output).toContain('/api/service/users');
      expect(output).not.toContain('not-a-valid-url');
      const stderrOutput = [...stderrSpy.mock.calls, ...consoleErrorSpy.mock.calls]
        .map((call) => String(call[0]))
        .join('');
      expect(stderrOutput).toContain('Skipped 1 entry with an invalid request URL.');
    } finally {
      stderrSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    }
  });
});

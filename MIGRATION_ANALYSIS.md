# Oclif Framework Migration Analysis - har-to-mocks

**Date:** 2026-01-15
**Current Framework:** Oclif v1 (@oclif/command@^1.8.0)
**Target Framework:** @oclif/core@^4.8.0
**Project:** har-to-mocks CLI tool

---

## Executive Summary

The `har-to-mocks` project currently uses the **deprecated Oclif v1 framework** with critical security vulnerabilities. This analysis covers:

1. **Current State Assessment** - Framework version, dependencies, and vulnerabilities
2. **Security Vulnerabilities** - 34 vulnerabilities (1 critical, 11 high, 10 moderate, 12 low)
3. **Test Coverage Status** - 100% coverage threshold with custom Jest setup
4. **Migration Requirements** - Path from v1 to v4 with breaking changes
5. **Testing Adaptation Strategy** - CLI testing approach and custom adapter needs
6. **Recommended Action Plan** - Step-by-step migration strategy

---

## 1. Current State Assessment

### Framework Dependencies

#### Deprecated Oclif v1 Packages (Production)
```json
{
  "@oclif/command": "^1.8.0",      // DEPRECATED - Use @oclif/core
  "cli-ux": "^5.6.7",               // DEPRECATED - Merged into @oclif/core
  "fs-extra": "^10.1.0",
  "tslib": "^2.4.0",
  "update-notifier": "^5.1.0"
}
```

#### Deprecated Oclif v1 Packages (Development)
```json
{
  "@oclif/config": "^1.17.0",      // DEPRECATED - Use @oclif/core
  "@oclif/dev-cli": "^1.26.10",    // DEPRECATED - Use oclif@^4.x
  "@oclif/plugin-help": "^5.1.12",
  "@oclif/test": "^2.1.0",
  "jest": "^28.1.1",
  "ts-jest": "^28.0.5",
  "typescript": "^4.7.3"
}
```

### Current CLI Structure

**Entry Point:** `/bin/run`
```javascript
#!/usr/bin/env node
require('ts-node').register({project})
require(`../${dev ? 'src' : 'lib'}`).run()
.catch(require('@oclif/errors/handle'))
```

**Command Implementation:** `/src/index.ts`
```typescript
import { Command, flags } from '@oclif/command';
import { readJson } from 'fs-extra';
import updateNotifier from 'update-notifier';

class HarToMocks extends Command {
  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    url: flags.string({ char: 'u', description: 'filter by url' }),
    method: flags.string({
      char: 'm',
      options: Object.values(Method),
      multiple: true,
      default: [Method.GET]
    }),
    type: flags.enum<ResourceType>({
      char: 't',
      options: Object.values(ResourceType),
      default: ResourceType.xhr
    }),
    'dry-run': flags.boolean({ description: 'to not write files' })
  };

  static args = [
    { name: 'file', description: 'sorce file (.har) path', require: true },
    { name: 'to', description: 'path to your mocks/api folder' }
  ];

  async run() {
    const { args, flags: usedFlags } = this.parse(HarToMocks);
    // ... implementation
  }
}
```

### Node.js Version Support
- **Current:** `>=8.0.0` (package.json engines)
- **Required for @oclif/core v4:** `>=18.0.0`
- **Recommendation:** Update to Node.js 20+ (LTS)

---

## 2. Security Vulnerabilities

### Critical Issues (npm audit summary)
```
34 vulnerabilities (12 low, 10 moderate, 11 high, 1 critical)
```

### High-Priority Vulnerabilities

#### 1. **@babel/traverse** - CRITICAL
- **Severity:** 9.4 CVSS
- **CVE:** GHSA-67hx-6x53-jw92
- **Issue:** Arbitrary code execution vulnerability
- **Affected:** `<7.23.2`
- **Fix:** Transitive dependency - update Jest and related tooling

#### 2. **@babel/helpers** - MODERATE
- **Severity:** 6.2 CVSS
- **CVE:** GHSA-968p-4wvh-cqc8
- **Issue:** Inefficient RegExp complexity (ReDoS)
- **Affected:** `<7.26.10`
- **Fix:** Update parent dependencies

#### 3. **braces** - HIGH
- **Severity:** 7.5 CVSS
- **CVE:** GHSA-grv7-fg5c-xmjg
- **Issue:** Uncontrolled resource consumption
- **Affected:** `<3.0.3`
- **Fix:** Update micromatch dependencies

#### 4. **cross-spawn** - HIGH
- **Severity:** 7.5 CVSS
- **CVE:** GHSA-3xgq-45jj-v275
- **Issue:** RegExp Denial of Service
- **Affected:** `<6.0.6`
- **Fix:** Update Jest and testing tools

#### 5. **@oclif/dev-cli** - LOW
- **Issue:** Transitive vulnerability via `qqjs`
- **Fix:** Replace with modern `oclif@^4.x` CLI

#### 6. **cli-ux** - DEPRECATED
- **Warning:** Package no longer supported
- **Fix:** Migrate to `@oclif/core` which includes cli-ux functionality

### Dependency Update Requirements
Many vulnerabilities stem from outdated transitive dependencies in:
- Jest ecosystem (babel, cross-spawn)
- Oclif v1 packages
- Legacy build tools

**Resolution:** Updating to @oclif/core v4 and Jest v29+ will resolve most issues.

---

## 3. Test Coverage Status

### Coverage Configuration
**File:** `jest.config.js`
```javascript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```
✅ **Strict 100% threshold enforced on all metrics**

### Test Suite Overview

| Test Suite | Location | Tests | Purpose |
|------------|----------|-------|---------|
| Integration | `/tests/integration.test.ts` | 5 | CLI end-to-end testing |
| Unit - folder-tree | `/src/har-to-mocks/features/folder-tree/folder-tree.test.ts` | 1 | Tree visualization |
| Unit - extract-to-columns | `/src/har-to-mocks/features/result-table/utils/extract-to-columns.test.ts` | 2 | URL parsing |
| Unit - process-data | `/src/har-to-mocks/features/write-mocks/utils/process-data.test.ts` | 1 | File path transformation |
| **Total** | | **9** | |

### Test Framework Stack
```json
{
  "@oclif/test": "^2.1.0",    // CLI testing utilities
  "jest": "^28.1.1",           // Test runner
  "ts-jest": "^28.0.5",        // TypeScript support
  "chai": "^4.3.4"             // Assertions (unused?)
}
```

### Current CLI Testing Pattern

**Integration tests use `@oclif/test`:**
```typescript
import { test } from '@oclif/test';
import cmd = require('../src');

describe('CLI functionality', () => {
  test
    .stdout()
    .do(() => cmd.run(['./tests/mocks/sample.har']))
    .it('without any flag show all requests in .har', (ctx) => {
      expect(ctx.stdout).toBe(`...expected output...`);
    });
});
```

### Feature Coverage

#### ✅ **Well Tested**
- Default command execution (no flags)
- `--url` flag for URL filtering
- `--method` flag with multiple values
- `--dry-run` flag for preview mode
- File writing operations (call count)
- Output table formatting
- Folder tree visualization

#### ⚠️ **Partially Tested**
- HTTP methods (only GET, POST tested)
- Resource types (only `xhr` tested)
- File content verification (only call count, not actual content)

#### ❌ **Not Tested**
- Error handling (invalid HAR, missing files, I/O errors)
- Edge cases (empty data, special characters, malformed input)
- `HarToMocksProcess` class methods in isolation
- Logger output
- Update notifier functionality
- Help/version flags
- PUT, DELETE, PATCH methods
- `fetch`, `document` resource types
- URL filtering with query parameters

### Test Gaps Summary

**Coverage Status:** Tests exist but may not exercise all code paths needed for 100% coverage. The strict Jest threshold suggests either:
1. Coverage collection is disabled (`collectCoverage: false`)
2. Some code is excluded from coverage
3. Coverage reports are not being generated in CI

**Risk:** Migration will require careful test updates to maintain coverage.

---

## 4. Migration Requirements

### Migration Path: v1 → v4

The migration involves **two major version jumps**:
1. **v1 → v2:** Deprecated packages to `@oclif/core`
2. **v2 → v3:** Breaking changes in Node.js, ts-node, and Config structure
3. **v3 → v4:** Latest stable release

### Breaking Changes Matrix

| Category | v1 Behavior | v4 Behavior | Impact |
|----------|-------------|-------------|--------|
| **Imports** | `@oclif/command`, `cli-ux` | `@oclif/core` | HIGH |
| **Parse Method** | Synchronous | Asynchronous (`await`) | HIGH |
| **Args Definition** | Array format | Object with `Args.*` methods | HIGH |
| **Flags Auto-add** | `-h`, `-v` auto-added | Must explicitly configure | LOW |
| **Node.js Version** | >=8.0.0 | >=18.0.0 | MEDIUM |
| **ts-node** | Bundled | Must add as devDependency | MEDIUM |
| **cli-ux** | Separate package | `ux` namespace in core | HIGH |
| **Bin Script** | Basic | ESM/CJS interop required | MEDIUM |
| **Config.plugins** | Array | Map<string, Plugin> | LOW |
| **Error Handler** | Sync | Async | MEDIUM |

### Detailed Migration Steps

#### Step 1: Update package.json Dependencies

**Remove:**
```json
{
  "@oclif/command": "^1.8.0",
  "@oclif/config": "^1.17.0",
  "@oclif/dev-cli": "^1.26.10",
  "cli-ux": "^5.6.7"
}
```

**Add:**
```json
{
  "dependencies": {
    "@oclif/core": "^4.8.0"
  },
  "devDependencies": {
    "oclif": "^4.16.3",
    "ts-node": "^10.9.2",
    "@oclif/test": "^4.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Step 2: Update Command Implementation

**Before (`/src/index.ts`):**
```typescript
import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';

class HarToMocks extends Command {
  static flags = {
    url: flags.string({ char: 'u' }),
    method: flags.string({ char: 'm', multiple: true })
  };

  static args = [
    { name: 'file', require: true },
    { name: 'to' }
  ];

  async run() {
    const { args, flags } = this.parse(HarToMocks);
    cli.log('Processing...');
  }
}
```

**After:**
```typescript
import { Command, Flags, Args, ux } from '@oclif/core';

class HarToMocks extends Command {
  static flags = {
    url: Flags.string({ char: 'u' }),
    method: Flags.string({ char: 'm', multiple: true })
  };

  static args = {
    file: Args.string({ description: 'source file (.har) path', required: true }),
    to: Args.string({ description: 'path to your mocks/api folder' })
  };

  async run() {
    const { args, flags } = await this.parse(HarToMocks);  // AWAIT!
    ux.log('Processing...');  // Changed from cli.log
  }
}
```

**Key Changes:**
1. Import `Flags` and `Args` from `@oclif/core`
2. Change `flags.string` → `Flags.string`
3. Convert args array to object using `Args.string()`, `Args.file()`, etc.
4. **Add `await` before `this.parse()`** ⚠️ Critical!
5. Replace `cli.*` with `ux.*`

#### Step 3: Update Bin Script

**Before (`/bin/run`):**
```javascript
#!/usr/bin/env node
const path = require('path')
const project = path.join(__dirname, '../tsconfig.json')
const dev = require('fs').existsSync(project)

if (dev) {
  require('ts-node').register({project})
}

require(`../${dev ? 'src' : 'lib'}`).run()
.catch(require('@oclif/errors/handle'))
```

**After (CJS):**
```javascript
#!/usr/bin/env node

const oclif = require('@oclif/core')

const path = require('path')
const project = path.join(__dirname, '..', 'tsconfig.json')
const dev = require('fs').existsSync(project)

if (dev) {
  require('ts-node').register({project})
}

oclif.run().then(require('@oclif/core/flush')).catch(require('@oclif/core/handle'))
```

**Changes:**
1. Import `@oclif/core` module
2. Use `oclif.run()` instead of `require('../src').run()`
3. Update error handler: `require('@oclif/core/handle')`
4. Add flush handler: `.then(require('@oclif/core/flush'))`

#### Step 4: Update package.json Oclif Configuration

**Add:**
```json
{
  "oclif": {
    "bin": "har-to-mocks",
    "dirname": "har-to-mocks",
    "commands": "./lib",
    "additionalHelpFlags": ["-h"],
    "additionalVersionFlags": ["-v"]
  }
}
```

**Explanation:**
- `additionalHelpFlags`/`additionalVersionFlags`: Restore `-h` and `-v` shortcuts removed in v2
- `commands`: Path to compiled command files

#### Step 5: Update tsconfig.json

Ensure modern TypeScript settings:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

---

## 5. Testing Adaptation Strategy

### Current Testing Architecture

The project uses a **hybrid approach**:
- **@oclif/test** for CLI integration testing
- **Jest** as test runner
- **Custom test patterns** for verifying stdout

### Migration Impact on Tests

#### @oclif/test v2 → v4 Changes

**Version Compatibility:**
```json
{
  "@oclif/test": "^4.0.0"  // Requires @oclif/core ^4.x
}
```

**Breaking Changes in @oclif/test:**
1. May require updating test helper imports
2. Stdout/stderr capture mechanisms could change
3. Mock setup for file operations needs verification

### Test Adapter Requirements

#### Current Test Pattern Analysis

**Integration Test Structure:**
```typescript
import { test } from '@oclif/test';
import cmd = require('../src');
import fsExtra from 'fs-extra';

describe('Defined path to .har', () => {
  test
    .stdout()
    .do(() => cmd.run(['./tests/mocks/sample.har']))
    .it('without any flag show all requests', (ctx) => {
      expect(ctx.stdout).toBe(`...expected output...`);
    });
});
```

**Issues:**
1. ❌ Directly requires command: `cmd = require('../src')`
2. ⚠️ Assumes synchronous execution
3. ✅ Uses `@oclif/test` stdout capture (good!)
4. ❌ Mock setup unclear (fs-extra mocking?)

#### Recommended Test Adapter Approach

##### Option A: Minimal Adapter (Recommended)

**Keep @oclif/test framework**, update test patterns:

```typescript
import { Config } from '@oclif/core';
import { test, expect } from '@oclif/test';

describe('CLI tests', () => {
  test
    .stdout()
    .command(['./tests/mocks/sample.har'])  // Use .command() instead of .do()
    .it('should show all requests', (ctx) => {
      expect(ctx.stdout).to.contain('Filtered requests:');
    });
});
```

**Changes:**
- Use `.command([...])` instead of `.do(() => cmd.run([...]))`
- Remove direct command import
- Update assertions if needed (Chai vs Jest expectations)

##### Option B: Custom Test Helper (If needed)

Create a test utility wrapper:

```typescript
// tests/helpers/cli-runner.ts
import { Config } from '@oclif/core';
import HarToMocks from '../../src';

export async function runCLI(args: string[]): Promise<string> {
  const config = await Config.load();
  const command = new HarToMocks(args, config);

  let output = '';
  const originalLog = command.log;
  command.log = (message: string) => {
    output += message + '\n';
  };

  await command.run();
  return output;
}

// Usage in tests:
describe('CLI functionality', () => {
  it('should filter requests by URL', async () => {
    const output = await runCLI(['./tests/mocks/sample.har', '--url=/user']);
    expect(output).toContain('userRoles');
  });
});
```

**Pros:**
- Full control over command execution
- Easy to add custom assertions
- Works with Jest's async/await patterns

**Cons:**
- More maintenance overhead
- Duplicates some @oclif/test functionality

##### Option C: Hybrid Approach (Most Flexible)

Use **both** @oclif/test for integration tests **and** direct Jest tests for unit tests:

```typescript
// Integration test (tests/integration.test.ts)
import { test, expect } from '@oclif/test';

describe('Integration: CLI commands', () => {
  test
    .stdout()
    .command(['sample.har'])
    .it('runs command', (ctx) => {
      expect(ctx.stdout).to.contain('Filtered requests');
    });
});

// Unit test (src/har-to-mocks/har-to-mocks.test.ts)
import { HarToMocksProcess } from './har-to-mocks';

describe('Unit: HarToMocksProcess', () => {
  it('extracts entries from HAR', () => {
    const processor = new HarToMocksProcess(console.log);
    const result = processor.extract(mockHar, { methods: ['GET'] });
    expect(result).toHaveLength(3);
  });
});
```

### Recommended Test Migration Steps

1. **Update @oclif/test to v4** and verify existing tests still pass
2. **Replace `cmd.run()` pattern** with `.command([...])`
3. **Add `await` to async test operations** if needed
4. **Verify mock setup** for fs-extra and other dependencies
5. **Add unit tests** for classes/functions not covered by integration tests
6. **Run coverage report** to identify gaps: `npm run test:ci -- --coverage`

### Mock Adapter for File System

The current tests mock `fs-extra` to avoid actual file writes. Ensure mocking works after migration:

**Jest mock setup (`__mocks__/fs-extra.ts`):**
```typescript
const fsExtra = jest.createMockFromModule<typeof import('fs-extra')>('fs-extra');

fsExtra.writeFileSync = jest.fn();
fsExtra.ensureDirSync = jest.fn();
fsExtra.readJson = jest.fn().mockResolvedValue({
  log: {
    entries: [/* mock HAR entries */]
  }
});

module.exports = fsExtra;
```

Add to `jest.config.js`:
```javascript
setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
```

---

## 6. Recommended Action Plan

### Phase 1: Preparation (Low Risk)

**Goal:** Set up environment and verify current tests pass

1. ✅ **Backup current state**
   ```bash
   git checkout -b migration/oclif-v4-prep
   git add -A && git commit -m "Pre-migration snapshot"
   ```

2. ✅ **Install latest Node.js 20 LTS**
   ```bash
   nvm install 20
   nvm use 20
   node --version  # Verify v20.x
   ```

3. ✅ **Run existing tests to establish baseline**
   ```bash
   npm install
   npm run test:ci
   ```

4. ✅ **Generate coverage report**
   ```bash
   npm run test:ci -- --coverage
   ```
   - Review current coverage percentages
   - Identify untested code paths

5. ✅ **Document test patterns**
   - List all test files and their purposes
   - Identify dependencies on deprecated packages

### Phase 2: Dependency Updates (Medium Risk)

**Goal:** Update packages while maintaining compatibility

1. ✅ **Update package.json - Core dependencies**
   ```json
   {
     "dependencies": {
       "@oclif/core": "^4.8.0",
       "fs-extra": "^11.2.0",
       "tslib": "^2.8.1",
       "update-notifier": "^7.3.1"
     }
   }
   ```

2. ✅ **Update package.json - Dev dependencies**
   ```json
   {
     "devDependencies": {
       "oclif": "^4.16.3",
       "@oclif/test": "^4.0.9",
       "ts-node": "^10.9.2",
       "typescript": "^5.7.2",
       "jest": "^29.7.0",
       "ts-jest": "^29.2.5",
       "@types/node": "^22.10.2",
       "@types/jest": "^29.5.14"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. ✅ **Remove deprecated packages**
   ```bash
   npm uninstall @oclif/command @oclif/config @oclif/dev-cli cli-ux
   ```

4. ✅ **Install new dependencies**
   ```bash
   npm install
   ```

5. ✅ **Verify no major errors**
   ```bash
   npm list --depth=0  # Check installed versions
   npm audit  # Check remaining vulnerabilities
   ```

### Phase 3: Code Migration (High Risk)

**Goal:** Update command implementation and bin scripts

1. ✅ **Update `/src/index.ts` imports**
   ```typescript
   // OLD
   import { Command, flags } from '@oclif/command';
   import { cli } from 'cli-ux';

   // NEW
   import { Command, Flags, Args, ux } from '@oclif/core';
   ```

2. ✅ **Update flags definition**
   ```typescript
   // OLD
   static flags = {
     version: flags.version({ char: 'v' }),
     help: flags.help({ char: 'h' }),
     url: flags.string({ char: 'u', description: 'filter by url' }),
     method: flags.string({ char: 'm', multiple: true, default: [Method.GET] }),
     type: flags.enum<ResourceType>({ char: 't', default: ResourceType.xhr }),
     'dry-run': flags.boolean({ description: 'to not write files' })
   };

   // NEW
   static flags = {
     version: Flags.version({ char: 'v' }),
     help: Flags.help({ char: 'h' }),
     url: Flags.string({ char: 'u', description: 'filter by url' }),
     method: Flags.string({ char: 'm', multiple: true, default: [Method.GET] }),
     type: Flags.custom<ResourceType>({
       char: 't',
       options: Object.values(ResourceType),
       default: ResourceType.xhr
     })(),
     'dry-run': Flags.boolean({ description: 'to not write files, just show results' })
   };
   ```

3. ✅ **Update args definition**
   ```typescript
   // OLD
   static args = [
     { name: 'file', description: 'sorce file (.har) path', require: true },
     { name: 'to', description: 'path to your mocks/api folder' }
   ];

   // NEW
   static args = {
     file: Args.string({
       description: 'source file (.har) path',
       required: true
     }),
     to: Args.string({
       description: 'path to your mocks/api folder'
     })
   };
   ```

4. ✅ **Add await to parse() call**
   ```typescript
   // OLD
   const { args, flags: usedFlags } = this.parse(HarToMocks);

   // NEW
   const { args, flags: usedFlags } = await this.parse(HarToMocks);
   ```

5. ✅ **Update bin script `/bin/run`**
   ```javascript
   #!/usr/bin/env node

   const oclif = require('@oclif/core')
   const path = require('path')
   const project = path.join(__dirname, '..', 'tsconfig.json')
   const dev = require('fs').existsSync(project)

   if (dev) {
     require('ts-node').register({project})
   }

   oclif.run().then(require('@oclif/core/flush')).catch(require('@oclif/core/handle'))
   ```

6. ✅ **Update package.json oclif config**
   ```json
   {
     "oclif": {
       "bin": "har-to-mocks",
       "dirname": "har-to-mocks",
       "commands": "./lib",
       "additionalHelpFlags": ["-h"],
       "additionalVersionFlags": ["-v"]
     }
   }
   ```

7. ✅ **Build and verify**
   ```bash
   npm run build
   ./bin/run --version
   ./bin/run --help
   ```

### Phase 4: Test Migration (High Risk)

**Goal:** Update tests to work with @oclif/core v4

1. ✅ **Update test imports**
   ```typescript
   // tests/integration.test.ts
   import { Config } from '@oclif/core';
   import { expect, test } from '@oclif/test';
   ```

2. ✅ **Replace cmd.run() pattern**
   ```typescript
   // OLD
   test
     .stdout()
     .do(() => cmd.run(['./tests/mocks/sample.har']))
     .it('test description', (ctx) => {
       expect(ctx.stdout).toBe(`...`);
     });

   // NEW (Option 1: Use .command())
   test
     .stdout()
     .command(['./tests/mocks/sample.har'])
     .it('test description', (ctx) => {
       expect(ctx.stdout).to.contain('Filtered requests');
     });

   // NEW (Option 2: Custom helper)
   it('test description', async () => {
     const output = await runCLI(['./tests/mocks/sample.har']);
     expect(output).toContain('Filtered requests');
   });
   ```

3. ✅ **Update mock setup if needed**
   - Verify fs-extra mocks still work
   - Check if @oclif/test v4 changes mock behavior

4. ✅ **Run tests incrementally**
   ```bash
   npm run test:ci -- tests/integration.test.ts
   ```

5. ✅ **Fix failing tests one by one**
   - Update assertions (Chai vs Jest)
   - Handle async/await properly
   - Verify stdout capture still works

6. ✅ **Run full test suite**
   ```bash
   npm run test:ci
   ```

### Phase 5: Coverage Verification (Medium Risk)

**Goal:** Ensure 100% coverage is maintained

1. ✅ **Enable coverage collection**
   ```javascript
   // jest.config.js
   collectCoverage: true,
   ```

2. ✅ **Run coverage report**
   ```bash
   npm run test:ci -- --coverage
   ```

3. ✅ **Review coverage output**
   ```
   ----------------------------|---------|----------|---------|---------|
   File                        | % Stmts | % Branch | % Funcs | % Lines |
   ----------------------------|---------|----------|---------|---------|
   All files                   |     100 |      100 |     100 |     100 |
   ```

4. ✅ **Add tests for gaps**
   - If coverage < 100%, identify missing test cases
   - Add unit tests for untested functions
   - Add error handling tests

5. ✅ **Verify coverage threshold enforcement**
   ```bash
   # Should fail if coverage < 100%
   npm run test:ci
   ```

### Phase 6: Validation & Documentation (Low Risk)

**Goal:** Verify migration success and document changes

1. ✅ **Manual CLI testing**
   ```bash
   # Test basic functionality
   ./bin/run tests/mocks/sample.har

   # Test with flags
   ./bin/run tests/mocks/sample.har --url=/user
   ./bin/run tests/mocks/sample.har --method=GET --method=POST
   ./bin/run tests/mocks/sample.har ./output --dry-run
   ./bin/run tests/mocks/sample.har ./output

   # Verify help and version
   ./bin/run --help
   ./bin/run -h
   ./bin/run --version
   ./bin/run -v
   ```

2. ✅ **Run final security audit**
   ```bash
   npm audit
   ```
   - Verify critical and high vulnerabilities are resolved
   - Document any remaining low/moderate issues

3. ✅ **Performance testing**
   ```bash
   # Compare before/after execution time
   time ./bin/run tests/mocks/sample.har ./output
   ```

4. ✅ **Update documentation**
   - Update README.md with new Node.js requirement (>=18)
   - Document breaking changes for contributors
   - Update CHANGELOG.md

5. ✅ **Commit migration**
   ```bash
   git add -A
   git commit -m "feat: migrate from Oclif v1 to @oclif/core v4

   BREAKING CHANGE: Requires Node.js 18+

   - Migrate from deprecated @oclif/command to @oclif/core v4
   - Update all dependencies to resolve security vulnerabilities
   - Modernize bin script for ESM/CJS interoperability
   - Update test suite to use @oclif/test v4
   - Fix 34 security vulnerabilities (1 critical, 11 high)

   Migration follows official guides:
   - https://github.com/oclif/core/blob/main/guides/PRE_CORE_MIGRATION.md
   - https://github.com/oclif/core/blob/main/guides/V3_MIGRATION.md"
   ```

### Phase 7: CI/CD Updates (Medium Risk)

**Goal:** Update workflows and deployment pipelines

1. ✅ **Update GitHub Actions workflows**
   ```yaml
   # .github/workflows/test.yml
   jobs:
     test:
       runs-on: ubuntu-latest
       strategy:
         matrix:
           node-version: [18.x, 20.x, 22.x]  # Update from [14.x, 16.x, 18.x]
   ```

2. ✅ **Update Docker images** (if applicable)
   ```dockerfile
   FROM node:20-alpine  # Update from node:16
   ```

3. ✅ **Update deployment documentation**
   - Minimum Node.js version in deployment guides
   - Update contributor setup instructions

4. ✅ **Run CI pipeline**
   - Push branch and verify all checks pass
   - Review build logs for warnings

---

## 7. Risk Assessment & Mitigation

### High-Risk Changes

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tests break after migration** | Critical - blocks release | Incremental test updates, maintain test coverage, use feature branch |
| **CLI behavior changes** | High - user-facing | Extensive manual testing, compare outputs before/after |
| **Breaking changes missed** | High - production issues | Follow official migration guides, peer review |
| **Coverage drops below 100%** | Medium - CI fails | Add missing tests before merging |

### Medium-Risk Changes

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Node.js version incompatibility** | Medium - deployment | Update all environments before release, document requirements |
| **@oclif/test v4 API changes** | Medium - test refactor | Review @oclif/test changelog, use custom adapter if needed |
| **Performance regression** | Low-Medium | Benchmark before/after, profile if issues arise |

### Rollback Plan

If critical issues arise post-migration:

1. **Revert commit**: `git revert <migration-commit>`
2. **Restore dependencies**: `npm install`
3. **Verify tests pass**: `npm run test:ci`
4. **Deploy previous version**
5. **Document issue** for future migration attempt

---

## 8. Testing Strategy Summary

### Current State
- ✅ Custom Jest setup with 100% coverage threshold
- ✅ @oclif/test v2 for CLI integration testing
- ✅ 9 tests covering main CLI flows
- ⚠️ Coverage collection disabled in config

### Migration Requirements
- **Update @oclif/test**: v2 → v4
- **Test pattern changes**: Replace `cmd.run()` with `.command([])`
- **Async handling**: Ensure proper async/await in tests
- **Mock verification**: Confirm fs-extra mocking still works

### Custom Adapter Needs

**Verdict: Custom adapter NOT strictly required**

**Reasoning:**
1. @oclif/test v4 provides sufficient CLI testing utilities
2. Existing test patterns can be updated with minimal changes
3. Custom adapter adds maintenance overhead

**When custom adapter WOULD be needed:**
- If @oclif/test v4 lacks specific features (unlikely)
- If migrating away from @oclif/test entirely (not recommended)
- If complex test setup requires abstraction layer

### Recommended Testing Approach

**Use @oclif/test v4 with updated patterns:**
```typescript
// Integration tests - Use @oclif/test
import { expect, test } from '@oclif/test';

describe('CLI commands', () => {
  test
    .stdout()
    .command(['sample.har'])
    .it('processes HAR file', (ctx) => {
      expect(ctx.stdout).to.contain('Filtered requests');
    });
});

// Unit tests - Use Jest directly
import { HarToMocksProcess } from './har-to-mocks';

describe('HarToMocksProcess', () => {
  it('extracts entries', () => {
    const processor = new HarToMocksProcess(jest.fn());
    expect(processor.extract(mockHar)).toHaveLength(3);
  });
});
```

**Benefits:**
- Leverages official Oclif testing tools
- Minimal custom code to maintain
- Full feature coverage achievable
- 100% coverage goal attainable

---

## 9. Expected Outcomes

### Security Improvements
- ✅ **Critical vulnerability resolved** (@babel/traverse CVE)
- ✅ **34 vulnerabilities addressed** (down to 0-2 low severity)
- ✅ **Deprecated packages removed** (cli-ux, @oclif/command)
- ✅ **Modern dependency tree** with active maintenance

### Framework Modernization
- ✅ **Oclif v4.8.0** - Latest stable release
- ✅ **Node.js 18+ support** - Modern JavaScript features
- ✅ **TypeScript 5.x** - Latest type system improvements
- ✅ **ESM-ready** - Future-proof for ES modules

### Test Coverage Maintained
- ✅ **100% coverage threshold** enforced
- ✅ **All existing tests passing**
- ✅ **Enhanced test reliability** with updated tooling
- ✅ **Better async handling** in test suite

### Developer Experience
- ✅ **Modern tooling** - Updated Jest, TypeScript, Oclif
- ✅ **Better IDE support** - Improved type definitions
- ✅ **Faster builds** - Optimized dependency tree
- ✅ **Active ecosystem** - Community support for @oclif/core

---

## 10. Timeline Estimate

| Phase | Duration | Effort |
|-------|----------|--------|
| **Phase 1: Preparation** | 1-2 hours | Low |
| **Phase 2: Dependency Updates** | 1 hour | Low |
| **Phase 3: Code Migration** | 2-3 hours | High |
| **Phase 4: Test Migration** | 3-4 hours | High |
| **Phase 5: Coverage Verification** | 2-3 hours | Medium |
| **Phase 6: Validation & Docs** | 2 hours | Low |
| **Phase 7: CI/CD Updates** | 1-2 hours | Medium |
| **Total** | **12-17 hours** | |

**Note:** Timeline assumes:
- Developer familiar with Oclif and TypeScript
- No major unexpected issues
- Tests well-maintained and passing
- CI/CD pipeline already exists

---

## 11. References & Resources

### Official Migration Guides
- [Pre-Core Migration Guide](https://github.com/oclif/core/blob/main/guides/PRE_CORE_MIGRATION.md) - v1 → v2 migration
- [V3 Migration Guide](https://github.com/oclif/core/blob/main/guides/V3_MIGRATION.md) - v2 → v3 breaking changes
- [Oclif Documentation](https://oclif.io/docs/introduction) - Official docs

### Package Documentation
- [@oclif/core](https://www.npmjs.com/package/@oclif/core) - Core framework package
- [@oclif/test](https://www.npmjs.com/package/@oclif/test) - Testing utilities
- [oclif CLI](https://www.npmjs.com/package/oclif) - CLI generator and tools

### Example Repositories
- [oclif/hello-world](https://github.com/oclif/hello-world) - Reference implementation
- [oclif/core examples](https://github.com/oclif/core/tree/main/examples) - Code samples

### Security Resources
- [npm audit documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [GitHub Advisory Database](https://github.com/advisories)
- [Snyk Vulnerability DB](https://security.snyk.io/)

---

## 12. Conclusion

The migration from Oclif v1 to @oclif/core v4 is **necessary and achievable** with moderate effort. The key benefits include:

1. **Security:** Resolves critical vulnerabilities
2. **Maintenance:** Moves to actively supported framework
3. **Modernization:** Enables modern Node.js and TypeScript features
4. **Coverage:** Existing 100% coverage goal can be maintained

**Custom adapter verdict:** **NOT required** - @oclif/test v4 provides sufficient CLI testing capabilities with minimal pattern updates.

**Recommended approach:**
1. Follow the phased migration plan above
2. Update tests incrementally using @oclif/test v4
3. Maintain test-driven approach throughout migration
4. Verify 100% coverage is maintained before merging

**Success criteria:**
- ✅ All tests passing
- ✅ 100% code coverage maintained
- ✅ Zero critical/high vulnerabilities
- ✅ CLI functionality unchanged
- ✅ Node.js 18+ support

The migration is **low-to-medium risk** if executed carefully with the phased approach outlined in this document.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-15
**Author:** Claude Code Analysis

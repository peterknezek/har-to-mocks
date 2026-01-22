har-to-mocks
============

Extract response from .har file and create JSON mocks for mock server.

[![Version](https://img.shields.io/npm/v/har-to-mocks.svg)](https://npmjs.org/package/har-to-mocks)
[![Downloads/week](https://img.shields.io/npm/dw/har-to-mocks.svg)](https://npmjs.org/package/har-to-mocks)
[![License](https://img.shields.io/npm/l/har-to-mocks.svg)](https://github.com/peterknezek/har-to-mocks/blob/master/package.json)

## Install CLI
```
npm install -g har-to-mocks
```

or by npx

```
npx har-to-mocks [path to .har] [path mock/api folder] --dry-run
```

## How does it work?

### Inspect and filter requests in .har files

File can contain hundreds of requests so it's important to be able filter data. For filtering you can use flags:
- (`--url`) for filtering by match in the url. Search is case sensitive and matches against the full URL including query parameters (e.g., `--url=?q=search` or `--url=/api/search?id=123`)
- (`-m`, `--method=GET --method=POST`) for filter specific method. Supported: 'GET', 'POST', 'PUT', 'DELETE' and 'PATCH' methods. Default value is 'GET'.
- (`-t`, `--type=xhr`) for filtering request type. Default value is 'xhr'

Video example: [YouTube har-to-mocks@1.1.1](https://youtu.be/Pc2J8aHRKNY).

example:
```
$ har-to-mocks ./file.har --url=api/service  --method=GET
```
will display:
```
Filtered requests:

 Name          │ Method │ Path                        │ Query │ Status
 ──────────────┼────────┼─────────────────────────────┼───────┼───────
 userRoles     │ GET    │ /api/service/userRoles      │       │ write
 currentUserId │ GET    │ /api/service/currentUserId  │       │ write
 active        │ GET    │ /api/service/clients/active │       │ write
```

The Query column displays URL query parameters, and the Status column shows which endpoints will be written:
```
 Name   │ Method │ Path             │ Query         │ Status
 ───────┼────────┼──────────────────┼───────────────┼───────
 search │ GET    │ /complete/search │ ?q=javascript │ skip
 search │ GET    │ /complete/search │ ?q=python     │ write
```

When multiple requests share the same path and method (but have different query parameters), they would write to the same file. The Status column indicates:
- **write** - This endpoint will be written to disk
- **skip** - This endpoint will be skipped (a later entry writes to the same file)

When duplicates are detected, a helpful hint is displayed:
```
Note: Some endpoints have status "skip" because they share the same path and method.
The last occurrence will be written. To select specific endpoints, use interactive mode:

  har-to-mocks <file.har> <output-folder> --interactive
```

If output folder is not specified mocks will not be written.

### Interactive Mode

Use the `--interactive` (or `-i`) flag to manually select which endpoints to write:

```
$ har-to-mocks ./file.har ./mocks --interactive
```

In interactive mode:
1. A checkbox list appears with all endpoints (use arrow keys to navigate, space to toggle, enter to confirm)
2. Endpoints that would be written by default are pre-selected
3. After selection, a folder tree preview is shown
4. You're asked to confirm before files are written

This is useful when you have duplicate routes and want to choose a specific response variant.

### Extract data from .har to mock/api folder

The second argument should be path to `mock`'s folder. Export structure is prepared for [mocks-to-msw](https://github.com/peterknezek/mocks-to-msw) which helps with integration with MSW (Mock Service Worker) and [connect-api-mocker](https://www.npmjs.com/package/connect-api-mocker). 

WARNING: When second argument is defined cli will write files. To avoid unwanted overwrite use `--dry-run` flag to skip writing part of process.

example:
```
$ har-to-mocks ./file.har ./mocks --url=api/service  --method=GET --dry-run
```
will display:
```
Filtered requests:

 Name          │ Method │ Path                        │ Query │ Status
 ──────────────┼────────┼─────────────────────────────┼───────┼───────
 userRoles     │ GET    │ /api/service/userRoles      │       │ write
 currentUserId │ GET    │ /api/service/currentUserId  │       │ write
 active        │ GET    │ /api/service/clients/active │       │ write

Folder tree which will be applied:

└─ mocks
   └─ api
      └─ service
         ├─ userRoles
         │  └─ GET.json
         ├─ currentUserId
         │  └─ GET.json
         └─ clients
            └─ active
               └─ GET.json

No files were written. If you want to write files remove the (--dry-run) flag.
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 7.0.0

### Tech Stack

This project uses modern JavaScript tooling:

- **Framework**: [@oclif/core](https://oclif.io/) v4 - Modern CLI framework
- **Module System**: ES Modules (ESM)
- **Testing**: [Vitest](https://vitest.dev/) with snapshot testing
- **TypeScript**: NodeNext module resolution for ESM compatibility
- **Linting**: ESLint with TypeScript support

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the CLI locally:
   ```bash
   ./bin/dev [args]
   ```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm test` - Run tests in watch mode
- `npm run test:ci` - Run tests once (for CI)
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run coverage` - Generate test coverage report

### Testing

The project maintains 100% test coverage with:

- **Unit tests** using Vitest with snapshot assertions
- **Integration tests** that verify CLI behavior end-to-end
- **Snapshot testing** to catch unintended output changes

Run tests:
```bash
npm test
```

Generate coverage report:
```bash
npm run coverage
```

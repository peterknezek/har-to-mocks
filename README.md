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

 Name          │ Method │ Path                        │ Query
 ──────────────┼────────┼─────────────────────────────┼──────
 userRoles     │ GET    │ /api/service/userRoles      │
 currentUserId │ GET    │ /api/service/currentUserId  │
 active        │ GET    │ /api/service/clients/active │
```

The Query column displays URL query parameters for easy identification of similar requests.

If output folder is not specified, mocks will not be written and no Status column is shown.

### Interactive Mode

Use the `--interactive` (or `-i`) flag to manually select which endpoints to write:

```
$ har-to-mocks ./file.har ./mocks --interactive
```

In interactive mode:
1. A checkbox list appears with all endpoints
2. **Response Preview**: As you navigate with arrow keys, the JSON response of the focused endpoint is displayed below the list
3. Endpoints that would be written by default are pre-selected
4. After selection, a folder tree preview is shown
5. You're asked to confirm before files are written

**Keyboard shortcuts:**
- `↑/↓` - Navigate through endpoints (updates response preview)
- `Space` - Toggle selection
- `a` - Toggle all
- `i` - Invert selection
- `Enter` - Confirm selection

The response preview helps you distinguish between multiple responses from the same endpoint with different data - useful when duplicate routes return different responses and you need to choose the right one.

### Extract data from .har to mock/api folder

The second argument should be path to `mock`'s folder. Export structure is prepared for [mocks-to-msw](https://github.com/peterknezek/mocks-to-msw) which helps with integration with MSW (Mock Service Worker) and [connect-api-mocker](https://www.npmjs.com/package/connect-api-mocker).

WARNING: When second argument is defined cli will write files. To avoid unwanted overwrite use `--dry-run` flag to skip writing part of process.

When a target folder is specified, the Status column shows what will happen to each file:
- **create** - File doesn't exist, will be created
- **update** - File already exists, will be overwritten
- **skip** - Duplicate endpoint, will be skipped (a later entry writes to the same file)

example:
```
$ har-to-mocks ./file.har ./mocks --url=api/service  --method=GET --dry-run
```
will display:
```
Filtered requests:

 Name          │ Method │ Path                        │ Query │ Status
 ──────────────┼────────┼─────────────────────────────┼───────┼───────
 userRoles     │ GET    │ /api/service/userRoles      │       │ create
 currentUserId │ GET    │ /api/service/currentUserId  │       │ create
 active        │ GET    │ /api/service/clients/active │       │ create

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

If files already exist, the tree shows which will be updated:
```
Folder tree which will be applied:

└─ mocks
   └─ api
      └─ service
         ├─ userRoles
         │  └─ GET.json [UPDATE]
         ├─ currentUserId
         │  └─ GET.json
         └─ clients
            └─ active
               └─ GET.json [UPDATE]
```

When multiple requests share the same path and method (but have different query parameters), they would write to the same file. A helpful hint is displayed:
```
Note: Some endpoints have status "skip" because they share the same path and method.
The last occurrence will be written. To select specific endpoints, use interactive mode:

  har-to-mocks <file.har> <output-folder> --interactive
```

### Chrome DevTools Local Overrides

Chrome can replace network responses with files from a local folder ([Local Overrides](https://developer.chrome.com/docs/devtools/overrides)). Use `--format=chrome-overrides` (or `-f chrome-overrides`) to write the responses in the folder layout Chrome expects:

```
$ har-to-mocks ./file.har ./overrides --format=chrome-overrides --dry-run
```

```
Folder tree which will be applied:

└─ overrides
   └─ sample.com
      ├─ api
      │  └─ service
      │     ├─ userRoles
      │     └─ clients
      │        └─ active
      └─ complete
         ├─ search?q=javascript
         └─ search?q=python
```

Then, in Chrome DevTools, open **Sources > Overrides**, click **Select folder for overrides**, pick the same folder, allow access and reload the page.

The files are named the way Chrome names them: `<host>/<path>`, with the query string kept in the file name and `index.html` for paths ending with `/`. Special characters are escaped, and very long URLs go into a `longurls` folder.

Things to know about this format:
- Chrome picks the file by URL only, not by method. If a GET and a POST go to the same URL, they share one file and only the last one is written (status **skip**). Different query strings get separate files.
- Chrome returns overridden responses with status 200 and uses the response headers of the real request.
- A URL path can't be both a file and a folder. For example, `/api/users` and `/api/users/1` can't both be written: the second one fails with `A file and a folder would have the same path`.
- Binary responses (base64 in the .har file) are decoded, so images and fonts are written as the original bytes.
- Point DevTools at the folder you wrote to. The `longurls` file names depend on the full path of that folder.

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

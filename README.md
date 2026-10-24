har-to-mocks
============

Extract response from .har file and create JSON mocks for mock server.

[![Version](https://img.shields.io/npm/v/har-to-mocks.svg)](https://npmjs.org/package/har-to-mocks)
[![Downloads/week](https://img.shields.io/npm/dw/har-to-mocks.svg)](https://npmjs.org/package/har-to-mocks)
[![License](https://img.shields.io/npm/l/har-to-mocks.svg)](https://github.com/peterknezek/har-to-mocks/blob/master/package.json)

**Website and docs:** [peterknezek.github.io/har-to-mocks](https://peterknezek.github.io/har-to-mocks/) ([CLI reference](https://peterknezek.github.io/har-to-mocks/docs.html#cli), [how to get a HAR file](https://peterknezek.github.io/har-to-mocks/docs.html#har), [FAQ](https://peterknezek.github.io/har-to-mocks/docs.html#faq))

**Adapters:** serve the generated mocks with [mocks-to-msw](https://github.com/peterknezek/mocks-to-msw) (MSW) or [mocks-to-playwright](https://github.com/peterknezek/mocks-to-playwright) (Playwright). See [Use the mocks](#use-the-mocks).

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

 # │ Name          │ Method │ Path                        │ Query
 ──┼───────────────┼────────┼─────────────────────────────┼──────
 1 │ userRoles     │ GET    │ /api/service/userRoles      │
 2 │ currentUserId │ GET    │ /api/service/currentUserId  │
 3 │ active        │ GET    │ /api/service/clients/active │
```

The Query column displays URL query parameters for easy identification of similar requests. The `#` column numbers the requests, so you can [select them with `--select`](#select-requests-without-the-interactive-mode).

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
4. After selection, the same selection is printed as a `--select` value, so you can repeat it without the interactive mode
5. A folder tree preview is shown
6. You're asked to confirm before files are written

Add `--select` to pre-select specific endpoints instead of the default ones. Interactive mode works with both formats (`--format=mocks` and `--format=chrome-overrides`).

**Keyboard shortcuts:**
- `↑/↓` - Navigate through endpoints (updates response preview)
- `Space` - Toggle selection
- `a` - Toggle all
- `i` - Invert selection
- `Enter` - Confirm selection

The response preview helps you distinguish between multiple responses from the same endpoint with different data - useful when duplicate routes return different responses and you need to choose the right one.

### Select requests without the interactive mode

Use `--select` (or `-s`) with the numbers from the `#` column to choose specific requests in a script or without a terminal UI. Separate numbers with commas, write ranges as `5-7` and repeat the flag if you like. The numbers refer to the list shown with the same filters (`--url`, `--method`, `--type`).

```
$ har-to-mocks ./file.har --url=api/service
$ har-to-mocks ./file.har ./mocks --url=api/service --select=1,3
$ har-to-mocks ./file.har ./overrides --url=api/service --select=1,3 --format=chrome-overrides
```

Only the selected requests are shown and written, with their original numbers:
```
Selected requests:

 # │ Name      │ Method │ Path                        │ Query │ Status
 ──┼───────────┼────────┼─────────────────────────────┼───────┼───────
 1 │ userRoles │ GET    │ /api/service/userRoles      │       │ create
 3 │ active    │ GET    │ /api/service/clients/active │       │ create
```

### Extract data from .har to mock/api folder

The second argument should be path to `mock`'s folder. Export structure is prepared for [mocks-to-msw](https://github.com/peterknezek/mocks-to-msw) (MSW, Mock Service Worker), [mocks-to-playwright](https://github.com/peterknezek/mocks-to-playwright) (Playwright tests) and [connect-api-mocker](https://www.npmjs.com/package/connect-api-mocker). See [Use the mocks](#use-the-mocks).

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

 # │ Name          │ Method │ Path                        │ Query │ Status
 ──┼───────────────┼────────┼─────────────────────────────┼───────┼───────
 1 │ userRoles     │ GET    │ /api/service/userRoles      │       │ create
 2 │ currentUserId │ GET    │ /api/service/currentUserId  │       │ create
 3 │ active        │ GET    │ /api/service/clients/active │       │ create

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
The last occurrence will be written. To select specific endpoints, use --select or interactive mode:

  har-to-mocks <file.har> <output-folder> --select=1,3
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

## Use the mocks

The default `--format=mocks` layout (`<url path>/<METHOD>.json`) is read by two adapters. Both ship the same `generate-mocks` CLI, which writes a typed `mocks.ts` import file from the mocks folder, so one set of mocks can feed the app, Storybook and your tests.

### mocks-to-msw

[mocks-to-msw](https://github.com/peterknezek/mocks-to-msw) turns the mocks into [MSW](https://mswjs.io) handlers for development, Storybook and unit tests.

```ts
import { createMockHandler } from "mocks-to-msw";
import mocks from "./mocks/mocks";

const { mock } = createMockHandler<keyof typeof mocks>({ mocks });

export const handlers = [
  mock.get("/client"),
  mock.post("/client/application", (data) => ({ ...data, modified: true })),
];
```

### mocks-to-playwright

[mocks-to-playwright](https://github.com/peterknezek/mocks-to-playwright) serves the same mocks in [Playwright](https://playwright.dev) tests through `page.route()`, on a page or a whole browser context.

```ts
import { test } from "@playwright/test";
import { createMockRoutes } from "mocks-to-playwright";
import mocks from "./mocks/mocks";

const { mock } = createMockRoutes<keyof typeof mocks>({ mocks });

test("shows the client", async ({ page }) => {
  await mock.get("/client")(page);
  await mock.post("/client/application", (data) => ({ ...data, status: "approved" }))(page);
  await page.goto("/");
});
```

Both adapters check at compile time that a path has a mock for the method you use, and accept a modifier to change a response for one handler or one test.

## Development

### Prerequisites

- Node.js >= 22.0.0
- npm >= 7.0.0

### Tech Stack

This project uses modern JavaScript tooling:

- **Framework**: [@oclif/core](https://oclif.io/) v5 - Modern CLI framework
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

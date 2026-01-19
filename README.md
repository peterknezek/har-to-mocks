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
- (`--url`) for filtering by match in the url. Search is case sensitive
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

 Name                    Method Path                        
 ─────────────────────── ────── ─────────────────────────── 
 userRoles               GET    /api/service/userRoles      
 currentUserId           GET    /api/service/currentUserId  
 active                  GET    /api/service/clients/active 
```

If output folder is not specified mocks will not be written.


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

 Name                    Method Path                        
 ─────────────────────── ────── ─────────────────────────── 
 userRoles               GET    /api/service/userRoles      
 currentUserId           GET    /api/service/currentUserId  
 active                  GET    /api/service/clients/active 

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

### Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass: `npm run test:ci`
4. Ensure linting passes: `npm run lint`
5. Ensure build succeeds: `npm run build`
6. Submit a pull request

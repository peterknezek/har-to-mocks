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
- (`-m`, `--method=GET`) for filter specific method. Default value is 'GET'
- (`-t`, `--type=xhr`) for filtering request type. Default value is 'xhr'


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

Export structure is prepared for [connect-api-mocker](https://www.npmjs.com/package/connect-api-mocker). After successful filtering request just add second argument which will be path to `connect-api-mocker`'s folder for mock/api.

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

import { test } from '@oclif/test';
import cmd = require('../src');

describe('Defined path to .har', () => {
  test
    .stdout()
    .do(() => cmd.run(['./tests/mocks/sample.har']))
    .it('without any flag show all requests in .har', (ctx) => {
      expect(ctx.stdout).toBe(`
Filtered requests:

 Name                    Method Path                        
 ─────────────────────── ────── ─────────────────────────── 
 userRoles               GET    /api/service/userRoles      
 currentUserId           GET    /api/service/currentUserId  
 active                  GET    /api/service/clients/active 

`);
    });

  test
    .stdout()
    .do(() => cmd.run(['./tests/mocks/sample.har', '--url=/user']))
    .it('with url flag should filter requests based on url with case sensitice', (ctx) => {
      expect(ctx.stdout).toBe(`
Filtered requests:

 Name                    Method Path                   
 ─────────────────────── ────── ────────────────────── 
 userRoles               GET    /api/service/userRoles 

`);
    });
});

describe('Defined path to .har and target path', () => {
  test
    .stdout()
    .do(() => cmd.run(['./tests/mocks/sample.har', './mocks', '--dry-run']))
    .it('should render result table with folder tree without writing files', (ctx) => {
      expect(ctx.stdout).toBe(`
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

No files was writed. If you want to write files remove (--dry-run) flag.

`);
    });
});

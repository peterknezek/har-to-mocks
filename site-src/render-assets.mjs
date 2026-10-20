// Re-renders og.png and the favicon PNGs. Run from the gh-pages branch root:
//   npm i --no-save playwright && npx playwright install chromium
//   node site-src/render-assets.mjs
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.setViewportSize({width:1200,height:630});
await p.goto('file://' + process.cwd() + '/site-src/og.html'); await p.waitForTimeout(1500);
await p.screenshot({path:'og.png'});
const svg = 'data:image/svg+xml;base64,' + readFileSync('favicon.svg').toString('base64');
for (const [size,name] of [[512,'favicon-512.png'],[180,'apple-touch-icon.png'],[32,'favicon-32.png']]) {
  await p.setViewportSize({width:size,height:size});
  await p.setContent(`<body style="margin:0"><img src="${svg}" width="${size}" height="${size}"></body>`);
  await p.waitForTimeout(300);
  await p.screenshot({path:name, omitBackground:true});
}
await b.close();

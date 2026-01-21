import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';

const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'));

// External packages that should NOT be bundled
// @oclif/core needs to be external to work properly
// fs-extra and update-notifier use CommonJS and cause issues when bundled in ESM
const external = [
  '@oclif/core',
  'fs-extra',
  'update-notifier',
];

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'lib/index.js',
  external,
  banner: {
    js: '// @oclif/core must be external for proper CLI functionality\n',
  },
  sourcemap: false,
  minify: false,
  keepNames: true,
  metafile: true,
  logLevel: 'info',
}).then((result) => {
  console.log('\n✓ Bundle created successfully');

  // Show bundle size
  const size = Object.values(result.metafile.outputs)[0].bytes;
  console.log(`  Bundle size: ${(size / 1024).toFixed(2)} KB`);

  // Show what was bundled
  const inputs = Object.keys(result.metafile.inputs).filter(f => !f.includes('node_modules'));
  console.log(`  Source files: ${inputs.length}`);
}).catch(() => process.exit(1));

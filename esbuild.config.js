import * as esbuild from 'esbuild';

// External packages that should NOT be bundled
// @oclif/core needs to be external to work properly
// update-notifier uses CommonJS and causes issues when bundled in ESM
// @inquirer/prompts uses CommonJS internals that don't bundle properly
const external = ['@oclif/core', 'update-notifier', '@inquirer/prompts'];

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

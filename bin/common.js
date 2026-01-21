import { Config } from '@oclif/core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute the single-command CLI
 * @param {Object} options - Execution options
 * @param {boolean} options.requireBuild - Whether to require build check
 */
export async function executeCLI(options = {}) {
  const { requireBuild = false } = options;

  // Check if lib directory exists
  const libCommandPath = join(__dirname, '..', 'lib', 'index.js');

  if (requireBuild) {
    const { existsSync } = await import('fs');
    if (!existsSync(libCommandPath)) {
      console.error('Error: Please build the project first with "npm run build"');
      console.error('For development, run: npm run build && ./bin/dev [args]');
      process.exit(1);
    }
  }

  // Suppress warnings during config load
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = () => {};

  try {
    // Load the single command
    const module = await import(libCommandPath);
    const Command = module.default;

    // Load config and run the command directly
    const config = await Config.load({
      root: join(__dirname, '..'),
      devPlugins: false,
      userPlugins: false
    });

    // Restore warning emitter
    process.emitWarning = originalEmitWarning;

    const cmd = new Command(process.argv.slice(2), config);

    await cmd.run();
    process.exit(0);
  } catch (error) {
    // Restore warning emitter in case of error
    process.emitWarning = originalEmitWarning;

    // Handle ExitError which is thrown for --help and --version
    if (error.oclif && error.oclif.exit !== undefined) {
      process.exit(error.oclif.exit);
    }
    // Handle other errors
    console.error(error);
    process.exit(1);
  }
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Args, Command, Flags } from '@oclif/core';
import updateNotifier, { Package } from 'update-notifier';

import type { Har } from './har-to-mocks/index.js';
import { HarToMocksProcess, Method, ResourceType } from './har-to-mocks/index.js';

export default class Index extends Command {
  static description = 'Extract response from .har file and create JSON mocks for mock server.';

  static strict = false;

  static flags = {
    version: Flags.version({ char: 'v' }),
    help: Flags.help({ char: 'h' }),
    url: Flags.string({ char: 'u', description: 'filter by url' }),
    method: Flags.string({
      char: 'm',
      options: Object.values(Method),
      description: 'filter by method. You can use multiple options, for example: --method=GET --method=POST',
      default: [Method.GET],
      multiple: true,
    }),
    type: Flags.custom<ResourceType>({
      char: 't',
      options: Object.values(ResourceType),
      description: 'filter by resourceType',
      // eslint-disable-next-line @typescript-eslint/require-await
      default: async () => ResourceType.xhr,
      // eslint-disable-next-line @typescript-eslint/require-await
      parse: async (input) => input as ResourceType,
    })(),
    'dry-run': Flags.boolean({ description: 'to not write files, just show results' }),
    interactive: Flags.boolean({
      char: 'i',
      description: 'interactive mode to select which endpoints to write',
    }),
  };

  static args = {
    file: Args.string({ description: 'source file (.har) path', required: true }),
    to: Args.string({ description: 'path to your mocks/api folder' }),
  };

  /**
   * Read and parse the .har file, exiting with a user-friendly error message
   * instead of a raw stack trace when the file is missing or malformed.
   */
  private readHarFile(filePath: string): Har {
    let fileContent: string;
    try {
      fileContent = readFileSync(filePath, 'utf-8');
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        this.error(`File not found: ${filePath}`);
      }
      if (code === 'EISDIR') {
        this.error(`Expected a file but found a directory: ${filePath}`);
      }
      this.error(`Could not read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    let data: Har;
    try {
      data = JSON.parse(fileContent) as Har;
    } catch {
      this.error(`File is not valid JSON: ${filePath}`);
    }

    if (!Array.isArray(data?.log?.entries)) {
      this.error(`File is not a valid HAR file (missing "log.entries"): ${filePath}`);
    }

    return data;
  }

  async run() {
    const pkg = JSON.parse(readFileSync(join(this.config.root, 'package.json'), 'utf-8')) as Package;
    updateNotifier({ pkg }).notify({ defer: false });

    const process = new HarToMocksProcess(this.log.bind(this), this.warn.bind(this));
    const { args, flags: usedFlags } = await this.parse(Index);

    const data = this.readHarFile(args.file);
    process.extract(data, {
      methods: usedFlags.method as Method[],
      resourceType: usedFlags.type,
      url: usedFlags.url,
    });

    if (args.to && typeof args.to === 'string') {
      // Target path provided - show enhanced table with Status column
      if (usedFlags.interactive) {
        await process.writeInteractive(args.to, usedFlags['dry-run']);
      } else {
        process.write(args.to, usedFlags['dry-run']);
      }
    } else {
      // No target path - show basic table for inspection only
      process.showResults();
    }

    this.log('');
  }
}

import { Args, Command, Flags } from '@oclif/core';
import fsExtra from 'fs-extra';
import { join } from 'path';
import updateNotifier, { Package } from 'update-notifier';

const { readJson } = fsExtra;

import type { Har } from './har-to-mocks/index.js';
import { HarToMocksProcess, Method, ResourceType } from './har-to-mocks/index.js';

class HarToMocks extends Command {
  static description = 'Extract response from .har file and create JSON mocks for mock server.';

  static flags = {
    // add --version flag to show CLI version
    version: Flags.version({ char: 'v' }),
    help: Flags.help({ char: 'h' }),

    // flag to filter by url
    url: Flags.string({ char: 'u', description: 'filter by url' }),
    // flag to filter method (-m, --method=GET)
    method: Flags.string({
      char: 'm',
      options: Object.values(Method),
      description: 'filter by method. You can use multiple options, for example: --method=GET --method=POST',
      default: [Method.GET],
      multiple: true,
    }),
    // flag to filter resourceType (-t, --type=xhr)
    type: Flags.custom<ResourceType>({
      char: 't',
      options: Object.values(ResourceType),
      description: 'filter by resourceType',
      default: async () => ResourceType.xhr,
      parse: async (input) => input as ResourceType,
    })(),

    // flag to not write files, just show results (--dry-run)
    'dry-run': Flags.boolean({ description: 'to not write files, just show results' }),
  };

  static args = {
    file: Args.string({ description: 'source file (.har) path', required: true }),
    to: Args.string({ description: 'path to your mocks/api folder' }),
  };

  async run() {
    const pkg = (await readJson(join(this.config.root, 'package.json'))) as Package;
    updateNotifier({
      pkg,
      updateCheckInterval: 100,
      shouldNotifyInNpmScript: true,
    }).notify();

    const process = new HarToMocksProcess(this.log.bind(this));
    const { args, flags: usedFlags } = await this.parse(HarToMocks);

    if (args.file && typeof args.file === 'string') {
      const data = (await readJson(args.file)) as Har;
      await process.extract(data, {
        methods: usedFlags.method as Method[],
        resourceType: usedFlags.type,
        url: usedFlags.url,
      });
    }

    if (args.to && typeof args.to === 'string') {
      process.write(args.to, usedFlags['dry-run']);
    }

    // this is bottom padding
    this.log('');
  }
}

export default HarToMocks;

import { Args, Command, Flags } from '@oclif/core';
import fsExtra from 'fs-extra';
import { join } from 'path';
import updateNotifier, { Package } from 'update-notifier';

const { readJson } = fsExtra;

import type { Har } from '../har-to-mocks/index.js';
import { HarToMocksProcess, Method, ResourceType } from '../har-to-mocks/index.js';

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
  };

  static args = {
    file: Args.string({ description: 'source file (.har) path', required: true }),
    to: Args.string({ description: 'path to your mocks/api folder' }),
  };

  async run() {
    const pkg = (await readJson(join(this.config.root, 'package.json'))) as Package;
    updateNotifier({ pkg }).notify({ defer: false });

    const process = new HarToMocksProcess(this.log.bind(this));
    const { args, flags: usedFlags } = await this.parse(Index);

    if (args.file && typeof args.file === 'string') {
      const data = (await readJson(args.file)) as Har;
      process.extract(data, {
        methods: usedFlags.method as Method[],
        resourceType: usedFlags.type,
        url: usedFlags.url,
      });
    }

    if (args.to && typeof args.to === 'string') {
      process.write(args.to, usedFlags['dry-run']);
    }

    this.log('');
  }
}

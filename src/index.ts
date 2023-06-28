import { Command, flags } from '@oclif/command';
import { readJson } from 'fs-extra';
import updateNotifier, { Package } from 'update-notifier';

import type { Har } from './har-to-mocks';
import { HarToMocksProcess, Method, ResourceType } from './har-to-mocks';

class HarToMocks extends Command {
  static description = 'Extract response from .har file and create JSON mocks for mock server.';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    // flag to filter by url
    url: flags.string({ char: 'u', description: 'filter by url' }),
    // flag to filter method (-m, --method=GET)
    method: flags.string({
      char: 'm',
      options: Object.values(Method),
      description: 'filter by method. You can use multiple options, for example: --method=GET --method=POST',
      default: [Method.GET],
      multiple: true,
      
    }),
    // flag to filter resourceType (-t, --type=xhr)
    type: flags.enum<ResourceType>({
      char: 't',
      options: Object.values(ResourceType),
      description: 'filter by resourceType',
      default: ResourceType.xhr,
    }),

    // flag to not write files, just show results (--dry-run)
    'dry-run': flags.boolean({ description: 'to not write files, just show results' }),
  };

  static args = [
    { name: 'file', description: 'sorce file (.har) path', require: true },
    { name: 'to', description: 'path to your mocks/api folder' },
  ];

  async run() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json') as Package;
    updateNotifier({
      pkg,
      updateCheckInterval: 100,
      shouldNotifyInNpmScript: true,
    }).notify();

    const process = new HarToMocksProcess(this.log.bind(this));
    const { args, flags: usedFlags } = this.parse(HarToMocks);

    if (args.file && typeof args.file === 'string') {
      const data = (await readJson(args.file)) as Har;
      process.extract(data, { methods: usedFlags.method as Method[], resourceType: usedFlags.type, url: usedFlags.url });
    }

    if (args.to && typeof args.to === 'string') {
      process.write(args.to, usedFlags['dry-run']);
    }

    // this is bottom padding
    this.log('');
  }
}

export = HarToMocks;

import {Command, flags} from '@oclif/command'
import {readJson} from 'fs-extra'
import {HarToMocksProcess, Har, Method, ResourceType} from './har-to-mocks'

import updateNotifier from 'update-notifier'
const pkg = require("../package.json");

class HarToMocks extends Command {
  static description = 'Extract response from .har file and create JSON mocks for mock server.'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    // flag to filter by url
    url: flags.string({char: 'u', description: 'filter by url'}),
    // flag to filter method (-m, --method=GET)
    method: flags.enum<Method>({char: 'm', options: Object.values(Method), description: 'filter by method', default: Method.GET}),
    // flag to filter resourceType (-t, --type=xhr)
    type: flags.enum<ResourceType>({char: 't', options: Object.values(ResourceType), description: 'filter by resourceType', default: ResourceType.xhr}),

    // flag to not write files, just show results (--dry-run)
    'dry-run': flags.boolean({description: 'to not write files, just show results'}),
  }

  static args = [{name: 'file', description: 'sorce file (.har) path', require: true}, {name: 'to', description: 'path to your mocks/api folder'}]

  async run() {
    updateNotifier({
      pkg,
      updateCheckInterval: 100,
      shouldNotifyInNpmScript: true
    }).notify();

    const {args, flags} = this.parse(HarToMocks)
    const process = new HarToMocksProcess(this.log)

    if (args.file) {
      const data: Har = await readJson(args.file)
      process.extractor(data, {method: flags.method, resourceType: flags.type, url: flags.url})
    }

    if (args.to) {
      process.writer(args.to, flags['dry-run'])
    }

    // this is bottom padding
    this.log('')
  }
}

export = HarToMocks

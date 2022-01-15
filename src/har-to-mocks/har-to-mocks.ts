import { resultTable, writeMocks } from './features';
import type { Entry, Filter, Har, Logger } from './types';

export class HarToMocksProcess {
  public data: Entry[] = [];

  constructor(private log: Logger) {
    this.log = log;
  }

  /**
   * Extract `Entrys`, filter by flags and return to another process
   * @param {JSON} fileContent har as JSON
   * @param {object} filter flags
   */
  extractor(fileContent: Har, filter: Filter) {
    const { method, resourceType, url } = filter;
    const { entries } = fileContent.log;
    let filtred: Entry[] = entries;

    // Filter by user input in the flow:
    if (url) {
      filtred = filtred.filter((e) => e.request.url.includes(url));
    }

    if (resourceType) {
      filtred = filtred.filter((e) => e._resourceType === resourceType);
    }

    if (method) {
      filtred = filtred.filter((e) => e.request.method === method);
    }

    // Log table with content
    this.log('\nFiltered requests:\n');
    resultTable(filtred, this.log);

    this.data = filtred;
  }

  writer(targetPath: string, isDryRun = false) {
    writeMocks(targetPath, this.data, this.log, { isDryRun });
  }
}

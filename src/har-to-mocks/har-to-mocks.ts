import {
  confirmWrite,
  executeWriteMocks,
  interactiveSelect,
  previewMocks,
  resultTable,
  writeMocks,
} from './features/index.js';
import type { Entry, Filter, Har, Logger } from './types/index.js';

export class HarToMocksProcess {
  public data: Entry[] = [];

  constructor(private log: Logger) {}

  /**
   * Extract `Entrys`, filter by flags and return to another process
   * @param {JSON} fileContent har as JSON
   * @param {object} filter flags
   */
  extract(fileContent: Har, filter: Filter) {
    const { methods, resourceType, url } = filter;
    const { entries } = fileContent.log;
    let filtred: Entry[] = entries;

    // Filter by user input in the flow:
    if (url) {
      filtred = filtred.filter((e) => e.request.url.includes(url));
    }

    if (resourceType) {
      filtred = filtred.filter((e) => e._resourceType === resourceType);
    }

    if (methods) {
      filtred = filtred.filter((e) => methods.includes(e.request.method));
    }

    // Log table with content
    this.log('\nFiltered requests:\n');
    resultTable(filtred, this.log);

    this.data = filtred;
  }

  write(targetPath: string, isDryRun = false) {
    writeMocks(targetPath, this.data, this.log, { isDryRun });
  }

  /**
   * Interactive mode: allows user to select which endpoints to write
   * @param {string} targetPath path to write mocks
   * @param {boolean} isDryRun if true, do not write files
   */
  async writeInteractive(targetPath: string, isDryRun = false) {
    if (this.data.length === 0) {
      this.log('\nNo endpoints to select.');
      return;
    }

    this.log('');
    const selectedEntries = await interactiveSelect(this.data);

    if (selectedEntries === null || selectedEntries.length === 0) {
      this.log('\nNo endpoints selected. Exiting.');
      return;
    }

    this.log(`\n${selectedEntries.length} endpoint(s) selected.`);

    // Show preview of what will be created
    const fileCount = previewMocks(targetPath, selectedEntries, this.log);

    if (isDryRun) {
      this.log('\nNo files were written. If you want to write files remove the (--dry-run) flag.');
      return;
    }

    // Ask for confirmation before writing
    const shouldWrite = await confirmWrite(fileCount);
    if (!shouldWrite) {
      this.log('\nOperation cancelled.');
      return;
    }

    // Actually write the files
    executeWriteMocks(targetPath, selectedEntries, this.log);
  }
}

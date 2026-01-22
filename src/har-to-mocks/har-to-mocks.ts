import {
  checkFileExistence,
  confirmWrite,
  executeWriteMocks,
  interactiveSelect,
  previewMocksWithStatus,
  resultTable,
  resultTableWithFileStatus,
} from './features/index.js';
import { markDuplicates } from './features/result-table/utils/index.js';
import type { Entry, Filter, Har, Logger } from './types/index.js';

/**
 * Filter entries to only include those that will actually be written (not skipped due to duplicates)
 */
const filterWritableEntries = (entries: Entry[]): Entry[] => {
  const entriesWithStatus = markDuplicates(entries);
  return entriesWithStatus.filter((e) => e.willBeWritten).map((e) => e.entry);
};

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

    this.data = filtred;
  }

  /**
   * Show filtered results table (without Status column - for inspection only when no target path)
   */
  showResults() {
    this.log('\nFiltered requests:\n');
    resultTable(this.data, this.log);
  }

  /**
   * Write mocks to the target path
   * @param {string} targetPath path to write mocks
   * @param {boolean} isDryRun if true, do not write files
   */
  write(targetPath: string, isDryRun = false) {
    // Filter to only entries that will be written (not skipped due to duplicates)
    const writableEntries = filterWritableEntries(this.data);

    // Check file existence once (only for writable entries)
    const existenceMap = checkFileExistence(targetPath, writableEntries);

    // Show enhanced table with create/update/skip status (shows all entries including skipped)
    this.log('\nFiltered requests:\n');
    resultTableWithFileStatus(this.data, targetPath, existenceMap, this.log);

    // Show folder tree with [UPDATE] markers (only shows files that will be written)
    previewMocksWithStatus(targetPath, writableEntries, existenceMap, this.log);

    if (isDryRun) {
      this.log('\nNo files were written. If you want to write files remove the (--dry-run) flag.');
    } else {
      executeWriteMocks(targetPath, writableEntries, this.log);
    }
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

    // Check file existence once
    const existenceMap = checkFileExistence(targetPath, selectedEntries);

    // Show enhanced table with create/update/skip status
    this.log('\nSelected endpoints:\n');
    resultTableWithFileStatus(selectedEntries, targetPath, existenceMap, this.log);

    // Show folder tree with [UPDATE] markers
    previewMocksWithStatus(targetPath, selectedEntries, existenceMap, this.log);

    if (isDryRun) {
      this.log('\nNo files were written. If you want to write files remove the (--dry-run) flag.');
      return;
    }

    // Ask for confirmation before writing
    const shouldWrite = await confirmWrite(selectedEntries.length);
    if (!shouldWrite) {
      this.log('\nOperation cancelled.');
      return;
    }

    // Actually write the files
    executeWriteMocks(targetPath, selectedEntries, this.log);
  }
}

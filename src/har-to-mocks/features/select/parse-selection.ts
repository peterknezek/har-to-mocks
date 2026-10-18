/**
 * Parses `--select` values into entry indexes.
 * Values are row numbers from the `#` column, separated by commas, with ranges written as `5-7`.
 *
 * @param values - Values of the `--select` flag, e.g. `['1,3', '5-7']`
 * @param count - Number of rows the numbers refer to
 * @returns Sorted, unique, zero-based indexes
 * @throws Error with a user-facing message when a value is not valid
 */
export const parseSelection = (values: string[], count: number): number[] => {
  const indexes = new Set<number>();

  values
    .flatMap((value) => value.split(','))
    .map((part) => part.trim())
    .forEach((part) => {
      const match = /^(\d+)(?:-(\d+))?$/.exec(part);
      const from = Number(match?.[1]);
      const to = Number(match?.[2] ?? match?.[1]);
      if (!match || from < 1 || to < from) {
        throw new Error(`Invalid --select value "${part}". Use row numbers from the # column, e.g. --select=1,3,5-7`);
      }
      if (to > count) {
        throw new Error(`Row ${to} does not exist in --select. There are ${count} filtered requests.`);
      }
      for (let number = from; number <= to; number++) {
        indexes.add(number - 1);
      }
    });

  return [...indexes].sort((a, b) => a - b);
};

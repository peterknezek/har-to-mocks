/**
 * Folder layout of the written mock files.
 */
export enum OutputFormat {
  /** `<path>/<METHOD>.json` for mocks-to-msw and connect-api-mocker */
  mocks = 'mocks',
  /** `<host>/<path>[?query]` for Chrome DevTools Local Overrides */
  chromeOverrides = 'chrome-overrides',
}

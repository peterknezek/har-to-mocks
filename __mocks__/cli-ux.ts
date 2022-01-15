import * as ux from 'cli-ux';

ux.cli.action.start = jest.fn();
ux.cli.action.stop = jest.fn();

export const cli = ux.cli;

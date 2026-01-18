import * as ux from 'cli-ux';
import { vi } from 'vitest';

ux.cli.action.start = vi.fn();
ux.cli.action.stop = vi.fn();

export const cli = ux.cli;

import fsExtra from 'fs-extra';
import { vi } from 'vitest';

fsExtra.ensureDirSync = vi.fn();
fsExtra.writeFileSync = vi.fn();

export default fsExtra;

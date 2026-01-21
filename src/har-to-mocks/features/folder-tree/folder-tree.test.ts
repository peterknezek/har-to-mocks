import { folderTree } from './folder-tree.js';
import type { Mock } from 'vitest';

describe('Folder tree', () => {
  it('sub-trees should be generate correctly', () => {
    vi.spyOn(global.console, 'log').mockImplementation(() => undefined);
    const mockPaths = ['a/b/c', 'a/bb/c', 'a/bb/cc', 'a/dd/bb', 'a/dd/bb/x', 'a/dd/bb/y'];
    folderTree(mockPaths);
    const output = (global.console.log as Mock).mock.calls[0][0];

    expect(output).toMatchSnapshot();
  });
});

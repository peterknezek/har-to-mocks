import { folderTree } from './folder-tree.js';

describe('Folder tree', () => {
  it('sub-trees should be generate correctly', () => {
    jest.spyOn(global.console, 'log').mockImplementation(() => null);
    const mockPaths = ['a/b/c', 'a/bb/c', 'a/bb/cc', 'a/dd/bb', 'a/dd/bb/x', 'a/dd/bb/y'];
    folderTree(mockPaths);
    const output = (global.console.log as jest.Mock).mock.calls[0][0];

    expect(output).toMatchSnapshot();
  });
});

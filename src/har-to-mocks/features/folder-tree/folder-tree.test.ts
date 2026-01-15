import { folderTree } from './folder-tree';

describe('Folder tree', () => {
  it('sub-trees should be generate correctly', () => {
    jest.spyOn(global.console, 'log').mockImplementation(() => null);
    const mockPaths = ['a/b/c', 'a/bb/c', 'a/bb/cc', 'a/dd/bb', 'a/dd/bb/x', 'a/dd/bb/y'];
    folderTree(mockPaths);
    const output = (global.console.log as jest.Mock).mock.calls[0][0];

    // Check that output contains the expected paths
    expect(output).toContain('.');
    expect(output).toContain('a');
    expect(output).toContain('b');
    expect(output).toContain('bb');
    expect(output).toContain('c');
    expect(output).toContain('cc');
    expect(output).toContain('dd');
    expect(output).toContain('x');
    expect(output).toContain('y');
  });
});

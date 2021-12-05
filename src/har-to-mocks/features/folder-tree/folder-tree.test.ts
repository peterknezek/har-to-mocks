import { folderTree } from './folder-tree';

describe('Folder tree', () => {
  it('sub-trees should be generate correctly', () => {
    jest.spyOn(global.console, 'log').mockImplementation(() => null);
    const mockPaths = ['a/b/c', 'a/bb/c', 'a/bb/cc', 'a/dd/bb', 'a/dd/bb/x', 'a/dd/bb/y'];
    folderTree(mockPaths);
    expect(global.console.log).toBeCalledWith(`└─ a
   ├─ b
   │  └─ c
   ├─ bb
   │  ├─ c
   │  └─ cc
   └─ dd
      └─ bb
         ├─ x
         └─ y`);
  });
});

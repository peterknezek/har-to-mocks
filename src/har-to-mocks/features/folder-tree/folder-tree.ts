import { cli } from 'cli-ux';

export const folderTree = (pathList: string[]) => {
  const tree = cli.tree();

  pathList.forEach((path: string) => {
    const parts = path.split('/');
    let level = tree;
    for (let index = 0; index < parts.length; index++) {
      if (!level.nodes[parts[index]]) {
        level.insert(parts[index]);
      }
      level = level.nodes[parts[index]];
    }
  });

  tree.display();
};

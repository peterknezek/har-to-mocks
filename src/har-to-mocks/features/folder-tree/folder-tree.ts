import { cli } from 'cli-ux';

export const folderTree = (pathList: string[]) => {
  const tree = cli.tree();

  pathList.forEach((path: string) => {
    const parts = path.split('/');
    let level = tree;
    for (const part of parts) {
      if (!level.nodes[part]) {
        level.insert(part);
      }
      level = level.nodes[part];
    }
  });

  tree.display();
};

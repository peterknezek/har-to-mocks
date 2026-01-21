import archy from 'archy';

interface TreeNode {
  label: string;
  nodes: (TreeNode | string)[];
}

export const folderTree = (pathList: string[]) => {
  const root: TreeNode = { label: '.', nodes: [] };

  pathList.forEach((path: string) => {
    const parts = path.split('/').filter(Boolean);
    let currentLevel = root.nodes;

    parts.forEach((part: string, index: number) => {
      const existingNode = currentLevel.find((node) => typeof node !== 'string' && node.label === part) as
        | TreeNode
        | undefined;

      if (existingNode) {
        currentLevel = existingNode.nodes;
      } else {
        const isLastPart = index === parts.length - 1;
        if (isLastPart) {
          currentLevel.push(part);
        } else {
          const newNode: TreeNode = { label: part, nodes: [] };
          currentLevel.push(newNode);
          currentLevel = newNode.nodes;
        }
      }
    });
  });

  console.log(archy(root));
};

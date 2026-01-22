import archy from 'archy';

import type { FileExistenceMap } from '../write-mocks/utils/check-file-existence.js';

interface TreeNode {
  label: string;
  nodes: (TreeNode | string)[];
}

/**
 * Display a folder tree structure.
 * @param pathList - List of file paths to display
 * @param existenceMap - Optional map of file paths to existence status. If provided, existing files will be marked with [UPDATE].
 */
export const folderTree = (pathList: string[], existenceMap?: FileExistenceMap) => {
  const root: TreeNode = { label: '.', nodes: [] };

  pathList.forEach((filePath: string) => {
    const parts = filePath.split('/').filter(Boolean);
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
          // Check if file exists and add [UPDATE] marker
          const fileExists = existenceMap?.exists.get(filePath) ?? false;
          const label = fileExists ? `${part} [UPDATE]` : part;
          currentLevel.push(label);
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

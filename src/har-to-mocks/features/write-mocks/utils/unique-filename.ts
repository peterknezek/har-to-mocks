import fs from 'fs';

export const getUniqueFileName = (baseFileName: string, filePath: string) => {
  let counter = 1;
  let fileName = baseFileName;

  while (fs.existsSync(`${filePath}/${fileName}`)) {
    fileName = `${counter}_${fileName}`;
    counter++;
  }

  return fileName;
};

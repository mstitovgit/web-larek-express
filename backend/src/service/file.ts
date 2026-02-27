const fs = require('fs');
const path = require('path');

const STATIC_PATH = path.join(process.cwd(), 'src', 'public');
const UPLOAD_PATH = path.join(STATIC_PATH, process.env.UPLOAD_PATH || 'images');
const UPLOAD_PATH_TEMP = path.join(STATIC_PATH, process.env.UPLOAD_PATH_TEMP || 'temp');

export const moveImage = async (fileName: string) => {
  const baseName = fileName.replace('/images', '');
  const tempPath = path.join(UPLOAD_PATH_TEMP, baseName);
  const targetPath = path.join(UPLOAD_PATH, baseName);
  await fs.promises.rename(tempPath, targetPath);
};

export const removeImage = async (fileName: string) => {
  const filePath = path.join(STATIC_PATH, fileName);
  await fs.promises.unlink(filePath);
};

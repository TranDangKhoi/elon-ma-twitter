import fs from "fs";
import path from "path";

export const initFolder = () => {
  const uploadFolderPath = path.resolve("uploads");
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      // Mục đích là để tạo nested folder
      recursive: true,
    });
  } else {
    return;
  }
};

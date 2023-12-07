import { Request } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
const uploadDir = path.resolve("uploads");

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

export const formiddableSingleUploadHandler = (req: Request) => {
  const form = formidable({
    uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    // 10 * 1024 = 10KB => 10KB * 1024 = 10MB
    maxFileSize: 10 * 1024 * 1024,
    filter: function ({ mimetype, name, originalFilename }) {
      console.log({ name, mimetype });
      const isFileValid = Boolean(name === "image" && mimetype?.includes("images"));
      return isFileValid;
    },
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return resolve(files);
    });
  });
};

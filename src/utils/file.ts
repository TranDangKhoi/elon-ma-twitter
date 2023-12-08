import { Request } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { uploadDir } from "src/constants/constants";
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
      console.log(mimetype);
      const isFileValid = Boolean(mimetype?.includes("image"));
      const isKeyValid = name === "image";
      if (!isFileValid) {
        form.emit("error" as "data", new Error("File type is not valid") as any);
      }
      if (!isKeyValid) {
        form.emit(
          "error" as "data",
          new Error(`The key "${name}" in form-data is not valid, please replace it with "image" `) as any,
        );
      }
      return isFileValid;
    },
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log(files);
      if (err) {
        return reject(err);
      }
      if (!files.image) {
        return reject(new Error("Can not upload empty stuffs"));
      }
      return resolve(files);
    });
  });
};

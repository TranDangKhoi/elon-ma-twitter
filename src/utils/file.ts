import { Request } from "express";
import formidable, { File } from "formidable";
import { UPLOAD_DIR_TEMP } from "~/constants/constants";
import fs from "node:fs";
export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_DIR_TEMP)) {
    fs.mkdirSync(UPLOAD_DIR_TEMP, {
      recursive: true,
    });
  } else {
    return;
  }
};

export const getFileNameWithoutExtensions = (filename: string) => {
  const splittedFileName = filename.split(".");
  splittedFileName.pop();
  return splittedFileName.join("");
};

export const formiddableSingleUploadHandler = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_DIR_TEMP,
    allowEmptyFiles: false,
    maxFiles: 4,
    keepExtensions: true,
    // 10 * 1024 = 10KB => 10KB * 1024 = 10MB
    maxFileSize: 10 * 1024 * 1024,
    // totalFileSize maximum sẽ là 40MB, tức là nếu upload nhiều ảnh một lúc thì max chỉ được là 40MB thôi
    maxTotalFileSize: 10 * 4 * 1024 * 1024,
    filter: function ({ mimetype, name, originalFilename }) {
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
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!files.image) {
        return reject(new Error("Can not upload empty stuffs"));
      }
      return resolve(files.image);
    });
  });
};

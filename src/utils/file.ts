import { Request } from "express";
import formidable, { File } from "formidable";
import { IMAGE_UPLOAD_TEMP_DIR, VIDEO_UPLOAD_DIR, VIDEO_UPLOAD_TEMP_DIR } from "~/constants/constants";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

export const initFolder = () => {
  if (!fs.existsSync(IMAGE_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(IMAGE_UPLOAD_TEMP_DIR, {
      recursive: true,
    });
  }
  if (!fs.existsSync(VIDEO_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(VIDEO_UPLOAD_TEMP_DIR, {
      recursive: true,
    });
  }
  return;
};

export const getFileNameWithoutExtensions = (filename: string) => {
  return path.parse(filename).name;
};

export const getExtensionWithoutFilename = (filename: string) => {
  return path.parse(filename as string).ext;
};

export const formiddableImageUploadHandler = (req: Request) => {
  const form = formidable({
    uploadDir: IMAGE_UPLOAD_TEMP_DIR,
    allowEmptyFiles: false,
    maxFiles: 4,
    // keepExtensions: true,
    // 10 * 1024 bytes = 10KB => 10KB * 1024 bytes = 10MB
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

export const formiddableVideoUploadHandler = async (req: Request) => {
  const uniqueId = nanoid();
  const UNIQUE_VIDEO_UPLOAD_DIR = path.join(VIDEO_UPLOAD_DIR, uniqueId);
  fs.mkdirSync(UNIQUE_VIDEO_UPLOAD_DIR);
  const form = formidable({
    uploadDir: UNIQUE_VIDEO_UPLOAD_DIR,
    allowEmptyFiles: false,
    maxFiles: 1,
    filename: (filename, ext) => {
      return uniqueId + ext;
    },
    // 10 * 1024 bytes = 10KB => 10KB * 1024 bytes = 10MB
    maxFileSize: 25 * 1024 * 1024,
    filter: function ({ mimetype, name, originalFilename }) {
      const isFileValid = Boolean(mimetype?.includes("video"));
      const isKeyValid = name === "video";
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
      if (!files.video) {
        return reject(new Error("Can not upload empty stuffs"));
      }
      const videos = files.video;
      videos.forEach((video) => {
        const extensionOfFilename = getExtensionWithoutFilename(video.originalFilename as string);
        fs.renameSync(video.filepath, `${video.filepath}${extensionOfFilename}`);
        video.newFilename = `${getFileNameWithoutExtensions(video.filepath)}${extensionOfFilename}`;
        video.filepath = `${video.filepath}${extensionOfFilename}`;
      });
      return resolve(files.video);
    });
  });
};

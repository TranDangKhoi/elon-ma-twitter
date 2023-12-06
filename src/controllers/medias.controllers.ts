import { Request, Response } from "express";
import formidable from "formidable";
import path from "path";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
const uploadDir = path.resolve("uploads");
export const uploadSingleImage = async (req: Request, res: Response) => {
  const form = formidable({
    uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    // 10 * 1024 = 10KB => 10KB * 1024 = 10MB
    maxFileSize: 10 * 1024 * 1024,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
    }
    console.log(fields);
    console.log(files);
    return res.status(HttpStatusCode.OK).json({
      message: "Upload ảnh thành công",
    });
  });
  // return res.status(HttpStatusCode.OK).json({
  //   message: "Hahaha",
  // });
};

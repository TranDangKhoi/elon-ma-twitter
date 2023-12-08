import { Request } from "express";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/constants";
import { formiddableSingleUploadHandler, getFileNameWithoutExtensions } from "~/utils/file";
import fs from "fs";
class MediasServices {
  async handleUploadSingleImage(req: Request) {
    const file = await formiddableSingleUploadHandler(req);
    const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
    await sharp(file.filepath)
      .resize({
        width: 1200,
        height: 1200,
      })
      .jpeg({
        quality: 80,
      })
      .toFile(UPLOAD_DIR + `/${fileWithoutExtensions}.jpg`);
    fs.unlinkSync(file.filepath);

    return `http://localhost:8080/uploads/${fileWithoutExtensions}.jpg`;
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

import { Request } from "express";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/constants";
import { formiddableSingleUploadHandler, getFileNameWithoutExtensions } from "~/utils/file";
class MediasServices {
  async handleUploadSingleImage(req: Request) {
    const file = await formiddableSingleUploadHandler(req);
    const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
    await sharp(file.filepath)
      .resize(1200, 1200, {
        fit: "inside",
      })
      .jpeg({
        quality: 80,
      })
      .toFile(UPLOAD_DIR + `/${fileWithoutExtensions}.jpg`);
    return `http://localhost:8080/uploads/${fileWithoutExtensions}.jpg`;
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

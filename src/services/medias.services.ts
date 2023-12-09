import { Request } from "express";
import sharp from "sharp";
import { isProduction } from "~/constants/config";
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
    return isProduction
      ? `${process.env.API_HOST}/uploads/${fileWithoutExtensions}`
      : `http://localhost:8080/uploads/${fileWithoutExtensions}.jpg`;
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

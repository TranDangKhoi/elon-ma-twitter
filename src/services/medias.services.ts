import { Request } from "express";
import sharp from "sharp";
import { isProduction } from "~/constants/config";
import { UPLOAD_DIR } from "~/constants/constants";
import { MediaType } from "~/constants/enums";
import { TMediaResponse } from "~/types/media.types";
import { formiddableSingleUploadHandler, getFileNameWithoutExtensions } from "~/utils/file";
class MediasServices {
  async handleUploadImages(req: Request) {
    const files = await formiddableSingleUploadHandler(req);
    const result: TMediaResponse[] = await Promise.all(
      files.map(async (file) => {
        const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
        await sharp(file.filepath)
          .resize(1200, 1200, {
            fit: "inside",
          })
          .jpeg({
            quality: 80,
          })
          .toFile(UPLOAD_DIR + `/${fileWithoutExtensions}.jpg`);
        return {
          url: isProduction
            ? `${process.env.API_HOST}/${fileWithoutExtensions}`
            : `http://localhost:8080/${fileWithoutExtensions}.jpg`,
          type: MediaType.Image,
        };
      }),
    );
    return result;
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

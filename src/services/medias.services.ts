import { Request } from "express";
import sharp from "sharp";
import { isProduction } from "~/constants/config";
import { IMAGE_UPLOAD_DIR } from "~/constants/constants";
import { MediaType } from "~/constants/enums";
import { TMediaResponse } from "~/types/media.types";
import {
  formiddableImageUploadHandler,
  formiddableVideoUploadHandler,
  getFileNameWithoutExtensions,
} from "~/utils/file";
class MediasServices {
  async handleUploadImages(req: Request) {
    console.log(req);
    const imageFiles = await formiddableImageUploadHandler(req);
    const result: TMediaResponse[] = await Promise.all(
      imageFiles.map(async (file) => {
        // const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
        console.log(file.filepath);
        await sharp(file.filepath)
          .resize(1200, 1200, {
            fit: "inside",
          })
          .jpeg({
            quality: 80,
          })
          .toFile(IMAGE_UPLOAD_DIR + `/${file.newFilename}.jpg`);
        return {
          url: isProduction
            ? `${process.env.API_HOST}/medias/image/${file.newFilename}.jpg`
            : `http://localhost:8080/medias/image/${file.newFilename}.jpg`,
          type: MediaType.Image,
        };
      }),
    );
    return result;
  }

  async handleUploadVideos(req: Request) {
    const videoFile = await formiddableVideoUploadHandler(req);
    const videoFileWithoutExtensions = getFileNameWithoutExtensions(videoFile[0].newFilename);
    return {
      url: isProduction
        ? `${process.env.API_HOST}/medias/video/${videoFileWithoutExtensions}.mp4`
        : `http://localhost:8080/medias/video/${videoFileWithoutExtensions}.mp4`,
      type: MediaType.Video,
    };
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

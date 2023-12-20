import { Request } from "express";
import sharp from "sharp";
import { isProduction } from "~/constants/config";
import { IMAGE_UPLOAD_DIR } from "~/constants/constants";
import { MediaType } from "~/constants/enums";
import { TMediaResponse } from "~/types/media.types";
import fsPromise from "fs/promises";
import {
  formiddableImageUploadHandler,
  formiddableVideoUploadHandler,
  getFileNameWithoutExtensions,
} from "~/utils/file";
import { encodeHLSWithMultipleVideoStreams } from "~/utils/ffmpeg";
class MediasServices {
  async handleUploadImages(req: Request) {
    const imageFiles = await formiddableImageUploadHandler(req);
    const result: TMediaResponse[] = await Promise.all(
      imageFiles.map(async (file) => {
        // const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
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
    const videoFiles = await formiddableVideoUploadHandler(req);
    const result = videoFiles.map((file) => {
      return {
        url: isProduction
          ? `${process.env.API_HOST}/medias/video/${file.newFilename}`
          : `http://localhost:8080/medias/video/${file.newFilename}`,
        type: MediaType.Video,
      };
    });
    return result;
  }
  async handleUploadHlsVideos(req: Request) {
    const videoFiles = await formiddableVideoUploadHandler(req);
    const result = await Promise.all(
      videoFiles.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath);
        const newFileName = getFileNameWithoutExtensions(file.filepath);
        fsPromise.unlink(file.filepath);
        return {
          url: isProduction
            ? `${process.env.API_HOST}/medias/video-hls/${newFileName}`
            : `http://localhost:8080/medias/video-hls/${newFileName}`,
          type: MediaType.HLS,
        };
      }),
    );
    return result;
  }
}

const mediasServices = new MediasServices();
export default mediasServices;

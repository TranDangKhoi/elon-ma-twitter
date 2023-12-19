import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import mime from "mime";
import { IMAGE_UPLOAD_DIR, VIDEO_UPLOAD_DIR, VIDEO_UPLOAD_TEMP_DIR } from "~/constants/constants";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { MediaMessage } from "~/constants/messages.enum";
import mediasServices from "~/services/medias.services";

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadImages(req);
  res.status(HttpStatusCode.OK).json({
    message: MediaMessage.UPLOAD_IMAGE_SUCCESSFULLY,
    result,
  });
};

export const uploadVideosController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadVideos(req);
  res.status(HttpStatusCode.OK).json({
    message: MediaMessage.UPLOAD_VIDEO_SUCCESSFULLY,
    result,
  });
};

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  res.sendFile(path.resolve(IMAGE_UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found");
    }
  });
};

export const streamVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const { range } = req.headers;
  if (!range) {
    res.status(HttpStatusCode.BAD_REQUEST).send("Require Range header");
  }
  const { name } = req.params;
  const videoPath = path.resolve(VIDEO_UPLOAD_DIR, name);
  // 1MB = 10^6 bytes (Tính theo hệ thập phân, byte là thứ mà chúng ta hay thấy trên UI)
  // Còn nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size;
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 19 * 10 ** 6; // 10^6 = 1MB

  // Lấy giá trị bytes bắt đầu từ header Range bằng cách loại bỏ tất cả các kí tự không phải số (vd: bytes=1048576- => 1048576)
  const start = Number(range?.replace(/\D/g, ""));

  // Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize - 1
  const end = Math.min(start + chunkSize, videoSize - 1);

  // Dung lượng thực tế cho mỗi đoạn video stream
  // thường đây = chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || "video/*";
  /**
   * Format của header Content-Range: bytes <start>-<end>/<videoSize>
   * Ví dụ: Content-Range: bytes 1048576-3145727/3145728
   * Yêu cầu là `end` phải luôn luôn nhỏ hơn `videoSize`
   * ❌ 'Content-Range': 'bytes 0-100/100'
   * ✅ 'Content-Range': 'bytes 0-99/100'
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoảng cách.
   * Để dễ hình dung, mọi người tưởng tượng từ số 0 đến số 10 thì ta có 11 số.
   * byte cũng tương tự, nếu start = 0, end = 10 thì ta có 11 byte.
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0----------------50|51----------------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */
  const headers = {
    "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  };
  res.writeHead(HttpStatusCode.PARTIAL_CONTENT, "", headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};

export const uploadHlsVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadHlsVideos(req);
  res.status(HttpStatusCode.OK).json({
    message: MediaMessage.UPLOAD_VIDEO_SUCCESSFULLY,
    result,
  });
};

export const hlsStreamVideoController = async (req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatusCode.OK).send("HLS Stream Video");
};

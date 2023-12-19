import { exec } from "child_process";
import path from "path";

const MAXIMUM_BITRATE_720P = 5 * 10 ** 6; // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6; // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6; // 16Mbps

const getBitrate = (filePath: string) => {
  return new Promise<number>((resolve, reject) => {
    exec(
      `ffprobe -v error -select_streams v:0 -show_entries stream=bit_rate -of default=nw=1:nk=1 ${filePath}`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        resolve(Number(stdout.trim()));
      },
    );
  });
};

const getResolution = (filePath: string) => {
  return new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    exec(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filePath}`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const resolution = stdout.trim().split("x");
        const [width, height] = resolution;
        resolve({
          width: Number(width),
          height: Number(height),
        });
      },
    );
  });
};

const getWidth = (height: number, resolution: { width: number; height: number }) => {
  const width = Math.round((height * resolution.width) / resolution.height);
  // Vì ffmpeg yêu cầu width và height phải là số chẵn
  return width % 2 === 0 ? width : width + 1;
};

export const encodeHLSWithMultipleVideoStreams = async (inputPath: string) => {
  const [bitrate, resolution] = await Promise.all([getBitrate(inputPath), getResolution(inputPath)]);
  const parent_folder = path.join(inputPath, "..");
  const outputSegmentPath = path.join(parent_folder, "v%v/fileSequence%d.ts");
  const outputPath = path.join(parent_folder, "v%v/prog_index.m3u8");
  const bitrate720 = bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate;
  const bitrate1080 = bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate;
  const bitrate1440 = bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate;

  const commandWithMax720 = `
  ffmpeg -y -i ${inputPath} \\
  -preset veryslow -g 48 -crf 17 -sc_threshold 0 \
  -map 0:0 -map 0:1 \\
  -s:v:0 ${getWidth(720, resolution)}x720 -c:v:0 libx264 -b:v:0 ${bitrate720} \\
  -c:a copy \\
  -var_stream_map "v:0,a:0" \\
  -master_pl_name master.m3u8 \\
  -f hls -hls_time 6 -hls_list_size 0 \\
  -hls_segment_filename "${outputSegmentPath}" \\
  ${outputPath}
`;

  const commandWithMax1080 = `
  ffmpeg -y -i ${inputPath} \\
  -preset veryslow -g 48 -crf 17 -sc_threshold 0 \
  -map 0:0 -map 0:1 -map 0:0 -map 0:1 \\
  -s:v:0 ${getWidth(720, resolution)}x720 -c:v:0 libx264 -b:v:0 ${bitrate720} \\
  -s:v:1 ${getWidth(1080, resolution)}x1080 -c:v:1 libx264 -b:v:1 ${bitrate1080} \\
  -c:a copy \\
  -var_stream_map "v:0,a:0 v:1,a:1" \\
  -master_pl_name master.m3u8 \\
  -f hls -hls_time 6 -hls_list_size 0 \\
  -hls_segment_filename "${outputSegmentPath}" \\
  ${outputPath}
`;
  const commandWithMax1440 = `
  ffmpeg -y -i ${inputPath} \\
  -preset veryslow -g 48 -crf 17 -sc_threshold 0 \
  -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 \\
  -s:v:0 ${getWidth(720, resolution)}x720 -c:v:0 libx264 -b:v:0 ${bitrate720} \\
  -s:v:1 ${getWidth(1080, resolution)}x1080 -c:v:1 libx264 -b:v:1 ${bitrate1080} \\
  -s:v:2 ${getWidth(1440, resolution)}x1440 -c:v:2 libx264 -b:v:2 ${bitrate1440} \\
  -c:a copy \\
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \\
  -master_pl_name master.m3u8 \\
  -f hls -hls_time 6 -hls_list_size 0 \\
  -hls_segment_filename "${outputSegmentPath}" \\
  ${outputPath}
`;

  const commandWithOriginalWidth = `
ffmpeg -y -i ${inputPath} \\
-preset veryslow -g 48 -crf 17 -sc_threshold 0 \
-map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 \\
-s:v:0 ${getWidth(720, resolution)}x720 -c:v:0 libx264 -b:v:0 ${bitrate720} \\
-s:v:1 ${getWidth(1080, resolution)}x1080 -c:v:1 libx264 -b:v:1 ${bitrate1080} \\
-c:v:2 libx264 -b:v:2 ${bitrate} \\
-c:a copy \\
-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \\
-master_pl_name master.m3u8 \\
-f hls -hls_time 6 -hls_list_size 0 \\
-hls_segment_filename "${outputSegmentPath}" \\
${outputPath}
`;

  let command = commandWithMax720;
  if (resolution.width > 720) {
    command = commandWithMax1080;
  }
  if (resolution.width > 1080) {
    command = commandWithMax1440;
  }
  if (resolution.width > 1440) {
    command = commandWithOriginalWidth;
  }

  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      console.log("Convert thành công");
      resolve(true);
    });
  });
};

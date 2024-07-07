const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

// url to fetch random images
const images = "https://picsum.photos/600";

async function downloadImage(url, imagePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(imagePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log(`Image Downloaded Path: ${imagePath}`);
      resolve();
    });
    writer.on("error", reject);
  });
}

function createVideoFromImages(imagePattern, outputPath, fps = 25) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePattern)
      .inputOptions([
        "-framerate",
        fps, // input frame rate
      ])
      .on("end", () => {
        console.log("Video created successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error creating video:", err);
        reject(err);
      })
      .outputOptions([
        "-r",
        fps, // output frame rate
        "-c:v",
        "libx264", // video codec
        "-pix_fmt",
        "yuv420p", // pixel format
      ])
      .save(outputPath)
      // adding width and height
      .videoFilters("scale=1980:720");
  });
}
// Note make sure to save the file with name image1.type, image2.type... in the same order you want your video to be
const imagePattern = "./images/image%d.jpeg";

async function main() {
  isDirExists = fs.existsSync(path.join(__dirname, "/images"));
  if (!isDirExists) {
    fs.mkdirSync(path.join(__dirname, "/images"));
  }
  const allImagesDownloaded = new Promise((resolve) => {
    for (let i = 0; i < 50; i++) {
      (async () => {
        await downloadImage(
          images,
          path.join(__dirname, "/images/", `image${i + 1}.jpeg`)
        );
      })();
    }
    resolve(true);
  });
  if (allImagesDownloaded) {
    createVideoFromImages(imagePattern, "./video.mp4", 30);
  }
}

main();

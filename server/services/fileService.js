import fs from "fs";
import path from "path";
import util from "util";
import { fileURLToPath } from "url";

const unlinkAsync = util.promisify(fs.unlink);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadDir = path.join("/tmp", "audios");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Saves an uploaded file to the temporary upload directory.
 * @param {Object} file - The file object containing the audio data.
 * @returns {Promise<string>} The file path of the saved file.
 */
export const saveFile = async (file) => {
  const tempFilePath = path.join(uploadDir, file.filename);

  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(tempFilePath);
    file.file.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return tempFilePath;
};

/**
 * Cleans up a temporary file by removing it from the filesystem.
 * @param {string} filePath - The path of the file to be deleted.
 * @returns {Promise<void>}
 */
export const cleanupFile = async (filePath) => {
  if (fs.existsSync(filePath)) {
    await unlinkAsync(filePath);
  }
};

import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads a JSON dataset from the local file system and returns a random text.
 * @returns {Promise<string>} A random text string from the dataset.
 */
export async function getRandomText() {
  try {
    const filePath = path.resolve(__dirname, "/tmp/text.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Dataset is empty or not an array.");
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    console.error("Error in getRandomText:", error);
    throw new Error("Error fetching text from local dataset.");
  }
}

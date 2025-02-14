import { HfInference } from "@huggingface/inference";
import { saveFile, cleanupFile } from "./fileService.js";
import fs from "fs";

const MODEL = "openai/whisper-medium";

/**
 * Transcribes the given audio file using Hugging Face's Whisper model.
 * @param {string} filePath - The path of the file to be transcribed.
 * @returns {Promise<Object>} The transcription result.
 */
export const transcribeAudio = async (filePath, apiKey) => {
  try {
    const hf = new HfInference(apiKey);
    const data = fs.readFileSync(filePath);

    const transcriptionResult = await hf.automaticSpeechRecognition({
      data,
      model: MODEL,
      provider: "hf-inference",
      language: "en",
    });

    return {
      transcription: transcriptionResult.text,
      fileSize: `${(await fs.promises.stat(filePath)).size / 1024} KB`,
    };
  } catch (error) {
    console.error("Error processing file:", error.message);
    throw error;
  }
};

/**
 * Handles file processing and transcription.
 */
export const processFileAndTranscribe = async (file, apiKey) => {
  const tempFilePath = await saveFile(file);
  try {
    return await transcribeAudio(tempFilePath, apiKey);
  } finally {
    await cleanupFile(tempFilePath);
  }
};

import axios from "axios";
import { saveFile, cleanupFile } from "./fileService.js";
import fs from "fs";
import FormData from "form-data";

/**
 * Transcribes the given audio file using OpenAI's Whisper API.
 * Sends the file to Whisper and returns the transcription result.
 * @param {string} filePath - The path of the file to be transcribed.
 * @param {string} fileType - The MIME type of the audio file.
 * @returns {Promise<Object>} The transcription result including text, file size, and file type.
 */
export const transcribeAudio = async (filePath, fileType) => {
  try {
    console.log("Loaded API Key:", getAPIKeys().openAIKey);
    console.log("Transcribing file:", filePath);

    // Create a readable stream of the audio file
    const fileStream = fs.createReadStream(filePath);

    // Prepare FormData for the API request
    const formData = new FormData();
    formData.append("file", fileStream, {
      filename: "audio.webm",
      contentType: fileType,
    });
    formData.append("model", WHISPER_MODEL);

    // Send the audio file to Whisper API for transcription
    const response = await axios.post(OPENAI_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    const transcriptionResult = response.data;

    // Return the result along with file details
    return {
      transcription: transcriptionResult.text,
      fileSize: `${(await fs.promises.stat(filePath)).size / 1024} KB`,
      fileType,
    };
  } catch (error) {
    console.error(
      "Error processing file:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Handles file processing and transcription.
 * Saves the file, sends it to Whisper API for transcription, and cleans up after processing.
 * @param {Object} file - The file object containing the audio to be transcribed.
 * @returns {Promise<Object>} The transcription result, file details, and success message.
 */
export const processFileAndTranscribe = async (file) => {
  // Save the file temporarily for processing
  const tempFilePath = await saveFile(file);

  try {
    // Send the file to the transcription service
    const transcriptionResponse = await transcribeAudio(
      tempFilePath,
      file.mimetype
    );
    return transcriptionResponse;
  } finally {
    // Clean up temporary files after transcription
    await cleanupFile(tempFilePath);
  }
};

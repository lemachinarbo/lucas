import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";
import FormData from "form-data";

// Load environment variables
dotenv.config();

console.log(process.env.OPENAI_API_KEY); // Verify if the key loads correctly

const testWhisperAPI = async () => {
  try {
    // Provide a path to a small audio file for testing
    const filePath = "src/tmp/audios/yeah.webm"; // Replace with the path to your test file
    const audioBuffer = await fs.readFile(filePath);

    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: "yeah.webm",
      contentType: "audio/webm",
    });
    formData.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("Whisper API Response:", response.data);
  } catch (error) {
    console.error(
      "Error testing Whisper API:",
      error.response?.data || error.message
    );
  }
};

testWhisperAPI();

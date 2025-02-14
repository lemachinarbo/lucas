import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log(process.env.HUGGING_FACE_API_KEY); // Verify if the key loads correctly

const testHuggingFaceAPI = async () => {
  try {
    // Input text for emotion analysis
    const inputText = "I love using Hugging Face's APIs!";

    // API endpoint for Hugging Face Inference (GoEmotions model)
    const apiUrl =
      "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-go-emotion";

    // Make the API request
    const response = await axios.post(
      apiUrl,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the response from the API
    console.log("Hugging Face API Response:", response.data);
  } catch (error) {
    console.error(
      "Error testing Hugging Face API:",
      error.response?.data || error.message
    );
  }
};

testHuggingFaceAPI();

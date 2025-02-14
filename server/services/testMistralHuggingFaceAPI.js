import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log(process.env.HUGGING_FACE_API_KEY); // Verify if the key loads correctly

const testMistralAPI = async () => {
  try {
    const inputText = "I feel like today has been a rollercoaster of emotions.";

    // Mistral-7B API endpoint
    const apiUrl =
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

    // Make the API request
    const response = await axios.post(
      apiUrl,
      {
        inputs: `Analyze the following text and summarize its emotional tone: "${inputText}"`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the response from the API
    console.log("Mistral API Response:", response.data);
  } catch (error) {
    console.error(
      "Error testing Mistral API:",
      error.response?.data || error.message
    );
  }
};

testMistralAPI();

//todo: can fetch and generate methods be unified?
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HfInference } from "@huggingface/inference";

const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

/**
 * Fetches the system prompt from the markdown file.
 * @returns {string} The prompt content.
 */

export const fetchPrompt = () => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const promptFilePath = path.resolve(__dirname, "../prompts/feedback.md");

    const content = fs.readFileSync(promptFilePath, "utf-8").trim();
    console.log("Fetched Prompt:", content); // Debugging

    return content;
  } catch (error) {
    console.error("Error reading prompt:", error.message);
    throw new Error("Failed to load default prompt.");
  }
};

/**
 * Fetches feedback analysis using Hugging Face's chatCompletion API.
 * @param {string} text - The text to analyze.
 * @param {string} sentiment - The detected sentiment of the text.
 * @param {string[]} emotions - The detected emotions in the text.
 * @returns {string} Generated feedback from Mistral.
 */
const fetchFeedbackAnalysis = async (
  text,
  sentiment,
  emotions,
  customPrompt = null,
  apiKey
) => {
  try {
    const hf = new HfInference(apiKey);
    const systemPrompt = customPrompt || fetchPrompt();

    console.log("Used prompt: ", systemPrompt);

    const context = `Users input detected sentiment: ${sentiment}. Detected emotions: ${emotions}.`;

    const messages = [
      { role: "system", content: `${systemPrompt}\n\n${context}` },
      { role: "user", content: text },
    ];

    const chatCompletion = await hf.chatCompletion({
      model: MODEL,
      messages,
      max_tokens: 500,
    });

    const feedback = chatCompletion.choices[0].message.content.trim();
    console.log("Generated feedback:", feedback);
    return feedback;
  } catch (error) {
    console.error("Error fetching feedback analysis:", error.message);
    throw error;
  }
};

/**
 * Generates feedback based on text input, sentiment, and emotions.
 * @param {string} text - The text to analyze.
 * @param {string} sentiment - The detected sentiment of the text.
 * @param {string[]} emotions - The detected emotions in the text.
 * @returns {string} Processed feedback.
 */
export const generateFeedback = async (
  text,
  sentiment,
  emotions,
  customPrompt,
  apiKey
) => {
  try {
    const feedback = await fetchFeedbackAnalysis(
      text,
      sentiment,
      emotions,
      customPrompt,
      apiKey
    );
    return feedback;
  } catch (error) {
    console.error("Error in generateFeedback:", error.message);
    throw error;
  }
};

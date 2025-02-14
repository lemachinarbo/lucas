import { HfInference } from "@huggingface/inference";

const MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment";

/**
 * Classifies sentiment based on the provided text.
 * @param {string} text - The text to analyze.
 * @returns {Object} The highest-scoring sentiment result, including label and score.
 * @throws {Error} Throws an error if there is a failure in fetching or processing the sentiment.
 */
export const classifySentiment = async (text, apiKey) => {
  try {
    const rawSentiment = await fetchSentiment(text, apiKey);
    return processSentiment(rawSentiment);
  } catch (error) {
    console.error("Error in classifySentiment:", error.message);
    throw error;
  }
};

/**
 * Fetches sentiment analysis from Hugging Face API.
 * @param {string} text - The text to analyze.
 * @returns {Array} Raw sentiment data from the API.
 * @throws {Error} Throws an error if the API call fails.
 */
const fetchSentiment = async (text, apiKey) => {
  const hf = new HfInference(apiKey);

  try {
    return await hf.textClassification({ model: MODEL, inputs: text });
  } catch (error) {
    console.error("Error fetching sentiment:", error.message);
    throw error;
  }
};

/**
 * Processes the raw sentiment data and returns the highest-scoring sentiment.
 * @param {Array} rawSentiment - Raw sentiment data from the API.
 * @returns {Object} Processed sentiment result, including the highest sentiment label and score.
 * @throws {Error} Throws an error if the raw sentiment data is invalid or empty.
 */
const processSentiment = (rawSentiment) => {
  if (!Array.isArray(rawSentiment) || rawSentiment.length === 0) {
    throw new Error("Invalid or empty sentiment response.");
  }

  return rawSentiment
    .map((item) => ({ sentiment: item.label, score: item.score }))
    .sort((a, b) => b.score - a.score)[0]; // Return the highest-scoring sentiment
};

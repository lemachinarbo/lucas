import { HfInference } from "@huggingface/inference";

const MODEL = "SamLowe/roberta-base-go_emotions";

/**
 * Fetches emotion data from Hugging Face API using HfInference.
 * @param {string} transcription - The transcription text to analyze.
 * @returns {Array} Raw emotion data.
 */
const fetchEmotions = async (transcription, apiKey) => {
  try {
    const hf = new HfInference(apiKey);

    const response = await hf.textClassification({
      model: MODEL,
      inputs: transcription,
    });

    return response;
  } catch (error) {
    console.error("Error fetching emotions:", error);
    throw error;
  }
};

/**
 * Processes raw emotion data into a sorted array of emotions.
 * @param {Array} rawEmotions - Raw emotion data from the API.
 * @returns {Array} Sorted and cleaned emotion data.
 */
const processEmotions = (rawEmotions) => {
  if (!Array.isArray(rawEmotions) || !rawEmotions.length) {
    throw new Error("Invalid or empty emotion data in response.");
  }

  const emotions = rawEmotions
    .flat()
    .map(({ label, score }) => ({
      emotion: label,
      score: Number(score.toFixed(3)),
    }))
    .sort((a, b) => b.score - a.score);

  if (!emotions.length) {
    throw new Error("No valid emotions found in processed data.");
  }

  return emotions;
};

/**
 * Filters emotions with a score greater than or equal to 0.15.
 * @param {Array} emotions - Sorted emotion data.
 * @returns {Array} Significant emotions with score >= 0.15.
 */
const filterSignificantEmotions = (emotions) => {
  return emotions.filter((e) => e.score >= 0.15);
};

/**
 * Classifies emotions based on transcription text using Hugging Face API.
 * @param {string} transcription - The transcription text to analyze.
 * @returns {Object} Processed emotion results with significant emotions.
 */
export const classifyEmotions = async (transcription, apiKey) => {
  try {
    const rawEmotions = await fetchEmotions(transcription, apiKey);
    const emotions = processEmotions(rawEmotions);
    const significantEmotions = filterSignificantEmotions(emotions);

    return { significantEmotions, rawEmotions };
  } catch (error) {
    console.error("Error in classifyEmotions:", error.message);
    throw error;
  }
};

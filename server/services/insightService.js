import fs from "fs";
import path from "path";

const INSIGHTS_PATH = path.resolve("tmp/datasets/insights.json");

/**
 * Loads insights from the insights.json file.
 * @returns {Object} Parsed insights data.
 */
const loadInsights = () => {
  try {
    const data = fs.readFileSync(INSIGHTS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading insights:", error.message);
    return [];
  }
};

/**
 * Retrieves insights based on requested emotions.
 * @param {Object[]} emotions - List of emotion objects, each containing an 'emotion' key.
 * @param {string} emotions[].emotion - The emotion name to look for in the insights data.
 * @returns {Object} Matched insights, where the key is the emotion and the value contains the associated topic and redirection.
 */
export const getInsightsForEmotions = (emotions) => {
  const allInsights = loadInsights();
  const matchedInsights = {};

  emotions.forEach((emotionObj) => {
    const emotion = emotionObj.emotion;
    const matchedEmotion = allInsights.find((item) => item.emotion === emotion);

    if (matchedEmotion) {
      const { topic, redirection } = matchedEmotion;
      matchedInsights[emotion] = { topic, redirection };
    } else {
      console.log(`No match found for ${emotion}`);
    }
  });

  return matchedInsights;
};

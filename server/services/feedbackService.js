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
 * @param {Object} insights - The detected insights from the text.
 * @returns {string} Generated feedback from Mistral.
 */
const fetchFeedbackAnalysis = async (
  text,
  sentiment,
  emotions,
  insights,
  customPrompt = null,
  apiKey
) => {
  try {
    const hf = new HfInference(apiKey);
    const systemPrompt = customPrompt || fetchPrompt();

    const template = createTemplate();

    const parsedEmotions = emotions.split(", ").map((pair) => {
      const [emotion, score] = pair.split(" ");
      return { emotion, score: parseFloat(score) || "N/A" };
    });

    // Fill the template with the required data
    const filledTemplate = populateTemplate(template, {
      prompt: systemPrompt,
      sentiment,
      emotion: formatEmotions(insights.insights, parsedEmotions),
    });

    const messages = [
      { role: "system", content: filledTemplate },
      { role: "user", content: text },
    ];

    console.log(messages);

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
 * Creates the feedback template with placeholders.
 * @returns {string} The template string with placeholders.
 */
const createTemplate = () => {
  return `
$prompt

User's input detected sentiment: $sentiment.

(Background insights for reference—use only if relevant)
{foreach emotion}
- $emotion ($score) [Topic: $topic]
  Possible redirections:
{foreach redirection}
  → $redirection
{/foreach redirection}
{/foreach emotion}
`;
};

/**
 * Populates the template with dynamic data.
 * @param {string} template - The template string with placeholders.
 * @param {Object} data - The dynamic data to replace the placeholders.
 * @returns {string} The populated template.
 */
const populateTemplate = (template, data) => {
  let output = template
    .replace("$prompt", data.prompt)
    .replace("$sentiment", data.sentiment);

  // Handle emotion foreach block
  output = output.replace(
    /\{foreach emotion\}([\s\S]*?)\{\/foreach emotion\}/g,
    (_, block) => {
      if (!data.emotion || data.emotion.length === 0) return "";

      return data.emotion
        .map((item) => {
          let populatedBlock = block;

          Object.entries(item).forEach(([placeholder, value]) => {
            if (placeholder === "redirection") return; // Skip redirection
            populatedBlock = populatedBlock.replace(
              new RegExp(`\\$${placeholder}`, "g"),
              value
            );
          });

          if (item.redirection?.length > 0) {
            populatedBlock = populatedBlock.replace(
              /\{foreach redirection\}([\s\S]*?)\{\/foreach redirection\}/g,
              (_, blockContent) => {
                return item.redirection
                  .map((redir) =>
                    blockContent.replace(/\$redirection/g, redir).trim()
                  )
                  .join("\n");
              }
            );
          } else {
            populatedBlock = populatedBlock.replace(
              /\{foreach redirection\}([\s\S]*?)\{\/foreach redirection\}/g,
              ""
            );
          }

          return populatedBlock.trim();
        })
        .join("\n");
    }
  );

  return output;
};

/**
 * Formats emotions from the insights object into a structured array.
 * @param {Object} insights - The insights object containing emotions.
 * @returns {Array} An array of formatted emotion objects.
 */
const formatEmotions = (insights, emotionsArray) => {
  return Object.entries(insights || {}).map(([emotion, details]) => {
    // Find matching emotion in the parsed array
    const matchedEmotion = emotionsArray.find((e) => e.emotion === emotion);

    return {
      emotion,
      score: matchedEmotion ? matchedEmotion.score : "N/A",
      topic: details.topic || "Unknown",
      redirection: details.redirection || [],
    };
  });
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
  insights,
  customPrompt,
  apiKey
) => {
  try {
    const feedback = await fetchFeedbackAnalysis(
      text,
      sentiment,
      emotions,
      insights,
      customPrompt,
      apiKey
    );
    return feedback;
  } catch (error) {
    console.error("Error in generateFeedback:", error.message);
    throw error;
  }
};

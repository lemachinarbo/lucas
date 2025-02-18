import { handleLocalStorage } from "./storageService";
import { fetchRandomText } from "./apiService.js";

const openAIKey = localStorage.getItem("openAIKey");
const huggingFaceKey = localStorage.getItem("huggingFaceKey");

/**
 * Analyzes the current transcription by fetching emotion and sentiment data.
 * @param {Object} app - The Alpine component instance.
 */
export async function analyzeTranscription(app) {
  if (!app.textToAnalyze) {
    app.logMessage("No text available to analyze.");
    return;
  }

  try {
    const { emotions, sentiment, feedback } = await fetchAnalysisData(
      app,
      app.textToAnalyze
    );
    processAnalysisResults(app, emotions, sentiment, feedback);
  } catch (error) {
    app.logMessage(`Error connecting to the server: ${error.message}`);
  }
}

/**
 * Fetches a random text and analyzes it.
 * @param {Object} app - The Alpine component instance.
 */
export async function analyzeRandomText(app) {
  await fetchRandomText(app);
  await analyzeTranscription(app);
}

/**
 * Sends the transcription to the analysis APIs and retrieves emotion, sentiment, and feedback data.
 * @param {string} text - The transcription text to analyze.
 * @returns {Promise<Object>} An object containing emotions, sentiment, and feedback.
 */
async function fetchAnalysisData(app, text) {
  app.logMessage("Ping: /api/analyze", true);
  // First, fetch emotions and sentiment sequentially
  const emotionResponse = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      huggingFaceKey: huggingFaceKey,
    },
    body: JSON.stringify({ transcription: text }),
  });

  if (!emotionResponse.ok) {
    throw new Error(`Emotion API error: ${emotionResponse.statusText}`);
  }
  const emotionResult = await emotionResponse.json();
  app.logMessage("Emotions Response:", emotionResult);

  app.logMessage("Ping: /api/sentiment", true);
  const sentimentResponse = await fetch("/api/sentiment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      huggingFaceKey: huggingFaceKey,
    },
    body: JSON.stringify({ transcription: text }),
  });

  if (!sentimentResponse.ok) {
    throw new Error(`Sentiment API error: ${sentimentResponse.statusText}`);
  }
  const sentimentResult = await sentimentResponse.json();
  app.logMessage("Sentiment Response:", sentimentResult);

  const significantEmotions = emotionResult.emotions?.significantEmotions;

  const formattedEmotions = (significantEmotions || [])
    .map(({ emotion, score }) => `${emotion} ${score.toFixed(2)}`)
    .join(", ");

  app.logMessage("Ping: /api/insights", true);
  const insightsResponse = await fetch("/api/insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emotions: significantEmotions }),
  });

  if (!insightsResponse.ok) {
    throw new Error(`Insights API error: ${insightsResponse.statusText}`);
  }
  const insightsResult = await insightsResponse.json();
  app.logMessage("Insights Response:", insightsResult);
  console.log(insightsResult);

  const formattedSentiment = `${
    sentimentResult.sentiment?.sentiment
  } ${sentimentResult.sentiment?.score.toFixed(2)}`;

  const customPrompt =
    localStorage.getItem("userPrompt") !== localStorage.getItem("defaultPrompt")
      ? localStorage.getItem("userPrompt")
      : null;

  app.logMessage("Ping: /api/feedback");

  const feedbackResponse = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      huggingFaceKey: huggingFaceKey,
    },
    body: JSON.stringify({
      transcription: text,
      emotions: formattedEmotions,
      sentiment: formattedSentiment,
      insights: insightsResult,
      customPrompt,
    }),
  });

  if (!feedbackResponse.ok) {
    throw new Error(`Feedback API error: ${feedbackResponse.statusText}`);
  }
  const feedbackResult = await feedbackResponse.json();
  app.logMessage("Feedback Response:", feedbackResult);

  return {
    emotions: emotionResult.emotions?.significantEmotions || [],
    sentiment: sentimentResult.sentiment || {},
    insights: insightsResult || {},
    feedback: feedbackResult.feedback || "",
  };
}

/**
 * Processes the analysis results and updates the Alpine component.
 * @param {Object} app - The Alpine component instance.
 * @param {Array<Object>} emotions - List of detected emotions.
 * @param {Object} sentimentScores - Sentiment analysis scores.
 * @param {string} feedback - AI-generated feedback based on emotions and sentiment.
 */
function processAnalysisResults(app, emotions, sentimentScores, feedback) {
  if (emotions.length === 0) {
    app.logMessage("No significant emotions detected.");
  }

  const emotionList = emotions.map((e) => e.emotion).join(", ");
  const sentimentList = Object.entries(sentimentScores)
    .map(([key, value]) =>
      typeof value === "number"
        ? `${key} (${value.toFixed(2)})`
        : `${key} (${value})`
    )
    .join(", ");

  const feedbackText = feedback || "No feedback available.";

  app.logMessage(`Pong: ${emotionList}`);
  app.logMessage(`Pong: ${sentimentList}`);
  app.logMessage(`Pong: ${feedbackText}`);

  app.echoMessage(
    `${app.textToAnalyze} —<em>${emotionList}</em> [${sentimentList}]<br><strong>Feedback:</strong> ${feedbackText}`
  );

  const transcriptionData = {
    transcription: app.textToAnalyze,
    emotions: emotions.map((e) => ({ emotion: e.emotion, score: e.score })),
    sentiment: sentimentScores,
    feedback: feedbackText,
    date: new Date().toISOString(),
  };

  handleLocalStorage(app, "save", "transcriptionData", transcriptionData);

  app.textToAnalyze = "";
}

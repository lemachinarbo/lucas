//todo: sanitize api requests.

import { getHello } from "../services/helloService.js";
import { processFileAndTranscribe } from "../services/transcriptionService.js";
import { classifyEmotions } from "../services/emotionService.js";
import { getRandomText } from "../services/randomTextService.js";
import { classifySentiment } from "../services/sentimentService.js";
import { generateFeedback, fetchPrompt } from "../services/feedbackService.js";
import fastifyMultipart from "@fastify/multipart";

export default async function (fastify) {
  /**
   * GET /api/hello
   * -------------------------------
   * Description:
   * - Returns a "hello" message from the hello service.
   *
   * Request:
   * - No parameters or body required.
   *
   * Response:
   * - 200: { message: string } - The hello message.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "message": "Hello, world!"
   * }
   */
  fastify.get("/api/hello", async (request, reply) => {
    try {
      const response = await getHello(); // Call the service to fetch the hello message
      return reply.send(response);
    } catch (error) {
      console.error("Error in /api/hello:", error);
      return reply.status(500).send({ message: "Internal server error." });
    }
  });

  /**
   * GET /api/random-text
   * -------------------------------
   * Description:
   * - Fetches a random text from a local JSON file.
   *
   * Request:
   * - No parameters or body required.
   *
   * Response:
   * - 200: { text: string } - The retrieved random text.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "text": "This is a random text sample."
   * }
   */

  fastify.get("/api/random-text", async (request, reply) => {
    try {
      const randomText = await getRandomText();
      console.log(randomText);

      return reply.status(200).send({ text: randomText });
    } catch (error) {
      console.error("Error fetching random text:", error);
      return reply.status(500).send({ message: error.message });
    }
  });

  /**
   * GET /api/prompt
   * -------------------------------
   * Description:
   * - Returns the default prompt from the markdown file.
   *
   * Request:
   * - No parameters or body required.
   *
   * Response:
   * - 200: { prompt: string } - The markdown content.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "prompt": "Your feedback prompt text..."
   * }
   */
  fastify.get("/api/prompt", async (request, reply) => {
    try {
      const prompt = fetchPrompt();
      return reply.send({ prompt });
    } catch (error) {
      console.error("Error in /api/prompt:", error);
      return reply.status(500).send({ message: "Failed to fetch prompt." });
    }
  });

  // Register the Fastify plugin for handling multipart file uploads
  fastify.register(fastifyMultipart);

  /**
   * POST /api/transcribe
   * -------------------------------
   * Description:
   * - Accepts an audio file and returns its transcription.
   *
   * Request:
   * - Headers: Content-Type: multipart/form-data
   * - Body: { file: File } - The audio file to be transcribed.
   *
   * Response:
   * - 200: { transcription: string, fileSize: string, fileType: string } - Transcription details.
   * - 400: { message: string } - No file uploaded.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "transcription": "This is the transcribed text.",
   *   "fileSize": "2 MB",
   *   "fileType": "audio/webm"
   * }
   */
  fastify.post("/api/transcribe", async (request, reply) => {
    try {
      const file = await request.file(); // Retrieve the uploaded file from the request
      const huggingFaceKey = request.headers["huggingfacekey"];

      // Check if a file is provided; return an error if not
      if (!file || !file.filename) {
        return reply.status(400).send({ message: "No file uploaded." });
      }

      if (!huggingFaceKey) {
        return reply.status(400).send({ message: "Missing API key." });
      }

      const transcriptionResponse = await processFileAndTranscribe(
        file,
        huggingFaceKey
      );

      return reply.status(200).send(transcriptionResponse);
    } catch (error) {
      console.error("Error during file upload or transcription:", error);
      return reply.status(500).send({ message: "Internal server error." });
    }
  });

  /**
   * POST /api/analyze
   * -------------------------------
   * Description:
   * - Accepts a transcription text and returns emotion classification results.
   *
   * Request:
   * - Headers: Content-Type: application/json
   * - Body: { transcription: string } - The transcription text to analyze.
   *
   * Response:
   * - 200: { emotions: Object } - Emotion classification details.
   * - 400: { message: string } - Invalid or missing transcription text.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "emotions": {
   *     "happy": 0.8,
   *     "sad": 0.1,
   *     "neutral": 0.1
   *   }
   * }
   */
  fastify.post("/api/analyze", async (request, reply) => {
    try {
      const { transcription } = request.body;
      const huggingFaceKey = request.headers["huggingfacekey"];

      // Validate the transcription text
      if (!transcription) {
        return reply
          .status(400)
          .send({ message: "No transcription text provided." });
      }

      if (!huggingFaceKey) {
        return reply.status(400).send({ message: "Missing API key." });
      }

      const emotionAnalysis = await classifyEmotions(
        transcription,
        huggingFaceKey
      );

      return reply.status(200).send({ emotions: emotionAnalysis });
    } catch (error) {
      console.error("Error during emotion analysis:", error);
      return reply.status(500).send({ message: "Internal server error." });
    }
  });

  /**
   * POST /api/sentiment
   * -------------------------------
   * Description:
   * - Accepts a transcription text and returns sentiment classification results.
   *
   * Request:
   * - Headers: Content-Type: application/json
   * - Body: { transcription: string } - The transcription text to analyze.
   *
   * Response:
   * - 200: { sentiment: Object } - Sentiment classification details.
   * - 400: { message: string } - Invalid or missing transcription text.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "sentiment": {
   *     "sentiment": "positive",
   *     "score": 0.85
   *   }
   * }
   */

  fastify.post("/api/sentiment", async (request, reply) => {
    try {
      const { transcription } = request.body;
      const huggingFaceKey = request.headers["huggingfacekey"];

      if (!transcription) {
        return reply
          .status(400)
          .send({ message: "No transcription text provided." });
      }
      if (!huggingFaceKey) {
        return reply.status(400).send({ message: "Missing API key." });
      }

      const sentiment = await classifySentiment(transcription, huggingFaceKey);

      return reply.status(200).send({ sentiment });
    } catch (error) {
      console.error("Error during sentiment analysis:", error);
      return reply.status(500).send({ message: "Internal server error." });
    }
  });

  /**
   * POST /api/feedback
   * -------------------------------
   * Description:
   * - Accepts a transcription text and returns meaningful feedback.
   *
   * Request:
   * - Headers: Content-Type: application/json
   * - Body: { transcription: string } - The transcription text to analyze.
   *
   * Response:
   * - 200: { feedback: string } - Feedback based on the user's text.
   * - 400: { message: string } - Invalid or missing transcription text.
   * - 500: { message: string } - Internal server error.
   *
   * Example Response:
   * {
   *   "feedback": "It sounds like you're feeling overwhelmed. Consider taking a short break and focusing on one task at a time."
   * }
   */

  fastify.post("/api/feedback", async (request, reply) => {
    try {
      const { transcription, sentiment, emotions, customPrompt } = request.body;
      const huggingFaceKey = request.headers["huggingfacekey"];

      console.log("transcription: ", transcription);
      console.log("sentiment: ", sentiment);
      console.log("emotions: ", emotions);

      if (!transcription) {
        return reply
          .status(400)
          .send({ message: "No transcription text provided." });
      }

      if (!huggingFaceKey) {
        return reply.status(400).send({ message: "Missing API key." });
      }

      const feedback = await generateFeedback(
        transcription,
        sentiment,
        emotions,
        customPrompt,
        huggingFaceKey
      );

      return reply.status(200).send({ feedback });
    } catch (error) {
      console.error("Error during feedback analysis:", error);
      return reply.status(500).send({ message: "Internal server error." });
    }
  });
}

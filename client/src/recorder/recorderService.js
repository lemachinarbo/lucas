import RecordRTC from "recordrtc";
import { analyzeTranscription } from "../services/analysisService";

const openAIKey = localStorage.getItem("openAIKey");
const huggingFaceKey = localStorage.getItem("huggingFaceKey");

/**
 * Toggles between starting and stopping the recording.
 * @param {Object} app - The Alpine component instance.
 */
export async function startStopRecording(app) {
  if (app.isRecording) {
    await stopRecording(app);
  } else {
    await startRecording(app);
  }
}

/**
 * Starts recording audio from the user's microphone.
 * @param {Object} app - The Alpine component instance.
 */
export async function startRecording(app) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    // Initialize the recorder with the audio stream
    app.recorder = new RecordRTC(stream, {
      type: "audio",
      disableLogs: true,
    });
    app.recorder.startRecording();
    app.isRecording = true;
    app.logMessage("Recording started.", true, true);
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

/**
 * Stops the ongoing recording and processes the recorded audio.
 * @param {Object} app - The Alpine component instance.
 */
export async function stopRecording(app) {
  if (!app.recorder) return;
  app.recorder.stopRecording(async () => {
    const audioBlob = app.recorder.getBlob(); // Get the recorded audio as a Blob
    app.isRecording = false;
    app.logMessage("Recording stopped.");
    await processAudio(app, audioBlob); // Process the audio for transcription
  });
}

/**
 * Sends the recorded audio to the server for transcription.
 * @param {Object} app - The Alpine component instance.
 * @param {Blob} audioBlob - The recorded audio blob.
 */
export async function processAudio(app, audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  try {
    app.logMessage("Ping: /api/transcribe", true);
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: { huggingFaceKey: huggingFaceKey },
      body: formData,
    });
    if (!response.ok) {
      console.error("Failed to send file:", response.statusText);
      app.logMessage(`Server error: ${response.statusText}`);
      return;
    }
    const result = await response.json();
    app.textToAnalyze = result.transcription;
    app.logMessage(
      `Pong: ${app.textToAnalyze} (${result.fileSize}, ${result.fileType})`
    );
    analyzeTranscription(app);
  } catch (error) {
    app.logMessage(`Error connecting to the server: ${error.message}`);
  }
}

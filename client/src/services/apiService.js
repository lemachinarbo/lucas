/**
 * Fetches data from the "/api/hello" endpoint.
 * @param {Object} app - The Alpine component instance.
 */
export async function hello(app) {
  app.logMessage(`Ping: /api/hello`, true, true);
  try {
    const response = await fetch("/api/hello");
    const data = await response.json();
    const message = `${data["hello"] || "No data available"}`;
    app.logMessage(`Pong: ${message}`);
    app.echoMessage(message);
  } catch (error) {
    const message = `Error fetching data: ${error.message}`;
    app.logMessage(message);
  }
}

/**
 * Fetches text data from the new API endpoint.
 * @param {Object} app - The Alpine component instance.
 */
export async function fetchRandomText(app) {
  try {
    app.logMessage("Ping: /api/random-text", true);
    const response = await fetch("/api/random-text");
    const data = await response.json();
    app.textToAnalyze = data.text || "No text available";
    app.logMessage(`Pong: ${app.textToAnalyze}`);
  } catch (error) {
    const message = `Error fetching text: ${error.message}`;
    app.logMessage(message);
  }
}

/**
 * Fetches the system prompt from the API.
 * @param {Object} app - The Alpine component instance.
 */
export async function fetchPrompt(app) {
  try {
    app.logMessage("Ping: /api/prompt");
    const response = await fetch("/api/prompt");
    const data = await response.json();
    const serverPrompt = data.prompt || "No prompt available";

    // Store default server prompt
    localStorage.setItem("defaultPrompt", serverPrompt);

    // If no user prompt is set, initialize it with the server prompt
    if (!localStorage.getItem("userPrompt")) {
      localStorage.setItem("userPrompt", serverPrompt);
    }

    app.userPrompt = localStorage.getItem("userPrompt");
    app.logMessage(`Pong: ${app.userPrompt}`);
  } catch (error) {
    app.logMessage(`Error fetching prompt: ${error.message}`);
  }
}

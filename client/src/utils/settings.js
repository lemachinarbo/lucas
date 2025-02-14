/**
 * Restores the default prompt from local storage.
 *
 * This function retrieves the `defaultPrompt` stored in local storage
 * and sets it as the `userPrompt` in both the app state and local storage.
 *
 * @param {Object} app - The Alpine component instance.
 */
export function restoreDefaultPrompt(app) {
  app.userPrompt = localStorage.getItem("defaultPrompt");
  localStorage.setItem("userPrompt", app.userPrompt);
}

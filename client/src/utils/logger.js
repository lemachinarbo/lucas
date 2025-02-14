/**
 * Updates the message log with a new message.
 *
 * @param {Object} app - The Alpine component instance.
 * @param {string} message - The message to display.
 * @param {boolean} [replace=false] - If true, replaces the log instead of appending.
 */

export function echoMessage(app, message, replace = false) {
  if (replace) {
    app.messageLog = `${message}<br>`;
  } else {
    app.messageLog += `${message}<br>`;
  }
}

/**
 * Logs a message to the console if debugging is enabled.
 *
 * @param {Object} app - The Alpine component instance.
 * @param {string} message - The message to log.
 * @param {boolean} [echo=false] - Whether to also echo the message.
 */
export function logMessage(app, message, echo = false, replace = false) {
  if (app.debug) {
    console.log(message);
    if (echo) {
      echoMessage(app, message, replace);
    }
  }
}

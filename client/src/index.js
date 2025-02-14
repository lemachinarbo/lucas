// todo:
// 1. When an error such as 'no text available' is returned, it is being logged in the user's history.
// 2. Language selector
// 3. Add an option to export JSON history with a user token.
// 4. Add option to use OPEN AI token

import Alpine from "alpinejs";
import * as recorderService from "./recorder/recorderService.js";
import * as apiService from "./services/apiService.js";
import * as analysisService from "./services/analysisService.js";
import * as storageService from "./services/storageService.js";
import { logMessage, echoMessage } from "./utils/logger.js";
import { restoreDefaultPrompt } from "./utils/settings.js";

// Attach Alpine.js to the global window object
window.Alpine = Alpine;

// Initialize Alpine.js component when Alpine is ready
document.addEventListener("alpine:init", () => {
  Alpine.data("app", () => ({
    isRecording: false,
    messageLog: "",
    historyLog: "",
    textToAnalyze: "",
    recorder: null,

    openAIKey: localStorage.getItem("openAIKey") || "",
    huggingFaceKey: localStorage.getItem("huggingFaceKey") || "",
    userPrompt: localStorage.getItem("userPrompt") || "",
    debug: localStorage.getItem("debugMode") === "true",

    saveSettings() {
      localStorage.setItem("openAIKey", this.openAIKey);
      localStorage.setItem("huggingFaceKey", this.huggingFaceKey);
      localStorage.setItem("userPrompt", this.userPrompt);
      localStorage.setItem("debugMode", this.debug);

      // Force Alpine to reinitialize
      location.reload();
    },

    async init() {
      this.logMessage("Initializing app...");

      if (!this.userPrompt) {
        await this.fetchPrompt();
      }
    },

    async startStopRecording() {
      await recorderService.startStopRecording(this);
    },

    async hello() {
      await apiService.hello(this);
    },

    async fetchPrompt() {
      await apiService.fetchPrompt(this);
    },

    restorePrompt() {
      restoreDefaultPrompt(this);
    },

    async analyzeRandomText() {
      await analysisService.analyzeRandomText(this);
    },

    async loadLocalStorageEntries() {
      await storageService.loadLocalStorageEntries(this);
    },

    logMessage(message, echo, replace) {
      logMessage(this, message, echo, replace);
    },

    echoMessage(message, replace) {
      echoMessage(this, message, replace);
    },
  }));
});

// Start the Alpine.js framework
Alpine.start();

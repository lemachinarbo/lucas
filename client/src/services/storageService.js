import { formatGroupedEntries } from "./formatService.js";

export const handleLocalStorage = (app, action, key, value = null) => {
  switch (action) {
    case "save": {
      const existingData = JSON.parse(localStorage.getItem(key)) || [];
      const updatedData = Array.isArray(existingData)
        ? [...existingData, value]
        : [value];
      localStorage.setItem(key, JSON.stringify(updatedData));
      app.logMessage(`Saved to local storage: ${key}`);
      break;
    }
    case "get": {
      const data = localStorage.getItem(key);
      app.logMessage(`Retrieved from local storage: ${key}`);
      return data ? JSON.parse(data) : null;
    }
    case "clear": {
      localStorage.removeItem(key);
      app.logMessage(`Cleared local storage: ${key}`);
      break;
    }
    default:
      app.logMessage("Invalid action for local storage handler.");
  }
};

export const loadLocalStorageEntries = async (app) => {
  const storedData = getStoredData();

  if (!Array.isArray(storedData) || storedData.length === 0) {
    app.messageLog = "No transcription data found.";
    return;
  }

  const sortedData = sortEntriesByDate(storedData);
  const groupedByDate = groupEntriesByDate(sortedData);
  const formattedEntries = formatGroupedEntries(groupedByDate);

  app.historyLog = formattedEntries;
};

export const getStoredData = () => {
  const rawData = localStorage.getItem("transcriptionData");
  return rawData ? JSON.parse(rawData) : [];
};

export const sortEntriesByDate = (entries) => {
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const groupEntriesByDate = (entries) => {
  return entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});
};

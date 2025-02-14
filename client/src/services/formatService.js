import { sortEntriesByDate } from "./storageService.js";

export const formatGroupedEntries = async (groupedEntries) => {
  const template = await loadTemplate("./templates/group-entry.html");

  const formattedSections = await Promise.all(
    Object.entries(groupedEntries).map(async ([date, entries]) => {
      const sortedEntries = sortEntriesByDate(entries);
      const formattedEntries = await Promise.all(
        sortedEntries.map(formatEntry)
      );

      return template
        .replace("{{date}}", date)
        .replace("{{entries}}", formattedEntries.join(""));
    })
  );

  return formattedSections.join("");
};

const loadTemplate = async (path) => {
  const res = await fetch(path);
  return res.text();
};

const formatEntry = async (entry) => {
  let template = await loadTemplate("./templates/log-entry.html");
  const emotionTemplate = await loadTemplate("./templates/emotion.html");

  const time = new Date(entry.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const emotionsWithEmojis = entry.emotions
    .map((e) =>
      emotionTemplate
        .replace("{{emoji}}", getEmojiForEmotion(e.emotion))
        .replace("{{emotion}}", e.emotion)
        .replace(
          "{{score}}",
          e.score !== undefined ? e.score.toFixed(2) : "N/A"
        )
    )
    .join("");

  const sentimentText =
    entry.sentiment && typeof entry.sentiment === "object"
      ? entry.sentiment.sentiment
      : entry.sentiment || "N/A";

  let borderColor = "gray";
  if (sentimentText === "negative") borderColor = "red";
  else if (sentimentText === "positive") borderColor = "green";

  template = template
    .replace("{{time}}", time)
    .replace("{{transcription}}", entry.transcription)
    .replace(/--borderColor--/g, borderColor)
    .replace("{{sentimentText}}", sentimentText)
    .replace("{{emotions}}", emotionsWithEmojis);

  return template;
};

const getEmojiForEmotion = (emotion) => {
  const emotionToEmoji = {
    admiration: "😊",
    amusement: "😆",
    anger: "😠",
    annoyance: "😒",
    approval: "👍",
    caring: "❤️",
    confusion: "😕",
    curiosity: "🤔",
    desire: "😍",
    disappointment: "😞",
    disapproval: "👎",
    disgust: "🤢",
    embarrassment: "😳",
    excitement: "🎉",
    fear: "😨",
    gratitude: "🙏",
    grief: "😢",
    joy: "😀",
    love: "🥰",
    nervousness: "😬",
    optimism: "😌",
    pride: "🦁",
    realization: "💡",
    relief: "😌",
    remorse: "😔",
    sadness: "😢",
    surprise: "😮",
    neutral: "🫥",
  };
  return emotionToEmoji[emotion] || "❓";
};

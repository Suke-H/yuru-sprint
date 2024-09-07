const { detectStatuses } = require("./statusDetector");
const { weeklyReportMessage } = require("../messages/weeklyReportMessage");
const { sendWeeklyDataToNotion } = require("./sendToNotionDB");
const { emojiMapping } = require("../utils/emojiMapping");

async function generateWeeklyReport(slack, channelId) {
  try {
    console.log("Generating weekly report...");

    const { goalStatuses, period } = await detectStatuses(slack, channelId);
    console.log("Goal statuses:", JSON.stringify(goalStatuses, null, 2));
    console.log("Period:", period);

    if (goalStatuses.length === 0) {
      await slack.chat.postMessage({
        channel: channelId,
        text: "今週の目標が設定されていませんでした。来週は目標を設定しましょう！",
      });
      return;
    }

    const achievementRate = calculateAchievementRate(goalStatuses);

    const message = weeklyReportMessage(goalStatuses, achievementRate, period);

    await slack.chat.postMessage({
      channel: channelId,
      ...message,
    });

    console.log("Weekly report sent successfully");
  } catch (error) {
    console.error("Error generating weekly report:", error);
    throw error;
  }
}

function calculateAchievementRate(goalStatuses) {
  const completedGoals = goalStatuses.filter((goal) => goal.isCompleted);
  return Math.round((completedGoals.length / goalStatuses.length) * 100);
}

async function handleUserFeedback(payload, slack, channelId) {
  try {
    const feedback =
      payload.state.values.reflection_input.reflection_input.value;
    if (!feedback) {
      throw new Error("Feedback is empty");
    }

    const { goals, period } = JSON.parse(payload.actions[0].value);
    console.log("Parsed data:", { goals, period });

    const completedTasks = goals
      .filter((goal) => goal.isCompleted)
      .map((goal) => `${emojiMapping[goal.emoji].notion} ${goal.text}`);
    const incompleteTasks = goals
      .filter((goal) => !goal.isCompleted)
      .map((goal) => `${emojiMapping[goal.emoji].notion} ${goal.text}`);

    await sendWeeklyDataToNotion(
      completedTasks.join("\n") || "なし",
      incompleteTasks.join("\n") || "なし",
      feedback,
      period
    );

    console.log("Data sent to Notion successfully");

    await slack.chat.postMessage({
      channel: channelId,
      text: "Notionへ送信しました。1週間お疲れ様！",
    });
  } catch (error) {
    console.error("Error handling user feedback:", error);
    await slack.chat.postMessage({
      channel: channelId,
      text: `エラーが発生しました: ${error.message}`,
    });
    throw error;
  }
}

module.exports = {
  generateWeeklyReport,
  handleUserFeedback,
};

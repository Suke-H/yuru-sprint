const { detectStatuses } = require("./statusDetector");
const { weeklyReportMessage } = require("../messages/weeklyReportMessage");
const { sendWeeklyDataToNotion } = require("./sendToNotionDB");
const { emojiMapping } = require("../utils/emojiMapping");
const { USERS } = require("../config");

async function sendMessageToUser(slack, channelId, userId) {
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

    const message = weeklyReportMessage(userId, goalStatuses, achievementRate, period);

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

async function generateWeeklyReport(slack) {
  for (const user of USERS) {
    await sendMessageToUser(slack, user.CHANNEL_ID, user.USER_ID);
  }
}

function calculateAchievementRate(goalStatuses) {
  const completedGoals = goalStatuses.filter((goal) => goal.isCompleted);
  return Math.round((completedGoals.length / goalStatuses.length) * 100);
}

async function handleUserFeedback(payload, slack) {
  try {
    const feedback =
      payload.state.values.reflection_input.reflection_input.value;
    if (!feedback) {
      throw new Error("Feedback is empty");
    }

    const { goals, period } = JSON.parse(payload.actions[0].value);
    
    // static_selectの状態を取得して目標の達成状態を更新
    const updatedGoals = goals.map((goal, index) => ({
      ...goal,
      isCompleted: payload.state.values[`goal_status_${index}`][`goal_status_change_${index}`].selected_option.value === "completed",
      finalStatus: payload.state.values[`goal_status_${index}`][`goal_status_change_${index}`].selected_option.value === "completed" ? "達成" : "未達成"
    }));

    // チャンネルに対応するUSERを取得
    const mentionedUser = USERS.find(user => user.CHANNEL_ID === payload.channel.id);

    const completedTasks = updatedGoals
      .filter((goal) => goal.isCompleted)
      .map((goal) => `${emojiMapping[goal.emoji].notion} ${goal.text}`);
    const incompleteTasks = updatedGoals
      .filter((goal) => !goal.isCompleted)
      .map((goal) => `${emojiMapping[goal.emoji].notion} ${goal.text}`);

    await sendWeeklyDataToNotion(
      period,
      mentionedUser.USER_NAME,
      completedTasks.join("\n") || "なし",
      incompleteTasks.join("\n") || "なし",
      feedback
    );

    console.log("Data sent to Notion successfully");

    const updatedAchievementRate = Math.round(
      (completedTasks.length / updatedGoals.length) * 100
    );

    await slack.chat.postMessage({
      channel: payload.channel.id,
      text: `最終達成率: ${updatedAchievementRate}%\nNotionへ送信しました。1週間お疲れ様！`,
    });
  } catch (error) {
    console.error("Error handling user feedback:", error);
    await slack.chat.postMessage({
      channel: payload.channel.id,
      text: `エラーが発生しました: ${error.message}`,
    });
    throw error;
  }
}

module.exports = {
  generateWeeklyReport,
  handleUserFeedback,
};

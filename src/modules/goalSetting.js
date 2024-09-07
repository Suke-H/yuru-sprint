const {
  goalSettingMessage,
  updateGoalSettingMessage,
} = require("../messages/goalSettingMessage");
const { emojiMapping } = require("../utils/emojiMapping");

let currentGoals = [];

async function initiateGoalSetting(slack, channelId) {
  currentGoals = []; // 目標リストをリセット
  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      ...goalSettingMessage,
    });
    console.log("Goal setting message sent successfully");
    return result.ts; // メッセージのタイムスタンプを返す
  } catch (error) {
    console.error("Error sending goal setting message:", error);
  }
}

async function handleGoalSubmission(payload, slack, channelId) {
  const goalText = payload.state.values.goal_input.goal_value.value;
  const emoji =
    payload.state.values.emoji_input.emoji_value.selected_option.value;

  currentGoals.push({ text: goalText, emoji: emoji });

  const dynamicChannelId = payload.channel.id;

  console.log("Updating message with:", {
    channel: dynamicChannelId,
    ts: payload.message.ts,
    goals: currentGoals,
  });

  try {
    const result = await slack.chat.update({
      channel: dynamicChannelId,
      ts: payload.message.ts,
      ...updateGoalSettingMessage(currentGoals),
    });
    console.log("Update result:", result);
  } catch (error) {
    console.error("Error updating goal message:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
}

async function finalizeGoalSetting(payload, slack, channelId) {
  // ランダムに絵文字を選択
  const goalsWithRandomEmoji = currentGoals.map((goal) => ({
    text: goal.text,
    emoji: getRandomEmoji(),
  }));

  const goalListText = formatGoalList(goalsWithRandomEmoji);

  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      text: `今週の目標です：\n${goalListText}`,
    });

    // 各目標の絵文字でリアクションを追加
    for (const goal of goalsWithRandomEmoji) {
      await addReactionToMessage(slack, channelId, result.ts, goal.emoji);
    }

    // 以前の目標設定メッセージを削除
    await slack.chat.delete({
      channel: channelId,
      ts: payload.message.ts,
    });
    console.log("Final goal list sent successfully with reactions");
  } catch (error) {
    console.error("Error sending final goal list or adding reactions:", error);
  }
}

async function addReactionToMessage(slack, channelId, timestamp, emojiKey) {
  const reaction = emojiMapping[emojiKey].reaction;
  try {
    await slack.reactions.add({
      channel: channelId,
      timestamp: timestamp,
      name: reaction,
    });
    console.log(`Reaction ${reaction} added successfully`);
  } catch (error) {
    console.error("Error adding reaction:", error);
  }
}

function formatGoalList(goals) {
  return goals
    .map((goal, index) => `${index + 1}. ${goal.text} :${goal.emoji}:`)
    .join("\n");
}

function getRandomEmoji() {
  const emojiKeys = Object.keys(emojiMapping);
  const randomIndex = Math.floor(Math.random() * emojiKeys.length);
  return emojiKeys[randomIndex];
}

module.exports = {
  initiateGoalSetting,
  handleGoalSubmission,
  finalizeGoalSetting,
};

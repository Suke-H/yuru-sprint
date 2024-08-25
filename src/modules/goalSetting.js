const { goalSettingMessage, updateGoalSettingMessage } = require('../messages/goalSettingMessage');

let currentGoals = [];

async function initiateGoalSetting(slack, channelId) {
  currentGoals = []; // 目標リストをリセット
  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      ...goalSettingMessage
    });
    console.log('Goal setting message sent successfully');
    return result.ts; // メッセージのタイムスタンプを返す
  } catch (error) {
    console.error('Error sending goal setting message:', error);
  }
}

async function handleGoalSubmission(payload, slack, channelId) {
  const goalText = payload.state.values.goal_input.goal_value.value;
  const emojiValue = payload.state.values.emoji_input.emoji_value.selected_option.value;
  const emoji = getEmojiFromValue(emojiValue);

  currentGoals.push({ text: goalText, emoji: emoji });

  // payloadからチャンネルIDを動的に取得
  // const dynamicChannelId = payload.channel.id;
  const dynamicChannelId = channelId;
  // console.log('Dynamic channel ID:', dynamicChannelId); 

  console.log('Updating message with:', {
    channel: dynamicChannelId,
    ts: payload.message.ts,
    goals: currentGoals
  });

  try {
    const result = await slack.chat.update({
      channel: dynamicChannelId,
      ts: payload.message.ts,
      ...updateGoalSettingMessage(currentGoals)
    });
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error updating goal message:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

async function finalizeGoalSetting(payload, slack, channelId) {
  const goalListText = formatGoalList(currentGoals);
  try {
    await slack.chat.postMessage({
      channel: channelId,
      text: `今週の目標です：\n${goalListText}`
    });
    await slack.chat.delete({
      channel: channelId,
      ts: payload.message.ts
    });
    console.log('Final goal list sent successfully');
  } catch (error) {
    console.error('Error sending final goal list:', error);
  }
}

function formatGoalList(goals) {
  return goals.map((goal, index) => `${index + 1}. ${goal.emoji} ${goal.text}`).join('\n');
}

function getEmojiFromValue(value) {
  const emojiMap = {
    target: "🎯",
    muscle: "💪",
    trophy: "🏆",
    book: "📚",
    computer: "💻"
  };
  return emojiMap[value] || "🔹"; // デフォルト絵文字
}

module.exports = {
  initiateGoalSetting,
  handleGoalSubmission,
  finalizeGoalSetting
};
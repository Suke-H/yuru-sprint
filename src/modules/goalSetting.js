const _ = require('lodash');
const { emojiMapping } = require("../utils/emojiMapping");
const { goalListMessage, goalsFromBlocks, addGoalModal } = require("../messages/goalSettingMessage");
const { USERS } = require("../config");

const MAX_GOALS = 15;

async function sendMessageToUser(slack, channelId, userId) {
  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      ...goalListMessage(userId),
    });
    console.log(`Message sent successfully to channel: ${channelId}`);
    return result.ts;
  } catch (error) {
    console.error(`Error sending message to channel ${channelId}:`, error);
  }
}

async function initiateGoalSetting(slack) {
  for (const user of USERS) {
    await sendMessageToUser(slack, user.CHANNEL_ID, user.USER_ID);
  }
}

// 「＋ 目標を追加」ボタン -> ポップアップを開く
// ボタンが押された時点のメッセージ（payload.message）から、今のリストを読み取ってポップアップに持たせる
async function openAddGoalModal(payload, slack) {
  const { userId, goals, reactedEmojis } = readGoalMessage(payload.message);
  await slack.views.open({
    trigger_id: payload.trigger_id,
    view: addGoalModal(payload.channel.id, payload.message.ts, userId, goals, reactedEmojis),
  });
}

// ポップアップの「追加」 -> リストに追加し、絵文字のスタンプを付ける
// 戻り値: ポップアップを閉じずにエラーを出すときは Slack へ返すレスポンス、閉じてよいときは null
async function handleAddGoalSubmission(payload, slack) {
  const { channelId, messageTs, userId, goals, reactedEmojis } = JSON.parse(payload.view.private_metadata);
  const goalText = payload.view.state.values.goal_input.goal_value.value.trim();

  if (goals.length >= MAX_GOALS) {
    return {
      response_action: "errors",
      errors: { goal_input: `目標の数が上限（${MAX_GOALS}個）に達しています。` },
    };
  }

  // 使っていない絵文字からランダムに選ぶ
  // 削除した目標に自分で押したスタンプは残るので、スタンプが付いている絵文字も避ける
  const usedEmojis = [...goals.map((goal) => goal.emoji), ...reactedEmojis];
  const emoji = _.sample(Object.keys(emojiMapping).filter((key) => !usedEmojis.includes(key)));
  goals.push({ text: goalText, emoji });

  await slack.chat.update({
    channel: channelId,
    ts: messageTs,
    ...goalListMessage(userId, goals),
  });

  try {
    await slack.reactions.add({
      channel: channelId,
      timestamp: messageTs,
      name: emojiMapping[emoji].reaction,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
  }

  console.log(`Goal added: ${goalText} :${emoji}:`);
  return null;
}

// 「目標を削除」メニューで目標を選択 -> リストから消し、Bot のスタンプを外す
async function deleteGoal(payload, slack) {
  const channelId = payload.channel.id;
  const messageTs = payload.message.ts;
  // 以前の形式（目標ごとの削除ボタン）は action.value に入っている
  const action = payload.actions[0];
  const { emoji } = JSON.parse(action.selected_option ? action.selected_option.value : action.value);

  const { userId, goals } = readGoalMessage(payload.message);
  const remainingGoals = goals.filter((goal) => goal.emoji !== emoji);

  await slack.chat.update({
    channel: channelId,
    ts: messageTs,
    ...goalListMessage(userId, remainingGoals),
  });

  try {
    await slack.reactions.remove({
      channel: channelId,
      timestamp: messageTs,
      name: emojiMapping[emoji].reaction,
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
  }

  console.log(`Goal deleted: :${emoji}:`);
}

// 目標リストのメッセージから、宛先ユーザー・現在の目標・付いているスタンプを読み取る
function readGoalMessage(message) {
  const userId = message.blocks[0].text.text.match(/<@([^>]+)>/)[1];
  const goals = goalsFromBlocks(message.blocks);
  const reactedEmojis = (message.reactions || []).map((reaction) => reaction.name);
  return { userId, goals, reactedEmojis };
}

module.exports = {
  initiateGoalSetting,
  openAddGoalModal,
  handleAddGoalSubmission,
  deleteGoal,
};

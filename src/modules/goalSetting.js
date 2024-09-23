const _ = require('lodash');
const { emojiMapping } = require("../utils/emojiMapping");
const { goalSettingMessage, updateGoalSettingMessage } = require("../messages/goalSettingMessage");
const { USERS } = require("../config");

const MAX_GOALS = 15;

function getRandomEmojis(count) {
  const allEmojis = Object.keys(emojiMapping);
  return _.shuffle(allEmojis).slice(0, count);
}

async function sendMessageToUser(slack, channelId) { 
  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      ...goalSettingMessage,
    });
    console.log(`Message sent successfully to channel: ${channelId}`);
    return result.ts;
  } catch (error) {
    console.error(`Error sending message to channel ${channelId}:`, error);
  }
}

async function initiateGoalSetting(slack) {
  for (const user of USERS) {
    await sendMessageToUser(slack, user.CHANNEL_ID);
  }
}

async function handleGoalSubmission(payload, slack) {
  const currentGoals = await getCurrentGoals(slack, payload.channel.id, payload.message.ts);

  if (currentGoals.length >= MAX_GOALS) {
    try {
      await slack.chat.postEphemeral({
        channel: payload.channel.id,
        user: payload.user.id,
        text: `目標の数が上限（${MAX_GOALS}個）に達しています。これ以上追加できません。`,
      });
    } catch (error) {
      console.error("Error sending ephemeral message:", error);
    }
    return;
  }

  const goalText = payload.state.values.goal_input.goal_value.value;

  currentGoals.push({ text: goalText });

  try {
    const result = await slack.chat.update({
      channel: payload.channel.id,
      ts: payload.message.ts,
      ...updateGoalSettingMessage(currentGoals),
    });
    console.log("Update result:", result);
  } catch (error) {
    console.error("Error updating goal message:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
}

async function deleteGoal(payload, slack, index) {
  const currentGoals = await getCurrentGoals(slack, payload.channel.id, payload.message.ts);

  currentGoals.splice(index, 1);

  try {
    const result = await slack.chat.update({
      channel: payload.channel.id,
      ts: payload.message.ts,
      ...updateGoalSettingMessage(currentGoals),
    });
    console.log("Goal deleted successfully");
  } catch (error) {
    console.error("Error deleting goal:", error);
  }
}

async function finalizeGoalSetting(payload, slack) {
  const currentGoals = await getCurrentGoals(slack, payload.channel.id, payload.message.ts);
  const randomEmojis = getRandomEmojis(currentGoals.length);
  const goalsWithRandomEmoji = currentGoals.map((goal, index) => ({
    text: goal.text,
    emoji: randomEmojis[index],
  }));

  const goalListText = formatGoalList(goalsWithRandomEmoji);

  try {
    const result = await slack.chat.postMessage({
      channel: payload.channel.id,
      text: `今週の目標です：\n${goalListText}`,
    });

    for (const goal of goalsWithRandomEmoji) {
      await addReactionToMessage(slack, payload.channel.id, result.ts, goal.emoji);
    }

    await slack.chat.delete({
      channel: payload.channel.id,
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

async function getCurrentGoals(slack, channelId, messageTs) {
  try {
    const result = await slack.conversations.history({
      channel: channelId,
      latest: messageTs,
      inclusive: true,
      limit: 1
    });

    if (result.messages && result.messages.length > 0) {
      const message = result.messages[0];
      const goalListBlock = message.blocks.find(block => 
        block.type === "context" && block.elements[0].type === "mrkdwn"
      );

      if (goalListBlock) {
        return goalListBlock.elements.map(element => {
          const match = element.text.match(/\d+\.\s(.+)/);
          return match ? { text: match[1] } : null;
        }).filter(Boolean);
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching current goals:", error);
    return [];
  }
}

module.exports = {
  initiateGoalSetting,
  handleGoalSubmission,
  finalizeGoalSetting,
  deleteGoal,
};
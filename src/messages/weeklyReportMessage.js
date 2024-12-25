const { emojiMapping } = require("../utils/emojiMapping");

function weeklyReportMessage(userId, goals, period) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${userId}>\n*今週の目標の振り返り (${period})*`,
        },
      },
      ...goals.map((goal, index) => ({
        type: "section",
        block_id: `goal_status_${index}`,
        text: {
          type: "mrkdwn",
          text: `${index + 1}. ${emojiMapping[goal.emoji].notion} ${goal.text} ${goal.isCompleted ? "✅" : "⬜"}`,
        },
        accessory: {
          type: "static_select",
          action_id: `goal_status_change_${index}`,
          initial_option: {
            text: {
              type: "plain_text",
              text: goal.isCompleted ? "達成" : "未達成",
              emoji: true,
            },
            value: goal.isCompleted ? "completed" : "incomplete",
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "達成",
                emoji: true,
              },
              value: "completed",
            },
            {
              text: {
                type: "plain_text",
                text: "未達成",
                emoji: true,
              },
              value: "incomplete",
            },
          ],
        },
      })),
      {
        type: "input",
        block_id: "reflection_input",
        element: {
          type: "plain_text_input",
          action_id: "reflection_input",
          multiline: true,
        },
        label: {
          type: "plain_text",
          text: "今週の感想",
          emoji: true,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "送信",
              emoji: true,
            },
            value: JSON.stringify({ goals, period }),
            action_id: "submit_reflection",
          },
        ],
      },
    ],
  };
}

module.exports = {
  weeklyReportMessage,
};
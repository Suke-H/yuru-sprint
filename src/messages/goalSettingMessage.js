require('dotenv').config();

const MAX_GOALS = 15;

function createGoalSettingMessage(userId) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${userId}>\n今週の目標を入力してください：`
        }
      },
      {
        type: "input",
        block_id: "goal_input",
        element: {
          type: "plain_text_input",
          action_id: "goal_value",
          placeholder: {
            type: "plain_text",
            text: "目標を入力してください"
          }
        },
        label: {
          type: "plain_text",
          text: "目標"
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "追加"
            },
            style: "primary",
            action_id: "add_goal"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*今週の目標リスト：*"
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "目標はまだ追加されていません。"
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "目標設定完了"
            },
            style: "danger",
            action_id: "finalize_goals"
          }
        ]
      }
    ]
  };
}

function updateGoalSettingMessage(goals) {
  const updatedBlocks = [...createGoalSettingMessage().blocks];

  const goalListIndex = updatedBlocks.findIndex(block =>
    block.type === "section" && block.text.text === "*今週の目標リスト：*"
  );

  if (goals.length > 0) {
    updatedBlocks[goalListIndex + 1] = {
      type: "context",
      elements: goals.map((goal, index) => ({
        type: "mrkdwn",
        text: `${index + 1}. ${goal.text}`
      }))
    };

    // Add delete buttons for each goal with unique action_ids
    updatedBlocks.splice(goalListIndex + 2, 0, {
      type: "actions",
      elements: goals.map((goal, index) => ({
        type: "button",
        text: {
          type: "plain_text",
          text: "削除"
        },
        style: "danger",
        action_id: `delete_goal_${index}`,
        value: index.toString()
      }))
    });
  }

  if (goals.length >= MAX_GOALS) {
    updatedBlocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:warning: 目標の数が上限（${MAX_GOALS}個）に達しています。これ以上追加できません。`
      }
    });
  }

  return { blocks: updatedBlocks };
}

module.exports = {
  createGoalSettingMessage,
  updateGoalSettingMessage
};
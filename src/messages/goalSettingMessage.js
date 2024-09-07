require('dotenv').config();

const MAX_GOALS = 15; // 最大目標数を定数として定義

const goalSettingMessage = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${process.env.SLACK_USER_ID}>\n今週の目標を入力してください：`
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
        type: "input",
        block_id: "emoji_input",
        element: {
          type: "static_select",
          action_id: "emoji_value",
          placeholder: {
            type: "plain_text",
            text: "絵文字を選択してください"
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "🎯 Target"
              },
              value: "dart"
            },
            {
              text: {
                type: "plain_text",
                text: "💪 Muscle"
              },
              value: "muscle"
            },
            {
              text: {
                type: "plain_text",
                text: "🏆 Trophy"
              },
              value: "trophy"
            },
            {
              text: {
                type: "plain_text",
                text: "📚 Book"
              },
              value: "book"
            },
            {
              text: {
                type: "plain_text",
                text: "💻 Computer"
              },
              value: "computer"
            }
          ]
        },
        label: {
          type: "plain_text",
          text: "絵文字"
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
  
  function updateGoalSettingMessage(goals) {
    const updatedBlocks = [...goalSettingMessage.blocks];
  
    // 目標リストの更新
    const goalListIndex = updatedBlocks.findIndex(block =>
      block.type === "section" && block.text.text === "*今週の目標リスト：*"
    );
  
    // 目標がある場合はリストを更新
    if (goals.length > 0) {
      updatedBlocks[goalListIndex + 1] = {
        type: "context",
        elements: goals.map(goal => ({
          type: "mrkdwn",
          text: `:${goal.emoji}: ${goal.text}`
        }))
      };
    }
  
    // 目標数が上限に達した場合のメッセージを追加
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
    goalSettingMessage,
    updateGoalSettingMessage
  };
  
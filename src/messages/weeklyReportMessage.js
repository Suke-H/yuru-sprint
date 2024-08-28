function weeklyReportMessage(formattedGoals, achievementRate) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*今週の目標の振り返り*"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: formattedGoals
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `全体の達成率: ${achievementRate}%`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "今週の振り返りをしましょう！\n今週の目標達成状況を確認し、感想を入力してください。"
        }
      },
      {
        type: "input",
        block_id: "reflection_input",
        element: {
          type: "plain_text_input",
          action_id: "reflection_input",
          multiline: true
        },
        label: {
          type: "plain_text",
          text: "今週の感想",
          emoji: true
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "送信",
              emoji: true
            },
            action_id: "submit_reflection"
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: JSON.stringify({ formattedGoals, achievementRate })
          }
        ]
      }
    ]
  };
}

module.exports = {
  weeklyReportMessage
};
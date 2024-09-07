function weeklyReportMessage(goals, achievementRate, period) {
  const formattedGoals = goals.map((goal, index) => 
    `${index + 1}. :${goal.emoji}: ${goal.text} ${goal.isCompleted ? "✅" : "⬜"}`
  ).join('\n');

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*今週の目標の振り返り (${period})*`
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
            value: JSON.stringify({ goals, period }),
            action_id: "submit_reflection"
          }
        ]
      }
    ]
  };
}

module.exports = {
  weeklyReportMessage
};

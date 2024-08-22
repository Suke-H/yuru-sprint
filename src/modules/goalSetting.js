async function initiateGoalSetting(slack, channelId) {
    try {
      await slack.chat.postMessage({
        channel: channelId,
        text: "今週の目標を設定しましょう！",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*今週の目標設定*\n目標を追加し、完了したら設定を終了してください。"
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "目標を追加",
                  emoji: true
                },
                action_id: "add_goal"
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "設定完了",
                  emoji: true
                },
                action_id: "complete_goals"
              }
            ]
          }
        ]
      });
      console.log('Goal setting message sent successfully');
    } catch (error) {
      console.error('Error sending goal setting message:', error);
    }
  }
  
  module.exports = {
    initiateGoalSetting
  };
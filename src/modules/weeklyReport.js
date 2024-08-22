async function generateWeeklyReport(slack, channelId) {
    try {
      await slack.chat.postMessage({
        channel: channelId,
        text: "今週の振り返りをしましょう！",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*今週の振り返り*\n今週の目標達成状況を確認し、感想を入力してください。"
            }
          },
          {
            type: "input",
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
          }
        ]
      });
      console.log('Weekly report message sent successfully');
    } catch (error) {
      console.error('Error sending weekly report message:', error);
    }
  }
  
  module.exports = {
    generateWeeklyReport
  };
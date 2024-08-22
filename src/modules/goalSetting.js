const { goalSettingMessage } = require('../messages/goalSettingMessage');

async function initiateGoalSetting(slack, channelId) {
    try {
      await slack.chat.postMessage({
        channel: channelId,
        ...goalSettingMessage
      });
      console.log('Goal setting message sent successfully');
    } catch (error) {
      console.error('Error sending goal setting message:', error);
    }
  }
  
  module.exports = {
    initiateGoalSetting
  };
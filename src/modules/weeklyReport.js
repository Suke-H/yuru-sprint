const { weeklyReportMessage } = require('../messages/weeklyReportMessage');

async function generateWeeklyReport(slack, channelId) {
    try {
      await slack.chat.postMessage({
        channel: channelId,
        ...weeklyReportMessage
      });
      console.log('Weekly report message sent successfully');
    } catch (error) {
      console.error('Error sending weekly report message:', error);
    }
  }
  
  module.exports = {
    generateWeeklyReport
  };
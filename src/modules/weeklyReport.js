const { weeklyReportMessage } = require('../messages/weeklyReportMessage');
const { detectStatuses } = require('./statusDetector');

async function generateWeeklyReport(slack, channelId) {
    // try {
    //   await slack.chat.postMessage({
    //     channel: channelId,
    //     ...weeklyReportMessage
    //   });
    //   console.log('Weekly report message sent successfully');
    // } catch (error) {
    //   console.error('Error sending weekly report message:', error);
    // }

    try {
      console.log('Generating weekly report...');
      
      const goalStatuses = await detectStatuses(slack, channelId);
      
      if (goalStatuses.length === 0) {
        console.log('No goals found for the week');
        return;
      }
  
      console.log('Weekly Goal Statuses:');
      goalStatuses.forEach((goal, index) => {
        console.log(`${index + 1}. ${goal.text} (${goal.emoji}): ${goal.isCompleted ? 'Completed' : 'Not Completed'}`);
      });
  
      const completedGoals = goalStatuses.filter(goal => goal.isCompleted);
      const achievementRate = Math.round((completedGoals.length / goalStatuses.length) * 100);
      
      console.log(`\nTotal goals: ${goalStatuses.length}`);
      console.log(`Completed goals: ${completedGoals.length}`);
      console.log(`Achievement rate: ${achievementRate}%`);
  
      console.log('Weekly report generation completed');
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }


  }
  
  module.exports = {
    generateWeeklyReport
  };
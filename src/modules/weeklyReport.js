const { detectStatuses } = require('./statusDetector');

async function generateWeeklyReport(slack, channelId) {
  try {
    console.log('Generating weekly report...');
    
    const goalStatuses = await detectStatuses(slack, channelId);
    
    if (goalStatuses.length === 0) {
      await slack.chat.postMessage({
        channel: channelId,
        text: "今週の目標が設定されていませんでした。来週は目標を設定しましょう！"
      });
      return;
    }

    const reportMessage = formatWeeklyReport(goalStatuses);

    await slack.chat.postMessage({
      channel: channelId,
      text: reportMessage
    });

    console.log('Weekly report sent successfully');
  } catch (error) {
    console.error('Error generating weekly report:', error);
  }
}

function formatWeeklyReport(goalStatuses) {
  let report = "*今週の目標の振り返り*\n\n";

  goalStatuses.forEach((goal, index) => {
    const statusEmoji = goal.isCompleted ? "✅" : "⬜";
    report += `${index + 1}. :${goal.emoji}: ${goal.text} ${statusEmoji}\n`;
  });

  const completedGoals = goalStatuses.filter(goal => goal.isCompleted);
  const achievementRate = Math.round((completedGoals.length / goalStatuses.length) * 100);

  report += `\n全体の達成率: ${achievementRate}%\n`;
  
  return report;
}

module.exports = {
  generateWeeklyReport
};
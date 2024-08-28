const { detectStatuses } = require('./statusDetector');
const { weeklyReportMessage } = require('../messages/weeklyReportMessage');
const { sendWeeklyDataToNotion } = require('./sendToNotionDB');

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

    const formattedGoals = formatGoalStatuses(goalStatuses);
    const achievementRate = calculateAchievementRate(goalStatuses);

    const message = weeklyReportMessage(formattedGoals, achievementRate);

    await slack.chat.postMessage({
      channel: channelId,
      ...message
    });

    console.log('Weekly report sent successfully');
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

function formatGoalStatuses(goalStatuses) {
  return goalStatuses.map((goal, index) => {
    const statusEmoji = goal.isCompleted ? "✅" : "⬜";
    return `${index + 1}. :${goal.emoji}: ${goal.text} ${statusEmoji}`;
  }).join('\n');
}

function calculateAchievementRate(goalStatuses) {
  const completedGoals = goalStatuses.filter(goal => goal.isCompleted);
  return Math.round((completedGoals.length / goalStatuses.length) * 100);
}

async function handleUserFeedback(feedback, hiddenGoalsData, slack, channelId) {
  try {
    if (!feedback) {
      throw new Error('Feedback is empty');
    }

    const { formattedGoals, achievementRate } = hiddenGoalsData;
    
    // 完了タスクと未完了タスクを分離
    const completedTasks = [];
    const incompleteTasks = [];
    formattedGoals.split('\n').forEach(goal => {
      if (goal.includes('✅')) {
        completedTasks.push(goal.replace('✅', '').trim());
      } else {
        incompleteTasks.push(goal.replace('⬜', '').trim());
      }
    });

    await sendWeeklyDataToNotion(
      completedTasks.join('\n') || 'なし',
      incompleteTasks.join('\n') || 'なし',
      achievementRate,
      feedback
    );
    console.log('Data sent to Notion successfully');

    // フィードバックを受け取ったことを確認するメッセージをチャンネルに送信
    await slack.chat.postMessage({
      channel: channelId,
      text: "Notionへ送信しました。1週間お疲れ様！"
    });
  } catch (error) {
    console.error('Error handling user feedback:', error);
    await slack.chat.postMessage({
      channel: channelId,
      text: `エラーが発生しました: ${error.message}`
    });
    throw error;
  }
}

module.exports = {
  generateWeeklyReport,
  handleUserFeedback
};
const { Client } = require('@notionhq/client');
const config = require('../config');

const notion = new Client({ auth: config.NOTION_INTEGRATION_TOKEN });

async function sendWeeklyDataToNotion(completedTasks, incompleteTasks, achievementRate, feedback) {
  try {
    const today = new Date();
    // const period = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const period = "8/19-8/25";

    const response = await notion.pages.create({
      parent: { database_id: config.NOTION_DATABASE_ID },
      properties: {
        '期間': {
          title: [{ text: { content: period } }]
        },
        '完了タスク': {
          rich_text: [{ text: { content: completedTasks } }]
        },
        '未完了タスク': {
          rich_text: [{ text: { content: incompleteTasks } }]
        },
        // '達成率': {
        //   number: achievementRate
        // },
        '感想': {
          rich_text: [{ text: { content: feedback } }]
        },
      },
    });

    console.log('データがNotionに追加されました:', response);
    return response;
  } catch (error) {
    console.error('Notionへのデータ追加エラー:', error);
    throw error;
  }
}

module.exports = {
  sendWeeklyDataToNotion
};

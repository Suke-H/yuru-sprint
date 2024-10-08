const { Client } = require('@notionhq/client');
const config = require('../config');

// CI/CD時の問題: database_idに空白と""が含まれるためトリムする
const cleanDatabaseId = config.NOTION_DATABASE_ID.trim().replace(/"/g, '');

const notion = new Client({ auth: config.NOTION_INTEGRATION_TOKEN });

async function sendWeeklyDataToNotion(period, userName, completedTasks, incompleteTasks, feedback) {
  try {

    console.log('Preparing data for Notion API');
    const notionData = {
      parent: { database_id: cleanDatabaseId },
      properties: {
        '期間': {
          title: [{ text: { content: period } }]
        },
        'ゆるゆる走者': {
          rich_text: [{ text: { content: userName } }]
        },
        '完了タスク': {
          rich_text: [{ text: { content: completedTasks } }]
        },
        '未完了タスク': {
          rich_text: [{ text: { content: incompleteTasks } }]
        },
        '感想': {
          rich_text: [{ text: { content: feedback } }]
        },
      },
    };

    console.log('Sending request to Notion API');
    console.log('Request data:', JSON.stringify(notionData, null, 2));

    const response = await notion.pages.create(notionData);

    console.log('Data successfully added to Notion');
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error adding data to Notion:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

module.exports = {
  sendWeeklyDataToNotion
};

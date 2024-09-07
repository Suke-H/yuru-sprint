const { Client } = require('@notionhq/client');
const config = require('../config');

// データベースIDのクリーニング：トリムと引用符の除去
const cleanDatabaseId = config.NOTION_DATABASE_ID.trim().replace(/"/g, '');

const notion = new Client({ auth: config.NOTION_INTEGRATION_TOKEN });

async function sendWeeklyDataToNotion(completedTasks, incompleteTasks, achievementRate, feedback) {
  console.log('Starting sendWeeklyDataToNotion function');
  console.log('Config:', {
    NOTION_INTEGRATION_TOKEN: config.NOTION_INTEGRATION_TOKEN ? 'Set (not shown for security)' : 'Not set',
    NOTION_DATABASE_ID: cleanDatabaseId
  });

  try {
    const today = new Date();
    const period = "8/19-8/25";

    console.log('Preparing data for Notion API');
    const notionData = {
      parent: { database_id: cleanDatabaseId },
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

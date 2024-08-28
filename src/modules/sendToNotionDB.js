const { Client } = require('@notionhq/client');

require('dotenv').config();
const config = require('../config');

// Notion APIクライアントの作成
console.log(config);
console.log(config.NOTION_DATABASE_ID);
console.log(config.NOTION_INTEGRATION_TOKEN);
const notion = new Client({ auth: config.NOTION_INTEGRATION_TOKEN });

// データベースにデータを書き込む関数
async function addDataToNotion(period, completedTasks, incompleteTasks, feedback) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: config.NOTION_DATABASE_ID },
      properties: {
        '期間': {
          title: [
            {
              text: {
                content: period,
              },
            },
          ],
        },
        '完了タスク': {
          rich_text: [
            {
              text: {
                content: completedTasks,
              },
            },
          ],
        },
        '未完了タスク': {
          rich_text: [
            {
              text: {
                content: incompleteTasks,
              },
            },
          ],
        },
        '感想': {
          rich_text: [
            {
              text: {
                content: feedback,
              },
            },
          ],
        },
      },
    });

    console.log('データがNotionに追加されました:', response);
  } catch (error) {
    console.error('Notionへのデータ追加エラー:', error);
  }
}

// データを送信する関数
function sendWeeklyDataToNotion() {
  // 期間を設定
  const period = '8/26~9/1';  // ここで期間を指定（動的に生成する場合はDate関数などを使用）

  // 完了タスクを指定
  const completedTasks = `🦷歯を磨く\n📚本を読む`;  // 複数行を\nで区切る

  // 未完了タスクを指定
  const incompleteTasks = `🏃‍♂️ランニング\n💻コーディング`;  // 複数行を\nで区切る

  // 感想を指定
  const feedback = '今週はよく頑張ったが、もう少し時間管理が必要。';

  // Notionにデータを追加
  addDataToNotion(period, completedTasks, incompleteTasks, feedback);
}

// 関数を実行してデータを送信
sendWeeklyDataToNotion();

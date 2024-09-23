require('dotenv').config();
const env = process.env.NODE_ENV || 'production';

// カンマ区切りの環境変数を配列として取得
const USER_IDS = process.env.USER_IDS ? process.env.USER_IDS.split(',') : [];
const USER_NAMES = process.env.USER_NAMES ? process.env.USER_NAMES.split(',') : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const WEBHOOK_URLS = process.env.WEBHOOK_URLS ? process.env.WEBHOOK_URLS.split(',') : [];

// 要素数の確認: 要素数が一致しない場合はエラーをスロー
if (USER_IDS.length !== USER_NAMES.length || USER_IDS.length !== CHANNEL_IDS.length || USER_IDS.length !== WEBHOOK_URLS.length) {
  throw new Error('USER_IDS, USER_NAMES, CHANNEL_IDS, and WEBHOOK_URLS must have the same number of elements');
}

// indexだけを使ってループを回すためにforループを使用
const USERS = [];
for (let i = 0; i < USER_IDS.length; i++) {
  USERS.push({
    USER_ID: USER_IDS[i],
    USER_NAME: USER_NAMES[i],
    CHANNEL_ID: CHANNEL_IDS[i],
    WEBHOOK_URL: WEBHOOK_URLS[i],
  });
}

const config = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN, 
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  NOTION_INTEGRATION_TOKEN: process.env.NOTION_INTEGRATION_TOKEN,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  USERS,

  development: {
    GOAL_SETTING_CRON: '*/1 * * * *',   // 1分に1回
    WEEKLY_REPORT_CRON: '*/1 * * * *'  // 1分に1回
  },

  production: {
    GOAL_SETTING_CRON: '0 9 * * 0',  // 毎週日曜日の午前9時
    WEEKLY_REPORT_CRON: '0 17 * * 5' // 毎週金曜日の午後5時
  },
};

if (!config.SLACK_BOT_TOKEN) {
  console.error('SLACK_BOT_TOKEN is not set. Please set it in your environment variables.');
  process.exit(1);
}

module.exports = {
  ...config,
  ...config[env]
};

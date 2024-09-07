require('dotenv').config();
const env = process.env.NODE_ENV || 'production';

const config = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN, 
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  NOTION_INTEGRATION_TOKEN: process.env.NOTION_INTEGRATION_TOKEN,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,

  development: {
    GOAL_SETTING_CRON: '*/10 * * * *',   // 10分に1回
    WEEKLY_REPORT_CRON: '*/10 * * * *'  // 10分に1回
  },

  production: {
    // GOAL_SETTING_CRON: '0 9 * * 0',  // 毎週日曜日の午前9時
    // WEEKLY_REPORT_CRON: '0 17 * * 5' // 毎週金曜日の午後5時
    // GOAL_SETTING_CRON: '0 9 * * *',   // 毎日午前9時
    // WEEKLY_REPORT_CRON: '0 17 * * *'  // 毎日午後5時
    GOAL_SETTING_CRON: '*/10 * * * *',   // 10分に1回
    WEEKLY_REPORT_CRON: '*/10 * * * *'  // 10分に1回
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

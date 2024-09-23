require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { WebClient } = require('@slack/web-api');
const config = require('./config');
const goalSetting = require('./modules/goalSetting');
const weeklyReport = require('./modules/weeklyReport');
const { Scheduler } = require('./utils/dateHelper');

function createApp(testMode = false) {
  const app = express();
  const slack = new WebClient(config.SLACK_BOT_TOKEN);
  const scheduler = new Scheduler(testMode);

  app.use(express.json());                          // events API
  app.use(express.urlencoded({ extended: true }));  // interactive API

  // Events API
  // 現在はテスト用
  app.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
      res.status(200).send(req.body.challenge);
    } else if (req.body.event && req.body.event.type === 'app_mention') {
      console.log('App was mentioned!');
  
      const mentionedChannelId = req.body.event.channel;
      
      // メンションされたチャンネルに対応するユーザーを見つける
      const mentionedUser = config.USERS.find(user => user.CHANNEL_ID === mentionedChannelId);
  
      if (mentionedUser) {
        // 見つかったユーザーのWebhook URLにメッセージを送信
        axios.post(mentionedUser.WEBHOOK_URL, { text: "Gotta get the bread and milk!" }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log(`Message posted successfully to ${mentionedUser.USER_NAME}:`, response.data);
        })
        .catch(error => {
          console.error(`Error posting message to ${mentionedUser.USER_NAME}:`, error);
        });
      } else {
        console.log(`No user found for channel ID: ${mentionedChannelId}`);
      }
  
      res.status(200).send('Event received');
    } else {
      res.status(200).send('OK');
    }
  });

  // Interactive API
  // - add_goal: 目標追加
  // - finalize_goals: 目標リスト確定
  // - submit_reflection: 週間レポートのフィードバック
  app.post('/slack/interactive', async (req, res) => {
    console.log('Received interactive payload:', req.body);
    let payload;
    
    try {
      payload = JSON.parse(req.body.payload);
      console.log('Parsed payload:', payload);
    } catch (error) {
      console.error('Error parsing payload:', error);
      return res.status(400).send('Invalid payload');
    }
    
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      console.log('Action:', action);
      try {
        // 週初めに送信した目標設定メッセージにて、目標追加ボタン -> 目標リストに追加して更新
        if (action.action_id === 'add_goal') {
          await goalSetting.handleGoalSubmission(payload, slack);

        // 目標リストを確定させる
        } else if (action.action_id === 'finalize_goals') {
          await goalSetting.finalizeGoalSetting(payload, slack);

        // 目標リストから1つ目標削除
        } else if (action.action_id.startsWith('delete_goal_')) {
          const index = parseInt(action.action_id.split('_')[2]);
          await goalSetting.deleteGoal(payload, slack, index);

        // 週終わりに送信した週間レポートのフィードバックを受け取る -> Notionに送信
        } else if (action.action_id === 'submit_reflection') {
          const userFeedback = payload.state.values.reflection_input.reflection_input.value;
          
          if (!userFeedback) {
            throw new Error('User feedback is empty');
          }
          
          await weeklyReport.handleUserFeedback(payload, slack, payload.channel.id);
        }
      } catch (error) {
        console.error('Error handling action:', error);
      }

    }

    res.status(200).send('');
  });

// Cloud Schedulerからのトリガーを受け付ける
app.post('/trigger/goal-setting', async (req, res) => {
  try {
    console.log('Initiating goal setting...');
    await goalSetting.initiateGoalSetting(slack);
    res.status(200).send('Goal setting initiated');
  } catch (error) {
    console.error('Error initiating goal setting:', error);
    res.status(500).send('Error initiating goal setting');
  }
});

app.post('/trigger/weekly-report', async (req, res) => {
  try {
    console.log('Generating weekly report...');
    await weeklyReport.generateWeeklyReport(slack);
    res.status(200).send('Weekly report generated');
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).send('Error generating weekly report');
  }
});

// 開発環境の場合、ローカルでスケジューリングを設定
if (process.env.NODE_ENV === 'development') {
  console.log('Setting up local scheduling...');
  
  const scheduleGoalSetting = scheduler.scheduleJob(
    config.GOAL_SETTING_CRON,
    () => {
      console.log('Initiating goal setting...');
      goalSetting.initiateGoalSetting(slack);
    }
  );
  
  // const scheduleWeeklyReport = scheduler.scheduleJob(
  //   config.WEEKLY_REPORT_CRON,
  //   () => {
  //     console.log('Generating weekly report...');
  //     weeklyReport.generateWeeklyReport(slack);
  //   }
  // );
}

return { app, scheduler };
}

if (require.main === module) {
  const { app } = createApp();
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Goal Setting Schedule: ${config.GOAL_SETTING_CRON}`);
    console.log(`Weekly Report Schedule: ${config.WEEKLY_REPORT_CRON}`);
  });
}

module.exports = { createApp };

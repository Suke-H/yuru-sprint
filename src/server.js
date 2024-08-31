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

  // 2つのパーサーを利用
  app.use(express.json());                          // events API
  app.use(express.urlencoded({ extended: true }));  // interactive API

  app.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
      res.status(200).send(req.body.challenge);
    } else if (req.body.event && req.body.event.type === 'app_mention') {
      console.log('App was mentioned!');

      const webhookUrl = process.env.SLACK_WEBHOOK_URL; 
      axios.post(webhookUrl, { text: "Gotta get the bread and milk!" }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Message posted successfully:', response.data);
      })
      .catch(error => {
        console.error('Error posting message:', error);
      });
  
      res.status(200).send('Event received');
    } else {
      res.status(200).send('OK');
    }
  });

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
          await goalSetting.handleGoalSubmission(payload, slack, config.SLACK_CHANNEL_ID);

        // 目標リストを確定させる
        } else if (action.action_id === 'finalize_goals') {
          await goalSetting.finalizeGoalSetting(payload, slack, config.SLACK_CHANNEL_ID);

        // 週終わりに送信した週間レポートのフィードバックを受け取る -> Notionに送信
        } else if (action.action_id === 'submit_reflection') {
          const userFeedback = payload.state.values.reflection_input.reflection_input.value;
          const hiddenGoalsData = JSON.parse(payload.message.blocks[payload.message.blocks.length - 1].elements[0].text);
        
          console.log('User feedback:', userFeedback);
          console.log('Hidden goals data:', hiddenGoalsData);
          
          if (!userFeedback) {
            throw new Error('User feedback is empty');
          }
          
          await weeklyReport.handleUserFeedback(userFeedback, hiddenGoalsData, slack, payload.channel.id);
        }
      } catch (error) {
        console.error('Error handling action:', error);
      }

    }

    res.status(200).send('');
  });

  const scheduleGoalSetting = scheduler.scheduleJob(
    config.GOAL_SETTING_CRON,
    () => {
      console.log('Initiating goal setting...');
      goalSetting.initiateGoalSetting(slack, config.SLACK_CHANNEL_ID);
    }
  );
  
  const scheduleWeeklyReport = scheduler.scheduleJob(
    config.WEEKLY_REPORT_CRON,
    () => {
      console.log('Generating weekly report...');
      weeklyReport.generateWeeklyReport(slack, config.SLACK_CHANNEL_ID);
    }
  );

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
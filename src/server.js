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

  // application/x-www-form-urlencoded パーサーを使用
  app.use(express.urlencoded({ extended: true }));

  app.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
      res.send(req.body.challenge);
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
        if (action.action_id === 'add_goal') {
          await goalSetting.handleGoalSubmission(payload, slack, config.SLACK_CHANNEL_ID);
        } else if (action.action_id === 'finalize_goals') {
          await goalSetting.finalizeGoalSetting(payload, slack, config.SLACK_CHANNEL_ID);
        }
      } catch (error) {
        console.error('Error handling action:', error);
      }
    }

    res.status(200).send('');
  });

  // const scheduleGoalSetting = scheduler.scheduleJob(
  //   config.GOAL_SETTING_CRON,
  //   () => {
  //     console.log('Initiating goal setting...');
  //     goalSetting.initiateGoalSetting(slack, config.SLACK_CHANNEL_ID);
  //   }
  // );
  
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
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Goal Setting Schedule: ${config.GOAL_SETTING_CRON}`);
    console.log(`Weekly Report Schedule: ${config.WEEKLY_REPORT_CRON}`);
  });
}

module.exports = { createApp };
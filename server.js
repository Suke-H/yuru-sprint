require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Slackからのイベントを受け取るエンドポイント
app.post('/slack/events', (req, res) => {
  // URL検証リクエストを処理
  if (req.body.type === 'url_verification') {
    res.send(req.body.challenge); 
  // メンションのイベントを処理 
  } else if (req.body.event && req.body.event.type === 'app_mention') {
    console.log('App was mentioned!');
    
    // ここに実際のWebhook URLを貼り付ける
    const webhookUrl = process.env.SLACK_WEBHOOK_URL; 
    // メッセージを送信
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
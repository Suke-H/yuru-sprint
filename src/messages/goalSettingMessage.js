const goalSettingMessage = {
    "blocks": [
        {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "目標と絵文字を入力してください："
        }
        },
        {
        "type": "input",
        "block_id": "goal_input",
        "element": {
            "type": "plain_text_input",
            "action_id": "goal_value",
            "placeholder": {
            "type": "plain_text",
            "text": "目標を入力してください"
            }
        },
        "label": {
            "type": "plain_text",
            "text": "目標"
        }
        },
        {
        "type": "input",
        "block_id": "emoji_input",
        "element": {
            "type": "static_select",
            "action_id": "emoji_value",
            "placeholder": {
            "type": "plain_text",
            "text": "絵文字を選択してください"
            },
            "options": [
            {
                "text": {
                "type": "plain_text",
                "text": "🎯 Target"
                },
                "value": "target"
            },
            {
                "text": {
                "type": "plain_text",
                "text": "💪 Muscle"
                },
                "value": "muscle"
            },
            {
                "text": {
                "type": "plain_text",
                "text": "🏆 Trophy"
                },
                "value": "trophy"
            },
            {
                "text": {
                "type": "plain_text",
                "text": "📚 Book"
                },
                "value": "book"
            },
            {
                "text": {
                "type": "plain_text",
                "text": "💻 Computer"
                },
                "value": "computer"
            }
            ]
        },
        "label": {
            "type": "plain_text",
            "text": "絵文字"
        }
        },
        {
        "type": "actions",
        "elements": [
            {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": "送信"
            },
            "style": "primary",
            "action_id": "submit_goal_emoji"
            }
        ]
        }
    ]
  };
  
  // 他のメッセージ定義もここに追加できます
  
  module.exports = {
    goalSettingMessage
  };
const { emojiMapping } = require("../utils/emojiMapping");

// 目標リストのメッセージから目標を読み取る
// 各目標の削除ボタンの value に { emoji, text } を JSON で持たせている
function goalsFromBlocks(blocks = []) {
  return blocks
    .filter((block) => block.accessory && block.accessory.action_id.startsWith("delete_goal_"))
    .map((block) => JSON.parse(block.accessory.value));
}

// 目標リストのメッセージ（日曜に送信し、目標を追加するたびに書き換える）
function goalListMessage(userId, goals = []) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${userId}>\n今週の目標を設定しよう！`,
      },
    },
  ];

  // 目標ごとに1行ずつ、右端に削除ボタンを付ける
  goals.forEach((goal, index) => {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${index + 1}. ${emojiMapping[goal.emoji].notion} ${goal.text}`,
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "削除" },
        action_id: `delete_goal_${index}`,
        value: JSON.stringify({ emoji: goal.emoji, text: goal.text }),
      },
    });
  });

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "＋ 目標を追加" },
        action_id: "open_add_goal",
      },
    ],
  });

  return {
    text: "今週の目標を設定しよう！",
    blocks,
  };
}

// 「＋ 目標を追加」で開くポップアップ
// 開いた時点のリストを private_metadata に持たせ、追加時はそれに1件足す
function addGoalModal(channelId, messageTs, userId, goals, reactedEmojis) {
  return {
    type: "modal",
    callback_id: "add_goal_modal",
    private_metadata: JSON.stringify({ channelId, messageTs, userId, goals, reactedEmojis }),
    title: { type: "plain_text", text: "目標を追加" },
    submit: { type: "plain_text", text: "追加" },
    close: { type: "plain_text", text: "キャンセル" },
    blocks: [
      {
        type: "input",
        block_id: "goal_input",
        element: {
          type: "plain_text_input",
          action_id: "goal_value",
          max_length: 100,
          placeholder: { type: "plain_text", text: "目標を入力してください" },
        },
        label: { type: "plain_text", text: "目標" },
      },
    ],
  };
}

module.exports = {
  goalListMessage,
  goalsFromBlocks,
  addGoalModal,
};

const { emojiMapping } = require("../utils/emojiMapping");

// 週間レポート側（statusDetector）はメッセージの text を
// 「今週の目標です：\n1. 目標 :emoji:」の形式で読み取るため、目標がある間は text をこの形式に保つ
function goalListText(goals) {
  return [
    "今週の目標です：",
    ...goals.map((goal, index) => `${index + 1}. ${goal.text} :${goal.emoji}:`),
  ].join("\n");
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
        value: goal.emoji,
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
    text: goals.length > 0 ? goalListText(goals) : "今週の目標を設定しよう！",
    blocks,
  };
}

// 「＋ 目標を追加」で開くポップアップ
function addGoalModal(channelId, messageTs) {
  return {
    type: "modal",
    callback_id: "add_goal_modal",
    private_metadata: JSON.stringify({ channelId, messageTs }),
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
          placeholder: { type: "plain_text", text: "目標を入力してください" },
        },
        label: { type: "plain_text", text: "目標" },
      },
    ],
  };
}

module.exports = {
  goalListMessage,
  addGoalModal,
};

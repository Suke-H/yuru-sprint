const _ = require("lodash");
const { emojiMapping } = require("../utils/emojiMapping");

// 目標リストのメッセージから目標を読み取る
// 「目標を削除」メニューの各選択肢の value に { emoji, text } を JSON で持たせている
// （以前の形式の、目標ごとの削除ボタンの value からも読み取れるようにしている）
function goalsFromBlocks(blocks = []) {
  const goals = [];
  for (const block of blocks) {
    if (block.accessory && block.accessory.action_id.startsWith("delete_goal_")) {
      goals.push(JSON.parse(block.accessory.value));
    }
    for (const element of block.elements || []) {
      if (element.action_id === "delete_goal") {
        goals.push(...element.options.map((option) => JSON.parse(option.value)));
      }
    }
  }
  return goals;
}

function goalLine(goal, index) {
  return `${index + 1}. ${emojiMapping[goal.emoji].notion} ${goal.text}`;
}

// 目標リストのメッセージ（日曜に送信し、目標を追加・削除するたびに書き換える）
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

  // 目標は1つのブロックにまとめて、普通の行間で並べる
  if (goals.length > 0) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: goals.map(goalLine).join("\n") },
    });
  }

  const actions = [
    {
      type: "button",
      text: { type: "plain_text", text: "＋ 目標を追加" },
      action_id: "open_add_goal",
    },
  ];

  // 「目標を削除」メニュー（消す目標がないときは出さない）
  if (goals.length > 0) {
    actions.push({
      type: "static_select",
      action_id: "delete_goal",
      placeholder: { type: "plain_text", text: "目標を削除" },
      options: goals.map((goal, index) => ({
        // 選択肢の表示は75文字までなので、絵文字の数え方の差も見込んで70文字で省略する
        text: { type: "plain_text", text: _.truncate(goalLine(goal, index), { length: 70 }) },
        value: JSON.stringify({ emoji: goal.emoji, text: goal.text }),
      })),
    });
  }

  blocks.push({ type: "actions", elements: actions });

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
          // 選択肢の value（150文字まで）に目標を入れるため、短めに制限する
          max_length: 80,
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

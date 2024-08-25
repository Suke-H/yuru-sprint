async function detectStatuses(slack, channelId) {
    try {
      const weeklyGoals = await getWeeklyGoals(slack, channelId);
      
      if (!weeklyGoals || weeklyGoals.length === 0) {
        console.log("No goals found for the week");
        return [];
      }
  
      const goalStatuses = await Promise.all(weeklyGoals.map(async (goal) => {
        const reactions = await getReactions(slack, channelId, goal.messageTs, goal.emoji);
        const isCompleted = reactions.count >= 2;
        return { ...goal, isCompleted };
      }));
  
      return goalStatuses;
    } catch (error) {
      console.error('Error detecting task statuses:', error);
      return [];
    }
  }
  
  async function getWeeklyGoals(slack, channelId) {
    try {
      console.log(`Attempting to retrieve messages from channel: ${channelId}`);
      const result = await slack.conversations.history({
        channel: channelId,
        limit: 100 // 適切な数に調整してください
      });
  
      console.log(`Retrieved ${result.messages.length} messages from the channel`);
      
      // 取得したメッセージの内容をログに出力（最初の5件のみ）
      result.messages.slice(0, 5).forEach((msg, index) => {
        console.log(`Message ${index + 1}:`, msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''));
      });
  
      // 最新の非空の目標メッセージを探す
      const goalMessage = result.messages.find(msg => 
        msg.text.startsWith("今週の目標です：") && 
        msg.text.split('\n').length > 1
      );
  
      if (!goalMessage) {
        console.log("No valid goal message found");
        return [];
      }
  
      console.log("Found goal message:", goalMessage.text);
  
      const goals = goalMessage.text.split('\n').slice(1).map(line => {
        const match = line.match(/(\d+)\. (.*?) :(.*?):/);
        if (match) {
          return {
            text: match[2],
            emoji: match[3],
            messageTs: goalMessage.ts
          };
        }
        return null;
      }).filter(Boolean);
  
      console.log("Extracted goals:", goals);
      return goals;
    } catch (error) {
      console.error('Error retrieving weekly goals:', error);
      return [];
    }
  }
  
  async function getReactions(slack, channelId, messageTs, emoji) {
    try {
      const result = await slack.reactions.get({
        channel: channelId,
        timestamp: messageTs
      });
  
      const targetReaction = result.message.reactions.find(reaction => reaction.name === emoji);
      return targetReaction || { count: 0, users: [] };
    } catch (error) {
      console.error('Error getting reactions:', error);
      return { count: 0, users: [] };
    }
  }
  
  module.exports = {
    detectStatuses
  };
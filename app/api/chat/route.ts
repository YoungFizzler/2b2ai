import { modelID, myProvider } from "@/lib/models";
import { convertToModelMessages, smoothStream, streamText, UIMessage } from "ai";
import { NextRequest } from "next/server";
import { getCompletePlayerData } from "@/lib/api";

export async function POST(request: NextRequest) {
  const {
    messages,
    selectedModelId,
    isAnalysis,
    playerName,
  }: {
    messages: Array<UIMessage>;
    selectedModelId: modelID;
    isAnalysis?: boolean;
    playerName?: string;
  } = await request.json();

  let finalMessages = messages;
  
  // if a player analysis request, fetch data, modify the last message
  if (isAnalysis && playerName) {
    try {
      const playerData = await getCompletePlayerData(playerName);
      
      // create the player report
      const analysisPrompt = `Please analyze and provide a comprehensive summary report for the 2b2t Minecraft server player "${playerName}" based on the following data:

**PLAYER STATISTICS:**
${playerData.stats ? `
- First Seen: ${new Date(playerData.stats.firstSeen).toLocaleDateString()}
- Last Seen: ${new Date(playerData.stats.lastSeen).toLocaleDateString()}
- Total Joins: ${playerData.stats.joinCount.toLocaleString()}
- Total Leaves: ${playerData.stats.leaveCount.toLocaleString()}
- Deaths: ${playerData.stats.deathCount.toLocaleString()}
- Kills: ${playerData.stats.killCount.toLocaleString()}
- Total Playtime: ${Math.floor(playerData.stats.playtimeSeconds / 3600)} hours
- Monthly Playtime: ${Math.floor(playerData.stats.playtimeSecondsMonth / 3600)} hours
- Chat Messages: ${playerData.stats.chatsCount.toLocaleString()}
- Priority Queue: ${playerData.stats.prio ? 'Yes' : 'No'}
` : 'No statistics available'}

**CURRENT STATUS:**
- Online Now: ${playerData.isOnline ? 'Yes' : 'No'}
- Priority Status: ${playerData.isPrio ? 'Yes' : 'No'}
- Suspected Bot: ${playerData.isBot ? 'Yes' : 'No'}

**RECENT CHAT MESSAGES (Last ${playerData.chats.length}):**
${playerData.chats.length > 0 ? playerData.chats.map(chat => 
  `[${new Date(chat.time).toLocaleDateString()}] ${chat.chat}`
).join('\n') : 'No recent chat messages found'}

**RECENT CONNECTIONS (Last ${playerData.connections.length}):**
${playerData.connections.length > 0 ? playerData.connections.slice(0, 10).map(conn => 
  `[${new Date(conn.time).toLocaleDateString()} ${new Date(conn.time).toLocaleTimeString()}] ${conn.connection}`
).join('\n') : 'No recent connection data found'}

Please provide:
1. **Estimated Timezone** (based on connection patterns)
2. **Associated Groups/Factions** (based on chat analysis)
3. **Playtime Analysis** (activity level, dedication)
4. **Behavior Patterns** (PvP focus, social activity, etc.)
5. **Player Reputation** (based on chat tone and activity)
6. **Notable info** (notable events, achievements, chats, messages)
7. **Overall Summary** (comprehensive player profile)


Format the response in a clear, structured report. Do NOT yap to much or be verbose or to little.`;
      
      // replace last message with the prompt
      const lastMessage = finalMessages[finalMessages.length - 1];
      const modifiedMessage = {
        ...lastMessage,
        parts: [{ type: 'text' as const, text: analysisPrompt }]
      };
      finalMessages = [
        ...finalMessages.slice(0, -1),
        modifiedMessage
      ];
    } catch (error) {
      console.error('Error fetching player data:', error);
      // fallback incase datafetch fails
      const lastMessage = finalMessages[finalMessages.length - 1];
      const errorMessage = `I apologize, but I couldn't fetch data for player "${playerName}". The player might not exist or the API might be temporarily unavailable.`;
      const modifiedMessage = {
        ...lastMessage,
        parts: [{ type: 'text' as const, text: errorMessage }]
      };
      finalMessages = [
        ...finalMessages.slice(0, -1),
        modifiedMessage
      ];
    }
  }

  const stream = streamText({
    system: selectedModelId.startsWith("gpt")
      ? "You are a helpful AI assistant created by OpenAI. You specialize in analyzing 2b2t Minecraft server player data and generating comprehensive player reports. Focus on identifying patterns in connection times for timezone estimation, analyzing chat content for group affiliations and behavior patterns, and providing detailed insights into player activity levels and reputation. Format your responses as structured reports with clear sections."
      : selectedModelId.startsWith("gemini")
      ? "You are Gemini, an AI assistant created by Google. You specialize in analyzing 2b2t Minecraft server player data and generating comprehensive player reports. Focus on identifying patterns in connection times for timezone estimation, analyzing chat content for group affiliations and behavior patterns, and providing detailed insights into player activity levels and reputation. Format your responses as structured reports with clear sections."
      : selectedModelId.startsWith("deepseek")
      ? "You are DeepSeek, an AI assistant created by DeepSeek. You specialize in analyzing 2b2t Minecraft server player data and generating comprehensive player reports. Focus on identifying patterns in connection times for timezone estimation, analyzing chat content for group affiliations and behavior patterns, and providing detailed insights into player activity levels and reputation. Format your responses as structured reports with clear sections."
      : "You are a helpful AI assistant that specializes in analyzing 2b2t Minecraft server player data and generating comprehensive player reports. Focus on identifying patterns in connection times for timezone estimation, analyzing chat content for group affiliations and behavior patterns, and providing detailed insights into player activity levels and reputation. Format your responses as structured reports with clear sections.",
    model: myProvider.languageModel(selectedModelId),
    experimental_transform: [
      smoothStream({
        chunking: "word",
      }),
    ],
    messages: convertToModelMessages(finalMessages),
  });

  return stream.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: () => {
      return `An error occurred, please try again!`;
    },
  });
}

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
      const analysisPrompt = `Please analyze and provide a indepth report for the minecraft username playing on 2b2t "${playerName}" based on the following data:

**Player Stats:**
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
` : 'No statistics available, Error fetching data. Notify user immediately.'}

**Current Status:**
- Currently Online: ${playerData.isOnline ? 'Yes' : 'No'}
- Priority Queue Status: ${playerData.isPrio ? 'Yes' : 'No'}
- Suspected Bot (According to 2b2t.vc API): ${playerData.isBot ? 'Yes' : 'No'}

**Recent Chat Messages (Last ${playerData.chats.length}):**
${playerData.chats.length > 0 ? playerData.chats.map(chat => 
  `[${new Date(chat.time).toLocaleDateString()}] ${chat.chat}` 
).join('\n') : 'No recent chat messages found, Error fetching data. Notify user immediately.'}

**Recent Connections (Last ${playerData.connections.length}):**
${playerData.connections.length > 0 ? playerData.connections.slice(0, 10).map(conn => 
  `[${new Date(conn.time).toLocaleDateString()} ${new Date(conn.time).toLocaleTimeString()}] ${conn.connection}`
).join('\n') : 'No recent connection data found, Error fetching data. Notify user immediately.'}

Please provide:
1. **Estimated Timezone** (based on connection patterns), notify user that this is just an estimate and my no means accurate.
2. **Associated Groups/Factions** (based on chat analysis & the group list below, disbanded groups still count)
3. **Playtime Analysis** (activity level, dedication, do they even have a life?)
4. **Behavior Patterns** (PvP focus, social activity, language style, racist?, etc)
5. **Player Reputation** (based on chat tone and activity, are they liked, do they beef in chat etc ) 
6. **Notable info** (notable events, achievements, chats, messages. Anything that may be helpfull in researching a player please note.


Format the response in a clear, structured report. Do NOT yap to much or be verbose or to little.
PSA: Provide quotes & messsages when possible which are notable. It helps the user understand what you mean way better.
Add funny remarks just a little like being mean savage but only subtle as it's not the goal here.
Below are a list of groups, use these as context when finding out if they are in groups according to chat logs.:

## Groups from 2b2t Wiki

### +
- [+Z Digging Group](https://2b2t.miraheze.org/wiki/%2BZ_Digging_Group)

### -
- [-X Diggers](https://2b2t.miraheze.org/wiki/-X_Diggers)

### 0
- [0Neb Appreciation Group](https://2b2t.miraheze.org/wiki/0Neb_Appreciation_Group)

### 2
- [2b2t Census Bureau](https://2b2t.miraheze.org/wiki/2b2t_Census_Bureau)
- [The Communist Party of 2b2t (2022 revival)](https://2b2t.miraheze.org/wiki/User:Cice_pro/Drafts/The_Communist_Party_of_2b2t_(2022_revival))
- [2b2t Communist Party (Refounded: 2022)](https://2b2t.miraheze.org/wiki/User:Tensive2b2t/Drafts/2b2t_Communist_Party_(Refounded:_2022))
- [2b2t Party Committee](https://2b2t.miraheze.org/wiki/2b2t_Party_Committee)
- [2b2t Times](https://2b2t.miraheze.org/wiki/2b2t_Times)
- [2b2tpress](https://2b2t.miraheze.org/wiki/2b2tpress)
- [2BQB](https://2b2t.miraheze.org/wiki/2BQB)
- [2K2R](https://2b2t.miraheze.org/wiki/2K2R)

### 4
- [4channers](https://2b2t.miraheze.org/wiki/4channers)

### A
- [Adolf Hitller's Private Army](https://2b2t.miraheze.org/wiki/Adolf_Hitller%27s_Private_Army)
- [Alpha Alliance](https://2b2t.miraheze.org/wiki/Alpha_Alliance)
- [Althernos](https://2b2t.miraheze.org/wiki/Quarantine:Althernos)
- [Ancients](https://2b2t.miraheze.org/wiki/Ancients)
- [Anti Bedrock Society](https://2b2t.miraheze.org/wiki/Anti_Bedrock_Society)
- [Anti Watercube Coalition](https://2b2t.miraheze.org/wiki/Anti_Watercube_Coalition)
- [Anti-Incursion](https://2b2t.miraheze.org/wiki/Anti-Incursion)
- [Anti-Taco Societies](https://2b2t.miraheze.org/wiki/Quarantine:Anti-Taco_Societies)
- [Armorsmith's Followers](https://2b2t.miraheze.org/wiki/Armorsmith%27s_Followers)
- [Astral Brotherhood](https://2b2t.miraheze.org/wiki/Astral_Brotherhood)
- [Astral Order](https://2b2t.miraheze.org/wiki/Astral_Order)
- [Astral Republic](https://2b2t.miraheze.org/wiki/Astral_Republic)
- [Asylum](https://2b2t.miraheze.org/wiki/Asylum)
- [Aven Alliance](https://2b2t.miraheze.org/wiki/Aven_Alliance)

### B
- [Backstreet Boys](https://2b2t.miraheze.org/wiki/Backstreet_Boys)
- [Bedrock City](https://2b2t.miraheze.org/wiki/Bedrock_City)
- [2Maps2Calendars](https://2b2t.miraheze.org/wiki/User:Beithir/Drafts/2Maps2Calendars)
- [Brotherhood](https://2b2t.miraheze.org/wiki/Quarantine:Brotherhood)
- [Brotherhood of Diamonds](https://2b2t.miraheze.org/wiki/Brotherhood_of_Diamonds)
- [Brotherhood of Iron](https://2b2t.miraheze.org/wiki/Brotherhood_of_Iron)
- [Brownmen](https://2b2t.miraheze.org/wiki/Brownmen)
- [Builders Haven](https://2b2t.miraheze.org/wiki/Builders_Haven)

### C
- [TheNonBozos](https://2b2t.miraheze.org/wiki/User:Carezo/drafts/TheNonBozos)
- [Church of Eden](https://2b2t.miraheze.org/wiki/Church_of_Eden)
- [Clout Club](https://2b2t.miraheze.org/wiki/Clout_Club)
- [Communist Party of 2b2t](https://2b2t.miraheze.org/wiki/Communist_Party_of_2b2t)
- [Conquest](https://2b2t.miraheze.org/wiki/Conquest)
- [Followers of the Crafting Table](https://2b2t.miraheze.org/wiki/Followers_of_the_Crafting_Table)
- [Crimson Star](https://2b2t.miraheze.org/wiki/Crimson_Star)
- [Crusade](https://2b2t.miraheze.org/wiki/Crusade)
- [Cydonia](https://2b2t.miraheze.org/wiki/Cydonia)

### D
- [Democratic Group Alliance](https://2b2t.miraheze.org/wiki/Democratic_Group_Alliance)
- [Democratic Republic of 2b2t](https://2b2t.miraheze.org/wiki/Democratic_Republic_of_2b2t)
- [DonFuer](https://2b2t.miraheze.org/wiki/DonFuer)

### E
- [Eclipse](https://2b2t.miraheze.org/wiki/Eclipse)
- [Elysium](https://2b2t.miraheze.org/wiki/Elysium)
- [Enclave](https://2b2t.miraheze.org/wiki/Enclave)
- [Eta](https://2b2t.miraheze.org/wiki/Eta)
- [Exodus (group)](https://2b2t.miraheze.org/wiki/Exodus_(group))

### F
- [Facepunch Republic](https://2b2t.miraheze.org/wiki/Facepunch_Republic)
- [New Facepunch Republic](https://2b2t.miraheze.org/wiki/New_Facepunch_Republic)
- [Fate](https://2b2t.miraheze.org/wiki/Fate)
- [Federation of Independent Groups](https://2b2t.miraheze.org/wiki/Federation_of_Independent_Groups)
- [Fellowship of the Diamond](https://2b2t.miraheze.org/wiki/Fellowship_of_the_Diamond)
- [Fifth Column](https://2b2t.miraheze.org/wiki/Fifth_Column)
- [Fsociety](https://2b2t.miraheze.org/wiki/Fsociety)

### G
- [Gape Group](https://2b2t.miraheze.org/wiki/Gape_Group)
- [Goodwill Trading](https://2b2t.miraheze.org/wiki/Goodwill_Trading)
- [Guardians of Andromeda](https://2b2t.miraheze.org/wiki/Guardians_of_Andromeda)
- [Guardsmen](https://2b2t.miraheze.org/wiki/Guardsmen)

### H
- [Miku Fun Committee](https://2b2t.miraheze.org/wiki/User:Haramb3e/Drafts/Miku_Fun_Committee)
- [Headpats4All](https://2b2t.miraheze.org/wiki/Headpats4All)
- [Shulkerroad](https://2b2t.miraheze.org/wiki/User:HighestAtWork/Draft/Shulkerroad)
- [Highland](https://2b2t.miraheze.org/wiki/Highland)
- [Highway Workers Union](https://2b2t.miraheze.org/wiki/Highway_Workers_Union)
- [Holy League](https://2b2t.miraheze.org/wiki/Holy_League)

### I
- [Imperator's Group](https://2b2t.miraheze.org/wiki/Imperator%27s_Group)
- [Imperialists](https://2b2t.miraheze.org/wiki/Quarantine:Imperialists)
- [Independent Interstate Society](https://2b2t.miraheze.org/wiki/Independent_Interstate_Society)
- [Infinity Incursion](https://2b2t.miraheze.org/wiki/Infinity_Incursion)
- [Infrared](https://2b2t.miraheze.org/wiki/Infrared)
- [Inquisition](https://2b2t.miraheze.org/wiki/Inquisition)
- [Insomnia](https://2b2t.miraheze.org/wiki/Quarantine:Insomnia)
- [Invictus](https://2b2t.miraheze.org/wiki/Invictus)

### J
- [JIDF](https://2b2t.miraheze.org/wiki/JIDF)
- [Journeymen](https://2b2t.miraheze.org/wiki/Journeymen)
- [Judge's Group](https://2b2t.miraheze.org/wiki/Judge%27s_Group)
- [Justice Against Mutes](https://2b2t.miraheze.org/wiki/Justice_Against_Mutes)

### K
- [Knights of Millstone](https://2b2t.miraheze.org/wiki/Quarantine:Knights_of_Millstone)
- [Knights of Spawn](https://2b2t.miraheze.org/wiki/Knights_of_Spawn)
- [Knights Templar](https://2b2t.miraheze.org/wiki/Knights_Templar)
- [KOS Assassins](https://2b2t.miraheze.org/wiki/KOS_Assassins)

### L
- [Luminaria](https://2b2t.miraheze.org/wiki/Luminaria)

### M
- [Mew Revolution](https://2b2t.miraheze.org/wiki/Mew_Revolution)
- [Midnight Council](https://2b2t.miraheze.org/wiki/Midnight_Council)
- [Millennium](https://2b2t.miraheze.org/wiki/Millennium)
- [Monument Construction Group](https://2b2t.miraheze.org/wiki/Monument_Construction_Group)
- [Motorway Extension Gurus](https://2b2t.miraheze.org/wiki/Motorway_Extension_Gurus)

### N
- [Nerds Inc](https://2b2t.miraheze.org/wiki/Nerds_Inc)
- [Nether Highway Group](https://2b2t.miraheze.org/wiki/Nether_Highway_Group)
- [No Cane No Gain](https://2b2t.miraheze.org/wiki/No_Cane_No_Gain)

### O
- [Obscension](https://2b2t.miraheze.org/wiki/Obscension)
- [Order of Lucifer](https://2b2t.miraheze.org/wiki/Order_of_Lucifer)
- [MelonMen](https://2b2t.miraheze.org/wiki/User:Osmobyte/drafts/MelonMen)
- [Outlast](https://2b2t.miraheze.org/wiki/Outlast)

### P
- [Paranormal](https://2b2t.miraheze.org/wiki/Quarantine:Paranormal)
- [Peacekeepers](https://2b2t.miraheze.org/wiki/Peacekeepers)
- [Pneuma](https://2b2t.miraheze.org/wiki/Pneuma)
- [Point Zenith](https://2b2t.miraheze.org/wiki/Point_Zenith)
- [Pyyland](https://2b2t.miraheze.org/wiki/Pyyland)

### R
- [Republic of Portals](https://2b2t.miraheze.org/wiki/Quarantine:Republic_of_Portals)
- [Republic Radio News](https://2b2t.miraheze.org/wiki/Republic_Radio_News)

### S
- [Shortbus Caliphate](https://2b2t.miraheze.org/wiki/Shortbus_Caliphate)
- [Singularity](https://2b2t.miraheze.org/wiki/Quarantine:Singularity)
- [Skybound](https://2b2t.miraheze.org/wiki/Quarantine:Skybound)
- [Southern Canal Association](https://2b2t.miraheze.org/wiki/Southern_Canal_Association)
- [Spawn Builders Association](https://2b2t.miraheze.org/wiki/Spawn_Builders_Association)
- [Spawn Infrastructure Group](https://2b2t.miraheze.org/wiki/Spawn_Infrastructure_Group)
- [SpawnMasons](https://2b2t.miraheze.org/wiki/SpawnMasons)
- [Sun Knights](https://2b2t.miraheze.org/wiki/Sun_Knights)
- [UnitedStatesofHakle](https://2b2t.miraheze.org/wiki/User:Swips/Drafts/UnitedStatesofHakle)

### T
- [T gang](https://2b2t.miraheze.org/wiki/T_gang)
- [TEA](https://2b2t.miraheze.org/wiki/TEA)
- [Team Aurora](https://2b2t.miraheze.org/wiki/Team_Aurora)
- [Team Baguette](https://2b2t.miraheze.org/wiki/Quarantine:Team_Baguette)
- [Team Coca Cola](https://2b2t.miraheze.org/wiki/Team_Coca_Cola)
- [Team ElRichMC](https://2b2t.miraheze.org/wiki/Quarantine:Team_ElRichMC)
- [Team Galactic](https://2b2t.miraheze.org/wiki/Quarantine:Team_Galactic)
- [Team Godmode](https://2b2t.miraheze.org/wiki/Quarantine:Team_Godmode)
- [Team Imperia](https://2b2t.miraheze.org/wiki/Team_Imperia)
- [Team Malaria](https://2b2t.miraheze.org/wiki/Team_Malaria)
- [Team Nethertea](https://2b2t.miraheze.org/wiki/Team_Nethertea)
- [Team Pepsi](https://2b2t.miraheze.org/wiki/Team_Pepsi)
- [Team Rainbow](https://2b2t.miraheze.org/wiki/Team_Rainbow)
- [Team Rusher](https://2b2t.miraheze.org/wiki/Team_Rusher)
- [Team Scrios](https://2b2t.miraheze.org/wiki/Quarantine:Team_Scrios)
- [Team Sexy](https://2b2t.miraheze.org/wiki/Team_Sexy)
- [Team Sun](https://2b2t.miraheze.org/wiki/Team_Sun)
- [Team Uberslugcake](https://2b2t.miraheze.org/wiki/Team_Uberslugcake)
- [Team WAO](https://2b2t.miraheze.org/wiki/Team_WAO)
- [TeamNoTrees](https://2b2t.miraheze.org/wiki/TeamNoTrees)
- [Teslic](https://2b2t.miraheze.org/wiki/Teslic)
- [Teutonic Order](https://2b2t.miraheze.org/wiki/Teutonic_Order)
- [The 4th Reich](https://2b2t.miraheze.org/wiki/The_4th_Reich)
- [The 5th Reich](https://2b2t.miraheze.org/wiki/Quarantine:The_5th_Reich)
- [The Blind Eye Clan](https://2b2t.miraheze.org/wiki/The_Blind_Eye_Clan)
- [The Breakery](https://2b2t.miraheze.org/wiki/The_Breakery)
- [The Collective](https://2b2t.miraheze.org/wiki/The_Collective)
- [The Confederacy](https://2b2t.miraheze.org/wiki/The_Confederacy)
- [The Emperium](https://2b2t.miraheze.org/wiki/The_Emperium)
- [The Emperium (Quarantine)](https://2b2t.miraheze.org/wiki/Quarantine:The_Emperium)
- [The Excursion](https://2b2t.miraheze.org/wiki/Quarantine:The_Excursion)
- [The Freelancers](https://2b2t.miraheze.org/wiki/The_Freelancers)
- [The Fursecutioners](https://2b2t.miraheze.org/wiki/Quarantine:The_Fursecutioners)
- [The Guild](https://2b2t.miraheze.org/wiki/The_Guild)
- [The Gulag](https://2b2t.miraheze.org/wiki/The_Gulag)
- [The Imperials](https://2b2t.miraheze.org/wiki/The_Imperials)
- [The Jew Masons](https://2b2t.miraheze.org/wiki/The_Jew_Masons)
- [The Klansmen](https://2b2t.miraheze.org/wiki/The_Klansmen)
- [The Last Templar](https://2b2t.miraheze.org/wiki/The_Last_Templar)
- [The Legion of Shenandoah](https://2b2t.miraheze.org/wiki/The_Legion_of_Shenandoah)
- [The Lost Nomads](https://2b2t.miraheze.org/wiki/The_Lost_Nomads)
- [The Mentlegen](https://2b2t.miraheze.org/wiki/The_Mentlegen)
- [The Order](https://2b2t.miraheze.org/wiki/The_Order)
- [The Purge](https://2b2t.miraheze.org/wiki/The_Purge)
- [The Republic](https://2b2t.miraheze.org/wiki/The_Republic)
- [The Resistance](https://2b2t.miraheze.org/wiki/The_Resistance)
- [The Society](https://2b2t.miraheze.org/wiki/The_Society)
- [The Society Project](https://2b2t.miraheze.org/wiki/The_Society_Project)
- [The Turtles](https://2b2t.miraheze.org/wiki/Quarantine:The_Turtles)
- [The Tyranny](https://2b2t.miraheze.org/wiki/Quarantine:The_Tyranny)
- [The Unity](https://2b2t.miraheze.org/wiki/Quarantine:The_Unity)
- [The Vikings](https://2b2t.miraheze.org/wiki/The_Vikings)
- [The VoWers](https://2b2t.miraheze.org/wiki/The_VoWers)

### U
- [Unidad](https://2b2t.miraheze.org/wiki/Unidad)
- [United Group Embassy](https://2b2t.miraheze.org/wiki/United_Group_Embassy)
- [United Workers' Front of 2b2t](https://2b2t.miraheze.org/wiki/User:Cice_pro/Drafts/United_Workers%27_Front_of_2b2t)

### V
- [V Fawkes](https://2b2t.miraheze.org/wiki/Quarantine:V_Fawkes)
- [Valkyria](https://2b2t.miraheze.org/wiki/Valkyria)
- [Vapepens Elite Alliance](https://2b2t.miraheze.org/wiki/Vapepens_Elite_Alliance)
- [Visionary](https://2b2t.miraheze.org/wiki/Visionary)
- [Volk'Krov](https://2b2t.miraheze.org/wiki/Volk%27Krov)
- [Vortex Coalition](https://2b2t.miraheze.org/wiki/Vortex_Coalition)

### W
- [Watchmen](https://2b2t.miraheze.org/wiki/Watchmen)
- [WaterWay Union](https://2b2t.miraheze.org/wiki/WaterWay_Union)
- [White Lotus Society](https://2b2t.miraheze.org/wiki/White_Lotus_Society)
- [Wingston](https://2b2t.miraheze.org/wiki/Wingston)

### Z
- [Zispanos](https://2b2t.miraheze.org/wiki/Zispanos)
- [Zisteau](https://2b2t.miraheze.org/wiki/Quarantine:Zisteau)

---

**Total Groups Listed: 186**

*Note: This list includes both active and disbanded groups. Some entries are drafts or quarantined pages, which are indicated by their URL paths.*
`;
      
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

const API_BASE = 'https://api.2b2t.vc';

export interface PlayerStats {
  joinCount: number;
  leaveCount: number;
  deathCount: number;
  killCount: number;
  firstSeen: string;
  lastSeen: string;
  playtimeSeconds: number;
  playtimeSecondsMonth: number;
  chatsCount: number;
  prio: boolean;
}

export interface PlayerChat {
  playerName: string;
  uuid: string;
  time: string;
  chat: string;
}

export interface Connection {
  time: string;
  connection: 'JOIN' | 'LEAVE';
}

export interface PlayerData {
  stats: PlayerStats | null;
  chats: PlayerChat[];
  connections: Connection[];
  isOnline: boolean;
  isPrio: boolean;
  isBot: boolean;
}

export async function getPlayerStats(playerName: string): Promise<PlayerStats | null> {
  try {
    const response = await fetch(`${API_BASE}/stats/player?playerName=${encodeURIComponent(playerName)}`);
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
}

export async function getPlayerChats(playerName: string, maxPages = 10): Promise<PlayerChat[]> {
  try {
    const allChats: PlayerChat[] = [];
    
    for (let page = 1; page <= maxPages; page++) {
      const response = await fetch(`${API_BASE}/chats?playerName=${encodeURIComponent(playerName)}&pageSize=100&page=${page}&sort=desc`);
      if (response.status === 204) break;
      
      const data = await response.json();
      if (!data.chats || data.chats.length === 0) break;
      
      allChats.push(...data.chats);
      
      // If fewer than 100 results returned then it was the last page of chats
      if (data.chats.length < 100) break;
    }
    
    return allChats;
  } catch (error) {
    console.error('Error fetching player chats:', error);
    return [];
  }
}

export async function getPlayerConnections(playerName: string, maxPages = 2): Promise<Connection[]> {
  try {
    const allConnections: Connection[] = [];
    
    for (let page = 1; page <= maxPages; page++) {
      const response = await fetch(`${API_BASE}/connections?playerName=${encodeURIComponent(playerName)}&pageSize=100&page=${page}&sort=desc`);
      if (response.status === 204) break;
      
      const data = await response.json();
      if (!data.connections || data.connections.length === 0) break;
      
      allConnections.push(...data.connections);
      
      // If fewer than 100 results returned then it was the last page of chats
      if (data.connections.length < 100) break;
    }
    
    return allConnections;
  } catch (error) {
    console.error('Error fetching player connections:', error);
    return [];
  }
}

export async function getCompletePlayerData(playerName: string): Promise<PlayerData> {
  const [stats, chats, connections] = await Promise.all([
    getPlayerStats(playerName),
    getPlayerChats(playerName),
    getPlayerConnections(playerName)
  ]);

  return {
    stats,
    chats,
    connections,
    isOnline: false,
    isPrio: false,
    isBot: false
  };
}
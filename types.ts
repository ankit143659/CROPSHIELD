
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  automationEnabled: boolean;
  avatar?: string;
}

export interface AutomationConfig {
  email: string;
  selectedSeason: 'spring' | 'summer' | 'autumn' | 'winter' | null;
  frequency: 'once' | 'annual';
  verified: boolean;
  active: boolean;
}

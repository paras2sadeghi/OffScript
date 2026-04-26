export type Mode = 'offscript' | 'wanderer' | 'ghost';

export type Mood = 'alive' | 'empty' | 'adventurous' | 'lonely' | 'free' | 'overwhelmed' | 'curious' | 'invisible';

export interface Character {
  title: string;
  backstory: string;
  movement: string;
}

export interface Mission {
  id: string;
  task: string;
  reflectionPrompt: string;
  completed: boolean;
  skipped?: boolean;
  reflection?: string;
  xp: number;
}

export interface GameState {
  mode: Mode | null;
  mood: Mood | null;
  location: string | null;
  character: Character | null;
  missions: Mission[];
  totalXp: number;
  earnedBadges: { title: string; date: string }[];
  step: 'welcome' | 'city' | 'mode' | 'mood' | 'loading' | 'reveal' | 'missions' | 'badges';
}

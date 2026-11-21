import { meta as starterMeta } from './starter/meta.ts';

export const GAMES = {
  starter: { meta: starterMeta, discModule: '/src/games/starter/disc.tsx' },
} as const;

export type GameId = keyof typeof GAMES;

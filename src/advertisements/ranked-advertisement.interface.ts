import type { Advertisement } from './advertisement.interface';

export interface RankedAdvertisement extends Advertisement {
  rank: number;
}

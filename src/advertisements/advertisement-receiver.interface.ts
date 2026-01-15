import type { MapElement } from '../maps';
import type { Advertisement } from './advertisement.interface';

export interface AdvertisementReceiver extends MapElement {
  receiveAdvertisement(advertisement: Advertisement): void;
}

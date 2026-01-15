import type { Advertisement } from './advertisement.interface';
import type { AdvertisementReceiver } from './advertisement-receiver.interface';

export interface AdvertisementBroadcaster {
  broadcast(advertisement: Advertisement): void;
  broadcastExcluding(
    advertisement: Advertisement,
    excludeReceiver: AdvertisementReceiver
  ): void;
  addReceiver(receiver: AdvertisementReceiver): void;
  removeReceiver(receiver: AdvertisementReceiver): void;
  clearReceivers(): void;
}

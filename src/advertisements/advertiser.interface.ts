import type { Advertisement } from './advertisement.interface';
import type { AdvertisementBroadcaster } from './advertisement-broadcaster.interface';
import type { AdvertisementReceiver } from './advertisement-receiver.interface';

export interface Advertiser {
  broadcaster: AdvertisementBroadcaster | null;
  broadcastAdvertisement(advertisement: Advertisement): void;
  broadcastAdvertisementExcluding(
    advertisement: Advertisement,
    excludeReceiver: AdvertisementReceiver
  ): void;
}

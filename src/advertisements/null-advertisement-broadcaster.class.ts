import type { AdvertisementBroadcaster } from './advertisement-broadcaster.interface';
import type { Advertisement } from './advertisement.interface';
import type { AdvertisementReceiver } from './advertisement-receiver.interface';

export class NullAdvertisementBroadcaster implements AdvertisementBroadcaster {
  broadcast(_advertisement: Advertisement): void {}
  broadcastExcluding(
    _advertisement: Advertisement,
    _excludeReceiver: AdvertisementReceiver
  ): void {}
  addReceiver(_receiver: AdvertisementReceiver): void {}
  removeReceiver(_receiver: AdvertisementReceiver): void {}
  clearReceivers(): void {}

  static create(): AdvertisementBroadcaster {
    return new NullAdvertisementBroadcaster();
  }
}

import type { AdvertisementBroadcaster } from './advertisement-broadcaster.interface';
import type { Advertisement } from './advertisement.interface';
import type { AdvertisementReceiver } from './advertisement-receiver.interface';
import type { MapElement } from '../maps';

export class AdvertisementBroadcasterImpl implements AdvertisementBroadcaster {
  private receiversById: globalThis.Map<number, AdvertisementReceiver> =
    new globalThis.Map();
  private calledIds: Set<number> = new Set();

  broadcast(advertisement: Advertisement): void {
    this.broadcastExcluding(advertisement, null as unknown as AdvertisementReceiver);
  }

  broadcastExcluding(
    advertisement: Advertisement,
    excludeReceiver: AdvertisementReceiver | null
  ): void {
    this.calledIds.clear();

    const map = advertisement.map;
    const locations = advertisement.broadcastLocations;

    for (const location of locations) {
      const elements = map.getElementsAtCell(location);
      for (const element of elements) {
        const receiver = this.receiversById.get(element.id);
        if (receiver && !this.calledIds.has(element.id)) {
          if (receiver !== excludeReceiver) {
            receiver.receiveAdvertisement(advertisement);
          }
          this.calledIds.add(element.id);
        }
      }
    }
  }

  addReceiver(receiver: AdvertisementReceiver): void {
    if (this.receiversById.has(receiver.id)) return;
    this.receiversById.set(receiver.id, receiver);
  }

  removeReceiver(receiver: AdvertisementReceiver): void {
    this.receiversById.delete(receiver.id);
  }

  clearReceivers(): void {
    this.receiversById.clear();
  }

  static create(receivers: AdvertisementReceiver[] = []): AdvertisementBroadcaster {
    const broadcaster = new AdvertisementBroadcasterImpl();
    for (const receiver of receivers) {
      broadcaster.addReceiver(receiver);
    }
    return broadcaster;
  }
}

export { AdvertisementBroadcasterImpl as AdvertisementBroadcaster };

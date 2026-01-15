import { AbstractCommand } from '@dpid/command-state-machine';
import type { Vector2 } from '../common';
import type { Map } from '../maps';
import type {
  AdvertisementReceiver,
  AdvertisingMapElement,
} from '../advertisements';
import { Advertisement } from '../advertisements';

function vector2Equals(a: Vector2 | null, b: Vector2 | null): boolean {
  if (a === null || b === null) return a === b;
  return a.x === b.x && a.y === b.y;
}

export class BroadcastStats extends AbstractCommand {
  private elapsed = 0;
  private cachedLocations: Vector2[] | null = null;
  private lastLocation: Vector2 | null = null;

  private constructor(
    private readonly advertiser: AdvertisingMapElement,
    private readonly excludeReceiver?: AdvertisementReceiver
  ) {
    super();
  }

  protected onStart(): void {
    this.elapsed = 0;
    this.cachedLocations = null;
    this.lastLocation = null;

    if (this.canBroadcast()) {
      this.createAndBroadcast();
    }
  }

  protected onUpdate(dt: number): void {
    if (!this.canBroadcast()) return;

    this.elapsed += dt;
    if (this.elapsed >= this.advertiser.data.broadcastInterval) {
      this.elapsed = 0;
      this.createAndBroadcast();
    }
  }

  private canBroadcast(): boolean {
    const { broadcastDistance, broadcastInterval } = this.advertiser.data;
    return (
      broadcastDistance > 0 &&
      broadcastInterval > 0 &&
      this.advertiser.map !== null
    );
  }

  private createAndBroadcast(): void {
    const map = this.advertiser.map;
    if (!map) return;

    const locations = this.getBroadcastLocations(map);
    const traits = this.advertiser.data.stats.traits.map((t) => t.copy());

    const ad = Advertisement.create(
      traits,
      map,
      this.advertiser.location,
      locations,
      this.advertiser.groupId
    );

    if (this.excludeReceiver) {
      this.advertiser.broadcastAdvertisementExcluding(ad, this.excludeReceiver);
    } else {
      this.advertiser.broadcastAdvertisement(ad);
    }
  }

  private getBroadcastLocations(map: Map): Vector2[] {
    if (
      this.cachedLocations !== null &&
      vector2Equals(this.lastLocation, this.advertiser.location)
    ) {
      return this.cachedLocations;
    }

    this.lastLocation = { ...this.advertiser.location };
    this.cachedLocations = map.getCellsInsideRadius(
      this.advertiser.location,
      this.advertiser.data.broadcastDistance
    );

    return this.cachedLocations;
  }

  static create(
    advertiser: AdvertisingMapElement,
    excludeReceiver?: AdvertisementReceiver
  ): BroadcastStats {
    return new BroadcastStats(advertiser, excludeReceiver);
  }
}

import type { TraitCollectionType as TraitCollection } from '../traits';
import type { MapElement } from '../maps';
import type { Advertiser } from './advertiser.interface';

export interface AdvertisingData {
  readonly stats: TraitCollection;
  readonly broadcastDistance: number;
  readonly broadcastInterval: number;
}

export interface AdvertisingMapElement extends MapElement, Advertiser {
  readonly data: AdvertisingData;
}

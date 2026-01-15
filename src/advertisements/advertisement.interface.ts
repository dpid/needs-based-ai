import type { Vector2, GroupMember, EventEmitter } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';
import type { Locatable, Map } from '../maps';

export interface Advertisement extends TraitCollection, Locatable, GroupMember {
  readonly map: Map;
  readonly broadcastLocations: readonly Vector2[];
  readonly onLocationUpdated: EventEmitter<Advertisement>;
}

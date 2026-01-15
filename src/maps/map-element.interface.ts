import type { Vector2, Identifiable, GroupMember } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';
import type { Locatable } from './locatable.interface';
import type { Positionable } from './positionable.interface';
import type { Map } from './map.interface';

export interface MapElement extends Locatable, Positionable, Identifiable, GroupMember {
  map: Map | null;
  readonly stats: TraitCollection;
  readonly isOnMap: boolean;
  addToMap(map: Map): void;
  removeFromMap(): void;
  distanceTo(other: MapElement): number;
  distanceToCell(cell: Vector2): number;
}

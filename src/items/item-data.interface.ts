import type { Copyable, Describable } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';

export interface ItemData extends Copyable<ItemData>, Describable {
  readonly stats: TraitCollection;
  readonly broadcastDistance: number;
  readonly broadcastInterval: number;
}

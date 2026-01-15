import type { ItemData } from './item-data.interface';
import type { TraitCollectionType as TraitCollection } from '../traits';
import { TraitCollectionImpl } from '../traits';

export class NullItemData implements ItemData {
  private _stats: TraitCollection = TraitCollectionImpl.create();

  get description(): string {
    return '';
  }

  get stats(): TraitCollection {
    return this._stats;
  }

  get broadcastDistance(): number {
    return 0;
  }

  get broadcastInterval(): number {
    return 0;
  }

  copy(): ItemData {
    return new NullItemData();
  }

  static create(): ItemData {
    return new NullItemData();
  }
}

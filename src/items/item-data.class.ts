import type { ItemData } from './item-data.interface';
import type { TraitCollectionType as TraitCollection, TraitType as Trait } from '../traits';
import { TraitCollectionImpl } from '../traits';

export class ItemDataImpl implements ItemData {
  private _description: string;
  private _stats: TraitCollection;
  private _broadcastDistance: number;
  private _broadcastInterval: number;

  constructor(
    description: string = '',
    broadcastDistance: number = 0,
    broadcastInterval: number = 0
  ) {
    this._description = description;
    this._stats = TraitCollectionImpl.create();
    this._broadcastDistance = broadcastDistance;
    this._broadcastInterval = broadcastInterval;
  }

  get description(): string {
    return this._description;
  }

  get stats(): TraitCollection {
    return this._stats;
  }

  get broadcastDistance(): number {
    return this._broadcastDistance;
  }

  get broadcastInterval(): number {
    return this._broadcastInterval;
  }

  copy(): ItemData {
    const copy = new ItemDataImpl(
      this._description,
      this._broadcastDistance,
      this._broadcastInterval
    );
    for (const trait of this._stats.traits) {
      copy._stats.addTrait(trait.copy());
    }
    return copy;
  }

  static create(
    description: string = '',
    broadcastDistance: number = 0,
    broadcastInterval: number = 0
  ): ItemData {
    return new ItemDataImpl(description, broadcastDistance, broadcastInterval);
  }

  static createFrom(source: ItemData): ItemData {
    return source.copy();
  }
}

export { ItemDataImpl as ItemData };

import type { Vector2, EventEmitter } from '../common';
import type { TraitType as Trait, TraitCollectionType as TraitCollection } from '../traits';
import type { Map, Locatable } from '../maps';
import type { Advertisement } from './advertisement.interface';
import type { RankedAdvertisement } from './ranked-advertisement.interface';
import { Vector2Zero, EventEmitterImpl } from '../common';
import { TraitCollectionImpl } from '../traits';
import { NullMap } from '../maps';

export class RankedAdvertisementImpl implements RankedAdvertisement {
  private _traits: TraitCollection;
  private _location: Vector2;
  private _map: Map;
  private _broadcastLocations: Vector2[];
  private _groupId: string;
  private _rank: number;
  readonly onLocationUpdated: EventEmitter<RankedAdvertisement>;

  constructor() {
    this._traits = TraitCollectionImpl.create();
    this._location = Vector2Zero;
    this._map = NullMap.create();
    this._broadcastLocations = [];
    this._groupId = '';
    this._rank = 0;
    this.onLocationUpdated = EventEmitterImpl.create<RankedAdvertisement>();
  }

  get traits(): readonly Trait[] {
    return this._traits.traits;
  }

  getTrait(id: string): Trait | null {
    return this._traits.getTrait(id);
  }

  addTrait(trait: Trait): void {
    this._traits.addTrait(trait);
  }

  removeTrait(trait: Trait): void {
    this._traits.removeTrait(trait);
  }

  removeTraitById(id: string): void {
    this._traits.removeTraitById(id);
  }

  clear(): void {
    this._traits.clear();
  }

  copy(): TraitCollection {
    return this._traits.copy();
  }

  get location(): Vector2 {
    return this._location;
  }

  get map(): Map {
    return this._map;
  }

  get broadcastLocations(): readonly Vector2[] {
    return this._broadcastLocations;
  }

  get groupId(): string {
    return this._groupId;
  }

  get rank(): number {
    return this._rank;
  }

  set rank(value: number) {
    this._rank = value;
  }

  static create(
    advertisement: Advertisement,
    rank: number = 0
  ): RankedAdvertisement {
    const ranked = new RankedAdvertisementImpl();
    for (const trait of advertisement.traits) {
      ranked.addTrait(trait.copy());
    }
    ranked._map = advertisement.map;
    ranked._location = advertisement.location;
    ranked._broadcastLocations = [...advertisement.broadcastLocations];
    ranked._groupId = advertisement.groupId;
    ranked._rank = rank;
    return ranked;
  }
}

export { RankedAdvertisementImpl as RankedAdvertisement };

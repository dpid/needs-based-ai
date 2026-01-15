import type { Vector2, EventEmitter } from '../common';
import type { TraitType as Trait, TraitCollectionType as TraitCollection } from '../traits';
import type { Map, Locatable } from '../maps';
import type { Advertisement } from './advertisement.interface';
import { Vector2Zero, EventEmitterImpl } from '../common';
import { TraitCollectionImpl } from '../traits';
import { NullMap } from '../maps';

export class AdvertisementImpl implements Advertisement {
  private _traits: TraitCollection;
  private _location: Vector2;
  private _map: Map;
  private _broadcastLocations: Vector2[];
  private _groupId: string;
  readonly onLocationUpdated: EventEmitter<Advertisement>;

  constructor() {
    this._traits = TraitCollectionImpl.create();
    this._location = Vector2Zero;
    this._map = NullMap.create();
    this._broadcastLocations = [];
    this._groupId = '';
    this.onLocationUpdated = EventEmitterImpl.create<Advertisement>();
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

  static create(
    traits: Trait[],
    map: Map,
    location: Vector2,
    broadcastLocations: Vector2[],
    groupId: string = ''
  ): Advertisement {
    const ad = new AdvertisementImpl();
    ad._traits = TraitCollectionImpl.createFrom(traits);
    ad._map = map;
    ad._location = location;
    ad._broadcastLocations = broadcastLocations;
    ad._groupId = groupId;
    return ad;
  }
}

export { AdvertisementImpl as Advertisement };

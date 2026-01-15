import type { StateTransitionHandler, StateMachine } from '@dpid/command-state-machine';
import type { Vector2, Vector3, EventEmitter } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';
import type { Map, MapElement } from '../maps';
import type {
  Advertisement,
  AdvertisementBroadcaster,
  AdvertisementReceiver,
} from '../advertisements';
import type { Item } from './item.interface';
import type { ItemData } from './item-data.interface';
import {
  generateId,
  vector2Distance,
  Vector2Zero,
  Vector3Zero,
  EventEmitterImpl,
} from '../common';
import { TraitCollectionImpl } from '../traits';
import { NullMap } from '../maps';
import { NullAdvertisementBroadcaster } from '../advertisements';
import { NullItemData } from './null-item-data.class';

export class ItemImpl implements Item {
  readonly id: number;
  private _location: Vector2;
  private _position: Vector3;
  private _map: Map | null = null;
  private _stats: TraitCollection;
  private _groupId: string;
  private _data: ItemData;
  private _broadcaster: AdvertisementBroadcaster | null = null;
  readonly onLocationUpdated: EventEmitter<ItemImpl>;

  constructor(groupId: string = '', initialLocation?: Vector2) {
    this.id = generateId();
    this._groupId = groupId;
    this._location = initialLocation ?? Vector2Zero;
    this._position = Vector3Zero;
    this._stats = TraitCollectionImpl.create();
    this._data = NullItemData.create();
    this.onLocationUpdated = EventEmitterImpl.create<ItemImpl>();
  }

  get data(): ItemData {
    return this._data;
  }

  set data(value: ItemData) {
    this._data = value;
  }

  get location(): Vector2 {
    return this._location;
  }

  set location(value: Vector2) {
    const wasOnMap = this.isOnMap;
    const previousMap = this._map;

    if (wasOnMap && previousMap) {
      previousMap.removeElement(this);
    }

    this._location = value;
    this.onLocationUpdated.emit(this);

    if (wasOnMap && previousMap) {
      previousMap.addElement(this);
    }
  }

  get position(): Vector3 {
    return this._position;
  }

  set position(value: Vector3) {
    this._position = value;
  }

  get map(): Map | null {
    return this._map;
  }

  set map(value: Map | null) {
    this._map = value;
  }

  get stats(): TraitCollection {
    return this._data.stats;
  }

  get groupId(): string {
    return this._groupId;
  }

  get isOnMap(): boolean {
    return this._map !== null && this._map.isElementOnMap(this);
  }

  addToMap(map: Map): void {
    if (this._map !== null) {
      this.removeFromMap();
    }
    this._map = map;
    map.addElement(this);
  }

  removeFromMap(): void {
    if (this._map !== null) {
      this._map.removeElement(this);
      this._map = null;
    }
  }

  distanceTo(other: MapElement): number {
    return vector2Distance(this._location, other.location);
  }

  distanceToCell(cell: Vector2): number {
    return vector2Distance(this._location, cell);
  }

  get broadcaster(): AdvertisementBroadcaster | null {
    return this._broadcaster;
  }

  set broadcaster(value: AdvertisementBroadcaster | null) {
    this._broadcaster = value;
  }

  broadcastAdvertisement(advertisement: Advertisement): void {
    if (this._broadcaster) {
      this._broadcaster.broadcast(advertisement);
    }
  }

  broadcastAdvertisementExcluding(
    advertisement: Advertisement,
    excludeReceiver: AdvertisementReceiver
  ): void {
    if (this._broadcaster) {
      this._broadcaster.broadcastExcluding(advertisement, excludeReceiver);
    }
  }

  handleTransition(transitionName: string): void {
    // Override in subclasses to handle state transitions
  }

  static create(groupId: string = '', initialLocation?: Vector2): Item {
    return new ItemImpl(groupId, initialLocation);
  }
}

export { ItemImpl as Item };

import type { Vector2, Vector3, EventEmitter } from '../common';
import type { TraitCollectionType } from '../traits';
import type { MapElement } from './map-element.interface';
import type { Map } from './map.interface';
import {
  generateId,
  vector2Distance,
  Vector2Zero,
  Vector3Zero,
  EventEmitterImpl,
} from '../common';
import { TraitCollection } from '../traits';

export class SimpleMapElementImpl implements MapElement {
  readonly id: number;
  private _location: Vector2;
  private _position: Vector3;
  private _map: Map | null = null;
  readonly stats: TraitCollectionType;
  readonly groupId: string;
  readonly onLocationUpdated: EventEmitter<MapElement>;

  constructor(groupId: string = '', initialLocation?: Vector2) {
    this.id = generateId();
    this.groupId = groupId;
    this._location = initialLocation ?? Vector2Zero;
    this._position = Vector3Zero;
    this.stats = TraitCollection.create();
    this.onLocationUpdated = EventEmitterImpl.create<MapElement>();
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

  static create(groupId: string = '', initialLocation?: Vector2): MapElement {
    return new SimpleMapElementImpl(groupId, initialLocation);
  }
}

export { SimpleMapElementImpl as SimpleMapElement };

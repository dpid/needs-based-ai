import type { Vector2, EventEmitter } from '../common';
import type { Map } from './map.interface';
import type { MapElement } from './map-element.interface';
import { Vector2Zero, EventEmitterImpl } from '../common';

export class NullMap implements Map {
  readonly size: Vector2 = Vector2Zero;
  readonly cellCount: number = 0;
  readonly onElementAdded: EventEmitter<MapElement>;
  readonly onElementRemoved: EventEmitter<MapElement>;

  constructor() {
    this.onElementAdded = EventEmitterImpl.create<MapElement>();
    this.onElementRemoved = EventEmitterImpl.create<MapElement>();
  }

  addElement(_element: MapElement): void {}
  removeElement(_element: MapElement): void {}

  inBounds(_location: Vector2): boolean {
    return false;
  }

  isElementOnMap(_element: MapElement): boolean {
    return false;
  }

  getAllElements(): MapElement[] {
    return [];
  }

  getElementAtCell(_cell: Vector2): MapElement | null {
    return null;
  }

  getElementsAtCell(_cell: Vector2): MapElement[] {
    return [];
  }

  getElementsInsideRadius(_centerCell: Vector2, _radius: number): MapElement[] {
    return [];
  }

  static create(): Map {
    return new NullMap();
  }
}

import type { Vector2, EventEmitter } from '../common';
import type { MapElement } from './map-element.interface';

export interface Map {
  readonly size: Vector2;
  readonly cellCount: number;

  addElement(element: MapElement): void;
  removeElement(element: MapElement): void;

  readonly onElementAdded: EventEmitter<MapElement>;
  readonly onElementRemoved: EventEmitter<MapElement>;

  inBounds(location: Vector2): boolean;
  isElementOnMap(element: MapElement): boolean;

  getAllElements(): MapElement[];
  getElementAtCell(cell: Vector2): MapElement | null;
  getElementsAtCell(cell: Vector2): MapElement[];
  getElementsInsideRadius(centerCell: Vector2, radius: number): MapElement[];
  getCellsInsideRadius(centerCell: Vector2, radius: number): Vector2[];
}

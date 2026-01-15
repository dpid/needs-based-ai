import type { Vector2, EventEmitter } from '../common';
import type { Map } from './map.interface';
import type { MapElement } from './map-element.interface';
import { vector2, vector2HashCode, vector2Distance, EventEmitterImpl } from '../common';

export class GridMapImpl implements Map {
  readonly size: Vector2;
  readonly onElementAdded: EventEmitter<MapElement>;
  readonly onElementRemoved: EventEmitter<MapElement>;

  private hashToElements: globalThis.Map<number, MapElement[]> = new globalThis.Map();
  private elementToHash: globalThis.Map<MapElement, number> = new globalThis.Map();

  constructor(width: number, height: number) {
    this.size = vector2(width, height);
    this.onElementAdded = EventEmitterImpl.create<MapElement>();
    this.onElementRemoved = EventEmitterImpl.create<MapElement>();
  }

  get cellCount(): number {
    return this.size.x * this.size.y;
  }

  private getHashId(location: Vector2): number {
    const offsetX = Math.floor(this.size.x / 2);
    const offsetY = Math.floor(this.size.y / 2);
    return vector2HashCode(vector2(location.x + offsetX, location.y + offsetY));
  }

  addElement(element: MapElement): void {
    if (this.elementToHash.has(element)) {
      const oldHash = this.elementToHash.get(element)!;
      const oldList = this.hashToElements.get(oldHash);
      if (oldList) {
        const index = oldList.indexOf(element);
        if (index !== -1) {
          oldList.splice(index, 1);
        }
      }
    }

    const hash = this.getHashId(element.location);
    if (!this.hashToElements.has(hash)) {
      this.hashToElements.set(hash, []);
    }
    this.hashToElements.get(hash)!.push(element);
    this.elementToHash.set(element, hash);

    this.onElementAdded.emit(element);
  }

  removeElement(element: MapElement): void {
    if (this.elementToHash.has(element)) {
      const hash = this.elementToHash.get(element)!;
      const list = this.hashToElements.get(hash);
      if (list) {
        const index = list.indexOf(element);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
      this.elementToHash.delete(element);
      this.onElementRemoved.emit(element);
    }
  }

  inBounds(location: Vector2): boolean {
    const halfX = Math.floor(this.size.x / 2);
    const halfY = Math.floor(this.size.y / 2);
    return (
      location.x >= -halfX &&
      location.x < halfX &&
      location.y >= -halfY &&
      location.y < halfY
    );
  }

  isElementOnMap(element: MapElement): boolean {
    return this.elementToHash.has(element);
  }

  getAllElements(): MapElement[] {
    return Array.from(this.elementToHash.keys());
  }

  getElementAtCell(cell: Vector2): MapElement | null {
    const hash = this.getHashId(cell);
    const list = this.hashToElements.get(hash);
    if (list && list.length > 0) {
      return list[0];
    }
    return null;
  }

  getElementsAtCell(cell: Vector2): MapElement[] {
    const hash = this.getHashId(cell);
    const list = this.hashToElements.get(hash);
    return list ? [...list] : [];
  }

  getElementsInsideRadius(centerCell: Vector2, radius: number): MapElement[] {
    const result: MapElement[] = [];
    const radiusSquared = radius * radius;

    for (const element of this.elementToHash.keys()) {
      const dist = vector2Distance(centerCell, element.location);
      if (dist * dist <= radiusSquared) {
        result.push(element);
      }
    }

    return result;
  }

  static create(width: number, height: number): Map {
    return new GridMapImpl(width, height);
  }
}

export { GridMapImpl as GridMap };

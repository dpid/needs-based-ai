import type { Vector2 } from '../common';
import type { EventEmitter } from '../common';

export interface Locatable {
  readonly location: Vector2;
  readonly onLocationUpdated: EventEmitter<Locatable>;
}

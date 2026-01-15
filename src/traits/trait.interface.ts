import type { Copyable } from '../common';
import type { EventEmitter } from '../common';

export interface Trait extends Copyable<Trait> {
  readonly id: string;
  quantity: number;
  min: number;
  max: number;
  readonly onUpdated: EventEmitter<Trait>;
}

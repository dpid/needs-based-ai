import type { Trait } from './trait.interface';
import type { EventEmitter } from '../common';
import { EventEmitterImpl } from '../common';

export class TraitImpl implements Trait {
  private _quantity: number;
  private _min: number;
  private _max: number;
  readonly onUpdated: EventEmitter<Trait>;

  constructor(
    readonly id: string,
    quantity: number = 0,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ) {
    this._min = min;
    this._max = max;
    this._quantity = this.clamp(quantity);
    this.onUpdated = EventEmitterImpl.create<Trait>();
  }

  get quantity(): number {
    return this._quantity;
  }

  set quantity(value: number) {
    const newValue = this.clamp(value);
    if (this._quantity !== newValue) {
      this._quantity = newValue;
      this.onUpdated.emit(this);
    }
  }

  get min(): number {
    return this._min;
  }

  set min(value: number) {
    this._min = value;
    this._quantity = this.clamp(this._quantity);
  }

  get max(): number {
    return this._max;
  }

  set max(value: number) {
    this._max = value;
    this._quantity = this.clamp(this._quantity);
  }

  private clamp(value: number): number {
    return Math.max(this._min, Math.min(this._max, value));
  }

  copy(): Trait {
    return TraitImpl.create(this.id, this._quantity, this._min, this._max);
  }

  static create(
    id: string,
    quantity: number = 0,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ): Trait {
    return new TraitImpl(id, quantity, min, max);
  }
}

export { TraitImpl as Trait };

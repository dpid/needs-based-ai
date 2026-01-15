import type { Copyable } from '../common';
import type { Trait } from './trait.interface';

export interface TraitCollection extends Copyable<TraitCollection> {
  readonly traits: readonly Trait[];
  getTrait(id: string): Trait | null;
  addTrait(trait: Trait): void;
  removeTrait(trait: Trait): void;
  removeTraitById(id: string): void;
  clear(): void;
}

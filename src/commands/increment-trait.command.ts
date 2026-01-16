import { AbstractCommand } from '@dpid/command-state-machine';
import type { TraitCollectionType } from '../traits';

export class IncrementTrait extends AbstractCommand {
  private constructor(
    private readonly traitCollection: TraitCollectionType,
    private readonly traitId: string,
    private readonly incrementRate: number
  ) {
    super();
  }

  protected onUpdate(dt: number): void {
    const trait = this.traitCollection.getTrait(this.traitId);
    if (trait === null) return;

    const delta = this.incrementRate * dt;
    trait.quantity += delta;
  }

  static create(
    traitCollection: TraitCollectionType,
    traitId: string,
    incrementRate: number
  ): IncrementTrait {
    return new IncrementTrait(traitCollection, traitId, incrementRate);
  }
}

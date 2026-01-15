import type { TraitCollection } from './trait-collection.interface';
import type { Trait } from './trait.interface';

export class TraitCollectionImpl implements TraitCollection {
  private collection: Trait[] = [];

  get traits(): readonly Trait[] {
    return this.collection;
  }

  getTrait(id: string): Trait | null {
    return this.collection.find((trait) => trait.id === id) ?? null;
  }

  addTrait(trait: Trait): void {
    if (trait === null) return;
    const existing = this.getTrait(trait.id);
    if (existing === null) {
      this.collection.push(trait);
    }
  }

  removeTrait(trait: Trait): void {
    if (trait === null) return;
    this.removeTraitById(trait.id);
  }

  removeTraitById(id: string): void {
    const index = this.collection.findIndex((trait) => trait.id === id);
    if (index !== -1) {
      this.collection.splice(index, 1);
    }
  }

  clear(): void {
    this.collection.length = 0;
  }

  copy(): TraitCollection {
    const copy = new TraitCollectionImpl();
    for (const trait of this.collection) {
      copy.addTrait(trait.copy());
    }
    return copy;
  }

  static create(): TraitCollection {
    return new TraitCollectionImpl();
  }

  static createFrom(traits: Trait[]): TraitCollection {
    const collection = new TraitCollectionImpl();
    for (const trait of traits) {
      collection.addTrait(trait.copy());
    }
    return collection;
  }
}

export { TraitCollectionImpl as TraitCollection };

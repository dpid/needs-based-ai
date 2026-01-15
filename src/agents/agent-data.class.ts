import type { AgentData } from './agent-data.interface';
import type { TraitCollectionType as TraitCollection, TraitType as Trait } from '../traits';
import { TraitCollectionImpl } from '../traits';

export class AgentDataImpl implements AgentData {
  private _description: string;
  private _stats: TraitCollection;
  private _desires: TraitCollection;
  private _broadcastDistance: number;
  private _broadcastInterval: number;

  constructor(
    description: string = '',
    broadcastDistance: number = 0,
    broadcastInterval: number = 0
  ) {
    this._description = description;
    this._stats = TraitCollectionImpl.create();
    this._desires = TraitCollectionImpl.create();
    this._broadcastDistance = broadcastDistance;
    this._broadcastInterval = broadcastInterval;
  }

  get description(): string {
    return this._description;
  }

  get stats(): TraitCollection {
    return this._stats;
  }

  get desires(): TraitCollection {
    return this._desires;
  }

  get broadcastDistance(): number {
    return this._broadcastDistance;
  }

  get broadcastInterval(): number {
    return this._broadcastInterval;
  }

  copy(): AgentData {
    const copy = new AgentDataImpl(
      this._description,
      this._broadcastDistance,
      this._broadcastInterval
    );
    for (const trait of this._stats.traits) {
      copy._stats.addTrait(trait.copy());
    }
    for (const trait of this._desires.traits) {
      copy._desires.addTrait(trait.copy());
    }
    return copy;
  }

  static create(
    description: string = '',
    broadcastDistance: number = 0,
    broadcastInterval: number = 0
  ): AgentData {
    return new AgentDataImpl(description, broadcastDistance, broadcastInterval);
  }

  static createFrom(source: AgentData): AgentData {
    return source.copy();
  }
}

export { AgentDataImpl as AgentData };

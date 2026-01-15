import type { AgentData } from './agent-data.interface';
import type { TraitCollectionType as TraitCollection } from '../traits';
import { TraitCollectionImpl } from '../traits';

export class NullAgentData implements AgentData {
  private _stats: TraitCollection = TraitCollectionImpl.create();
  private _desires: TraitCollection = TraitCollectionImpl.create();

  get description(): string {
    return '';
  }

  get stats(): TraitCollection {
    return this._stats;
  }

  get desires(): TraitCollection {
    return this._desires;
  }

  get broadcastDistance(): number {
    return 0;
  }

  get broadcastInterval(): number {
    return 0;
  }

  copy(): AgentData {
    return new NullAgentData();
  }

  static create(): AgentData {
    return new NullAgentData();
  }
}

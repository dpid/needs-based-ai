import type { Copyable, Describable } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';

export interface AgentData extends Copyable<AgentData>, Describable {
  readonly stats: TraitCollection;
  readonly desires: TraitCollection;
  readonly broadcastDistance: number;
  readonly broadcastInterval: number;
}

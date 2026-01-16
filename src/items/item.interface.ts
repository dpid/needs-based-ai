import type { StateTransitionHandler } from '@dpid/command-state-machine';
import type { MapElement } from '../maps';
import type { Advertiser } from '../advertisements';
import type { ItemData } from './item-data.interface';
import type { ItemDebugInfo } from '../debug';

export interface Item extends MapElement, Advertiser, StateTransitionHandler {
  data: ItemData;
  getDebugInfo(): ItemDebugInfo | null;
}

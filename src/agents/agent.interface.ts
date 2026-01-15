import type { StateTransitionHandler } from '@dpid/command-state-machine';
import type { Vector2, EventEmitter } from '../common';
import type { MapElement } from '../maps';
import type {
  Advertiser,
  AdvertisementReceiver,
  AdvertisementType as Advertisement,
  RankedAdvertisementType as RankedAdvertisement,
} from '../advertisements';
import type { AgentData } from './agent-data.interface';

export interface Agent
  extends MapElement,
    Advertiser,
    AdvertisementReceiver,
    StateTransitionHandler {
  data: AgentData;
  readonly onAdvertisementReceived: EventEmitter<Advertisement>;
  targetAdvertisement: RankedAdvertisement | null;
  targetMapElement: MapElement | null;
  targetLocation: Vector2 | null;
}

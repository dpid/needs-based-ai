import type { StateTransitionHandler, StateMachine } from '@dpid/command-state-machine';
import type { Vector2, Vector3, EventEmitter } from '../common';
import type { TraitCollectionType as TraitCollection } from '../traits';
import type { Map, MapElement } from '../maps';
import type {
  AdvertisementType as Advertisement,
  AdvertisementBroadcaster,
  AdvertisementReceiver,
  RankedAdvertisementType as RankedAdvertisement,
} from '../advertisements';
import type { Agent } from './agent.interface';
import type { AgentData } from './agent-data.interface';
import {
  generateId,
  vector2Distance,
  Vector2Zero,
  Vector3Zero,
  EventEmitterImpl,
} from '../common';
import { TraitCollectionImpl } from '../traits';
import { NullMap } from '../maps';
import { NullAdvertisementBroadcaster } from '../advertisements';
import { NullAgentData } from './null-agent-data.class';

export class AgentImpl implements Agent {
  readonly id: number;
  private _location: Vector2;
  private _position: Vector3;
  private _map: Map | null = null;
  private _stats: TraitCollection;
  private _groupId: string;
  private _data: AgentData;
  private _broadcaster: AdvertisementBroadcaster | null = null;
  readonly onLocationUpdated: EventEmitter<AgentImpl>;
  readonly onAdvertisementReceived: EventEmitter<Advertisement>;

  targetAdvertisement: RankedAdvertisement | null = null;
  targetMapElement: MapElement | null = null;
  targetLocation: Vector2 | null = null;

  constructor(groupId: string = '', initialLocation?: Vector2) {
    this.id = generateId();
    this._groupId = groupId;
    this._location = initialLocation ?? Vector2Zero;
    this._position = Vector3Zero;
    this._stats = TraitCollectionImpl.create();
    this._data = NullAgentData.create();
    this.onLocationUpdated = EventEmitterImpl.create<AgentImpl>();
    this.onAdvertisementReceived = EventEmitterImpl.create<Advertisement>();
  }

  get data(): AgentData {
    return this._data;
  }

  set data(value: AgentData) {
    this._data = value;
  }

  get location(): Vector2 {
    return this._location;
  }

  set location(value: Vector2) {
    const wasOnMap = this.isOnMap;
    const previousMap = this._map;

    if (wasOnMap && previousMap) {
      previousMap.removeElement(this);
    }

    this._location = value;
    this.onLocationUpdated.emit(this);

    if (wasOnMap && previousMap) {
      previousMap.addElement(this);
    }
  }

  get position(): Vector3 {
    return this._position;
  }

  set position(value: Vector3) {
    this._position = value;
  }

  get map(): Map | null {
    return this._map;
  }

  set map(value: Map | null) {
    this._map = value;
  }

  get stats(): TraitCollection {
    return this._data.stats;
  }

  get desires(): TraitCollection {
    return this._data.desires;
  }

  get groupId(): string {
    return this._groupId;
  }

  get isOnMap(): boolean {
    return this._map !== null && this._map.isElementOnMap(this);
  }

  addToMap(map: Map): void {
    if (this._map !== null) {
      this.removeFromMap();
    }
    this._map = map;
    map.addElement(this);
  }

  removeFromMap(): void {
    if (this._map !== null) {
      this._map.removeElement(this);
      this._map = null;
    }
  }

  distanceTo(other: MapElement): number {
    return vector2Distance(this._location, other.location);
  }

  distanceToCell(cell: Vector2): number {
    return vector2Distance(this._location, cell);
  }

  get broadcaster(): AdvertisementBroadcaster | null {
    return this._broadcaster;
  }

  set broadcaster(value: AdvertisementBroadcaster | null) {
    this._broadcaster = value;
  }

  broadcastAdvertisement(advertisement: Advertisement): void {
    if (this._broadcaster) {
      this._broadcaster.broadcast(advertisement);
    }
  }

  broadcastAdvertisementExcluding(
    advertisement: Advertisement,
    excludeReceiver: AdvertisementReceiver
  ): void {
    if (this._broadcaster) {
      this._broadcaster.broadcastExcluding(advertisement, excludeReceiver);
    }
  }

  receiveAdvertisement(advertisement: Advertisement): void {
    this.onAdvertisementReceived.emit(advertisement);
  }

  handleTransition(transitionName: string): void {
    // Override in subclasses to handle state transitions
  }

  static create(groupId: string = '', initialLocation?: Vector2): Agent {
    return new AgentImpl(groupId, initialLocation);
  }
}

export { AgentImpl as Agent };

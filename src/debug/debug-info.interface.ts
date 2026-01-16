import type { Vector2 } from '../common';

export interface MapElementDebugInfo {
  type: string;
  id: string;
  position: Vector2;
}

export interface AgentDebugInfo extends MapElementDebugInfo {
  type: 'agent';
  advertisements: { trait: string; radius: number; quantity: number }[];
  desires: { trait: string; priority: number }[];
  receivedAdvertisements: AdvertisementDebugInfo[];
  currentTarget: { position: Vector2; trait: string } | null;
  lastDecision: DecisionDebugInfo | null;
}

export interface ItemDebugInfo extends MapElementDebugInfo {
  type: 'item';
  advertisements: { trait: string; radius: number; quantity: number }[];
}

export type DebugInfo = AgentDebugInfo | ItemDebugInfo;

export interface DecisionDebugInfo {
  selectedTarget: { id: string; trait: string; position: Vector2 } | null;
  reason: string;
  consideredOptions: {
    id: string;
    trait: string;
    position: Vector2;
    score: number;
    rejectionReason?: string;
  }[];
  timestamp: number;
}

export interface AdvertisementDebugInfo {
  sourceId: string;
  sourceType: 'agent' | 'item';
  trait: string;
  quantity: number;
  position: Vector2;
  distance: number;
}

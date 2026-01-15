import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandableState, StateMachine } from '@dpid/command-state-machine';
import { vector2, resetIdGenerator } from './common';
import { Trait, TraitCollection } from './traits';
import { GridMap } from './maps';
import {
  Advertisement,
  AdvertisementBroadcaster,
  AdvertisementType,
} from './advertisements';
import { Item, ItemData } from './items';
import { Agent, AgentData } from './agents';
import { BroadcastStats } from './commands';

describe('Integration Tests', () => {
  beforeEach(() => {
    resetIdGenerator();
  });

  describe('Agent receives advertisement from Item', () => {
    it('should deliver advertisement to agent when both are on the same cell', () => {
      const map = GridMap.create(10, 10);
      const broadcaster = AdvertisementBroadcaster.create();

      const item = Item.create('items', vector2(0, 0));
      const itemData = ItemData.create('Food source', 5, 1);
      itemData.stats.addTrait(Trait.create('food', 100));
      item.data = itemData;
      item.broadcaster = broadcaster;
      item.addToMap(map);

      const agent = Agent.create('agents', vector2(0, 0));
      const agentData = AgentData.create('Hungry agent', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 50));
      agent.data = agentData;
      agent.addToMap(map);
      broadcaster.addReceiver(agent);

      const receivedAds: AdvertisementType[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as AdvertisementType);
      });

      const ad = Advertisement.create(
        [Trait.create('food', 100)],
        map,
        item.location,
        [vector2(0, 0)],
        'items'
      );

      broadcaster.broadcast(ad);

      expect(receivedAds.length).toBe(1);
      expect(receivedAds[0].traits[0].id).toBe('food');
      expect(receivedAds[0].traits[0].quantity).toBe(100);
    });

    it('should not deliver advertisement to agent outside broadcast range', () => {
      const map = GridMap.create(10, 10);
      const broadcaster = AdvertisementBroadcaster.create();

      const item = Item.create('items', vector2(0, 0));
      item.addToMap(map);

      const agent = Agent.create('agents', vector2(5, 5));
      agent.addToMap(map);
      broadcaster.addReceiver(agent);

      const receivedAds: AdvertisementType[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as AdvertisementType);
      });

      const ad = Advertisement.create(
        [Trait.create('food', 100)],
        map,
        item.location,
        [vector2(0, 0)],
        'items'
      );

      broadcaster.broadcast(ad);

      expect(receivedAds.length).toBe(0);
    });
  });

  describe('GridMap radius queries', () => {
    it('should return elements inside radius', () => {
      const map = GridMap.create(20, 20);

      const agent1 = Agent.create('agents', vector2(0, 0));
      const agent2 = Agent.create('agents', vector2(1, 1));
      const agent3 = Agent.create('agents', vector2(5, 5));

      agent1.addToMap(map);
      agent2.addToMap(map);
      agent3.addToMap(map);

      const nearbyElements = map.getElementsInsideRadius(vector2(0, 0), 2);

      expect(nearbyElements.length).toBe(2);
      expect(nearbyElements.some((e) => e.id === agent1.id)).toBe(true);
      expect(nearbyElements.some((e) => e.id === agent2.id)).toBe(true);
      expect(nearbyElements.some((e) => e.id === agent3.id)).toBe(false);
    });
  });

  describe('Trait updates', () => {
    it('should emit update events when trait quantity changes', () => {
      const trait = Trait.create('health', 100, 0, 100);
      const updates: number[] = [];

      trait.onUpdated.addListener((t) => {
        updates.push(t.quantity);
      });

      trait.quantity = 50;
      trait.quantity = 25;
      trait.quantity = 25;

      expect(updates).toEqual([50, 25]);
    });

    it('should clamp quantity to min/max', () => {
      const trait = Trait.create('health', 100, 0, 100);

      trait.quantity = 150;
      expect(trait.quantity).toBe(100);

      trait.quantity = -50;
      expect(trait.quantity).toBe(0);
    });
  });

  describe('MapElement location updates', () => {
    it('should re-add element to map when location changes', () => {
      const map = GridMap.create(10, 10);
      const agent = Agent.create('agents', vector2(0, 0));
      agent.addToMap(map);

      expect(map.getElementsAtCell(vector2(0, 0)).length).toBe(1);
      expect(map.getElementsAtCell(vector2(5, 5)).length).toBe(0);

      agent.location = vector2(5, 5);

      expect(map.getElementsAtCell(vector2(0, 0)).length).toBe(0);
      expect(map.getElementsAtCell(vector2(5, 5)).length).toBe(1);
    });
  });

  describe('BroadcastStats command', () => {
    it('should broadcast item stats on start', () => {
      const map = GridMap.create(20, 20);
      const broadcaster = AdvertisementBroadcaster.create();

      const item = Item.create('items', vector2(0, 0));
      const itemData = ItemData.create('Food', 5, 1);
      itemData.stats.addTrait(Trait.create('food', 100));
      item.data = itemData;
      item.broadcaster = broadcaster;
      item.addToMap(map);

      const agent = Agent.create('agents', vector2(2, 2));
      agent.addToMap(map);
      broadcaster.addReceiver(agent);

      const receivedAds: AdvertisementType[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as AdvertisementType);
      });

      const sm = StateMachine.create();
      const state = CommandableState.create('broadcast');
      state.addCommand(BroadcastStats.create(item));
      sm.addState(state);
      sm.setState('broadcast');

      expect(receivedAds.length).toBe(1);
      expect(receivedAds[0].traits[0].id).toBe('food');
    });

    it('should broadcast on interval', () => {
      const map = GridMap.create(20, 20);
      const broadcaster = AdvertisementBroadcaster.create();

      const item = Item.create('items', vector2(0, 0));
      const itemData = ItemData.create('Food', 5, 2);
      itemData.stats.addTrait(Trait.create('food', 100));
      item.data = itemData;
      item.broadcaster = broadcaster;
      item.addToMap(map);

      const agent = Agent.create('agents', vector2(2, 2));
      agent.addToMap(map);
      broadcaster.addReceiver(agent);

      const receivedAds: AdvertisementType[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as AdvertisementType);
      });

      const sm = StateMachine.create();
      const state = CommandableState.create('broadcast');
      state.addCommand(BroadcastStats.create(item));
      sm.addState(state);
      sm.setState('broadcast');

      expect(receivedAds.length).toBe(1);

      sm.update(1);
      expect(receivedAds.length).toBe(1);

      sm.update(1);
      expect(receivedAds.length).toBe(2);

      sm.update(2);
      expect(receivedAds.length).toBe(3);
    });

    it('should not broadcast to agents outside radius', () => {
      const map = GridMap.create(20, 20);
      const broadcaster = AdvertisementBroadcaster.create();

      const item = Item.create('items', vector2(0, 0));
      const itemData = ItemData.create('Food', 3, 1);
      itemData.stats.addTrait(Trait.create('food', 100));
      item.data = itemData;
      item.broadcaster = broadcaster;
      item.addToMap(map);

      const agent = Agent.create('agents', vector2(5, 5));
      agent.addToMap(map);
      broadcaster.addReceiver(agent);

      const receivedAds: AdvertisementType[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as AdvertisementType);
      });

      const sm = StateMachine.create();
      const state = CommandableState.create('broadcast');
      state.addCommand(BroadcastStats.create(item));
      sm.addState(state);
      sm.setState('broadcast');

      expect(receivedAds.length).toBe(0);
    });

    it('should exclude specified receiver for agents', () => {
      const map = GridMap.create(20, 20);
      const broadcaster = AdvertisementBroadcaster.create();

      const broadcastingAgent = Agent.create('agents', vector2(0, 0));
      const agentData = AgentData.create('Broadcaster', 5, 1);
      agentData.stats.addTrait(Trait.create('gold', 50));
      broadcastingAgent.data = agentData;
      broadcastingAgent.broadcaster = broadcaster;
      broadcastingAgent.addToMap(map);
      broadcaster.addReceiver(broadcastingAgent);

      const otherAgent = Agent.create('agents', vector2(2, 2));
      otherAgent.addToMap(map);
      broadcaster.addReceiver(otherAgent);

      const selfAds: AdvertisementType[] = [];
      broadcastingAgent.onAdvertisementReceived.addListener((ad) => {
        selfAds.push(ad as AdvertisementType);
      });

      const otherAds: AdvertisementType[] = [];
      otherAgent.onAdvertisementReceived.addListener((ad) => {
        otherAds.push(ad as AdvertisementType);
      });

      const sm = StateMachine.create();
      const state = CommandableState.create('broadcast');
      state.addCommand(BroadcastStats.create(broadcastingAgent, broadcastingAgent));
      sm.addState(state);
      sm.setState('broadcast');

      expect(selfAds.length).toBe(0);
      expect(otherAds.length).toBe(1);
    });
  });

  describe('getCellsInsideRadius', () => {
    it('should return cells within radius', () => {
      const map = GridMap.create(20, 20);
      const cells = map.getCellsInsideRadius(vector2(0, 0), 2);

      expect(cells.length).toBeGreaterThan(0);
      expect(cells.some((c) => c.x === 0 && c.y === 0)).toBe(true);
      expect(cells.some((c) => c.x === 1 && c.y === 1)).toBe(true);
      expect(cells.some((c) => c.x === 2 && c.y === 0)).toBe(true);
      expect(cells.every((c) => c.x * c.x + c.y * c.y <= 4)).toBe(true);
    });

    it('should respect map bounds', () => {
      const map = GridMap.create(4, 4);
      const cells = map.getCellsInsideRadius(vector2(0, 0), 5);

      cells.forEach((cell) => {
        expect(map.inBounds(cell)).toBe(true);
      });
    });
  });
});

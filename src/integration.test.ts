import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vector2, resetIdGenerator } from './common';
import { Trait, TraitCollection } from './traits';
import { GridMap } from './maps';
import { Advertisement, AdvertisementBroadcaster } from './advertisements';
import { Item, ItemData } from './items';
import { Agent, AgentData } from './agents';

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

      const receivedAds: typeof Advertisement[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as typeof Advertisement);
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

      const receivedAds: typeof Advertisement[] = [];
      agent.onAdvertisementReceived.addListener((ad) => {
        receivedAds.push(ad as typeof Advertisement);
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
});

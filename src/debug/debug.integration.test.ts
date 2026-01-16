import { describe, it, expect, beforeEach } from 'vitest';
import { Debug } from './debug.class';
import { Agent, AgentData } from '../agents';
import { Item, ItemData } from '../items';
import { GridMap } from '../maps';
import { Advertisement } from '../advertisements';
import { Trait } from '../traits';
import { vector2 } from '../common';
import { AdvertisementHandler } from '../commands';

describe('Debug Integration', () => {
  beforeEach(() => {
    Debug.disable();
  });

  describe('Debug Toggle', () => {
    it('should return null for all entities when debug is disabled', () => {
      Debug.disable();
      const agent = Agent.create('players', vector2(5, 5));
      const item = Item.create('items', vector2(10, 10));

      expect(agent.getDebugInfo()).toBeNull();
      expect(item.getDebugInfo()).toBeNull();
    });

    it('should return debug info when enabled', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const item = Item.create('items', vector2(10, 10));

      expect(agent.getDebugInfo()).not.toBeNull();
      expect(item.getDebugInfo()).not.toBeNull();
    });

    it('should handle toggle during runtime', () => {
      const agent = Agent.create('players', vector2(5, 5));

      Debug.disable();
      expect(agent.getDebugInfo()).toBeNull();

      Debug.enable();
      expect(agent.getDebugInfo()).not.toBeNull();

      Debug.disable();
      expect(agent.getDebugInfo()).toBeNull();
    });
  });

  describe('Agent Debug Info', () => {
    it('should return complete debug info structure', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test Agent', 5, 1);
      agentData.stats.addTrait(Trait.create('health', 100));
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;
      agent.addToMap(map);

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo).not.toBeNull();
      expect(debugInfo?.type).toBe('agent');
      expect(debugInfo?.id).toBeDefined();
      expect(debugInfo?.position).toEqual({ x: 10, y: 10 });
      expect(debugInfo?.advertisements).toHaveLength(1);
      expect(debugInfo?.advertisements[0]).toEqual({
        trait: 'health',
        radius: 5,
        quantity: 100,
      });
      expect(debugInfo?.desires).toHaveLength(1);
      expect(debugInfo?.desires[0]).toEqual({
        trait: 'food',
        priority: 80,
      });
      expect(debugInfo?.receivedAdvertisements).toEqual([]);
      expect(debugInfo?.currentTarget).toBeNull();
      expect(debugInfo?.lastDecision).toBeNull();
    });

    it('should include multiple stats and desires', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const agentData = AgentData.create('Test Agent', 10, 1);
      agentData.stats.addTrait(Trait.create('health', 100));
      agentData.stats.addTrait(Trait.create('mana', 50));
      agentData.desires.addTrait(Trait.create('food', 80));
      agentData.desires.addTrait(Trait.create('water', 60));
      agent.data = agentData;

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo?.advertisements).toHaveLength(2);
      expect(debugInfo?.desires).toHaveLength(2);
    });

    it('should return a copy of position, not reference', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo?.position).toEqual({ x: 5, y: 5 });
      expect(debugInfo?.position).not.toBe(agent.location);
    });
  });

  describe('Item Debug Info', () => {
    it('should return complete debug info structure', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const item = Item.create('items', vector2(20, 20));
      const itemData = ItemData.create('Test Item', 8, 1);
      itemData.stats.addTrait(Trait.create('food', 50));
      item.data = itemData;
      item.addToMap(map);

      const debugInfo = item.getDebugInfo();

      expect(debugInfo).not.toBeNull();
      expect(debugInfo?.type).toBe('item');
      expect(debugInfo?.id).toBeDefined();
      expect(debugInfo?.position).toEqual({ x: 20, y: 20 });
      expect(debugInfo?.advertisements).toHaveLength(1);
      expect(debugInfo?.advertisements[0]).toEqual({
        trait: 'food',
        radius: 8,
        quantity: 50,
      });
    });

    it('should include multiple stats', () => {
      Debug.enable();
      const item = Item.create('items', vector2(10, 10));
      const itemData = ItemData.create('Test Item', 10, 1);
      itemData.stats.addTrait(Trait.create('food', 50));
      itemData.stats.addTrait(Trait.create('water', 30));
      itemData.stats.addTrait(Trait.create('health', 20));
      item.data = itemData;

      const debugInfo = item.getDebugInfo();

      expect(debugInfo?.advertisements).toHaveLength(3);
    });
  });

  describe('Advertisement Tracking', () => {
    it('should track received advertisements when debug is enabled', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(5, 5));
      agent.addToMap(map);

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.receivedAdvertisements).toHaveLength(1);
      expect(debugInfo?.receivedAdvertisements[0].trait).toBe('food');
      expect(debugInfo?.receivedAdvertisements[0].quantity).toBe(10);
      expect(debugInfo?.receivedAdvertisements[0].sourceType).toBe('item');
    });

    it('should not track advertisements when debug is disabled', () => {
      Debug.disable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(5, 5));
      agent.addToMap(map);

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      expect(agent.receivedAdvertisements).toHaveLength(0);
    });

    it('should cap advertisement history at 50 entries', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(5, 5));
      agent.addToMap(map);

      for (let i = 0; i < 60; i++) {
        const ad = Advertisement.create(
          [Trait.create('food', i)],
          map,
          vector2(10 + i, 10),
          [vector2(10 + i, 10)],
          'items'
        );
        agent.receiveAdvertisement(ad);
      }

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.receivedAdvertisements).toHaveLength(50);
      expect(debugInfo?.receivedAdvertisements[0].quantity).toBe(10);
      expect(debugInfo?.receivedAdvertisements[49].quantity).toBe(59);
    });

    it('should calculate distance correctly', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(0, 0));
      agent.addToMap(map);

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(3, 4),
        [vector2(3, 4)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.receivedAdvertisements[0].distance).toBe(5);
    });
  });

  describe('Decision Tracking', () => {
    it('should track decisions through AdvertisementHandler', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;
      agent.addToMap(map);

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.lastDecision).not.toBeNull();
      expect(debugInfo?.lastDecision?.selectedTarget?.trait).toBe('food');
      expect(debugInfo?.lastDecision?.reason).toContain('exceeds current target rank');
      expect(debugInfo?.lastDecision?.consideredOptions).toHaveLength(1);
      expect(debugInfo?.lastDecision?.consideredOptions[0].score).toBeGreaterThan(0);
      expect(debugInfo?.lastDecision?.timestamp).toBeGreaterThan(0);
    });

    it('should not track decisions when debug is disabled', () => {
      Debug.disable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;
      agent.addToMap(map);

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      expect(agent.lastDecision).toBeNull();
    });

    it('should include rejection reason for same-group advertisements', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;
      agent.addToMap(map);

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'players'
      );

      agent.receiveAdvertisement(ad);

      expect(agent.targetAdvertisement).toBeNull();
    });

    it('should include rejection reason for lower-ranked advertisements', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 10));
      agent.data = agentData;
      agent.addToMap(map);

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad1 = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );
      agent.receiveAdvertisement(ad1);

      const ad2 = Advertisement.create(
        [Trait.create('food', 5)],
        map,
        vector2(25, 25),
        [vector2(25, 25)],
        'items'
      );
      agent.receiveAdvertisement(ad2);

      expect(agent.targetAdvertisement?.traits[0]?.id).toBe('food');
    });

    it('should include current target in debug info', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(10, 10));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;
      agent.addToMap(map);

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.receiveAdvertisement(ad);

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.currentTarget).not.toBeNull();
      expect(debugInfo?.currentTarget?.trait).toBe('food');
      expect(debugInfo?.currentTarget?.position).toEqual({ x: 20, y: 20 });
    });
  });

  describe('Type Discrimination', () => {
    it('should support TypeScript type guards', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const agentData = AgentData.create('Test', 5, 1);
      agentData.desires.addTrait(Trait.create('food', 80));
      agent.data = agentData;

      const item = Item.create('items', vector2(10, 10));
      const itemData = ItemData.create('Test Item', 8, 1);
      item.data = itemData;

      const agentInfo = agent.getDebugInfo();
      const itemInfo = item.getDebugInfo();

      if (agentInfo?.type === 'agent') {
        expect(agentInfo.desires).toBeDefined();
        expect(agentInfo.receivedAdvertisements).toBeDefined();
        expect(agentInfo.lastDecision).toBeDefined();
        expect(agentInfo.currentTarget).toBeDefined();
      } else {
        throw new Error('Expected agent debug info');
      }

      if (itemInfo?.type === 'item') {
        expect(itemInfo.advertisements).toBeDefined();
      } else {
        throw new Error('Expected item debug info');
      }
    });

    it('should distinguish between agent and item types', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const item = Item.create('items', vector2(10, 10));

      const agentInfo = agent.getDebugInfo();
      const itemInfo = item.getDebugInfo();

      expect(agentInfo?.type).toBe('agent');
      expect(itemInfo?.type).toBe('item');
      expect(agentInfo?.type).not.toBe(itemInfo?.type);
    });
  });

  describe('Edge Cases', () => {
    it('should handle agent with no desires', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const agentData = AgentData.create('Test', 5, 1);
      agent.data = agentData;

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo?.desires).toEqual([]);
    });

    it('should handle agent with no stats', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const agentData = AgentData.create('Test', 5, 1);
      agent.data = agentData;

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo?.advertisements).toEqual([]);
    });

    it('should handle advertisement with no traits', () => {
      Debug.enable();
      const map = GridMap.create(100, 100);
      const agent = Agent.create('players', vector2(5, 5));
      agent.addToMap(map);

      const ad = Advertisement.create([], map, vector2(10, 10), [vector2(10, 10)], 'items');

      agent.receiveAdvertisement(ad);

      const debugInfo = agent.getDebugInfo();
      expect(debugInfo?.receivedAdvertisements[0].trait).toBe('unknown');
      expect(debugInfo?.receivedAdvertisements[0].quantity).toBe(0);
    });

    it('should handle agent with no target', () => {
      Debug.enable();
      const agent = Agent.create('players', vector2(5, 5));
      const agentData = AgentData.create('Test', 5, 1);
      agent.data = agentData;

      const debugInfo = agent.getDebugInfo();

      expect(debugInfo?.currentTarget).toBeNull();
    });
  });
});

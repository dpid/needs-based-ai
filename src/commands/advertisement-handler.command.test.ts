import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateMachine, CommandableState } from '@dpid/command-state-machine';
import { AdvertisementHandler } from './advertisement-handler.command';
import { Agent, AgentData, AgentType } from '../agents';
import { Advertisement, AdvertisementType } from '../advertisements';
import { Trait } from '../traits';
import { GridMap } from '../maps';
import { vector2 } from '../common';

describe('AdvertisementHandler', () => {
  let map: ReturnType<typeof GridMap.create>;
  let agent: ReturnType<typeof Agent.create>;
  let agentData: ReturnType<typeof AgentData.create>;

  beforeEach(() => {
    map = GridMap.create(100, 100);
    agent = Agent.create('players', vector2(5, 5));
    agentData = AgentData.create('Test Agent', 10, 1);
    agent.data = agentData;
    agent.addToMap(map);
  });

  describe('Basic Functionality', () => {
    it('should create command via factory method', () => {
      const handler = AdvertisementHandler.create(agent);
      expect(handler).toBeDefined();
    });

    it('should subscribe to onAdvertisementReceived on start', () => {
      const handler = AdvertisementHandler.create(agent);
      const addListenerSpy = vi.spyOn(agent.onAdvertisementReceived, 'addListener');

      handler.start();

      expect(addListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe on stop', () => {
      const handler = AdvertisementHandler.create(agent);
      const removeListenerSpy = vi.spyOn(agent.onAdvertisementReceived, 'removeListener');

      handler.start();
      handler.stop();

      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe on destroy', () => {
      const handler = AdvertisementHandler.create(agent);
      const removeListenerSpy = vi.spyOn(agent.onAdvertisementReceived, 'removeListener');

      handler.start();
      handler.destroy();

      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ranking Calculation', () => {
    it('should calculate rank based on matching traits', () => {
      agentData.desires.addTrait(Trait.create('food', 80));
      agentData.desires.addTrait(Trait.create('health', 50));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10), Trait.create('health', 5)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).not.toBeNull();
      expect(agent.targetAdvertisement?.rank).toBe(10 * 80 + 5 * 50);
    });

    it('should return rank 0 for same-group advertisements', () => {
      agentData.desires.addTrait(Trait.create('food', 80));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'players'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).toBeNull();
    });

    it('should return rank 0 for advertisements with no matching desires', () => {
      agentData.desires.addTrait(Trait.create('food', 80));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('water', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).toBeNull();
    });

    it('should accumulate rank from multiple matching traits', () => {
      agentData.desires.addTrait(Trait.create('food', 10));
      agentData.desires.addTrait(Trait.create('health', 20));
      agentData.desires.addTrait(Trait.create('mana', 30));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [
          Trait.create('food', 5),
          Trait.create('health', 3),
          Trait.create('mana', 2),
        ],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement?.rank).toBe(5 * 10 + 3 * 20 + 2 * 30);
    });
  });

  describe('Target Update Logic', () => {
    it('should set first advertisement with positive rank as target', () => {
      agentData.desires.addTrait(Trait.create('food', 80));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).not.toBeNull();
      expect(agent.targetLocation).toEqual(vector2(10, 10));
    });

    it('should replace target with higher-ranked advertisement', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad1 = Advertisement.create(
        [Trait.create('food', 5)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad1);
      const firstRank = agent.targetAdvertisement?.rank;

      const ad2 = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad2);

      expect(agent.targetAdvertisement?.rank).toBeGreaterThan(firstRank || 0);
      expect(agent.targetLocation).toEqual(vector2(20, 20));
    });

    it('should not replace target with lower-ranked advertisement', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad1 = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad1);
      const firstRank = agent.targetAdvertisement?.rank;
      const firstLocation = agent.targetLocation;

      const ad2 = Advertisement.create(
        [Trait.create('food', 5)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad2);

      expect(agent.targetAdvertisement?.rank).toBe(firstRank);
      expect(agent.targetLocation).toEqual(firstLocation);
    });
  });

  describe('State Transition Integration', () => {
    it('should trigger state transition when targetFoundTransition is provided', () => {
      agentData.desires.addTrait(Trait.create('food', 80));

      const sm = StateMachine.create();
      const seeking = CommandableState.create('seeking');
      const pursuing = CommandableState.create('pursuing');

      seeking.addTransition('targetFound', pursuing);

      let transitionCalled = false;
      agent.handleTransition = (name) => {
        transitionCalled = true;
        sm.handleTransition(name);
      };

      const handler = AdvertisementHandler.create(agent, 'targetFound');
      seeking.addCommand(handler);

      sm.addState(seeking);
      sm.addState(pursuing);
      sm.setState('seeking');

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).not.toBeNull();
      expect(transitionCalled).toBe(true);

      sm.update(0);

      expect(sm.currentState?.stateName).toBe('pursuing');
    });

    it('should not trigger transition when targetFoundTransition is not provided', () => {
      agentData.desires.addTrait(Trait.create('food', 80));

      const sm = StateMachine.create();
      const seeking = CommandableState.create('seeking');

      sm.addState(seeking);
      sm.setState('seeking');

      agent.handleTransition = (name) => sm.handleTransition(name);

      const handler = AdvertisementHandler.create(agent);
      seeking.addCommand(handler);

      sm.update(0.1);

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(sm.currentState?.stateName).toBe('seeking');
    });
  });

  describe('Distance Weighting', () => {
    it('should not apply distance weighting when distanceWeight is 0', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent, undefined, 0);
      handler.start();

      const nearAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(6, 5),
        [vector2(6, 5)],
        'items'
      );

      const farAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(50, 50),
        [vector2(50, 50)],
        'items'
      );

      agent.onAdvertisementReceived.emit(nearAd);
      const nearRank = agent.targetAdvertisement!.rank;

      agent.targetAdvertisement = null;

      agent.onAdvertisementReceived.emit(farAd);
      const farRank = agent.targetAdvertisement!.rank;

      expect(nearRank).toBe(farRank);
    });

    it('should prefer closer advertisements with positive distance weight', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent, undefined, 0.1);
      handler.start();

      const nearAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(6, 5),
        [vector2(6, 5)],
        'items'
      );

      const farAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(50, 50),
        [vector2(50, 50)],
        'items'
      );

      agent.onAdvertisementReceived.emit(nearAd);
      const nearRank = agent.targetAdvertisement!.rank;

      agent.targetAdvertisement = null;

      agent.onAdvertisementReceived.emit(farAd);
      const farRank = agent.targetAdvertisement!.rank;

      expect(nearRank).toBeGreaterThan(farRank);
    });

    it('should still give positive rank to distant advertisements', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent, undefined, 0.5);
      handler.start();

      const farAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(50, 50),
        [vector2(50, 50)],
        'items'
      );

      agent.onAdvertisementReceived.emit(farAd);

      expect(agent.targetAdvertisement?.rank).toBeGreaterThan(0);
    });

    it('should handle zero distance correctly', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent, undefined, 0.1);
      handler.start();

      const sameLocationAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(5, 5),
        [vector2(5, 5)],
        'items'
      );

      agent.onAdvertisementReceived.emit(sameLocationAd);

      expect(agent.targetAdvertisement?.rank).toBe(100);
    });
  });

  describe('Custom Ranking Function', () => {
    it('should use custom ranking function when provided', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const customRanking = (ad: AdvertisementType, ag: AgentType) => {
        return 999;
      };

      const handler = AdvertisementHandler.create(
        agent,
        undefined,
        0,
        customRanking
      );
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement?.rank).toBe(999);
    });

    it('should pass correct parameters to custom ranking function', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      let receivedAd: AdvertisementType | null = null;
      let receivedAgent: AgentType | null = null;

      const customRanking = (ad: AdvertisementType, ag: AgentType) => {
        receivedAd = ad;
        receivedAgent = ag;
        return 100;
      };

      const handler = AdvertisementHandler.create(
        agent,
        undefined,
        0,
        customRanking
      );
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(receivedAd).toBe(ad);
      expect(receivedAgent).toBe(agent);
    });

    it('should override default logic including same-group filtering', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const customRanking = () => {
        return 100;
      };

      const handler = AdvertisementHandler.create(
        agent,
        undefined,
        0,
        customRanking
      );
      handler.start();

      const sameGroupAd = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'players'
      );

      agent.onAdvertisementReceived.emit(sameGroupAd);

      expect(agent.targetAdvertisement?.rank).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle agent with no desires', () => {
      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [Trait.create('food', 10)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).toBeNull();
    });

    it('should handle advertisement with no traits', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad = Advertisement.create(
        [],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad);

      expect(agent.targetAdvertisement).toBeNull();
    });

    it('should handle equal rank advertisements by keeping first target', () => {
      agentData.desires.addTrait(Trait.create('food', 10));

      const handler = AdvertisementHandler.create(agent);
      handler.start();

      const ad1 = Advertisement.create(
        [Trait.create('food', 5)],
        map,
        vector2(10, 10),
        [vector2(10, 10)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad1);
      const firstLocation = agent.targetLocation;

      const ad2 = Advertisement.create(
        [Trait.create('food', 5)],
        map,
        vector2(20, 20),
        [vector2(20, 20)],
        'items'
      );

      agent.onAdvertisementReceived.emit(ad2);

      expect(agent.targetLocation).toEqual(firstLocation);
    });
  });
});

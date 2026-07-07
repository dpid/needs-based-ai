import { describe, it, expect, beforeEach } from 'vitest';
import type { Advertisement as AdvertisementType } from './advertisement.interface';
import { calculateDefaultRank } from './ranking';
import { Advertisement } from './advertisement.class';
import { Agent, AgentData, AgentType } from '../agents';
import { Trait } from '../traits';
import { GridMap } from '../maps';
import { vector2 } from '../common';

describe('calculateDefaultRank', () => {
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

  it('returns 0 for same-group advertisements', () => {
    agentData.desires.addTrait(Trait.create('food', 80));

    const ad = Advertisement.create(
      [Trait.create('food', 10)],
      map,
      vector2(10, 10),
      [vector2(10, 10)],
      'players'
    );

    expect(calculateDefaultRank(ad, agent)).toBe(0);
  });

  it('sums trait quantity times desire quantity across matching traits', () => {
    agentData.desires.addTrait(Trait.create('food', 80));
    agentData.desires.addTrait(Trait.create('health', 50));

    const ad = Advertisement.create(
      [Trait.create('food', 10), Trait.create('health', 5)],
      map,
      vector2(10, 10),
      [vector2(10, 10)],
      'items'
    );

    expect(calculateDefaultRank(ad, agent)).toBe(10 * 80 + 5 * 50);
  });

  it('returns 0 when no advertised traits match a desire', () => {
    agentData.desires.addTrait(Trait.create('food', 80));

    const ad = Advertisement.create(
      [Trait.create('water', 10)],
      map,
      vector2(10, 10),
      [vector2(10, 10)],
      'items'
    );

    expect(calculateDefaultRank(ad, agent)).toBe(0);
  });

  it('does not apply distance falloff when distanceWeight is 0', () => {
    agentData.desires.addTrait(Trait.create('food', 10));

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

    const nearRank = calculateDefaultRank(nearAd, agent, 0);
    const farRank = calculateDefaultRank(farAd, agent, 0);

    expect(nearRank).toBe(farRank);
  });

  it('applies distance falloff when distanceWeight is greater than 0', () => {
    agentData.desires.addTrait(Trait.create('food', 10));

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

    const nearRank = calculateDefaultRank(nearAd, agent, 0.1);
    const farRank = calculateDefaultRank(farAd, agent, 0.1);

    expect(nearRank).toBeGreaterThan(farRank);
  });

  it('skips distance falloff when the agent has no location', () => {
    const freeAgent = Agent.create('players');
    const freeAgentData = AgentData.create('Free Agent', 10, 1);
    freeAgentData.desires.addTrait(Trait.create('food', 10));
    freeAgent.data = freeAgentData;
    (freeAgent as unknown as { location: unknown }).location = undefined;

    const ad = Advertisement.create(
      [Trait.create('food', 10)],
      map,
      vector2(50, 50),
      [vector2(50, 50)],
      'items'
    );

    expect(calculateDefaultRank(ad, freeAgent, 0.1)).toBe(100);
  });

  it('supports composing a custom ranking function around the default', () => {
    agentData.desires.addTrait(Trait.create('food', 10));

    const someModifier = (ad: AdvertisementType): number => {
      return ad.groupId === 'boss' ? 2 : 1;
    };

    const custom = (ad: AdvertisementType, ag: AgentType): number =>
      calculateDefaultRank(ad, ag, 0.5) * someModifier(ad);

    const ad = Advertisement.create(
      [Trait.create('food', 10)],
      map,
      vector2(5, 5),
      [vector2(5, 5)],
      'boss'
    );

    expect(custom(ad, agent)).toBe(calculateDefaultRank(ad, agent, 0.5) * 2);
  });
});

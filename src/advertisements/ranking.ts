import type { Advertisement } from './advertisement.interface';
import type { AgentType as Agent } from '../agents';
import { vector2Distance } from '../common';

export function calculateDefaultRank(
  advertisement: Advertisement,
  agent: Agent,
  distanceWeight: number = 0
): number {
  if (advertisement.groupId === agent.groupId) {
    return 0;
  }

  let rank = 0;
  for (const adTrait of advertisement.traits) {
    const desire = agent.data.desires.getTrait(adTrait.id);
    if (desire) {
      rank += adTrait.quantity * desire.quantity;
    }
  }

  if (distanceWeight > 0 && agent.location) {
    const distance = vector2Distance(agent.location, advertisement.location);
    rank = rank * (1 / (1 + distance * distanceWeight));
  }

  return rank;
}

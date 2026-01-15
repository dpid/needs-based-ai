import { AbstractCommand } from '@dpid/command-state-machine';
import type { AgentType as Agent } from '../agents';
import type { AdvertisementType as Advertisement } from '../advertisements';
import { RankedAdvertisement } from '../advertisements';
import { vector2Distance } from '../common';

export class AdvertisementHandler extends AbstractCommand {
  private readonly handleAdvertisement: (ad: Advertisement) => void;

  private constructor(
    private readonly agent: Agent,
    private readonly targetFoundTransition?: string,
    private readonly distanceWeight: number = 0,
    private readonly customRankingFunction?: (
      ad: Advertisement,
      agent: Agent
    ) => number
  ) {
    super();
    this.handleAdvertisement = this.onAdvertisementReceived.bind(this);
  }

  protected onStart(): void {
    this.agent.onAdvertisementReceived.addListener(this.handleAdvertisement);
  }

  protected onStop(): void {
    this.agent.onAdvertisementReceived.removeListener(this.handleAdvertisement);
  }

  protected onDestroy(): void {
    this.agent.onAdvertisementReceived.removeListener(this.handleAdvertisement);
  }

  private onAdvertisementReceived(advertisement: Advertisement): void {
    const rank = this.calculateRank(advertisement);

    if (rank <= 0) return;

    if (this.isRankGreaterThanCurrentTarget(rank)) {
      const rankedAd = RankedAdvertisement.create(advertisement, rank);
      this.agent.targetAdvertisement = rankedAd;
      this.agent.targetLocation = advertisement.location;

      if (this.targetFoundTransition && this.targetFoundTransition.length > 0) {
        this.agent.handleTransition(this.targetFoundTransition);
      }
    }
  }

  private calculateRank(advertisement: Advertisement): number {
    if (this.customRankingFunction) {
      return this.customRankingFunction(advertisement, this.agent);
    }

    if (advertisement.groupId === this.agent.groupId) {
      return 0;
    }

    let rank = 0;
    for (const adTrait of advertisement.traits) {
      const desire = this.agent.data.desires.getTrait(adTrait.id);
      if (desire) {
        rank += adTrait.quantity * desire.quantity;
      }
    }

    if (this.distanceWeight > 0 && this.agent.location) {
      const distance = vector2Distance(this.agent.location, advertisement.location);
      rank = rank * (1 / (1 + distance * this.distanceWeight));
    }

    return rank;
  }

  private isRankGreaterThanCurrentTarget(rank: number): boolean {
    if (this.agent.targetAdvertisement === null) {
      return true;
    }
    return rank > this.agent.targetAdvertisement.rank;
  }

  static create(
    agent: Agent,
    targetFoundTransition?: string,
    distanceWeight: number = 0,
    customRankingFunction?: (ad: Advertisement, agent: Agent) => number
  ): AdvertisementHandler {
    return new AdvertisementHandler(
      agent,
      targetFoundTransition,
      distanceWeight,
      customRankingFunction
    );
  }
}

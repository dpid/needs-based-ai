import { describe, it, expect, beforeEach } from 'vitest';
import { StateMachine, CommandableState } from '@dpid/command-state-machine';
import { IncrementTrait } from './increment-trait.command';
import { TraitCollection, Trait } from '../traits';

describe('IncrementTrait', () => {
  let collection: ReturnType<typeof TraitCollection.create>;

  beforeEach(() => {
    collection = TraitCollection.create();
  });

  describe('Basic Functionality', () => {
    it('should create command via factory method', () => {
      const command = IncrementTrait.create(collection, 'health', 10);
      expect(command).toBeDefined();
    });

    it('should be added to state machine and start successfully', () => {
      collection.addTrait(Trait.create('health', 50));
      const command = IncrementTrait.create(collection, 'health', 10);

      const sm = StateMachine.create();
      const state = CommandableState.create('test');
      state.addCommand(command);
      sm.addState(state);
      sm.setState('test');

      expect(sm.currentState?.stateName).toBe('test');
    });
  });

  describe('Increment Behavior', () => {
    it('should increase trait quantity with positive rate', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(60);
    });

    it('should work with fractional dt (60fps frame time)', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(0.016);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBeCloseTo(50.16, 5);
    });

    it('should accumulate correctly over multiple updates', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      for (let i = 0; i < 5; i++) {
        command.update(0.1);
      }

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBeCloseTo(55, 5);
    });
  });

  describe('Decrement Behavior', () => {
    it('should decrease trait quantity with negative rate', () => {
      collection.addTrait(Trait.create('food', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'food', -10);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('food');
      expect(trait?.quantity).toBe(40);
    });

    it('should work with fractional dt (60fps frame time)', () => {
      collection.addTrait(Trait.create('food', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'food', -10);

      command.start();
      command.update(0.016);

      const trait = collection.getTrait('food');
      expect(trait?.quantity).toBeCloseTo(49.84, 5);
    });
  });

  describe('Bounds Clamping', () => {
    it('should respect max bound when incrementing', () => {
      collection.addTrait(Trait.create('health', 95, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(100);
    });

    it('should respect min bound when decrementing', () => {
      collection.addTrait(Trait.create('health', 5, 0, 100));
      const command = IncrementTrait.create(collection, 'health', -10);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(0);
    });

    it('should stay at max bound over multiple updates', () => {
      collection.addTrait(Trait.create('health', 98, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(0.5);
      command.update(0.5);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(100);
    });
  });

  describe('Missing Trait Handling', () => {
    it('should handle non-existent trait ID gracefully', () => {
      const command = IncrementTrait.create(collection, 'nonexistent', 10);

      command.start();
      expect(() => command.update(1.0)).not.toThrow();
      expect(() => command.update(1.0)).not.toThrow();
      expect(() => command.update(1.0)).not.toThrow();
    });

    it('should continue working after trait is removed', () => {
      const trait = Trait.create('health', 50, 0, 100);
      collection.addTrait(trait);
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(1.0);
      expect(collection.getTrait('health')?.quantity).toBe(60);

      collection.removeTrait(trait);
      expect(() => command.update(1.0)).not.toThrow();
    });
  });

  describe('Integration with State Machine', () => {
    it('should update trait when attached to active state', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      const sm = StateMachine.create();
      const state = CommandableState.create('active');
      state.addCommand(command);
      sm.addState(state);
      sm.setState('active');

      sm.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(60);
    });

    it('should stop updating when state is inactive', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      const sm = StateMachine.create();
      const stateA = CommandableState.create('stateA');
      const stateB = CommandableState.create('stateB');
      stateA.addCommand(command);

      sm.addState(stateA);
      sm.addState(stateB);
      sm.setState('stateA');

      sm.update(1.0);
      expect(collection.getTrait('health')?.quantity).toBe(60);

      sm.setState('stateB');
      sm.update(1.0);
      expect(collection.getTrait('health')?.quantity).toBe(60);
    });

    it('should stack effects from multiple IncrementTrait commands', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command1 = IncrementTrait.create(collection, 'health', 5);
      const command2 = IncrementTrait.create(collection, 'health', 3);

      command1.start();
      command2.start();

      command1.update(1.0);
      command2.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(58);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero increment rate', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 0);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(50);
    });

    it('should handle very large dt values', () => {
      collection.addTrait(Trait.create('health', 0, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 5);

      command.start();
      command.update(10.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(50);
    });

    it('should clamp to max with very large dt', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 5);

      command.start();
      command.update(20.0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(100);
    });

    it('should work with negative bounds', () => {
      collection.addTrait(Trait.create('temperature', 0, -100, 100));
      const command = IncrementTrait.create(collection, 'temperature', -10);

      command.start();
      command.update(1.0);

      const trait = collection.getTrait('temperature');
      expect(trait?.quantity).toBe(-10);
    });

    it('should handle zero dt', () => {
      collection.addTrait(Trait.create('health', 50, 0, 100));
      const command = IncrementTrait.create(collection, 'health', 10);

      command.start();
      command.update(0);

      const trait = collection.getTrait('health');
      expect(trait?.quantity).toBe(50);
    });
  });
});

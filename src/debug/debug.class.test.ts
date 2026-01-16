import { describe, it, expect, beforeEach } from 'vitest';
import { Debug } from './debug.class';

describe('Debug', () => {
  beforeEach(() => {
    Debug.disable();
  });

  it('should start disabled by default', () => {
    expect(Debug.isEnabled).toBe(false);
  });

  it('should enable debug mode', () => {
    Debug.enable();
    expect(Debug.isEnabled).toBe(true);
  });

  it('should disable debug mode', () => {
    Debug.enable();
    Debug.disable();
    expect(Debug.isEnabled).toBe(false);
  });

  it('should handle multiple enable/disable cycles', () => {
    Debug.enable();
    expect(Debug.isEnabled).toBe(true);

    Debug.disable();
    expect(Debug.isEnabled).toBe(false);

    Debug.enable();
    expect(Debug.isEnabled).toBe(true);

    Debug.disable();
    expect(Debug.isEnabled).toBe(false);
  });

  it('should maintain state across multiple enable calls', () => {
    Debug.enable();
    Debug.enable();
    expect(Debug.isEnabled).toBe(true);
  });

  it('should maintain state across multiple disable calls', () => {
    Debug.disable();
    Debug.disable();
    expect(Debug.isEnabled).toBe(false);
  });
});

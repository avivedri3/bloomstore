import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition } from './index.ts';

describe('order state machine', () => {
  it('allows pending_payment to confirmed', () => {
    assert.equal(canTransition('pending_payment', 'confirmed'), true);
  });

  it('blocks shipped to cancelled', () => {
    assert.equal(canTransition('shipped', 'cancelled'), false);
  });

  it('blocks delivered to any other status', () => {
    assert.equal(canTransition('delivered', 'cancelled'), false);
  });
});

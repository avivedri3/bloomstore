import { canTransition } from './index';

describe('order state machine', () => {
  it('allows pending_payment to confirmed', () => {
    expect(canTransition('pending_payment', 'confirmed')).toBe(true);
  });

  it('blocks shipped to cancelled', () => {
    expect(canTransition('shipped', 'cancelled')).toBe(false);
  });

  it('blocks delivered to any other status', () => {
    expect(canTransition('delivered', 'cancelled')).toBe(false);
  });
});

import { canTransition, MAX_FAILED_LOGINS } from '@bloomstore/shared-types';
import { fail, ok } from './common/http';

describe('http envelope', () => {
  it('wraps success payloads', () => {
    expect(ok({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
  });

  it('wraps errors', () => {
    expect(fail('ACCOUNT_LOCKED', 'locked').error.code).toBe('ACCOUNT_LOCKED');
  });
});

describe('order transitions used by OrdersService', () => {
  it('allows cancel before shipped', () => {
    expect(canTransition('processing', 'cancelled')).toBe(true);
    expect(canTransition('shipped', 'cancelled')).toBe(false);
  });
});

describe('lockout policy', () => {
  it('locks after five failures', () => {
    expect(MAX_FAILED_LOGINS).toBe(5);
  });
});

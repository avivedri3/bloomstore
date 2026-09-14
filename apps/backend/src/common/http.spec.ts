import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, MAX_FAILED_LOGINS } from '@bloomstore/shared-types';
import { fail, ok } from './http.ts';

describe('http envelope', () => {
  it('wraps success payloads', () => {
    assert.deepEqual(ok({ id: 1 }), { success: true, data: { id: 1 } });
  });

  it('wraps errors', () => {
    assert.equal(fail('ACCOUNT_LOCKED', 'locked').error.code, 'ACCOUNT_LOCKED');
  });
});

describe('order transitions used by OrdersService', () => {
  it('allows cancel before shipped', () => {
    assert.equal(canTransition('processing', 'cancelled'), true);
    assert.equal(canTransition('shipped', 'cancelled'), false);
  });
});

describe('lockout policy', () => {
  it('locks after five failures', () => {
    assert.equal(MAX_FAILED_LOGINS, 5);
  });
});

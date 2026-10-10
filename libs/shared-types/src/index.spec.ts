import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, contactMessageSchema, pageViewSchema, stockAlertSchema } from './index.ts';

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

describe('contact message', () => {
  it('accepts a trimmed inquiry', () => {
    const parsed = contactMessageSchema.parse({
      fullName: '  Maya Cohen  ',
      email: 'maya@bloomstore.com',
      message: '  I would like a wedding bouquet for June.  ',
    });
    assert.equal(parsed.fullName, 'Maya Cohen');
    assert.equal(parsed.message, 'I would like a wedding bouquet for June.');
  });

  it('rejects a short message', () => {
    assert.equal(
      contactMessageSchema.safeParse({
        fullName: 'Maya',
        email: 'maya@bloomstore.com',
        message: 'Hi',
      }).success,
      false,
    );
  });
});

describe('stock alert signup', () => {
  it('accepts a trimmed email', () => {
    const parsed = stockAlertSchema.parse({ email: '  Maya@BloomStore.com  ' });
    assert.equal(parsed.email, 'Maya@BloomStore.com');
  });

  it('rejects an invalid email', () => {
    assert.equal(stockAlertSchema.safeParse({ email: 'not-an-email' }).success, false);
  });
});

describe('page view', () => {
  it('accepts a catalog path and visitor id', () => {
    const parsed = pageViewSchema.parse({
      path: '/products/507f1f77bcf86cd799439011',
      visitorId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    });
    assert.equal(parsed.path, '/products/507f1f77bcf86cd799439011');
  });

  it('rejects a path that leaves the store', () => {
    assert.equal(
      pageViewSchema.safeParse({ path: 'https://example.com', visitorId: 'visitor-12345678' }).success,
      false,
    );
  });
});

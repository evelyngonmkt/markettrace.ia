import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from '@markettrace/shared';

describe('MarketTrace API foundation', () => {
  it('keeps the health contract explicit before domain services exist', () => {
    const response = healthResponseSchema.parse({
      status: 'ok',
      service: 'markettrace-api',
      version: '0.1.0',
    });

    expect(response.service).toBe('markettrace-api');
  });
});

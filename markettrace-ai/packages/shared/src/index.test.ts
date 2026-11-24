import { describe, expect, it } from 'vitest';

import { healthResponseSchema, productRoutes } from './index';

describe('shared contracts', () => {
  it('validates the API health response shape', () => {
    const parsed = healthResponseSchema.parse({
      status: 'ok',
      service: 'markettrace-api',
      version: '0.1.0',
    });

    expect(parsed.status).toBe('ok');
  });

  it('keeps the product navigation in one shared contract', () => {
    expect(productRoutes.map((route) => route.path)).toContain('/intelligence');
    expect(productRoutes).toHaveLength(7);
  });
});

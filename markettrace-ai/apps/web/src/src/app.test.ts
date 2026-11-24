import { describe, expect, it } from 'vitest';

import { productRoutes } from '@markettrace/shared';

describe('MarketTrace web foundation', () => {
  it('exposes the core product areas in the shared navigation contract', () => {
    expect(productRoutes.map((route) => route.label)).toEqual([
      'Dashboard',
      'Inteligência',
      'Pesquisa de mercado',
      'Memória empresarial',
      'Relatórios',
      'Empresa e equipe',
      'Configurações',
    ]);
  });
});

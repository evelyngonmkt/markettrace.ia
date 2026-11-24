import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('markettrace-api'),
  version: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const productRoutes = [
  { path: '/', label: 'Dashboard' },
  { path: '/intelligence', label: 'Inteligência' },
  { path: '/research', label: 'Pesquisa de mercado' },
  { path: '/memory', label: 'Memória empresarial' },
  { path: '/reports', label: 'Relatórios' },
  { path: '/company', label: 'Empresa e equipe' },
  { path: '/settings', label: 'Configurações' },
] as const;

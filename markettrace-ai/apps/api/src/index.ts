import cors from '@fastify/cors';
import Fastify from 'fastify';

import { healthResponseSchema } from '@markettrace/shared';

const port = Number(process.env.API_PORT ?? 3333);
const host = process.env.API_HOST ?? '0.0.0.0';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get('/health', async () => {
  return healthResponseSchema.parse({
    status: 'ok',
    service: 'markettrace-api',
    version: '0.1.0',
  });
});

app.get('/api/status', async () => ({
  service: 'markettrace-api',
  stage: 'foundation',
  note: 'Domain features are intentionally not connected in Entrega 1.',
}));

await app.listen({ port, host });

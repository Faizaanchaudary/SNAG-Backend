import type { CorsOptions } from 'cors';
import type { Config } from './index.js';

type CorsCfg = Pick<Config, 'nodeEnv' | 'corsOrigins'>;

/**
 * Dynamic origin check: allowlisted browser origins; allow no Origin (mobile
 * native, curl, server-to-server); in non-production, an empty allowlist
 * mirrors any origin for local development only.
 */
export function createCorsOriginDelegate(cfg: CorsCfg): CorsOptions['origin'] {
  const allowed = new Set(cfg.corsOrigins);
  const isProd = cfg.nodeEnv === 'production';

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (!isProd && allowed.size === 0) {
      callback(null, true);
      return;
    }
    if (allowed.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
}

export function createExpressCorsOptions(cfg: CorsCfg): CorsOptions {
  return {
    origin: createCorsOriginDelegate(cfg),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
  };
}

export function createSocketIoCorsOptions(cfg: CorsCfg) {
  return {
    origin: createCorsOriginDelegate(cfg),
    methods: ['GET', 'POST'],
    credentials: true,
  };
}

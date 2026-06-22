"use strict";
/**
 * Sentry initialisation — stub for Phase 1.
 *
 * To activate:
 *   1. Add SENTRY_DSN=https://xxx@sentry.io/xxx to apps/api/.env
 *   2. npm install @sentry/nestjs @sentry/profiling-node
 *   3. Uncomment the Sentry.init() call below
 *
 * The file is imported at the very top of main.ts (before any other imports).
 */
Object.defineProperty(exports, "__esModule", { value: true });
// import * as Sentry from '@sentry/nestjs';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
const dsn = process.env.SENTRY_DSN;
if (dsn) {
    // Sentry.init({
    //   dsn,
    //   integrations: [nodeProfilingIntegration()],
    //   tracesSampleRate: 1.0,
    //   profilesSampleRate: 1.0,
    // });
    console.log('[Sentry] DSN found — activate by uncommenting Sentry.init() in instrument.ts');
}
else {
    // No DSN configured — Sentry is silent. This is expected in development.
}
//# sourceMappingURL=instrument.js.map
-- Daily share of spam-gate model calls per client network
-- (src/lib/server/link-gate/budget.ts, reserveNetworkCall).
-- network is a SHA-256 hash of the network (IPv4 address or IPv6 /64) with
-- the daily salt from src/lib/server/creation-limits.ts, which expires after
-- two days, so a row cannot be linked to an address once its salt is gone.
-- Rows from earlier days are deleted on each network's first call of a day.
--
-- Apply this file alone; `bun run db:migrate:prod` re-runs every migration:
--   bunx wrangler d1 execute nah-tools-db --remote --file=migrations/0006_link_gate_network_budget.sql
-- If --file fails under wrangler OAuth, run the statement with --command.
-- It is safe to run twice.
CREATE TABLE IF NOT EXISTS link_gate_network_budget (
  day TEXT NOT NULL,
  network TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, network)
);

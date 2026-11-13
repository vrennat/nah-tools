-- Daily count of spam-gate model calls (src/lib/server/link-gate/budget.ts).
-- One row per UTC day. Each model call reserves one unit with a conditional
-- UPDATE, so the count never passes the cap.
-- Numbered after 0004 (pull request #63) but independent of it.
--
-- Apply this file alone; `bun run db:migrate:prod` re-runs every migration:
--   bunx wrangler d1 execute nah-tools-db --remote --file=migrations/0005_link_gate_budget.sql
-- If --file fails under wrangler OAuth (it has returned 401), use --command
-- with the statement below; it is safe to run twice.
CREATE TABLE IF NOT EXISTS link_gate_budget (
  day TEXT PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0
);

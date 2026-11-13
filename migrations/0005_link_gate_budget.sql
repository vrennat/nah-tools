-- Daily count of spam-gate model calls (src/lib/server/link-gate/budget.ts).
-- One row per UTC day; incremented atomically with INSERT ... ON CONFLICT.
-- Numbered after 0004 (pull request #63) but independent of it.
CREATE TABLE IF NOT EXISTS link_gate_budget (
  day TEXT PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0
);

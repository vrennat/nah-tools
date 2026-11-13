-- Why a redirect was disabled by the service rather than by its owner.
-- NULL: not disabled by the service. 'destination_flagged': a background
-- recheck by the link spam gate blocked the destination after the link was
-- created (see src/lib/server/link-gate/route.ts, scheduleRecheck).
ALTER TABLE redirects ADD COLUMN disabled_reason TEXT;

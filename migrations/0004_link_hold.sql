-- Spam gate hold state for go.nah.tools redirects.
-- NULL: not held. Otherwise why the link is held: 'suspicious' (the model
-- flagged the destination), 'redirect-limit' (too many redirects to check),
-- 'unchecked' (the model was unavailable; rechecked in the background) or
-- 'blocked' (a recheck found the destination is a scam).
-- A held link is also stored with is_active = 0, so a redirect worker that
-- does not know this column still refuses to redirect it.
ALTER TABLE redirects ADD COLUMN hold_reason TEXT;

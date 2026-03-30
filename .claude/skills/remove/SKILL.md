---
name: remove
description: Remove your personal data from data brokers using the nah.tools MCP server. Use when the user wants to opt out of data brokers, remove their info from people-search sites, or generate deletion emails.
---

# Data Broker Removal

Guide the user through removing their personal data from data brokers using the nah.tools MCP tools.

## Prerequisites

The nah.tools MCP server must be connected. The tools are prefixed `mcp__claude_ai_nah__` (or similar depending on the client). If the tools aren't available, tell the user to add the MCP server:

```json
{
  "mcpServers": {
    "nah-tools": {
      "url": "https://nah.tools/mcp"
    }
  }
}
```

## Workflow

### Step 1: Collect user info

Ask the user for the minimum required information:
- First name, last name
- Email address
- State (US state abbreviation, or "outside-us" for GDPR)

Optional but helpful: street address, city, ZIP, phone number. More info = more accurate broker matching and email generation. Don't push for optional fields if the user seems uncomfortable — this is a privacy tool.

### Step 2: Get the removal plan

Call `get_removal_plan` to get a prioritized, deduplicated list. Share the summary with the user:
- Total brokers to address
- Estimated total time
- Which opt-outs cover multiple subsidiaries (e.g., Intelius covers TruthFinder, Instant Checkmate, etc.)

### Step 3: Execute removals by priority

Work through brokers in priority order: crucial > high > medium > low.

**For each broker:**

1. Call `get_broker` to get full opt-out steps
2. Call `get_broker_search_url` to check if the user is listed (if the broker has a search page)
3. Based on the opt-out method:
   - **Email brokers:** Call `generate_removal_email` to get a ready-to-send email with mailto link
   - **Form brokers:** Walk the user through the form steps. If you have browser access, navigate to the opt-out page and assist with form submission
   - **Phone/mail brokers:** Provide the instructions and flag that these require manual action

**With browser access (Claude Desktop + computer use):**
- Open search URLs to verify the user's listing
- Navigate to opt-out pages
- Assist with form fields
- Stop at CAPTCHAs, email verification, phone verification, and government ID requirements — tell the user what to do

**Without browser access (Claude.ai, API):**
- Use `generate_all_emails` to batch-generate all email-method deletion requests at once
- Provide mailto links the user can click to send
- Give step-by-step instructions for form-based opt-outs
- Open search URLs for the user to check manually

### Step 4: Track progress

Keep a running list of completed vs remaining brokers as you work through them. After finishing, remind the user:
- Some brokers relist data after 60-180 days — suggest a calendar reminder
- The `get_broker` response includes `relistsAfterDays` for each broker
- They can re-run this process periodically

## Important rules

- **Never submit user information anywhere without explicit confirmation.** Always show what you're about to do and ask before acting.
- **Be honest about limitations.** CAPTCHAs, email verification, and phone verification require human involvement. Don't pretend you can handle these.
- **Deduplicate.** The removal plan already handles parent/subsidiary deduplication. Don't make the user opt out of a subsidiary if the parent is already covered.
- **Flag difficult brokers.** Some require government ID (Epsilon) or phone calls (certain background check companies). Call these out upfront so the user can decide whether to tackle them.

## Batch email shortcut

If the user just wants to send all the emails and doesn't need browser automation, use `generate_all_emails` with their info. It returns every email-method broker's deletion request in one call. Present the mailto links grouped by priority.

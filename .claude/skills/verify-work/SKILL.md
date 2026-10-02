---
name: verify-work
description: Run a complete check of your own work before reporting back. Use at the end of EVERY task (code, sites, documents, data, config, deliverables) and before saying anything is "done", "working" or "fixed".
---

# Verify work before reporting back

Never hand work back on the strength of "it should work". Prove it, then report what you proved and what you did not.

## 1. Re-read the request
List every explicit requirement (and the "must not" rules) from the user's message. Tick each against the actual output, not against your memory of it.

## 2. Run it for real
- **Code:** typecheck, lint, tests, and a production build. Then actually *run* it and exercise the feature, not just compile it.
- **Web/UI:** load it in a real browser (Playwright/Chromium is preinstalled), check console errors and failed requests, take screenshots at every key state, desktop **and** mobile, and *look at them*. Click the interactive things. Test keyboard, reduced motion and empty/error states.
- **Documents/data:** open the produced file, check numbers, formulas, links, formatting and that nothing is a placeholder you forgot.
- **Config/infra:** confirm the change took effect (read it back, hit the endpoint), not just that the command exited 0.

## 3. Check for what you changed *after* the last test
Any edit after the last verification invalidates it. Re-run the checks on the final state, rebuild, restart stale servers (check ports for old processes serving old builds).

## 4. Hunt for your own mistakes
Re-read the diff adversarially: leftover debug code, hard-coded values, invented facts/statistics/testimonials, broken edge cases, overlapping or unreadable text, things that only work on your machine.

## 5. Fix, then re-verify
Fix every issue found and repeat steps 2-4. Do not report with known, fixable defects.

## 6. Report honestly
State what you verified and how, what you could not verify (and why), and anything the user must supply or decide. Never claim a check you did not run; never hide a failure.

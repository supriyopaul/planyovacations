# Strategy 2 – Automated Suggestion Engine: Test Plan

This document defines practical and advanced test cases to validate the Automated Suggestion Engine described in `strategies/strategy2.md` (Section 5). It explains how to set up the calendar, what to observe in the UI, and the expected conclusions. No datasets are created here; use the sidebar brushes (or JSON events) to set up each scenario.

Notes
- Optional Holidays are workdays until taken (not anchors), but are high-viability workdays and receive a higher scoring bonus than Slow Periods.
- Busy Period days disqualify candidates that include them (unless fallback mode when no results are possible).
- Temporal spread: After scoring, the engine alternates picks from the start and end of the range to avoid clustering.

How to Use This Test Plan
1. Configure visible date range, weekend/off-days, and leave style in the UI sidebar.
2. Mark events using the brushes:
   - Public Holiday (blue), Optional Holiday (yellow), Planned Leave (teal), Busy Period (red), Slow Period (orange).
   - Alternatively, load JSON with `type` ∈ {`holiday`, `optional_holiday`, `planned_leave`, `busy_period`, `slow_period`}.
3. Trigger generation (e.g., open Suggestions list). Verify purple overlays for each suggestion and the explanation (rationale, leave days, total span, efficiency).
4. Pass Criteria: All observations in each case match the Expected Results and Conclusions.

General Checks for Every Test
- No suggested date overlaps a Busy Period (unless explicitly in fallback case).
- Optional Holiday days can appear inside suggestions as workdays and boost ranking; they never act as anchors by themselves.
- Temporal spread yields a left-right alternation among final Top K suggestions.
- Leave balance guardrails: suggestions never require more leave days than `remaining`.

---

## Calendar 1 — Empty Baseline (No Events)
Purpose: Validate anchors=weekends only, edge extenders, gap fillers, style modulation, and spread.

Setup
- No events at all. Off-days: Saturday (6) and Sunday (0). Leave style: test both `short` and `long`.

Expected Results
- Short style: Top suggestions are 1-day edge extenders adjacent to weekends (Fridays or Mondays), high efficiency per day.
- Long style: The engine proposes 5-day gap fillers (Mon–Fri) between two weekends to create 9-day stretches; efficiency lower per day but better total span. Edge extenders may still appear but rank lower than full-week suggestions.
- Temporal spread: Picks come from early and late parts of the year alternately.

Conclusions
- With only weekends as anchors, the engine still produces useful suggestions (edges and gaps). Style clearly affects ranking.

---

## Calendar 2 — Bridges, Gaps, Edge Extenders Together
Purpose: Validate all archetypes in one setup, including disqualification by busy periods.

Setup
- Mark a Tuesday Public Holiday in Month A.
- Mark a Thursday Public Holiday in Month B.
- Mark a Planned Leave block (Mon–Wed) in Month C.
- Mark a Busy Period covering a candidate Friday near Month A holiday.
- Mark a Slow Period spanning a week near Month B holiday.

Expected Results
- Bridge (Tue Holiday): Suggest taking the preceding Monday if not Busy. If Busy, the candidate is dropped.
- Bridge (Thu Holiday): Suggest taking the following Friday; slow days in the span improve ranking but do not create anchors.
- Gap Fillers: Identify 1–5 day gaps between weekend↔holiday or holiday↔planned-leave; propose filling the gap.
- Edge Extenders: 1–2 day suggestions before/after anchor blocks where a second anchor is missing.
- No candidate includes Busy Period days.
- Spread alternates between early and late months when picking Top K.

Conclusions
- All archetypes appear and are correctly filtered/boosted. Busy Periods prune candidates; Slow Periods help ranking.

---

## Calendar 3 — Only Optional Holidays
Purpose: Validate that Optional Holidays are workdays (not anchors) but increase candidate ranking.

Setup
- Mark several Optional Holidays (yellow) spaced across the year. No Public Holidays, no Planned Leave, no Busy Period.

Expected Results
- Suggestions can include those Optional Holiday days as part of edge/gap patterns relative to weekends.
- Optional Holiday days do not create anchor blocks; they are still counted as leave days if suggested.
- Candidates with Optional Holiday days rank above otherwise identical candidates without them (optional bonus > slow bonus).

Conclusions
- Optional Holidays behave as designed: workdays with higher viability but not anchors.

---

## Calendar 4 — Heavy Busy Periods
Purpose: Ensure candidates intersecting Busy are dropped and fallback behavior works.

Setup
- Mark long Busy Periods across most of Month D.
- No Holidays. Add a Slow Period not overlapping Busy.

Expected Results
- Candidates inside Busy are dropped.
- Engine proposes suggestions around the Slow Period only.
- If zero results remain, engine may offer single-day fallback suggestions outside the busiest clusters.

Conclusions
- Busy periods act as hard constraints; fallback provides minimal value when constraints are tight.

---

## Calendar 5 — Low Leave Balance (<= 2)
Purpose: Early filtering by leave balance and bridge-first preference.

Setup
- Set remaining balance to 1 or 2.
- Include a Tuesday or Thursday Public Holiday near a weekend.

Expected Results
- Only 1–2 day suggestions are generated.
- Bridge days (single-day) are prioritized.
- No suggestion exceeds the remaining balance.

Conclusions
- Guardrails are respected and the results are still high value.

---

## Calendar 6 — Large Balance + Long Style
Purpose: Validate long-chain constructor and chaining across multiple anchors.

Setup
- Style: `long`. Remaining >= 15.
- Multiple Holidays spread over a two-week window with weekends on both ends. Add a Slow Period covering the middle.

Expected Results
- Long-chain suggestions that join multiple anchors into 10–16 day total spans, proposing 4–7 leave days depending on layout.
- High-length and efficiency scores; optional and slow days inside the proposed leave improve rank.

Conclusions
- Long chain generation and scoring produce extended vacations properly.

---

## Calendar 7 — Temporal Spread Selection
Purpose: Ensure alternating picks from timeline ends to avoid clustering.

Setup
- Create multiple high-scoring opportunities in Q1 and Q4 (e.g., bridges + gaps). Minimal opportunities in Q2/Q3.

Expected Results
- After scoring, final Top K alternates early (Q1) → late (Q4) → early → late, skipping overlapping picks.
- If K cannot be achieved due to conflicts, the remainder are best-available regardless of side.

Conclusions
- Alternating end selection works and remains robust under conflicts.

---

## Calendar 8 — Planned Leave Adjacent to Holiday
Purpose: Validate gap detection between a Planned Leave block and a Holiday.

Setup
- Planned Leave: Mon–Tue. Public Holiday: Thu in the same week.

Expected Results
- Gap Fillers suggest Wed (1 day) to connect the leave to the holiday, producing a 5-day stretch with the weekend.

Conclusions
- Gap logic works for planned-leave ↔ holiday adjacency.

---

## Calendar 9 — Slow Period Expansion
Purpose: Validate expansions inside Slow Periods bordered by an anchor.

Setup
- Long Slow Period spanning 10+ days. Weekend anchor at one end.

Expected Results
- 2–5 day expansions inside the Slow Period adjacent to the weekend anchor, with rationale indicating slow-period advantage.

Conclusions
- Slow period amplifiers generate sensible candidates.

---

## Calendar 10 — Overlap De-Duplication & Merge
Purpose: Ensure overlapping candidates are de-duplicated and adjacent candidates of same archetype are merged.

Setup
- Construct two similar gap candidates sharing >50% of their dates, plus an adjacent 1-day edge candidate of the same archetype.

Expected Results
- Lower-scoring overlapping candidate is discarded.
- Adjacent same-archetype candidates merge when efficiency improves without exceeding balance.

Conclusions
- Overlap and merge rules enforce a clean, non-redundant suggestion set.

---

# Scenario Validation Using Provided Samples
The following describe expectations if you load the JSON formats similar to `test-calendar1.json`, `test-calendar2.json`, `test-calendar3.json` (do not modify files here; these are reference patterns).

Sample A (US-like, long style, remaining=8) – akin to `test-calendar1.json`
- Notable region: Thanksgiving week
  - Planned Leave: Mon–Wed (Nov 24–26)
  - Holiday: Thu (Nov 27)
  - Optional Holiday: Fri (Nov 28)
- Expected Top Suggestion (short/mixed/long): Take Fri Nov 28 (1 day).
  - Rationale: Extends Mon–Thu (with holiday) to a Fri + weekend stretch; optional-day bonus increases score; very high efficiency.
- Additional: Independence Day and Summer vacation may limit mid-year suggestions due to existing planned leave.

Sample B (JP-like, long style, remaining=15) – akin to `test-calendar2.json`
- Golden Week window:
  - Holiday: Tue Apr 29; Holidays: Sat–Mon May 3–5; Optional: Fri May 2
  - Expected: Suggest Wed–Fri Apr 30–May 2 (3 days) to create a long continuous block spanning two weekends and holidays; optional Fri boosts ranking.
- Summer: Busy (mid-July) followed by Slow (late July–Aug) and a one-day Marine Day (Mon Jul 21)
  - Expected: Drop candidates intersecting the mid-July busy period; suggest short expansions inside Slow after Jul 22; long-style may chain into early Aug where feasible.

Sample C (JP-like, short style, remaining=15) – akin to `test-calendar3.json`
- Marine Day (Mon Jul 21) and Busy Period (Jul 14–18)
  - Expected: Bridge/edge on Fri Jul 18 is disqualified (Busy). Short-style may suggest Tue Jul 22 to extend the holiday into the Slow Period start, or Fri Jul 25 as an edge near Slow.
- Optional holidays appear as 1-day high-viability workdays; they are never anchors but rank higher than normal workdays.

---

# How to Confirm Each Part Works
- Bridges: Find a Tue or Thu holiday near a weekend. Expect a single-day suggestion (Mon or Fri respectively) unless Busy. Check rationale mentions turning 3→4 days, etc.
- Gap Fillers: Create a 1–5 day work gap between two anchors (weekend↔holiday or holiday↔planned). Expect a multi-day suggestion covering the gap.
- Edge Extenders: With only one anchor on a side, expect 1–2 day suggestions adjacent to the anchor.
- Slow/Optional Bonuses: Create two otherwise identical candidates, one with a Slow day and one with an Optional Holiday day. The optional-containing candidate should rank higher.
- Busy Filter: Place Busy over a proposed day; the candidate must disappear (unless testing fallback).
- Leave Balance: Set remaining=1 and ensure only 1-day suggestions remain.
- Temporal Spread: Create high-scoring clusters in January and November; Top K should alternate early/late positions.
- De-Dupe & Merge: Create overlapping candidates (>50% shared dates). Lower-scoring duplicate is dropped; adjacent same-archetype may merge.

---

# Pass/Fail Summary Template (Per Calendar)
- Setup: [brief description]
- Observations: [top suggestions, dates, rationale]
- Checks:
  - [ ] No Busy overlap
  - [ ] Optional days improved rank but not anchors
  - [ ] Temporal spread alternation visible
  - [ ] Leave balance respected
  - [ ] Archetype behavior as expected (bridge/gap/edge/expansion/long-chain)
  - [ ] De-dup/merge rules applied
- Conclusion: [pass/fail + notes]

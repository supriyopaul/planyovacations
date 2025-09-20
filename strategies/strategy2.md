# Leave Planner: UI, Functionality, and Strategic Guide

## 1. Introduction

The Leave Planner is a visual tool designed to help users strategically plan and optimize their personal time off throughout the year. It transforms the calendar into an interactive canvas where users can mark different types of days (holidays, work periods, leave) using a "brush" system.

This document outlines the User Interface (UI), the core functionality driven by interaction rules, and a precise, three-phase algorithm for using the tool to effectively draft and finalize a leave plan.

## 2. User Interface (UI) and Core Components

The application's interface is built around two key components: a dynamic calendar and a palette of interactive brushes.

### 2.1 The Calendar View

The primary display is a standard calendar grid, showing months and days. Each date on the calendar is a cell that can be "painted" with a color and label corresponding to the selected brush type.

### 2.2 The Brush Palette & Rules

This is the central control panel. The user selects a brush from this palette to mark dates on the calendar. Each brush has a specific purpose, color, and set of rules that govern its behavior when interacting with other markings.

The rules for each brush are defined as follows:

| Brush Type | Color (bg/text) | Mutually Exclusive With | Affects Leave Balance | Convert Strategy (on Overlap with Exclusive Type) | Merge Strategy (Same Type Overlap) |
|------------|-----------------|-------------------------|----------------------|---------------------------------------------------|-----------------------------------|
| Public Holiday | Blue (bg-blue-50 / text-blue-700) | Optional Holiday, Planned Leave | No | Automatically removes all overlapping Optional Holidays and Planned Leave, creates new Public Holiday | Merges all overlapping Public Holidays into one event, extends range, uses new title |
| Optional Holiday | Yellow (bg-yellow-50 / text-yellow-700) | Public Holiday, Planned Leave | No | Automatically removes all overlapping Public Holidays and Planned Leave, creates new Optional Holiday | Merges all overlapping Optional Holidays into one event, extends range, uses new title |
| Planned Leave | Teal (bg-teal-50 / text-teal-700) | Public Holiday, Optional Holiday | Yes | Automatically removes all overlapping Public Holidays and Optional Holidays, creates new Planned Leave | Merges all overlapping Planned Leave into one event, extends range, uses new title |
| Busy Period | Red (bg-red-50 / text-red-700) | Slow Period | No | Automatically removes all overlapping Slow Periods, creates new Busy Period | Merges all overlapping Busy Periods into one event, extends range, uses new title |
| Slow Period | Orange (bg-orange-50 / text-orange-700) | Busy Period | No | Automatically removes all overlapping Busy Periods, creates new Slow Period | Merges all overlapping Slow Periods into one event, extends range, uses new title |
| Suggested Leave | Purple (bg-purple-50 / text-purple-700) | None | No | N/A (read-only suggestion) | N/A |
| Eraser | Slate (bg-slate-50 / text-slate-700) | N/A | N/A | N/A | N/A |

### 2.3 Leave Balance Indicator

A persistent UI element displays the user's remaining leave balance (e.g., "15/20 Days Remaining"). This value is only decremented when the Planned Leave brush is used.

## 3. Core Functionality

The application's logic is driven by the interaction between the selected brush and the calendar cells.

**Marking Dates**: The primary user action. The user clicks a brush from the palette and then clicks-and-drags over dates to "paint" them.

**Conflict Resolution (Convert Strategy)**: When a user paints over an existing, mutually exclusive marking, the old marking is automatically removed and replaced by the new one. For example, marking a Public Holiday as a Planned Leave day converts it, ensuring it correctly deducts from the user's balance.

**Merging Logic**: Painting a date with the same brush type as an adjacent date merges them into a single, contiguous block, extending the date range.

**Leave Balance Accounting**: The system strictly ties leave balance reduction to the Planned Leave brush. No other action affects the balance.

**Drafting (Suggested Leave)**: This special purple brush acts as a temporary, read-only overlay. It can coexist with any other marking, allowing users to sketch out potential plans without commitment. It does not trigger conversion or merging rules.

## 4. The Strategic Planning Solution

To use the tool effectively, the following three-phase process provides a clear, repeatable workflow from setup to finalization.

### Phase 1: Setup and Marking Constraints

**Objective**: To populate the calendar with all known, fixed information, creating the foundational constraints for planning.

1. **Gather Information**: Collect your total $Planned\ Leave$ balance, a list of all official $Public\ Holidays$, and any known $Busy\ Periods$ (e.g., project deadlines) or $Slow\ Periods$.

2. **Mark Public Holidays (First Pass)**: Select the $Public\ Holiday$ (Blue) brush and mark all official public holidays for the year.

3. **Mark Work Intensity (Second Pass)**: Use the $Busy\ Period$ (Red) brush to block out dates where leave is not feasible. Use the $Slow\ Period$ (Orange) brush to highlight ideal times for vacation.

### Phase 2: Drafting and Strategizing (The "What-If" Stage)

**Objective**: To systematically identify and mark all high-value leave opportunities using the read-only $Suggested\ Leave$ brush without consuming any leave balance.

#### Strategy 2.A: Identification of "Bridge" Days for Long Weekends

**Goal**: To find and mark single working days that connect a weekend to a public holiday.

**Algorithm**:

1. **Scan for Tuesday Holidays**: If a $Public\ Holiday$ falls on a Tuesday, check if the preceding Monday is a viable leave day (i.e., not a holiday or busy period). If so, **Action**: Mark that Monday with the $Suggested\ Leave$ brush.

2. **Scan for Thursday Holidays**: If a $Public\ Holiday$ falls on a Thursday, check if the following Friday is a viable leave day. If so, **Action**: Mark that Friday with the $Suggested\ Leave$ brush.

#### Strategy 2.B: Identification of "Max-Value" Vacation Blocks

**Goal**: To find and mark multi-day gaps between "Anchor Blocks" (weekends or holidays) to create extended vacations.

**Algorithm**:

1. Define an "Anchor Block" as any contiguous sequence of non-working days (weekends, public holidays).

2. For every Anchor Block A, find the next Anchor Block B.

3. Define the "Gap" as the sequence of working days between them. Let N be the number of days in the Gap.

4. **Evaluate**: If 1 <= N <= 5 and the Gap contains no $Busy\ Periods$, then **Action**: Mark all N working days in the Gap with the $Suggested\ Leave$ brush.

### Phase 3: Finalizing and Committing

**Objective**: To convert a preferred draft plan into a final, committed leave plan.

1. **Choose Your Plan**: Review all the purple $Suggested\ Leave$ markings on the calendar and decide which vacation(s) you wish to take.

2. **Commit and Mark**: Select the $Planned\ Leave$ (Teal) brush. Carefully "paint over" the purple suggestions for your chosen vacation. For each day painted, manually decrement your leave balance tracker. Stop when your balance reaches zero or your plan is fully marked.

3. **Clean Up**: Select the $Eraser$ brush and remove any remaining purple $Suggested\ Leave$ markings that you will not be using.

By following this structured approach, any user can move from a blank calendar to a fully optimized and committed leave plan that maximizes their time off while respecting all known constraints.

---

## 5. Automated Suggestion Engine (Enhanced Strategy Layer)

While Sections 1–4 describe a fully manual workflow, this enhanced strategy adds an *automatic suggestion engine* that generates, evaluates, ranks, and presents high‑value leave opportunities using the existing visual model (purple Suggested Leave overlays). It reduces user cognitive load while preserving transparency and manual override.

### 5.1 Design Principles
1. Non-Destructive: Suggestions never alter existing events (no conversion, no merging). They are overlays (purple) until the user commits.
2. Deterministic Core + Preference Modulation: A stable base algorithm whose ranking is modulated by user "leave style" (short / mixed / long).
3. Progressive Refinement: Start simple (bridge + gap + block expansion). Allow future pluggable heuristics.
4. Resource Awareness: Never propose a suggestion requiring more Planned Leave days than remaining balance.
5. Explainability: Each suggestion carries a rationale (e.g., "1 day → 4 consecutive days off by bridging weekend + holiday").
6. Optional Holidays Are Workdays Until Taken: They do NOT count as anchor non-working days unless already converted to Planned Leave or Public Holiday; however, they are treated as higher-viability workdays (scored like slow periods but with a stronger bonus).

### 5.2 Canonical Day Model
Internally (for generation only), build a derived array `days[]` over the visible range:

| Field | Meaning |
|-------|---------|
| date | ISO date string |
| isWeekend | Derived from offDays setting |
| isPublicHoliday | True if blue event present |
| isOptionalHoliday | True if yellow event present (still a workday; eligible for higher-viability bonus) |
| isPlannedLeave | True if teal event present |
| isBusy | True if red event present |
| isSlow | True if orange event present |
| isWorkday | `!isWeekend && !isPublicHoliday && !isPlannedLeave` (Optional Holiday does NOT flip this) |
| isAnchorNonWork | `isWeekend || isPublicHoliday || isPlannedLeave` (Optional holiday excluded) |
| suggestionMask | Temp marker to avoid duplicate suggestion coverage |

### 5.3 Opportunity Archetypes
The engine scans in ordered passes (earlier passes feed into later scoring but are not mutually exclusive):

1. Bridge Days (Single Connectors): One workday adjacent to two non-work blocks (e.g., Weekend–Workday–Holiday or Holiday–Workday–Weekend). Extends continuous off stretch with minimal spend.
2. Edge Extenders: 1–2 workdays immediately before or after an anchor block (e.g., take Friday before a Monday holiday to produce 4 days off). Distinct from pure bridge if only one side anchored.
3. Gap Fillers (Short Gaps): Consecutive workday gaps (length 1–5) between two anchor non-work blocks. (e.g., Weekend ... [Mon–Tue–Wed work] ... Public Holiday Thursday.)
4. Block Expansion (Slow Period Amplifiers): Contiguous runs of workdays inside a Slow Period bordered at least on one side by an anchor block and within configured max spend.
5. Long Stretch Constructors: For users preferring "long" style, attempt to chain multiple adjacent archetypes to produce 7–16 day total spans while limiting leave spend.

### 5.4 Candidate Representation
```
SuggestionCandidate {
	id: string;
	dates: Date[];              // Workdays to potentially take as leave
	spanStart: Date;            // First calendar date of continuous off block if applied
	spanEnd: Date;              // Last calendar date of continuous off block if applied
	leaveDays: number;          // = dates.length (business days)
	totalOffSpan: number;       // Inclusive calendar days from spanStart..spanEnd
	efficiency: number;         // totalOffSpan / leaveDays
	archetype: 'bridge' | 'gap' | 'edge' | 'expansion' | 'long_chain';
	busyPenalty: number;        // Sum of penalties per busy day (likely disqualify if >0)
	slowBonus: number;          // Count of days in slow period
	rationale: string;          // Human explanation
}
```

### 5.5 Scoring Model
Raw score computed, then style weighting applied:
```
if busyPenalty > 0 => reject (unless fallback mode)
efficiencyScore = clamp(efficiency / 10, 0, 1)
lengthScore = normalize(totalOffSpan, min=3, max=16)
leaveLoadScore = 1 - normalize(leaveDays, min=1, max=10)  // Favors fewer days
slowScore = slowBonus * 0.05  // Diminishing returns separately capped
archetypeBase = {
	bridge: 0.9,
	gap: 0.8,
	edge: 0.65,
	expansion: 0.6,
	long_chain: 1.0
}[archetype]

// Optional Holiday bonus: treat as more viable than slow
optionalBonus = count(d in dates where d.isOptionalHoliday)
optionalScore = optionalBonus * 0.08  // Heavier than slow bonus

raw = (0.33*efficiencyScore) + (0.14*lengthScore) + (0.24*leaveLoadScore) + (0.08*slowScore) + (0.08*optionalScore) + (0.13*archetypeBase)
```

Apply style preference multiplier:
```
switch style:
	short:    favor leaveDays <=2  ( *1.15 if leaveDays<=2 else *0.9 )
	mixed:    neutral ( *1.0 )
	long:     favor totalOffSpan>=8 ( *1.2 if totalOffSpan>=8 else *0.85 )
```

### 5.6 De-Duplication & Conflict Handling
Two candidates are considered overlapping if they share ≥50% of proposed leave `dates`. Keep the higher scored candidate; discard the other. A second pass merges adjacent candidates of same archetype when merging increases efficiency without exceeding remaining leave balance.

### 5.7 Leave Balance Guardrails
Discard candidates where `leaveDays > remainingBalance`.
If the sum of top N would exceed remaining, still present individually; commitment is user-driven.

### 5.8 Generation Flow (Pseudocode)
```
function generateSuggestions(days, remainingBalance, style):
	anchors = markAnchorBlocks(days) // contiguous sequences where isAnchorNonWork
	candidates = []

	// Pass 1: Bridges & Gaps
	candidates += findBridgeDays(days)
	candidates += findGapFillers(days, maxGap=5)

	// Pass 2: Edge & Expansion
	candidates += findEdgeExtenders(days)
	candidates += findSlowExpansions(days, maxConsecutive=5)

	// Pass 3: Long Chains (style==long)
	if style == 'long':
		 candidates += buildLongChains(anchors, days, maxLeave=remainingBalance)

	candidates = filterBusy(candidates)
	candidates = balanceFilter(candidates, remainingBalance)
	scoreAll(candidates, style)
		candidates = dedupeAndMerge(candidates)
		sortByScoreDesc(candidates)
		// Ensure calendar-wide spread by alternating picks from start and end
		return pickWithTemporalSpread(candidates, days, K=5)
```

### 5.9 Rationale Generation
Examples:
* Bridge: "Take Monday (1 day) to turn weekend + Tue holiday into 4 consecutive days off (efficiency 4.0)."
* Gap: "Take Tue–Wed (2 days) to connect existing leave block and upcoming public holiday → 7-day stretch."
* Long Chain: "Take Mon–Thu (4 days) inside slow period to create 11 consecutive days off including two weekends."

### 5.10 Edge Case Handling
| Scenario | Handling |
|----------|----------|
| No public holidays | Algorithm still uses weekends & existing planned leave as anchors; expansions rely on slow periods. |
| Only optional holidays | Optional holidays treated as workdays, so they can appear inside gaps; if user converts one later, future runs reclassify anchor status. |
| Optional holidays viability | Candidates that include optional-holiday workdays receive a higher bonus than slow periods, improving their rank without forcing conversion. |
| Contiguous busy periods | Candidates intersecting busy days dropped; fallback: if zero results, allow single low-penalty (1-day) suggestions outside busiest clusters. |
| Very low balance (<=2) | Filter phases early to only produce leaveDays <= balance, preferring bridges first. |
| Large available balance (>=15) | Allow long_chain builder to consider multi-block fusions up to configurable max (e.g., 16 calendar span). |
| Overlapping slow & anchor days | Slow bonus ignored for anchor non-work days; only counted for proposed leave workdays. |
| Multiple style changes quickly | Cache base candidates; re-score on style toggle for instant feedback. |
| Temporal spread guarantee | Alternating start/end selection avoids clustering; if K cannot be met due to conflicts, remaining picks default to best-score regardless of side. |

### 5.11 UI Integration Workflow
1. User loads or edits calendar → Recompute `days[]` + suggestions.
2. Display suggestion list (title + dates + rationale + leave days + total span + efficiency).
3. Hovering a suggestion highlights proposed dates in purple.
4. Accepting a suggestion converts its dates into Planned Leave (teal) via existing brush logic; triggers regeneration (balance decreases).
5. Rejecting a suggestion adds its date hash to a short-lived suppression list (e.g., until significant calendar change or session reset).
6. Changing leave style re-scores existing candidates without regeneration unless structural data changed.

### 5.12a Temporal Spread Selection (Alternating Ends)
To avoid clustering suggestions in one part of the year, selection after scoring uses an alternating sweep:

1. Sort candidates by `score` (desc) and, for equal scores, by `spanStart`.
2. Maintain two pointers into the ordered candidate list when projected on the calendar timeline: `L` from the earliest start, `R` from the latest end.
3. Alternate picks: take best from the left side, then best from the right side, skipping any candidate that materially overlaps (≥30% of dates) with already-picked ones.
4. Continue alternating until K suggestions chosen or list exhausted.

This aligns with the requirement: start near the beginning of the visible range, then pick from the end, then back toward the start, yielding a well-distributed set across the calendar.

### 5.12 Minimal Data Interfaces (Type Hints)
```
type LeaveStyle = 'short' | 'mixed' | 'long'

interface DayInfo { /* as table above */ }

interface SuggestionCandidate { /* as earlier */ }

interface SuggestionResult extends SuggestionCandidate {
	score: number;
	efficiencyLabel: string; // e.g. "1 day leave → 4 off"
}
```

### 5.13 Future Extensions (Optional)
* Machine learning ranking (train on user acceptance history).
* Seasonality weighting (historical workload patterns).
* Multi-user coordination (detect overlapping team busy periods).
* Hard constraints (company blackout windows) layer before generation.

### 5.14 Summary
This enhanced layer preserves the intuitive manual planning workflow while adding a principled, explainable, and efficient automated suggestion system. Optional holidays remain neutral workdays until converted, ensuring suggestions are opportunistic but not presumptive. The architecture is modular, enabling iterative sophistication without disrupting core user experience.

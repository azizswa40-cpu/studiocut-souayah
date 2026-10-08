# ADR 0001: Frame-Based Timebase — StudioCut Souayah

## Status
Accepted

## Context
Floating-point seconds as source of truth causes drift and rounding bugs
in trim/split/ripple operations.

## Decision
- Store all times as integer frames.
- Each Sequence declares an explicit frame rate (num/den).
- Rational timestamps allowed where needed (e.g. 30000/1001).
- Never store seconds as the canonical time value in project state.

## Consequences
- All domain operations must convert to/from frames at boundaries.
- UI may display seconds but must round-trip through frames.
- Unit tests must cover NTSC (29.97), 23.976, 25, 30, 50, 60.

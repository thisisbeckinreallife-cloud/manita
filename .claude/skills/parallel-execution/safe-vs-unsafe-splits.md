# Safe vs Unsafe Splits

## Safer
- left-rail UI polish vs right-pane loading states after contracts are stable
- test-writing vs documentation after the slice is already implemented

## Unsafe
- Prisma schema changes in one branch and task workspace logic in another without fixed contract
- GitHub bootstrap backend in one branch and right-pane deploy truth in another before state model is stable

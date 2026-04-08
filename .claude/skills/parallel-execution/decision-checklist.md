# Decision Checklist

- Are the files mostly disjoint?
- Does one branch depend on a migration from the other?
- Is there a single shared contract that can invalidate both branches?
- Can one branch ship meaningfully if the other fails?
- Is merge order obvious and low-risk?

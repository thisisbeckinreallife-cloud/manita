# State Machine

## GitHub bootstrap
requested -> provisioning -> linked | failed

## Railway linkage
requested -> linking -> linked | failed

## Deploy run
requested -> queued -> building -> deployed | failed

## Preview truth
unknown | unavailable | stale | live

Requested state and observed state must be stored separately.

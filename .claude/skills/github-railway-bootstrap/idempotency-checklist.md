# Idempotency Checklist

- repeated bootstrap request does not create duplicate repos
- repeated deploy linkage request does not create duplicate targets
- failed retries do not corrupt linkage records
- UI can recover from partially completed provisioning states

# Wraptitude branch API

This stack provides branch-aware APIs for the customer mobile app and admin web app. It creates a separate admin Cognito user pool, a branch-membership table, three private image buckets, and an HTTP API with separate JWT authorizers for customers and administrators.

## Deploy

```bash
sam build
sam deploy --guided --profile wraptitude --region us-east-2
```

After the stack is deployed, run `migrate_branch_data.py` once. The migration is idempotent and assigns legacy data to Markham.

The admin customer list uses `branchId-clientCreatedAt-index` for newest-first pagination. After deploying the index, backfill existing memberships once with `python3 backfill_client_created_at.py --apply` (run without `--apply` for a read-only count). New memberships receive this field automatically.

New service, quote, and emergency images are written to private buckets and returned only with short-lived signed URLs. Legacy images remain readable from the old buckets during the mobile-release transition.

Do not remove the remaining legacy data APIs or old buckets' public-read policies until the mobile release using this API is available to customers. At cutover, copy legacy objects to the private buckets, update stored keys, verify counts, and then remove public access from the old buckets.

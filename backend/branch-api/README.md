# Wraptitude branch API

This stack provides branch-aware APIs for the customer mobile app and admin web app. It creates a separate admin Cognito user pool, a branch-membership table, three private image buckets, and an HTTP API with separate JWT authorizers for customers and administrators.

## Deploy

```bash
sam build
sam deploy --guided --profile wraptitude --region us-east-2
```

`migrate_branch_data.py` was the original legacy migration. Do not rerun it after enabling fixed-branch signup: it predates account branch selection. Use `backfill_account_branches.py` (dry-run, then `--apply`) for account membership reconciliation.

The admin customer list uses `branchId-clientCreatedAt-index` for newest-first pagination. After deploying the index, backfill existing memberships once with `python3 backfill_client_created_at.py --apply` (run without `--apply` for a read-only count). New memberships receive this field automatically.

Customer accounts now have one fixed branch, selected at registration using the immutable Cognito `custom:home_branch` attribute. Existing accounts without the attribute are always Markham. The mobile app loads `/customer/account` before showing account data and has no branch switcher or device-selected branch cache. The backend resolves the account branch directly from Cognito, rejecting conflicting request parameters. Account creation immediately creates branch membership; a quote or order is not required. Anonymous quotes remain separate guest enquiries and do not create customer membership.

### Fixed account branch rollout

1. Back up the existing customer pool/client configuration and DynamoDB tables.
2. Deploy this SAM stack, including `CustomerAccountSignup` and the API's narrowly scoped Cognito read permission.
3. Run `configure_account_branch.py` (dry-run, then `--apply`). This adds an immutable schema attribute (cannot be deleted), preserves all other pool/client settings, and changes only the post-confirmation trigger. The old pre-signup trigger is preserved. The new trigger preserves account creation dates on retries and ignores password-reset confirmations.
4. Run `backfill_account_branches.py`, review the counts, then run with `--apply`. Missing Cognito accounts are reported, not recreated. No orders or existing memberships are moved/deleted.
5. Release the new app and admin UI. Verify Markham legacy login, both signup branches, matching admin customer lists, and rejection of cross-branch requests. Existing legacy API/image cutover remains a separate coordinated release task.

## App update prompts

`GET /public/app-version?platform=ios|android` reads an item from `wraptitudeAppVersionPolicy` keyed by `platform`. No item, or `enabled: false`, means no prompt. After a new release is **available in the platform store**, set these DynamoDB attributes for that platform: `enabled` (Boolean), `minimumVersion` (String), `latestVersion` (String), `storeUrl` (String), and optional `message` (String). Use numeric versions such as `1.2.0`. The mobile app requires an update when its installed version is below `minimumVersion`; it offers a dismissible update when it is between `minimumVersion` and `latestVersion`. A dismissed optional prompt returns for a newer `latestVersion`. The app rechecks at launch and when it becomes active, and uses the last successful policy if temporarily offline. Store URLs must be HTTPS links on `apps.apple.com` for iOS or `play.google.com` for Android. Invalid configuration does not block the app.

Do not enable a force threshold before the required version and its store link are live. This is an in-app usability gate, not a substitute for server-side compatibility or authorization checks: app versions released before the gate was added cannot display it. The iOS Xcode `MARKETING_VERSION` and Android Gradle `versionName` must be incremented for each release, independently of the JavaScript package version.

New service, quote, and emergency images are written to private buckets and returned only with short-lived signed URLs. Legacy images remain readable from the old buckets during the mobile-release transition.

Do not remove the remaining legacy data APIs or old buckets' public-read policies until the mobile release using this API is available to customers. At cutover, copy legacy objects to the private buckets, update stored keys, verify counts, and then remove public access from the old buckets.

## Branch order flow

- A customer has one registered branch. A service order must match that branch;
  the admin selector never reassigns customer accounts or orders.
- Quote requests are enquiries, not service orders. Once confirmed, staff create
  the service order from that branch's Clients view. Guest enquiries require the
  customer to register/sign in before an account-linked service order is created.
- The admin Orders view uses `GET /admin/services?branchId=...&pageSize=20&cursor=...`.
  JWT group authorization is checked before every page. Only summary fields and
  basic contact information for customers with matching orders are returned.
- This endpoint uses one **bounded scan** of the existing service table, not a
  full-table load. DynamoDB's limit counts evaluated rows, so a page may be empty
  but still contain `nextCursor`. Clients must keep Load more available until the
  cursor is null. Scan order is not chronological. A branch/date GSI is a future
  scalability improvement; this change does not alter the production table schema.
- Deploy the API before deploying the new admin Orders tab. Mobile tracking and
  history continue using the existing authenticated customer endpoint.
- Offline regression tests: `python3 -m unittest discover -s backend/branch-api -p 'test_*.py'`.

# Wraptitude branch API

This stack provides branch-aware APIs for the customer mobile app and admin web app. It creates a separate admin Cognito user pool, a branch-membership table, three private image buckets, and an HTTP API with separate JWT authorizers for customers and administrators.

## Deploy

```bash
sam build
sam deploy --guided --profile wraptitude --region us-east-2
```

After the stack is deployed, run `migrate_branch_data.py` once. The migration is idempotent and assigns legacy data to Markham.

The admin customer list uses `branchId-clientCreatedAt-index` for newest-first pagination. After deploying the index, backfill existing memberships once with `python3 backfill_client_created_at.py --apply` (run without `--apply` for a read-only count). New memberships receive this field automatically.

Customer accounts are shared across branches, but customer-list membership is branch-specific. Existing accounts were assigned to Markham during migration. For new activity, an authenticated customer joins a branch only after submitting a quote or emergency request there, or when an admin creates a service for that customer. Merely switching the app's selected branch does not add membership. The same customer may belong to both branches. Anonymous quotes appear in the selected branch's quote list but cannot create customer-account membership. `GET /customer/branches` returns only the signed-in customer's branch memberships; the admin customer list is scoped to the requesting administrator's allowed branch.

## App update prompts

`GET /public/app-version?platform=ios|android` reads an item from `wraptitudeAppVersionPolicy` keyed by `platform`. No item, or `enabled: false`, means no prompt. After a new release is **available in the platform store**, set these DynamoDB attributes for that platform: `enabled` (Boolean), `minimumVersion` (String), `latestVersion` (String), `storeUrl` (String), and optional `message` (String). Use numeric versions such as `1.2.0`. The mobile app requires an update when its installed version is below `minimumVersion`; it offers a dismissible update when it is between `minimumVersion` and `latestVersion`. A dismissed optional prompt returns for a newer `latestVersion`. The app rechecks at launch and when it becomes active, and uses the last successful policy if temporarily offline. Store URLs must be HTTPS links on `apps.apple.com` for iOS or `play.google.com` for Android. Invalid configuration does not block the app.

Do not enable a force threshold before the required version and its store link are live. This is an in-app usability gate, not a substitute for server-side compatibility or authorization checks: app versions released before the gate was added cannot display it. The iOS Xcode `MARKETING_VERSION` and Android Gradle `versionName` must be incremented for each release, independently of the JavaScript package version.

New service, quote, and emergency images are written to private buckets and returned only with short-lived signed URLs. Legacy images remain readable from the old buckets during the mobile-release transition.

Do not remove the remaining legacy data APIs or old buckets' public-read policies until the mobile release using this API is available to customers. At cutover, copy legacy objects to the private buckets, update stored keys, verify counts, and then remove public access from the old buckets.

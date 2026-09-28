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

Admin service images upload directly from the browser to `PrivateServiceBucket`
using `/admin/uploads/presign`. The bucket must allow CORS `PUT` requests with
the `Content-Type` header from `AdminOrigin`; API Gateway CORS alone does not
cover S3 uploads. Keep this origin aligned with the admin website and retain
the bucket's public-access block. The browser must send the same content type
used to sign the upload URL. Image previews use signed GET URLs.

Do not remove the remaining legacy data APIs or old buckets' public-read policies until the mobile release using this API is available to customers. At cutover, copy legacy objects to the private buckets, update stored keys, verify counts, and then remove public access from the old buckets.

## Branch order flow

- A customer has one registered branch. A service order must match that branch;
  the admin selector never reassigns customer accounts or orders.
- Quote requests are enquiries, not service orders. Once confirmed, staff create
  the service order from that branch's Clients view. Guest enquiries require the
  customer to register/sign in before an account-linked service order is created.
- The admin Orders view uses `GET /admin/services?branchId=...&pageSize=20&sort=newest&cursor=...`.
  JWT group authorization is checked before every page. Only summary fields and
  basic contact information for customers with matching orders are returned.
- With `sort=newest`, Orders query `branchId-chronologicalKey-index` descending.
  Quotes use the same index on their own table with `pageSize=20`. Both return
  `{items, nextCursor}`. Newest means order `createAt`, quote `submittedAt`, or
  client registration `createdAt`, not last edited time. Canonical UTC sort keys
  include a record-ID tie breaker. Unknown dates sort last. Original dates remain
  unchanged. The UI displays Toronto local date/time, including timezone.
- Requests without `sort=newest` retain the old bounded scan for compatibility
  during deployment. Quotes without `pageSize` retain the legacy array response.
- Deploy the API before deploying the new admin Orders tab. Mobile tracking and
  history continue using the existing authenticated customer endpoint.
- Offline regression tests: `python3 -m unittest discover -s backend/branch-api -p 'test_*.py'`.

Orders and Quotes accept an optional `search` query (up to 100 characters).
Search matches partial names/emails case-insensitively and phone digits regardless
of spaces, brackets or dashes. Order contact fields come from the linked customer.
Search filters each bounded branch page while preserving its chronological cursor;
an empty result page may still have more matches later. The admin automatically
continues past empty search pages and offers Load more after matching pages.
Changing or clearing the search starts from the newest page. Quote images are
signed only for matching results, and every page retains branch authorization.

### Newest-first index rollout (requires production approval)

The service and quote tables predate this SAM stack. Do not declare new table
resources with those names or recreate them. The indexes incur additional storage
and write charges. Deploy the frontend **last**, after all checks below pass.

1. Confirm the AWS account is `539247487854`, region `us-east-2`. Back up
   `wraptitudeAppService` and `wraptitudeAppQuote` and wait for AVAILABLE. Save
   the current SAM template and original Lambda packages for rollback.
2. Deploy the API through SAM. New writes now include `chronologicalKey`; the
   old admin still uses its compatible read paths while indexes are prepared.
3. Keep legacy mobile writers index-compatible until their separate retirement.
   `legacy_sorting_compat.build_package` prepares narrowly patched packages for
   `wraptitudeAppPostQuote`, `wraptitudeAppInsertService`, and
   `wraptitudeAppEditService`. Back up each original package and deploy with its
   current `RevisionId` to reject concurrent changes. Preserve all configuration,
   layers, dependencies and permissions. Legacy new records remain Markham;
   edits preserve stored branch and creation date. Do not enable a new frontend
   while any active writer can omit the new keys.
4. Run `python3 backend/branch-api/backfill_chronological_keys.py` for a read-only
   audit. Review missing branches and invalid dates. Backfill only sort metadata
   with `--apply --create-indexes`; this adds an ALL-projection GSI to each table
   without changing its existing keys/indexes/billing mode. Conditional updates
   protect concurrent edits and deletes. Wait for both indexes to become ACTIVE.
5. Run the audit again. Resolve any missing keys/conflicts, verify the index row
   counts against each branch, and test multi-page descending timestamps,
   cross-branch rejection, and empty Vaughan results through the API. New rows
   can take a moment to appear because GSIs are eventually consistent.
6. Deploy the admin frontend and verify all three tabs and Load more. No mobile
   release or password change is needed for this admin display change.

Rollback: restore the previous frontend first. Preserve the additive indexes and
sort metadata; they are harmless to the old UI. Do not restore table backups over
live data or delete records to roll back a UI change.
# Shared invoice numbering

`POST /admin/invoices/number` takes `serviceId` and `branchId`. It requires an
admin authorized for that branch and an existing order in that branch. Both
branches share `INV-000001`, `INV-000002`, etc. in first-allocation order, without
an annual reset. First PDF preview/download reserves a number and Toronto invoice
date for the order; retries, email attachments and reprints reuse that identity.
Previously downloaded invoices are not renumbered or imported.

`INVOICE_NUMBER_TABLE` points to the retained, encrypted DynamoDB ledger with
point-in-time recovery enabled. `COUNTER#global` and `INVOICE#<serviceId>` are
written together in a conditional transaction. No number is consumed by a losing
concurrent request. Order edits/deletions do not remove ledger entries or recycle
numbers. Do not reset/delete the counter or assignments after invoices have been
issued; disaster recovery must restore them together. Previewed or deleted orders
can leave reserved numbers absent from the set of downloaded invoices.

Deploy the table and scoped GetItem/PutItem permissions before deploying the
allocator and admin frontend. Package `invoice_numbers.py` with `app.py`.
Missing configuration, authorization failures and exhausted retries fail closed;
the frontend must never fall back to a locally generated invoice number.

## Admin news

The admin **News** tab uploads JPG/PNG/WebP covers (8 MB maximum) and saves
articles as drafts or publishes them to the shared mobile news feed. Branch
admins can edit articles owned by their branch; superadmins can edit all articles,
including the imported legacy articles. Published articles are visible to both
branches. Drafts from another branch are hidden. Saving a published article as a
draft removes it from the feed. The article date controls ordering, not scheduling.
Concurrent edits fail with 409; reload the article before retrying.

`/admin/news` supports GET and POST, `/admin/news/{id}` supports PATCH, and
`/admin/news/uploads/presign` supports POST. These reuse the admin JWT authorizer
and require an authorized `branchId`. The retained `${StackName}-news` table uses
conditional revisions. Covers live under `news/{branch}/` in the existing private
service bucket. Upload signatures constrain content type and length; publishing
also verifies the object. The public reader can sign only news image keys.

The existing mobile URL remains unchanged. Its `wraptitudeAppGetAllNews` Lambda
runs `news_feed.lambda_handler` with `news.py`, `NEWS_TABLE` and
`NEWS_IMAGE_BUCKET`. It returns the existing `{statusCode, body, headers}`
envelope, with `body` containing a JSON array of up to 50 published posts, newest
article date first. Image links last one hour and are refreshed when news reloads.

Rollout order: back up both Lambda packages/configurations and the legacy feed;
deploy the additive table and narrowly scoped reader policy; seed all legacy
articles with their original public fields and `status=published`; verify them;
then switch the legacy reader using its current Lambda RevisionId. Deploy the
admin frontend last. Never replace customer, order or invoice data during this
rollout. For rollback, restore the prior admin build and legacy reader package and
configuration; retain the news table and uploaded covers for recovery.

# Wraptitude branch API

This stack provides branch-aware APIs for the customer mobile app and admin web app. It creates a separate admin Cognito user pool, a branch-membership table, and an HTTP API with separate JWT authorizers for customers and administrators.

## Deploy

```bash
sam build
sam deploy --guided --profile wraptitude --region us-east-2
```

After the stack is deployed, run `migrate_branch_data.py` once. The migration is idempotent and assigns legacy data to Markham.

Do not remove the legacy API methods or public S3 policies until the mobile release using this API is available to customers.

# Tracked Item Field Suggestions

For naming clarity, use:

- `item_type` (instead of only `type`)
- `name`
- `identifier` (optional, for thumbprint/key-id/etc.)
- `source`
- `owner`
- `owner_email` (optional)
- `ticket` (optional)
- `date_created`
- `date_expiration`

Optional but useful:

- `environment` (prod/staging/dev)
- `is_active`
- `deleted_at` (soft-delete support)
- `notes`

## Suggested item types to track

- `tls_certificate`
- `api_key`
- `oauth_client_secret`
- `service_principal_secret`
- `iam_access_key`
- `domain_registration`
- `license_renewal`
- `ssh_key`
- `saml_signing_certificate`

## Reminder setting

- Current default reminder window: **14 days before expiration**
- UI includes:
  - color-coded status in table
  - dedicated reminder notification section

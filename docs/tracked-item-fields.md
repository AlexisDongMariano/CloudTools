# Tracked Item Field Suggestions

For naming clarity, use:

- `item_type` (instead of only `type`)
- `name`
- `identifier` (optional, for thumbprint/key-id/etc.)
- `source`
- `owner`
- `ticket` (optional)
- `date_created`
- `date_expiration`

Optional but useful:

- `environment` (prod/staging/dev)
- `is_active`
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

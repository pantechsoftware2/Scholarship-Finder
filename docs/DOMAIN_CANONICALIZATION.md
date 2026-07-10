# WWW Canonicalization Setup

The `www` canonicalization warning cannot be fixed only with page metadata. It requires a real hostname redirect at the platform or DNS layer.

## Recommended production choice

Use the non-`www` version as canonical:

- `https://yourdomain.com`
- Redirect `https://www.yourdomain.com` to `https://yourdomain.com`

## Vercel production setup

1. Add both domains in Vercel:
   - `yourdomain.com`
   - `www.yourdomain.com`
2. Set `yourdomain.com` as the primary domain.
3. Configure the `www` domain to redirect permanently to the primary domain.
4. Keep all canonical tags pointing to the primary non-`www` domain.

## Why this matters

Without a permanent redirect, search engines may treat `www` and non-`www` as separate URLs, which can dilute canonical consistency and link equity.

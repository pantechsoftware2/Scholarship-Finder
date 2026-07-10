# Email Authentication Setup

The SEO warning about a missing SPF record cannot be fixed in frontend or backend application code. It must be configured at the DNS level for the sending domain.

## Recommended production records

Example SPF record:

```txt
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

Use only the providers you actually send mail through. For example:

- Google Workspace: `include:_spf.google.com`
- Microsoft 365: `include:spf.protection.outlook.com`
- Resend / SendGrid / another provider: use that provider's official SPF include value

## Production checklist

1. Add the SPF TXT record at the root domain in your DNS provider.
2. Confirm there is only one SPF TXT record for the domain.
3. Validate the record with an SPF checker after propagation.
4. Also configure DKIM and DMARC for stronger email trust and deliverability.

## Why this matters

Without SPF, other senders can spoof your domain more easily, which can hurt deliverability and brand trust.

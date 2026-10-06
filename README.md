# AI HATCH V2

Independent Site for the V2 experiment.

- Public entry: `/`
- Admin: `/admin` (existing AI HATCH password)
- Review: `/?qa=1&src=internal_review`
- Recruitment: `/?src=instagram`, `/?src=network`
- Independent D1: new visits and responses begin at launch; historical data stays on the original Site.
- Original AI HATCH and its advertising URLs are unchanged.
- Legacy `/v2` paths on this new host redirect to the root, preserving query parameters.
- Original host `/v2` remains available for historical result links.
- Admin account is initialized once from the private ADMIN_ACCOUNT_SEED environment value. No raw password or existing login session is copied.

Build: `npm run build`. Verification: `node scripts/verify-v2.mjs`.

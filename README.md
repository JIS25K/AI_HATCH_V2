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

## Purchase-interest experiment · 2026-10-06

Content version: `workflow-study-2026-10-06-v4-purchase`. Task cards precede the optional level map. Each of 27 profiles retains its task/bottleneck/practice adaptation and adds a source-grounded workflow kit: explicitly fictional worked example, output contract, verification steps, optional external tools, and a tailored-guide offer.

Offer: one subject/task, one-time tailored AI usage guide, KRW 4,900. Proposed contents: task-specific instructions, tool setup sequence, verification checklist and reusable template. This is a fake-door experiment, not checkout. Clicking immediately discloses that the product is not available; no payment, order, reservation or contact data is collected. Tool integrations are not implemented or implied. No guaranteed accuracy, grade or time savings.

Events in existing `v2_events` (no schema change):
- `prompt_copy_click`: button intent, whether or not clipboard permission succeeds.
- `prompt_copy`: successful clipboard operation; previous versions already recorded this.
- `offer_view`: at least 50% of the price/button block visible in an active tab, or immediately before an explicit purchase click.
- `purchase_click`: after offer_view; server writes the offer ID, full scope, price, currency and displayed content version. Client-provided price is ignored.

All four are idempotent by run/event. Admin counts distinct browser IDs globally, by task and by all 27 complete profiles, with QA/source/cohort cutoff filters. A visitor with multiple runs is one browser in each applicable group. Offer CTR = distinct purchase-click browsers / distinct offer-view browsers within the same scope. This is an interest signal at a displayed price, not confirmed willingness to pay. Do not compare older missing click events as if they were zero measured interest. The original run version is retained; displayed content version is captured on new events. Historical saved runs render current guidance.

Verification covers all profiles, authentication, cross-browser isolation, price snapshot, repeated clicks, clipboard click/success separation, QA and cutoff exclusion, and CSV export.

### Research basis (official docs checked 2026-10-06)

- Zotero PDF reader: https://www.zotero.org/support/pdf_reader — annotations can be inserted into notes with source-page links. Used for research provenance and presentation claims. Does not establish that AI-generated citations are correct.
- Docling: https://github.com/docling-project/docling and https://docling-project.github.io/docling/reference/document_converter/ — structured document conversion and provenance. Developer setup is optional; extraction and Markdown export are not assumed to preserve all page references or be error-free.
- Anki text import: https://docs.ankiweb.net/importing/text-files.html — UTF-8 delimited files and field mapping. Used for a simple, manually checked two-field question/answer-plus-source export contract. No automatic Anki connection.
- Anki scheduling: https://docs.ankiweb.net/deck-options.html#fsrs — reviewed as an extension; no claim of guaranteed learning or exam prediction.
- Dify Knowledge Retrieval: https://docs.dify.ai/en/cloud/use-dify/nodes/knowledge-retrieval — retrieve document chunks for downstream LLM context and citation display. Presented as an optional configured system, not an integrated feature or a guarantee of grounding. Dify is not described as unrestricted MIT software; check its own license and model costs before deployment.
- Marp: https://marp.app/ — Markdown slides and HTML/PDF/PowerPoint export, MIT ecosystem. Used for an actionable text-to-slide output contract; rendered layouts and actual speaking time still require review.

The comparison, misconception and presentation examples are authored fictional fixtures, not measured customer outcomes. Source tool capabilities support workflow design; they do not prove our guide's value. Next evidence: copies, price-exposed purchase clicks, and later observed real work.

## Free/paid boundary revision

Version `workflow-study-2026-10-06-v5-guide-boundary` stops the free report after 04 / Acceptance Check. The detailed tool setup/implementation section and feedback form are no longer rendered. The next section shows tool examples and a KRW 4,900 proposed guide covering selection, installation, configuration, first run on the visitor's materials, troubleshooting, verification, and reuse. It remains unavailable: purchase opens the preparation notice, never checkout. Offer ID changes to `setup-guide-4900-v2` so prior clicks on a different scope are separable. Historical feedback data and APIs remain available for reporting.

The prompt copy button is now in a sticky toolbar at the prompt panel's top right. Manual selection/copy is not counted as a button click; clicking and successful clipboard copying remain distinct metrics.

Offer view/purchase events use version-suffixed names from this revision onward. A returning saved run can record the new offer separately; aggregate browser counts remain deduplicated, while per-offer results retain each offer's snapshot. CSV preserves raw versioned names.

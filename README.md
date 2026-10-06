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

### Short decision check (2026-10-06)
The optional landing-page section presents four scenarios: context design, evidence tracing, workflow design, and bounded delegation. Each has three choices, feedback on the selected answer, a recommended next action, and a link to a relevant Level 0–7 example. It does not certify skill or convert answers into an AI level. Answers and completed feedback are stored using the existing owned run and event table; public question payloads omit scoring keys. Completion is immutable per run/version, retries are idempotent, and admin counts distinct anonymous browsers with the existing QA/source/date filters. Question events count first submissions; final answer changes made before completing are captured in the completion event. Test entry uses `?qa=1&src=internal_review`. This optional path never marks the core work funnel as started.

### Adaptive Level 0–7 assessment (2026-10-07)

The current UI replaces the four-scenario check with five common questions, two branch-specific questions, and one conditional clarification. It targets people with basic AI experience and retains familiar technical terms (prompt, context, connector/MCP, workflow, agent, evaluation set). Terminology knowledge does not earn a level. Questions distinguish self-reported execution experience from situational judgment. Level 0–7 is eight positions including the entry level.

| Common question | What it distinguishes |
| --- | --- |
| Brief | Goals and constraints versus style or output length alone |
| Context | Ad hoc questions, specified tasks, maintained reusable context |
| Evidence | Original-source conditions versus agreement between AI answers |
| Execution | Manual turns, connected sources, fixed workflow, agent-chosen actions |
| Operation | Ad hoc review, one-off test, repeatable evaluation, shared infrastructure |

Each candidate stage receives one concrete experience question and one new-situation question. Examples include access scope for connected sources, intermediate inputs for workflows, stopping conditions for agents, failed-case rechecks for evaluation, and onboarding a new workflow into shared infrastructure. A clarification is asked for experience disagreement, advanced judgment gaps, or explicit non-use conflicting with an advanced claim.

Classification uses the lower of reported scope and the explicitly selected concrete behavior. It does not infer unasked intermediate skills. Using a default agent is not evidence of building one; several independent automations are not evidence of shared infrastructure. Source checking and task judgment are separately reported, and correct guesses cannot raise an experience level. Levels can be nonsequential: evaluation without an agent is valid. Explicit non-use conflicting with advanced experience yields a provisional entry result. Results describe the selected behavior and remain self-report estimates; artifacts, execution quality, time savings, and real proficiency have not been validated.

Review passes completed:
1. Construct coverage: separate configuration, execution, quality assurance, and shared operations; map each branch to a concrete distinguishing behavior.
2. Language: retain professional vocabulary with short explanations where needed; remove a leading “choose the first item” clarification, distinguish actual from intended experience, and provide “not sure” in judgment questions.
3. Redundancy: change the basic branch to correcting output format; change evaluation follow-up to failed-input rechecks; change infrastructure follow-up to integrating a new workflow.
4. Adversarial profiles: nonuser with correct judgments, unchanged templates, independent automations, evaluations without agents, contradictory experience, and judgment gaps with genuine reported experience.
5. Exhaustive routing: `node scripts/verify-level-check.mjs` covers all 60,448 valid answer paths, including seven- and eight-question completions, all eight reachable levels, malformed paths, and classification bounds. These are synthetic paths, not participants or a reliability study.
6. End-to-end checks: answer editing changes the branch, reload resumes an unfinished assessment, completion is restored, buttons work by keyboard, the result links to the correct level, and the mobile layout fits without horizontal overflow.

Analytics and persistence: `/api/v2/level-check` validates sequential paths and computes the result on the server. Draft + first question event + completion are written atomically. Completion is immutable per run/version. Mutable draft rows are omitted from analytical CSV/summary queries. New assessment events are versioned separately from the previous four-question check. Admin shows started/completed browsers, conditional step 8, per-question responses, estimated-level distribution and provisional results using the existing QA/source/cohort filters. No assessment action starts the main work funnel.

Design background: the European Commission [DigComp 3.0](https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digital-competence-framework-digcomp/digcomp-30_en) describes proficiency using cognitive demand, task complexity and autonomy. [UNESCO's AI competency framework for students](https://www.unesco.org/en/articles/ai-competency-framework-students?hub=67098) separates understanding, application and creation. These distinctions informed the experience/judgment separation. AI HATCH's stage definitions, questions and rules are custom and have not been validated by either framework.

Next evidence to collect: whether representative users interpret the options as intended, which question/branch they abandon, where self-report disagrees with a short real task, and whether results predict useful next actions. Do not present path coverage as evidence of measurement accuracy.

Search surfaced no additional official Google page beyond the DeepMind blog (all other results are secondary media). I have everything needed. The official DeepMind page was fetched directly (HTTP 200), and its metadata + full article body give me publication date, content, and availability evidence. Here is the result:

---

# Signal: Google DeepMind releases SL2T, a sign-language-to-text model, into Gboard and Live Transcribe on Pixel 11

**Vendor:** Google DeepMind (with the Android team)

## What changed
On **2026-08-12**, Google DeepMind introduced **SL2T** — a "massively multilingual sign-language-to-text translation model" — and shipped it into consumer products: it powers sign-to-text dictation in **Gboard** and **Live Transcribe** on **Pixel 11**, starting with **American Sign Language (ASL) → English**. This is described as "bringing sign language AI out of the lab and into consumer products for the first time." The model is trained on "over 100,000 hours of data across more than 50 sign languages" and claims a zero-shot score of **70 BLEURT** on the FLEURS-ASL (sd-test) benchmark.

## Official URL observed (fetch result)
- https://deepmind.google/blog/putting-sign-language-ai-into-users-hands/ — **HTTP 200**, 148,908 bytes, final URL identical (direct fetch, no redirect).

## Observed dates
- `article:published_time` = **2026-08-12T15:00:00+00:00** (also rendered in-page as "August 12, 2026"). Within the requested window (2026-08-11 → 2026-08-25, current date 2026-08-25).
- `article:modified_time` = 2026-08-21T09:38:19+00:00 — a later page edit, not a separate announcement.

## Availability state: **available (limited rollout)** — quoted evidence
The announcement page also states actual availability, so announcement and availability are on the same official URL:

> "SL2T powers sign-to-text dictation in Gboard and Live Transcribe on Pixel 11, starting with American Sign Language (ASL) to English."

> "You can experience SL2T in Gboard and Live Transcribe first on Pixel 11, with more devices coming soon — all at no additional cost."

Bounding language on the same page: "More devices are coming soon, and additional languages will follow." No open-weights claim appears anywhere on the page (the model is delivered via the apps, not released as downloadable weights). No deprecation or pricing change is involved.

## Verified / unverified boundary
**Verified directly (fetched):** The official URL returned HTTP 200; page title ("Putting sign language AI into users' hands"), `og:description`, published date, and full article text were captured from the HTML itself. The model name (SL2T), the features (sign-to-search, drafting, Gemini queries, Live Transcribe responses), the Pixel 11 / Gboard / Live Transcribe availability statement, the "no additional cost" line, the training scale, and the BLEURT claim are all verbatim strings from this official page.

**Unverified:** (1) Actual end-user availability on a real Pixel 11 device was **not** independently confirmed — no Google Store/device page was fetched, and the page does not state whether rollout is staged; the "available on Pixel 11" claim rests solely on the official page's own wording. (2) The 70 BLEURT benchmark figure is the vendor's claim, not independently evaluated. (3) Secondary articles (e.g., [Mashable](https://mashable.com/tech/google-pixel-11-asl-sign-to-text#1), [Yahoo Tech](https://tech.yahoo.com/ai/gemini/articles/google-brings-asl-text-translation-170154577.html#1), [NDTV](https://www.ndtv.com/offbeat/google-deepmind-unveils-sl2t-sign-language-ai-allows-users-to-search-without-typing-11904054)) were **not** fetched and are out of scope under the official-only policy — they are not evidence here.

**Relevance note:** Exact match for the requested focus — a Google DeepMind AI capability change in sign-language-to-text, published inside the 14-day window.

---

## Source health summary
- **1 of 1 official source reachable:** `deepmind.google` blog post — fetched OK (HTTP 200), static HTML fully readable (not an SPA shell). Partial coverage: no second official Google page (blog.google, Android, Google Store) was located in bounded search to corroborate device-level availability, so device availability remains verified only at the statement level.

## Facts vs inference
- **Facts (observed on the official URL, with date):** Title, `og:description` ("Introducing sign-language-to-text (SL2T), our breakthrough model…"), published 2026-08-12, modified 2026-08-21; SL2T name; powers Gboard + Live Transcribe on Pixel 11, ASL→English; "more devices coming soon"; "all at no additional cost"; >100,000 hours / 50+ sign languages; zero-shot 70 BLEURT on FLEURS-ASL; authored by "Google DeepMind Sign Language Team", joint with Android; no weights release mentioned.
- **Inference (labeled):** That the feature is live and usable for end users today on shipping Pixel 11 devices (page says "you can experience…", but device availability was not independently checked); that this is the single most relevant in-window change for the focus (based on search ranking and window fit); that the 2026-08-21 modification is a minor edit rather than a substantive change (not inspected diff-by-diff).

## Non-action statement
Read-only only: a bounded set of GET requests to the official DeepMind URL (plus web searches to locate it). No installs, purchases, subscriptions, publishing, or account changes were made; no cookies or credentials were used; secondary sources were deliberately not treated as evidence.

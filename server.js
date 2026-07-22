const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({
    groq_configured: !!process.env.GROQ_API_KEY,
    gemini_configured: !!process.env.GEMINI_API_KEY
}));

app.get('/', (req, res) => res.redirect('/index.html'));

// Static: dashboard UI (public/) and the bundled data snapshot (data/), used
// as the fallback source when the live Blinkit deployment is unreachable.
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (/\.(html|js|json)$/i.test(filePath)) res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
}));
app.use('/data-snapshot', express.static(path.join(__dirname, 'data')));

// ---------------------------------------------------------------------------
// PM Knowledge Base — condensed from DOCS/ProblemStatement.md, Architecture.md,
// ImplementationPlan.md, EdgeCases.md in the main Blinkit "Trial Confidence
// Layer" project. This grounds the chatbot in the ACTUAL project strategy
// (root cause, CCAR definition, research patterns, phased rollout, edge
// cases/mitigations) so it answers PM questions about THIS project accurately
// instead of generic e-commerce platitudes.
// ---------------------------------------------------------------------------

// All 22 languages of the Eighth Schedule of the Indian Constitution, with the
// correct native/customary script noted so the model doesn't default to the
// wrong one. Same list the main Blinkit app's chatbot uses.
const INDIAN_LANGUAGES = [
    'Hindi (Devanagari)', 'Bengali (Bengali script)', 'Marathi (Devanagari)', 'Telugu (Telugu script)',
    'Tamil (Tamil script)', 'Gujarati (Gujarati script)', 'Urdu (Perso-Arabic/Nastaliq script)',
    'Kannada (Kannada script)', 'Odia (Odia script)', 'Malayalam (Malayalam script)', 'Punjabi (Gurmukhi script)',
    'Assamese (Bengali-Assamese script)', 'Maithili (Devanagari)', 'Sanskrit (Devanagari)',
    'Nepali (Devanagari)', 'Konkani (Devanagari)', 'Sindhi (Devanagari or Perso-Arabic)',
    'Dogri (Devanagari)', 'Kashmiri (Perso-Arabic or Devanagari)', 'Manipuri/Meitei (Meitei Mayek or Bengali script)',
    'Santali (Ol Chiki script, or Devanagari/Bengali when the user types it that way)', 'Bodo (Devanagari)'
];

const PM_KNOWLEDGE = `
PROJECT: Blinkit Cross-Category Adoption — "Trial Confidence Layer" (Growth PM graduation project)

ROOT CAUSE: Trying a new (non-grocery) category on Blinkit is a high-risk, low-information, fee-penalised decision, and a single bad first trial permanently closes that category for the user. This is a trust/information problem — NOT an awareness problem (users already know these categories exist but actively avoid them, per rejected "Awareness Hypothesis") and NOT primarily a price problem (5 of 7 interviewees ranked reviews/brand above price).

TARGET SEGMENT: "Habituated Grocery Regulars" — order >=1x/week, >=3 months tenure, deeply concentrated in groceries/snacks/household essentials. Out of scope: brand-new users (<1 month, still forming core habit — added cross-category cognitive load risks their primary retention loop) and emergency-only/low-frequency users (insufficient session volume to build a compounding habit).

NORTH STAR METRIC — CCAR (Cross-Category Activation Rate): % of Monthly Active Customers (MAC) who purchase from >=1 new L2 category in a month. Numerator = MAC placing >=1 order with >=1 item from an L2 category they had ZERO purchases from in the preceding 90 days. Denominator = total MAC. The 90-day lookback prevents gaming (cycling between 2 habitual categories doesn't count; a lapsed-and-returned category correctly re-counts as reactivation).

SUPPORTING METRICS: New-Category Trial Rate (cart adds / MAC — isolates intent from conversion), Second-Purchase Rate (repeat within 30 days of first trial — "the real test," since per first-experience-determinism a trial that doesn't repeat likely means the category got permanently burned), Trial Basket Economics (fees as % of trial-order value), Horizontal Broadening (distinct L2 categories purchased per user per month).

GUARDRAILS (mandatory, outrank the growth goal): Core-Order Friction (grocery completion rate + time-to-checkout must NOT degrade — protecting the primary habit loop always wins over cross-category growth), Category-Abandonment Rate (trial-then-never-return; a rise means the intervention is driving trials into bad experiences, which is "worse than no intervention"), Return/Complaint Rate on newly-trialled categories.

5 RESEARCH PATTERNS (from 7 in-depth interviews in Varanasi, cross-referenced against a 32,999-item public corpus spanning YouTube/PissedConsumer/Reddit/Play Store/App Store/HackerNews, Jan 2023-Sep 2025):
A — First-Experience Determinism: one bad trial permanently closes a category (R5: 3 faulty electronics deliveries -> will never try electronics on Blinkit again; R3: one rotten-tomato-that-never-rotted experience -> no fresh produce since). Counter-example: R7 tried period panties once, loved it, now repeat-buys regularly — proves the mechanism works when trust holds.
B — Social Proof beats Platform Suggestions: users want specific, credible peer reviews on the EXACT product, not generic algorithmic suggestions (R1 explicitly rejects "generic suggestions"). 5 of 7 respondents rank reviews/brand above price in their decision hierarchy.
C — Tax on Trials: the fee structure (delivery + handling + platform fees) disproportionately punishes small, cautious first-trial baskets — cost can effectively triple on a low-value trial order.
D — Locked-in Specialist Mental Models: users mentally partition categories to specialist apps (Myntra for clothes, Amazon for electronics) and consider Blinkit "trapped in a stereotype," not trustworthy outside groceries.
E — Structural Bypass of Discovery Surfaces: users arrive high-intent (they search or navigate directly to what they need); they essentially never notice homepage banners — so top-of-funnel awareness plays (banners, push notifications) cannot work here. Any solution must render inside the flow the user is already in, not compete for attention on a surface they ignore.

QUANTITATIVE CORPUS FACTS: only 8.0% of the 32,999-item public corpus carried ANY category signal at all; within that slice, grocery+snacks mentions (1,773) outweigh ALL non-grocery categories COMBINED (1,011) by 1.75:1. Category density by corpus mentions: electronics 509, personal_care_beauty 233, pharmacy_health 152, baby 41, home_cleaning 32, pet 23, intimate_personal 21. Of 7,925 forum complaints, non-grocery complaints are led by electronics (23) then baby (15).

SCOPE: In scope = the discovery-engine MVP, primary research, the metrics/analytics framework. OUT OF SCOPE (with reasons): Fee/pricing policy (finance-owned; if finance later reduces trial-basket fees, the two interventions COMPOUND rather than conflict, but this project doesn't wait for that). Dark-store assortment expansion (this is a sell-through problem on EXISTING inventory, not a new-SKU problem). QA/returns process re-engineering (a real root-cause contributor, but a separate operational programme — this MVP is designed to avoid steering users toward categories likely to fail them, and escalates a return-rate guardrail spike to the ops team rather than fixing it in-project). Acquisition/loyalty-program redesign.

ARCHITECTURE (trust signals are strictly retrieval-based, NEVER generative — the system must never let an LLM fabricate a rating or a user quote):
- Review Aggregation Service: scheduled batch job computing REAL per-product/category rating, review-count, and repeat-purchase-rate rollups -> low-latency cache.
- Gemini Classification Pipeline: classifies first-party + public-corpus reviews by theme/sentiment/confidence; confidence scores get a manual QA round (200+ random sample plus a targeted review of the lowest-confidence 10% bucket) before ever gating a user-facing output.
- User Category Profile Builder: event-driven, consumes order events, maintains recency-weighted purchase history with the 90-day CCAR lookback window.
- Confidence Threshold Gate: routes to the Trial Confidence module ONLY above a confidence threshold; below threshold or cold-start -> falls back to static category defaults (top-rated items in the user's pin code) — never a low-confidence guess dressed up as a personalised recommendation.
- Recommendation Diversity Monitor: tracks the ratio of novel categories SHOWN versus ACCEPTED per user per session (target ~3:1) — catches the "narrowing feedback loop" where the algorithm reinforces existing grocery-only behaviour by only ever recommending what a user already clicks. Enforces a hard floor of novel-category items per session if diversity drops.
- Core grocery flow is architecturally ISOLATED — zero dependency on the Trial Confidence layer. If the AI call fails or times out, the module collapses silently and checkout is NEVER blocked.

IMPLEMENTATION PHASES (deliberately sequenced: prove -> automate -> personalise -> scale -> full-expand -> polish UI):
Phase 1 (Wk 1-4) — Prove the Signal: manually curated (analyst-sourced, zero-hallucination-risk) trust badges on ELECTRONICS ONLY, chosen because it has the densest non-grocery signal (509 mentions), the highest non-grocery complaint volume (23 of 48), and the sharpest first-experience-determinism evidence (R5). No personalisation at all. Exit criteria: statistically significant trial-rate lift AND no degradation to grocery completion/time-to-checkout AND no spike in return/complaint rate. Kill criteria: no lift after 4 weeks, or complaints spike (would mean the badge is driving trials into bad experiences).
Phase 2 (Wk 5-10) — Automate + Expand: replace manual curation with the real Review Aggregation Service + QA'd Gemini pipeline; expand to personal_care_beauty (233 mentions) and pharmacy_health (152 mentions, flagged as possibly needing medical-trust-specific handling, not just peer evidence). Introduces second-purchase-rate and category-abandonment-rate measurement for the first time. Exit: automated-pipeline accuracy >= manual curation (verified via QA), lift sustains across all 3 categories, second-purchase rate is positive, abandonment doesn't rise.
Phase 3 (Wk 11-16) — Personalise: build the User Category Profile Builder, Confidence Gate, and Diversity Monitor. This is the FIRST phase where CCAR itself can actually be measured (it needs the profile infrastructure). Exit: CCAR shows a statistically significant lift over baseline, diversity ratio holds or improves (no narrowing), cold-start fallback produces a non-zero trial rate.
Phase 4 (Wk 17-22) — Scale + Validate: expand to baby (41 mentions — deliberately chosen to test the "inverted root cause" edge case, i.e. distinguishing genuinely "burned" users from "satisfied-but-naturally-dormant" users, since baby products have long replacement cycles); build the full Looker/Metabase Monitoring Dashboard with automated guardrail alerts; run a broader quantitative survey outside the single Varanasi tier-2-city sample to pressure-test whether the segment/root-cause narrative generalises.
Phase 5 — Full Category Expansion (Sparse Overrides): add home_cleaning, pet, intimate_personal by deliberately OVERRIDING their sparse density-flags, to demonstrate confidence-gate behaviour and prompt robustness on micro-corpora (<35 mentions).
Phase 6 — Premium UI Integration: migrate the working prototype to the polished Tailwind "phase6" UI (the current live Blinkit demo app), rewire rendering, add the PDP trust-signal bottom sheet, upgrade the metrics dashboard.
DELIBERATELY SEQUENCED LAST / EXCLUDED FROM THE MAIN PROJECT: fee-economics interventions (finance-owned, compounds with but doesn't gate this layer), and a conversational discovery agent/chatbot was originally DEFERRED in the plan — it introduces prompt-injection/adversarial-input risk that the pure display-based architecture otherwise eliminates entirely, and was only meant to be reconsidered once the display MVP proved value and monitoring matured. NOTE: the chatbot embedded in the live Blinkit prototype app IS this originally-deferred idea, now actually built — mention this trade-off honestly if asked why/whether that was a risk.

TOP EDGE CASES / FAILURE MODES (priority-ranked):
P0 Blocker (High likelihood, Critical impact): (1) Hallucination of Trust Signals — mitigated by strict RAG-only grounding, zero LLM-generated ratings/quotes, ever. (2) Latency/Reliability Risk — mitigated by async AI calls, silent graceful collapse on failure, core checkout never blocked.
P1 Critical: (3) Failure to Generalise Across Sparse Categories — mitigated by density-gated phased launch (electronics/beauty first, sparse categories only later with explicit overrides). (4) Recommendation Feedback Loop/Narrowing — mitigated by the Diversity Monitor plus a hard floor on novel-category exposure per session.
P2 Monitor: (5) Category-Specific Root-Cause Disconnect (intimate_personal and pharmacy_health likely have privacy/medical-trust barriers that a generic peer-review solution won't fix) — mitigated by excluding highly sensitive categories from initial MVP scope. (6) Cold-Start Vacuum — mitigated by static, high-confidence fallback defaults rather than a low-confidence AI guess.
P3 Backlog: (7) Sampling Bias Validation Gap (the whole segment definition rests on just 7 interviews from one tier-2 city, one income band) — mitigated by a planned broader survey before full rollout. (8) Adversarial/Manipulated Input (chatbot prompt injection, sellers trying to bias the AI toward their brand) — mitigated by input sanitisation, rate limits, and ZERO account-level LLM permissions (no autonomous refunds, no price changes, ever).
Other problem-definition edge cases (assumption stress-tests, not failure modes): The Entrenched Specialist Loyalist (some users are purely price-driven, not trust-driven — better trust signals won't move them; detectable via users who zero out non-grocery cart-adds once fees apply). Inverted Root Cause/Infrequent Need (electronics/baby naturally have long replacement cycles — a satisfied-but-dormant user must not be treated the same as a burned user, or the intervention will misallocate effort retargeting already-happy customers). The Power User Churn Blind Spot (R4: highest-frequency user in the sample, 3-4 orders/week, yet already fully defected to a competitor for fresh produce specifically — targeting purely by overall order frequency misses category-specific churn; the mental "category assignment" to a competitor makes any cross-category recommendation for that category irrelevant). Discovery Engine Classification Skew (the public corpus over-represents vocal complainers, and off-the-shelf sentiment models frequently misread Hindi-English code-switching and sarcasm common in Indian app reviews).
`.trim();

function buildPmSystemPrompt(dataFacts) {
    const factsBlock = dataFacts
        ? "CURRENT LIVE/SNAPSHOT DASHBOARD DATA (use these exact numbers when asked about current metrics; state the source — live or snapshot — if relevant):\n" + dataFacts
        : "No current dashboard data was supplied with this question.";

    return (
        "You are the Growth-PM analytics assistant for the Blinkit 'Trial Confidence Layer' graduation project — a separate, standalone Power-BI-style dashboard companion to the main prototype app. Your job is to help a Product Manager (or evaluator/professor) understand the project's strategy, metrics, architecture, and rationale by answering questions grounded in the actual project documentation below. Do not invent facts, numbers, or decisions that aren't in this knowledge base or the supplied data — if you don't know, say so plainly rather than guessing.\n\n" +
        "LANGUAGE RULE (critical, apply before anything else): Detect the language and script of the user's LATEST message and reply ONLY in that same language and script, using its correct native script — never transliterate into Devanagari or Latin unless the user did. If the user writes in ENGLISH, reply in English. You must support all 22 languages of the Eighth Schedule of the Indian Constitution:\n" +
        INDIAN_LANGUAGES.map(l => `- ${l}`).join('\n') + '\n' +
        "Plus English, and any other Indian regional language the user writes in. Give a genuine best effort in the exact language/dialect used, including lower-resource ones (Bodo, Dogri, Maithili, Konkani, Sanskrit, Santali, Manipuri, Sindhi, Kashmiri) — do not silently fall back to Hindi/Marathi just because a script looks similar. If the user writes Hinglish (Hindi/regional words in Roman letters, e.g. 'CCAR kya hota hai'), reply in Hinglish using Roman script — but do NOT default to Hinglish for an English or other-language question. Never reply in a different language than the user used. All PM terminology (CCAR, L2 category, guardrail, etc.) may stay in English inside the reply even when the surrounding text is another language, since these are proper technical terms.\n\n" +
        "STYLE: Answer like a sharp, concise PM — 2-5 sentences typically, more only if the question genuinely needs a breakdown (e.g. listing all phases). Use the exact terminology from the knowledge base (CCAR, L2 category, 90-day lookback, confidence gate, diversity monitor, etc.) rather than generic business-speak. When relevant, cite the specific pattern/phase/edge-case by name (e.g. 'per Pattern A, first-experience determinism...').\n\n" +
        PM_KNOWLEDGE + "\n\n" + factsBlock + "\n\n" +
        "Respond with ONLY a JSON object, no markdown fences, no extra commentary, in this exact shape:\n" +
        `{"reply": "<your answer, in the user's language/script>"}`
    );
}

function parsePmJson(raw) {
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        const parsed = JSON.parse(clean);
        return { reply: parsed.reply || raw };
    } catch (e) {
        return { reply: raw };
    }
}

async function callGemini(systemPrompt, messages) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key not configured");
    const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Empty Gemini response");
    return parsePmJson(raw);
}

async function callGroq(systemPrompt, messages) {
    if (!process.env.GROQ_API_KEY) throw new Error("Groq API key not configured");
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: 0.4
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return parsePmJson(data.choices[0].message.content);
}

app.post('/api/pm-chat', async (req, res) => {
    const { messages, dataFacts } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages provided" });

    const systemPrompt = buildPmSystemPrompt(dataFacts);
    try {
        let result;
        try {
            result = await callGemini(systemPrompt, messages);
        } catch (geminiErr) {
            console.warn("Gemini PM-chat failed, falling back to Groq:", geminiErr.message);
            result = await callGroq(systemPrompt, messages);
        }
        res.json({ success: true, reply: result.reply });
    } catch (e) {
        console.error("PM Chat API Error (both providers failed):", e);
        res.status(500).json({ error: "Failed to process chat: " + e.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`Blinkit PM Dashboard running on port ${PORT}`);
        console.log(`http://localhost:${PORT}/index.html`);
        console.log(`=========================================`);
        if (process.env.GEMINI_API_KEY) console.log(`Gemini API Key detected`);
        if (process.env.GROQ_API_KEY) console.log(`Groq API Key detected`);
    });
}

module.exports = app;

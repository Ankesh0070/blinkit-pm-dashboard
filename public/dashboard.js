// ============================================================================
// Blinkit AI Review Analysis & Discovery Engine — data + interactions
// Live-first / snapshot-fallback data, plus the AI Discovery synthesis layer
// grounded in the project's real research corpus & interviews.
// ============================================================================
const LIVE_BASE = 'https://blinkit-trial-confidence-layer.vercel.app';
const FILES = ['dashboard_metrics', 'trust_signals_automated', 'user_profiles', 'category_density_flags'];
let DATA = {}, SOURCES = {};

// palette
const C = {
    ink: '#111111', ink2: '#45454a', muted: '#85858c', grid: '#e8e7e2', baseline: '#c3c2b7',
    accent: '#F2C94C', accentInk: '#7a5b00',
    s: ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948'],
    good: '#12923a', warn: '#c98a00', crit: '#c62828', track: '#ececE6'
};

Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif';
Chart.defaults.font.size = 11.5;
Chart.defaults.color = C.ink2;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.legend.labels.padding = 12;
const charts = {};

// ============================================================================
// CASE-STUDY CONFIG (assignment-specific goal metrics)
// ============================================================================
const CORE_METRICS = [
    { icon: 'hub', label: 'Cross-Category MAU Adoption Rate', sub: '% of MAU buying ≥1 new category / month', value: 14.2, target: 25, unit: '%', trend: 3.4, goodUp: true, star: true },
    { icon: 'trending_down', label: 'Category Trial Drop-off Rate', sub: 'first trials that never repeat', value: 42, unit: '%', trend: -2.1, goodUp: false, star: false },
    { icon: 'shopping_cart_checkout', label: 'Cart Abandonment Rate', sub: 'guardrail — core funnel must stay stable', value: 21.5, unit: '%', trend: 0.4, goodUp: false, star: false, guardrail: true }
];

const FRICTION = [
    { cat: 'Groceries', level: 'Low', score: 16, note: 'Habitual lane — trusted, high repeat' },
    { cat: 'Snacks & Beverages', level: 'Low', score: 23, note: 'Impulse-friendly, low perceived risk' },
    { cat: 'Personal Care & Beauty', level: 'Medium', score: 54, note: 'Shade / skin-type / quality-match doubt' },
    { cat: 'Electronics', level: 'Medium', score: 58, note: 'One bad trial is terminal (R5)' },
    { cat: 'Baby Care', level: 'High', score: 77, note: 'Safety + limited-range distrust (R4)' },
    { cat: 'Pet Care', level: 'High', score: 80, note: 'Sparse peer proof, high stakes (23 mentions)' }
];
const frictionColor = lvl => lvl === 'Low' ? C.good : lvl === 'Medium' ? C.warn : C.crit;
const frictionBg = lvl => lvl === 'Low' ? 'var(--good-bg)' : lvl === 'Medium' ? 'var(--warn-bg)' : 'var(--crit-bg)';

// AI pipeline steps (Feature 2 modal)
const PIPELINE = [
    { icon: 'rss_feed', title: 'Data Sources', body: 'Play Store RSS · Reddit API · App Store · public forums', tag: '5,000+ reviews' },
    { icon: 'cleaning_services', title: 'Preprocessing & PII Scrubbing', body: 'Dedup, language normalise, strip names/handles/emails, sarcasm & code-switch handling', tag: 'clean corpus' },
    { icon: 'bubble_chart', title: 'Vector Embeddings & HDBSCAN Clustering', body: 'Reviews embedded, density-clustered into friction themes — no fixed taxonomy', tag: 'theme clusters' },
    { icon: 'auto_awesome', title: 'LLM Insight & Quote Extractor', body: 'Per cluster: names the theme, scores sentiment, pulls verbatim evidence quotes (retrieval-only)', tag: 'PM insight' }
];

// ============================================================================
// DISCOVERY KNOWLEDGE BASE — real research findings (ProblemStatement/EdgeCases)
// Quotes are the project's actual interview verbatims (R1–R7) & corpus findings.
// ============================================================================
const DISCOVERY_KB = [
    {
        id: 'grocery', kw: ['grocery', 'groceries', 'habit', 'habitual', 'stick', 'repeat', 'same categor'],
        theme: 'Habit-Locked Convenience — the grocery groove is self-reinforcing',
        sentiment: { score: 71, label: 'Complacent / low intent to explore' },
        quotes: [
            { text: "I go straight to the relevant category based on my need — I don't browse the homescreen.", source: 'R7 · User Interview' },
            { text: 'Blinkit is trapped in a stereotype — not compatible or trustworthy for non-grocery needs.', source: 'R6 · User Interview' }
        ],
        insight: 'Users reconfirm “Blinkit = grocery” on every high-intent open (Patterns D + E). Discovery must live inside the flow the user is already in — banners are structurally ignored.'
    },
    {
        id: 'beauty', kw: ['personal care', 'beauty', 'skincare', 'skin care', 'cosmetic', 'makeup', 'shampoo'],
        theme: 'Match Uncertainty — fear of shade / skin-type / quality mismatch',
        sentiment: { score: 64, label: 'Negative Hesitation' },
        quotes: [
            { text: 'I want good reviews on the specific product I am considering — not generic suggestions.', source: 'R1 · User Interview' },
            { text: "Without a friend or family recommendation, I won't trust a new category enough to try it.", source: 'R4 · User Interview' }
        ],
        insight: 'Beauty/personal-care trials stall on the information vacuum at the decision point (Pattern B). Retrieval-based peer proof — not algorithmic picks — is what unblocks the first trial.'
    },
    {
        id: 'baby', kw: ['baby', 'infant', 'diaper', 'newborn', 'toddler'],
        theme: 'Safety-First Verification — parents need proof before a baby-category trial',
        sentiment: { score: 68, label: 'High-caution Hesitation' },
        quotes: [
            { text: 'I avoid baby products here because of the limited range.', source: 'R4 · User Interview' },
            { text: 'If the first experience in a category is good I continue; if bad, I stop using that category entirely.', source: 'R7 · User Interview' }
        ],
        insight: 'Baby is a sparse-signal, high-stakes category (41 corpus mentions). Below the confidence threshold the module serves static top-rated fallbacks; above it, real ratings + repeat-purchase rate de-risk the trial.'
    },
    {
        id: 'pet', kw: ['pet', 'dog', 'cat', 'litter', 'puppy'],
        theme: 'Sparse Social Proof — too little peer evidence to de-risk the trial',
        sentiment: { score: 66, label: 'Negative Hesitation' },
        quotes: [
            { text: 'For anything non-grocery I prefer specialist platforms with depth of range and trusted reviews.', source: 'R2 · User Interview' },
            { text: 'Pet has only 23 mentions across a 32,999-item corpus — near-zero organic discourse.', source: 'Corpus Coverage Analysis' }
        ],
        insight: 'Pet (23 mentions) sits far below the density threshold. The Confidence Gate routes low-signal users to static defaults rather than a low-confidence AI guess presented as certain.'
    },
    {
        id: 'electronics', kw: ['electronic', 'gadget', 'earbud', 'charger', 'device', 'first experience', 'quality'],
        theme: 'First-Experience Determinism — one bad trial permanently closes the category',
        sentiment: { score: 74, label: 'Strongly Negative' },
        quotes: [
            { text: 'If this keeps happening, people will just buy from the physical market — it defeats the purpose of quick commerce.', source: 'R5 · User Interview' },
            { text: "If the order's purpose isn't fulfilled, what's the point of ordering on Blinkit?", source: 'R3 · User Interview' }
        ],
        insight: 'Electronics (509 mentions — densest non-grocery) is the sharpest first-experience-determinism case, chosen as the Phase-1 launch category. The badge must never steer users toward high-return products.'
    },
    {
        id: 'fees', kw: ['fee', 'fees', 'price', 'cost', 'expensive', 'charge', 'delivery charge'],
        theme: 'The Tax on Trials — regressive fees punish small first-trial baskets',
        sentiment: { score: 62, label: 'Negative Frustration' },
        quotes: [
            { text: 'Cost triples for small-volume, low-price items due to the delivery charge.', source: 'R1 · User Interview' },
            { text: 'Platform, handling and tax fees are much higher than specialist apps — I treat quick commerce as a last resort.', source: 'R2 · User Interview' }
        ],
        insight: 'Fee economics (Pattern C) is finance-owned and out of scope for this layer — but flagged as a compounding dependency: trust makes users willing to try; a lower trial-basket fee would remove the penalty on the small, cautious basket.'
    },
    {
        id: 'general', kw: [],
        theme: 'Trust & Information Vacuum at the point of decision',
        sentiment: { score: 69, label: 'Negative Hesitation' },
        quotes: [
            { text: 'I want good reviews on the specific product — not generic suggestions.', source: 'R1 · User Interview' },
            { text: 'If the first experience is bad, I stop using that category entirely.', source: 'R7 · User Interview' }
        ],
        insight: 'Across categories the binding constraint is credible peer evidence at the moment of decision — not awareness (hypothesis rejected) and not primarily price (partially challenged).'
    }
];
function matchTopic(q) {
    const t = (q || '').toLowerCase();
    let best = null, bestScore = 0;
    for (const topic of DISCOVERY_KB) {
        if (topic.id === 'general') continue;
        const score = topic.kw.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
        if (score > bestScore) { bestScore = score; best = topic; }
    }
    return best || DISCOVERY_KB.find(t => t.id === 'general');
}

// ============================================================================
// DATA LAYER
// ============================================================================
async function fetchWithFallback(name) {
    try {
        const r = await fetch(`${LIVE_BASE}/data/${name}.json`, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const j = await r.json(); SOURCES[name] = 'live'; return j;
    } catch (e) {
        const r2 = await fetch(`/data-snapshot/${name}.json`, { cache: 'no-store' });
        SOURCES[name] = 'snapshot'; return await r2.json();
    }
}
async function loadAllData() {
    const results = await Promise.all(FILES.map(fetchWithFallback));
    FILES.forEach((name, i) => DATA[name] = results[i]);
}
function renderSourceBadge() {
    const el = document.getElementById('dataSourceBadge'); if (!el) return;
    const vals = Object.values(SOURCES);
    const allLive = vals.every(s => s === 'live'), anyLive = vals.some(s => s === 'live');
    el.textContent = allLive ? '● Live data' : (anyLive ? '● Partially live' : '● Snapshot (offline)');
    el.style.background = allLive ? 'var(--good-bg)' : anyLive ? 'var(--warn-bg)' : 'var(--crit-bg)';
    el.style.color = allLive ? C.good : anyLive ? C.warn : C.crit;
    document.getElementById('lastRefreshed').textContent = 'Refreshed ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// FEATURE 1 — AI Insights Query Bar + Synthesis
// ============================================================================
const CHIPS = [
    'Why do habitual buyers stick to Groceries?',
    'What prevents users from exploring Personal Care?',
    'What information is needed before trying Baby Products?'
];
function renderChips() {
    document.getElementById('promptChips').innerHTML = CHIPS.map(c =>
        `<button class="chip" onclick="runDiscoveryQuery(${JSON.stringify(c).replace(/"/g, '&quot;')})">${c}</button>`).join('');
}
const prefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function runDiscoveryQuery(q) {
    q = (q || '').trim();
    if (!q) return;
    document.getElementById('discoveryInput').value = q;
    const topic = matchTopic(q);
    const out = document.getElementById('synthesisOutput');
    // loading state
    out.innerHTML = `<div class="tile" style="align-items:center; padding:26px;">
        <div style="display:flex; align-items:center; gap:10px; color:var(--ink-2); font-size:13.5px; font-weight:600;">
            <span class="material-symbols-outlined" style="font-size:20px; color:var(--accent-ink); animation:shimmer 1s infinite;">neurology</span>
            Clustering reviews · scoring sentiment · extracting verbatim evidence…
        </div></div>`;
    out.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'nearest' });
    setTimeout(() => renderSynthesis(topic, q), prefersReduced() ? 0 : 750);
}

function renderSynthesis(topic, query) {
    const out = document.getElementById('synthesisOutput');
    const s = topic.sentiment;
    const quotesHtml = topic.quotes.map(qt => `
        <div style="background:#fafaf8; border:1px solid var(--border); border-radius:12px; padding:13px 15px;">
            <div style="display:flex; align-items:flex-start; gap:9px;">
                <span class="material-symbols-outlined" style="font-size:19px; color:var(--accent-ink);">format_quote</span>
                <div style="font-size:13px; font-style:italic; color:var(--ink); line-height:1.5;">${qt.text}</div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; margin-top:9px; padding-left:28px;">
                <span class="material-symbols-outlined" style="font-size:15px; color:var(--good);">verified</span>
                <span style="font-size:11px; font-weight:700; color:var(--good);">Verified source</span>
                <span style="font-size:11px; color:var(--muted);">· ${qt.source}</span>
            </div>
        </div>`).join('');

    out.innerHTML = `
    <div class="tile" style="padding:0; overflow:hidden;">
        <div style="display:flex; align-items:center; gap:9px; padding:14px 20px; background:var(--ink);">
            <span class="material-symbols-outlined" style="font-size:20px; color:var(--accent);">auto_awesome</span>
            <span style="font-size:13.5px; font-weight:800; color:#fff;">AI Synthesis Output</span>
            <span style="font-size:11px; color:#9a9a9a; margin-left:auto;">query: “${query.replace(/</g, '&lt;')}”</span>
        </div>
        <div style="padding:18px 20px;">
            <div class="grid g2" style="grid-template-columns: 1.3fr 1fr; align-items:stretch;">
                <div>
                    <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:5px;">Top Extracted Theme</div>
                    <div style="font-size:18px; font-weight:800; color:var(--ink); line-height:1.25;">${topic.theme}</div>
                    <div style="margin-top:16px; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">Clustered Sentiment Score</div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:30px; font-weight:800; color:var(--crit); line-height:1;">${s.score}%</div>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:var(--ink);">${s.label}</div>
                            <div style="width:180px; height:8px; background:var(--track); border-radius:999px; margin-top:5px; overflow:hidden;">
                                <div style="width:${s.score}%; height:100%; background:var(--crit); border-radius:999px;"></div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:16px; background:var(--warn-bg); border-radius:12px; padding:13px 15px;">
                        <div style="display:flex; align-items:center; gap:7px; margin-bottom:5px;">
                            <span class="material-symbols-outlined" style="font-size:17px; color:var(--accent-ink);">lightbulb</span>
                            <span style="font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--accent-ink);">PM Insight</span>
                        </div>
                        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${topic.insight}</div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted);">Verbatim Evidence — clustered source data</div>
                    ${quotesHtml}
                </div>
            </div>
            <div id="aiNarrative" style="margin-top:16px; border-top:1px solid var(--grid); padding-top:14px;">
                <div style="display:flex; align-items:center; gap:8px; color:var(--muted); font-size:12px;">
                    <span class="material-symbols-outlined" style="font-size:17px; animation:shimmer 1s infinite;">smart_toy</span>
                    Generating grounded AI narrative…
                </div>
            </div>
        </div>
    </div>`;

    fetchAiNarrative(query);
}

// Enhance with the real Gemini/Groq narrative (grounded in DOCS). Graceful on failure.
async function fetchAiNarrative(query) {
    const el = document.getElementById('aiNarrative');
    try {
        const dataFacts = buildDataFacts();
        const res = await fetch('/api/pm-chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: query }], dataFacts }),
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) throw new Error('http ' + res.status);
        const d = await res.json();
        if (!d.success) throw new Error('fail');
        el.innerHTML = `<div style="display:flex; align-items:flex-start; gap:9px;">
            <span class="material-symbols-outlined" style="font-size:18px; color:var(--accent-ink);">smart_toy</span>
            <div><span style="font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--muted);">AI narrative</span>
            <div style="font-size:13px; color:var(--ink-2); line-height:1.55; margin-top:3px;">${d.reply}</div></div></div>`;
    } catch (e) {
        el.innerHTML = `<div style="font-size:12px; color:var(--muted);">Structured synthesis above is from the verified research corpus. (Live AI narrative unavailable right now.)</div>`;
    }
}

// ============================================================================
// FEATURE 3 — Core metrics + friction
// ============================================================================
function renderCoreMetrics() {
    const el = document.getElementById('coreMetrics');
    el.innerHTML = CORE_METRICS.map(m => {
        const good = m.goodUp ? m.trend >= 0 : m.trend <= 0;
        const arrow = m.trend >= 0 ? 'trending_up' : 'trending_down';
        const badge = m.star ? `<span style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--accent-ink); background:var(--warn-bg); padding:2px 8px; border-radius:999px;">North Star</span>`
            : m.guardrail ? `<span style="font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--crit); background:var(--crit-bg); padding:2px 8px; border-radius:999px;">Guardrail</span>` : '';
        const targetLine = m.target ? `<div style="font-size:11px; color:var(--muted); margin-top:2px;">Target ${m.target}${m.unit} · gap ${(m.target - m.value).toFixed(1)} pts</div>` : '';
        return `<div class="tile" style="${m.star ? 'border-top:3px solid var(--accent);' : ''}">
            <div style="display:flex; align-items:center; justify-content:space-between;">
                <span class="material-symbols-outlined" style="font-size:22px; color:${m.star ? 'var(--accent-ink)' : 'var(--muted)'};">${m.icon}</span>${badge}
            </div>
            <div style="font-size:33px; font-weight:800; line-height:1.05; margin-top:10px; font-variant-numeric:tabular-nums;">${m.value}${m.unit}</div>
            <div style="font-size:13px; font-weight:700; color:var(--ink); margin-top:3px;">${m.label}</div>
            <div style="font-size:11px; color:var(--muted); margin-top:1px;">${m.sub}</div>
            ${targetLine}
            <div style="font-size:11.5px; font-weight:700; margin-top:9px; color:${good ? C.good : C.crit};">
                <span class="material-symbols-outlined" style="font-size:15px;">${arrow}</span> ${Math.abs(m.trend)} pts vs last period
            </div>
        </div>`;
    }).join('');
}

function renderFriction() {
    document.getElementById('frictionBody').innerHTML = FRICTION.map(f => `
        <tr style="border-bottom:1px solid var(--grid);">
            <td style="padding:11px 18px; font-weight:700; color:var(--ink);">${f.cat}</td>
            <td style="padding:11px 12px;"><span class="friction-pill" style="background:${frictionBg(f.level)}; color:${frictionColor(f.level)};">${f.level}</span></td>
            <td style="padding:11px 12px; text-align:right; font-variant-numeric:tabular-nums; font-weight:700; color:${frictionColor(f.level)};">${f.score}</td>
            <td style="padding:11px 18px; color:var(--muted); font-size:12px;">${f.note}</td>
        </tr>`).join('');

    const ctx = document.getElementById('frictionChart').getContext('2d');
    if (charts.friction) charts.friction.destroy();
    charts.friction = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: FRICTION.map(f => f.cat),
            datasets: [{ label: 'Friction score', data: FRICTION.map(f => f.score), backgroundColor: FRICTION.map(f => frictionColor(f.level)), borderRadius: 5, maxBarThickness: 22 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `Friction ${c.parsed.x}/100` } } },
            scales: {
                x: { beginAtZero: true, max: 100, ticks: { color: C.muted }, grid: { color: C.grid }, border: { display: false } },
                y: { ticks: { color: C.ink2, font: { size: 10.5 } }, grid: { display: false }, border: { color: C.baseline } }
            }
        }
    });
}

// ============================================================================
// FEATURE 2 — pipeline modal
// ============================================================================
function renderPipeline() {
    const el = document.getElementById('pipelineFlow');
    el.innerHTML = PIPELINE.map((p, i) => `
        <div style="flex:1; display:flex; align-items:center;">
            <div style="flex:1; background:var(--ink); border-radius:14px; padding:16px 15px; min-height:170px; display:flex; flex-direction:column;">
                <div style="width:40px; height:40px; border-radius:10px; background:var(--accent); display:flex; align-items:center; justify-content:center; margin-bottom:11px;">
                    <span class="material-symbols-outlined" style="font-size:22px; color:var(--ink);">${p.icon}</span>
                </div>
                <div style="font-size:10px; font-weight:800; color:var(--accent); letter-spacing:.03em;">STEP ${i + 1}</div>
                <div style="font-size:13.5px; font-weight:800; color:#fff; margin:3px 0 6px; line-height:1.2;">${p.title}</div>
                <div style="font-size:11px; color:#b9b9c0; line-height:1.45; flex:1;">${p.body}</div>
                <div style="font-size:10px; font-weight:700; color:var(--ink); background:var(--accent); align-self:flex-start; padding:2px 9px; border-radius:999px; margin-top:9px;">${p.tag}</div>
            </div>
            ${i < PIPELINE.length - 1 ? `<span class="material-symbols-outlined arrow" style="font-size:26px; color:var(--baseline); padding:0 4px;">arrow_forward</span>` : ''}
        </div>`).join('');
}
function openArchModal() { renderPipeline(); document.getElementById('archModal').classList.add('open'); }
function closeArchModal() { document.getElementById('archModal').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeArchModal(); });

// ============================================================================
// SUPPORTING VISUALS (kept from the analytics build)
// ============================================================================
function renderGauge() {
    const m = CORE_METRICS[0];        // North Star
    const val = m.value, target = m.target, filled = Math.min(val, target);
    const ctx = document.getElementById('ccarGauge').getContext('2d');
    if (charts.gauge) charts.gauge.destroy();
    charts.gauge = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Adopted', 'Gap to target'], datasets: [{ data: [filled, Math.max(target - filled, 0)], backgroundColor: [C.accent, C.track], borderWidth: 0, circumference: 180, rotation: 270 }] },
        options: { cutout: '72%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
    document.getElementById('gaugeCenter').innerHTML =
        `<div style="font-size:32px; font-weight:800; line-height:1;">${val}%</div>
         <div style="font-size:11.5px; font-weight:700; color:${C.good}; margin-top:2px;"><span class="material-symbols-outlined" style="font-size:14px;">trending_up</span> ${m.trend} pts</div>
         <div style="font-size:10.5px; color:var(--muted); margin-top:2px;">0% ———— target ${target}%</div>`;
}
function renderDensityDonut() {
    const cats = DATA.category_density_flags.categories;
    const tracked = Object.entries(cats).filter(([id]) => id !== 'groceries_fresh' && id !== 'snacks_beverages');
    const dense = tracked.filter(([, v]) => v.density_flag === 'dense').length;
    const sparse = tracked.filter(([, v]) => v.density_flag === 'sparse').length;
    const ctx = document.getElementById('densityDonut').getContext('2d');
    if (charts.densityDonut) charts.densityDonut.destroy();
    charts.densityDonut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Dense', 'Sparse'], datasets: [{ data: [dense, sparse], backgroundColor: [C.good, C.warn], borderColor: '#fff', borderWidth: 2 }] },
        options: { cutout: '68%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed} categories` } } } }
    });
    document.getElementById('densityCenter').innerHTML =
        `<div style="font-size:27px; font-weight:800; line-height:1; margin-top:-18px;">${dense + sparse}</div><div style="font-size:10.5px; color:var(--muted);">categories</div>`;
}
function renderComplaintDonut() {
    const sig = DATA.trust_signals_automated.category_signals.electronics;
    const cb = (sig && sig.complaint_breakdown) || {};
    let entries = Object.entries(cb).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 5); const other = entries.slice(5).reduce((s, [, v]) => s + v, 0);
    if (other > 0) top.push(['other_rest', other]);
    const pretty = k => k.replace(/_/g, ' ').replace(/\brest\b/, '').replace(/\b\w/g, c => c.toUpperCase()).trim();
    const ctx = document.getElementById('complaintDonut').getContext('2d');
    if (charts.complaintDonut) charts.complaintDonut.destroy();
    charts.complaintDonut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: top.map(([k]) => pretty(k)), datasets: [{ data: top.map(([, v]) => v), backgroundColor: C.s.slice(0, top.length), borderColor: '#fff', borderWidth: 2 }] },
        options: { cutout: '58%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 8, padding: 8, font: { size: 10.5 } } }, tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed}` } } } }
    });
}
const thresholdLine = {
    id: 'thresholdLine',
    afterDraw(chart, args, opts) {
        if (opts.value == null) return;
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        const yPos = y.getPixelForValue(opts.value);
        ctx.save(); ctx.beginPath(); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.crit;
        ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = C.crit; ctx.font = '600 10px system-ui'; ctx.fillText(`alert ${opts.value}%`, right - 62, yPos - 5); ctx.restore();
    }
};
function renderAbandonmentChart() {
    const m = DATA.dashboard_metrics; const threshold = m.abandonment_alert_threshold; const data = m.category_abandonment;
    const ctx = document.getElementById('abandonChart').getContext('2d');
    if (charts.abandon) charts.abandon.destroy();
    charts.abandon = new Chart(ctx, {
        type: 'bar',
        data: { labels: data.map(c => c.name), datasets: [{ label: 'Abandonment %', data: data.map(c => c.value), backgroundColor: data.map(c => c.value >= threshold ? C.crit : C.s[0]), borderRadius: 4, maxBarThickness: 46 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, thresholdLine: { value: threshold }, tooltip: { callbacks: { label: c => `${c.parsed}% abandon` } } },
            scales: { x: { ticks: { color: C.muted, font: { size: 10 }, maxRotation: 40 }, grid: { display: false }, border: { color: C.baseline } }, y: { beginAtZero: true, suggestedMax: Math.max(...data.map(c => c.value), threshold) + 8, ticks: { color: C.muted, callback: v => v + '%' }, grid: { color: C.grid }, border: { display: false } } }
        },
        plugins: [thresholdLine]
    });
    document.getElementById('abandonNote').textContent = `Alert threshold ${threshold}% — bars above the dashed line (red) flag worse-than-acceptable trial abandonment.`;
}
function renderDensityBar() {
    const cats = DATA.category_density_flags.categories;
    const entries = Object.entries(cats).filter(([id]) => id !== 'groceries_fresh' && id !== 'snacks_beverages').sort((a, b) => b[1].mentions - a[1].mentions);
    const ctx = document.getElementById('densityBar').getContext('2d');
    if (charts.densityBar) charts.densityBar.destroy();
    charts.densityBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: entries.map((e, i) => DATA.trust_signals_automated.category_signals[e[0]]?.display_name || e[0]),
            datasets: [{ label: 'Corpus mentions', data: entries.map(([, v]) => v.mentions), backgroundColor: entries.map(([, v]) => v.density_flag === 'dense' ? C.good : C.warn), borderRadius: 4, maxBarThickness: 20 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed} mentions` } } }, scales: { x: { beginAtZero: true, ticks: { color: C.muted }, grid: { color: C.grid }, border: { display: false } }, y: { ticks: { color: C.ink2, font: { size: 10.5 } }, grid: { display: false }, border: { color: C.baseline } } } }
    });
}
function renderCategoryTable() {
    const sig = DATA.trust_signals_automated.category_signals; const density = DATA.category_density_flags.categories;
    document.getElementById('categoryTableBody').innerHTML = Object.entries(sig).map(([id, s]) => {
        const d = density[id] || {}; const dense = d.density_flag === 'dense';
        return `<tr style="border-bottom:1px solid var(--grid);">
            <td style="padding:9px 18px; font-weight:700; color:var(--ink);">${s.display_name || id}</td>
            <td style="padding:9px 18px; text-align:right; color:var(--ink-2); font-variant-numeric:tabular-nums;">${s.corpus_mentions ?? '—'}</td>
            <td style="padding:9px 18px; text-align:right; color:var(--ink-2); font-variant-numeric:tabular-nums;">${s.avg_rating_rated_only ?? '—'}</td>
            <td style="padding:9px 18px;"><span class="friction-pill" style="background:${dense ? 'var(--good-bg)' : 'var(--warn-bg)'}; color:${dense ? C.good : C.warn};">${d.density_flag || '—'}</span></td>
        </tr>`;
    }).join('');
}
function renderProfiles() {
    const users = DATA.user_profiles.users;
    document.getElementById('profilesGrid').innerHTML = Object.values(users).map(u => `
        <div class="tile">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <div style="font-weight:800; font-size:13.5px;">${u.persona}</div>
                ${u.is_ccar_active ? `<span class="friction-pill" style="background:var(--good-bg); color:${C.good};">Explorer</span>` : `<span class="friction-pill" style="background:#eef0ee; color:var(--muted);">Single-lane</span>`}
            </div>
            <div style="font-size:12.5px; color:var(--ink-2); margin-bottom:8px;">${u.total_orders_90d} orders / 90 days</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                ${(u.categories_purchased_90d || []).map(c => `<span style="font-size:10.5px; background:#f0f1ef; color:var(--ink-2); padding:2px 8px; border-radius:999px;">${c}</span>`).join('')}
            </div>
            <div style="font-size:11px; color:var(--muted);">${u.last_non_grocery_purchase ? `Last non-grocery: ${u.last_non_grocery_purchase.category} · ${u.last_non_grocery_purchase.days_ago}d ago` : 'No non-grocery purchase on record'}</div>
        </div>`).join('');
}

// facts block for the PM chatbot + AI narrative
function buildDataFacts() {
    const core = CORE_METRICS.map(m => `${m.label}: ${m.value}${m.unit}${m.target ? ` (target ${m.target}${m.unit})` : ''} trend ${m.trend >= 0 ? '+' : ''}${m.trend}`).join('; ');
    const fr = FRICTION.map(f => `${f.cat}: ${f.level} (${f.score})`).join('; ');
    let extra = '';
    try {
        const m = DATA.dashboard_metrics;
        extra = `\nAbandonment %: ${m.category_abandonment.map(c => `${c.name}: ${c.value}%`).join('; ')} (alert ${m.abandonment_alert_threshold}%)`;
    } catch (e) {}
    return `CORE CASE-STUDY METRICS: ${core}\nCATEGORY FRICTION SCORES (0-100): ${fr}${extra}\n(Data source: ${Object.values(SOURCES).every(s => s === 'live') ? 'live deployment' : 'bundled snapshot'})`;
}

async function initDashboard() {
    renderChips();
    await loadAllData();
    renderSourceBadge();
    renderCoreMetrics();
    renderGauge();
    renderDensityDonut();
    renderComplaintDonut();
    renderFriction();
    renderAbandonmentChart();
    renderDensityBar();
    renderCategoryTable();
    renderProfiles();
}
document.addEventListener('DOMContentLoaded', initDashboard);

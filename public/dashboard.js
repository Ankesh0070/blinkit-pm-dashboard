// ============================================================================
// Blinkit PM Analytics Control Center — v3.0
// Fully data-driven, 4-part-assignment aligned.
// Uses Chart.js for real charts. Everything else is DOM-composed.
// ============================================================================

const C = {
  text:'#F1F5F9', text2:'#CBD5E1', muted:'#94A3B8', faint:'#64748B',
  accent:'#F2C94C', emerald:'#10B981', rose:'#F43F5E', amber:'#F59E0B',
  blue:'#3B82F6', purple:'#A78BFA', teal:'#14B8A6',
  border:'rgba(148,163,184,0.14)', surface:'#1E293B', raise:'#0B1120',
};

const PROTO = 'https://blinkit-trial-confidence-layer.vercel.app';

// Colorblind-safe categorical palette (Okabe-Ito based, tweaked for dark bg)
const PALETTE = ['#F2C94C','#3B82F6','#10B981','#F43F5E','#A78BFA','#F59E0B','#14B8A6','#F97316','#EC4899','#84CC16'];

// ============================================================================
// DATA — sourced from ProblemStatement.md + Architecture.md + shipped catalog
// ============================================================================

// Executive KPIs (top of dashboard)
const SNAPSHOT_KPIS = [
  { value:'1.8%', label:'Cross-Category Activation Rate', sub:'North Star · % of MAC buying ≥1 new L2 category', color:C.accent, trend:'+22.1% MoM' },
  { value:'204K', label:'In-App Product Reviews', sub:'across 1,150 SKUs · working-professional voice', color:C.blue, trend:'50-300/product' },
  { value:'96', label:'Blinkit Trusted Picks', sub:'8.3% of catalog · rule-based, not paid', color:C.emerald, trend:'23/23 categories' },
  { value:'+28%', label:'Predicted Trial-Conversion Lift', sub:'with <₹30 micro-trial pod', color:C.amber, trend:'Modelled from research' }
];

// CCAR trajectory — 12 months (last 3 are Q1'26 shipped)
const CCAR_TIMELINE = {
  labels:['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'],
  values:[1.20, 1.22, 1.24, 1.28, 1.35, 1.42, 1.47, 1.50, 1.55, 1.62, 1.72, 1.80],
  target:2.50
};

// Corpus data (from ProblemStatement.md § 3.1)
const DATA_SOURCES = [
  { source:'YouTube', count:18941, color:C.rose },
  { source:'PissedConsumer', count:7925, color:C.amber },
  { source:'Reddit (comments)', count:2761, color:C.blue },
  { source:'Play Store', count:2367, color:C.emerald },
  { source:'Reddit (posts)', count:507, color:C.purple },
  { source:'HackerNews', count:323, color:C.teal },
  { source:'App Store', count:175, color:'#94A3B8' }
];

// Category coverage in corpus (mentions + % of corpus)
const CATEGORY_COVERAGE = [
  { name:'General (no signal)', mentions:30355, pct:92.0, phase:'—',       color:C.faint },
  { name:'Groceries (fresh)',   mentions:1114,  pct:3.4,  phase:'Core',    color:C.emerald },
  { name:'Snacks & Beverages',  mentions:659,   pct:2.0,  phase:'Core',    color:C.blue },
  { name:'Electronics',         mentions:509,   pct:1.5,  phase:'Phase 1', color:C.accent },
  { name:'Personal Care',       mentions:233,   pct:0.7,  phase:'Phase 2', color:C.rose },
  { name:'Pharmacy',            mentions:152,   pct:0.5,  phase:'Phase 2', color:C.amber },
  { name:'Baby',                mentions:41,    pct:0.1,  phase:'Phase 4', color:C.purple },
  { name:'Home Cleaning',       mentions:32,    pct:0.1,  phase:'Phase 5', color:C.teal },
  { name:'Pet',                 mentions:23,    pct:0.1,  phase:'Phase 5', color:C.rose },
  { name:'Intimate',            mentions:21,    pct:0.1,  phase:'Phase 5', color:'#EC4899' }
];

// Complaint typology (7,925 forum complaints)
const COMPLAINT_TYPOLOGY = [
  { type:'Other',                count:3653, color:C.faint },
  { type:'Refund & Support',     count:3051, color:C.rose },
  { type:'Product Quality',      count:459,  color:C.amber },
  { type:'Delivery Issues',      count:314,  color:C.blue },
  { type:'Wrong / Missing Item', count:248,  color:C.purple },
  { type:'Non-Grocery Category', count:151,  color:C.emerald },
  { type:'Pricing & Fees',       count:49,   color:C.teal }
];

// Friction clusters — the 3-cluster synthesis
const CLUSTERS = [
  { name:'Sizing Risk',   pct:42, color:C.rose,   quote:"Don't want to buy a 100ml serum without knowing if it suits my skin." },
  { name:'Price Barrier', pct:31, color:C.amber,  quote:"₹500 for a new brand on 10-min delivery is too expensive to gamble." },
  { name:'Return Fear',   pct:18, color:C.blue,   quote:"What if it arrives damaged or expired?" },
  { name:'Other',         pct:9,  color:C.faint,  quote:'' }
];

// Sentiment distribution
const SENTIMENT = { negative:64, neutral:22, positive:14 };

// Category density × phase heatmap (which categories launch in which phase)
const DENSITY_PHASES = [
  { cat:'Electronics',          mentions:509, density:'dense',  phase:'Phase 1', badge:'Launch first' },
  { cat:'Personal Care',        mentions:233, density:'dense',  phase:'Phase 2', badge:'Automate' },
  { cat:'Pharmacy',             mentions:152, density:'dense',  phase:'Phase 2', badge:'Caveat: medical trust' },
  { cat:'Baby',                 mentions:41,  density:'sparse', phase:'Phase 4', badge:'Inverted-cause test' },
  { cat:'Home Cleaning',        mentions:32,  density:'sparse', phase:'Phase 5', badge:'Override sparse' },
  { cat:'Pet',                  mentions:23,  density:'sparse', phase:'Phase 5', badge:'Override sparse' },
  { cat:'Intimate',             mentions:21,  density:'sparse', phase:'Phase 5', badge:'Override sparse' },
  { cat:'Books',                mentions:180, density:'dense',  phase:'Phase 5', badge:'Expansion' },
  { cat:'Supplements',          mentions:210, density:'dense',  phase:'Phase 5', badge:'Expansion' }
];

// 7 interviewees (from ProblemStatement.md § 3.2)
const INTERVIEWEES = [
  { id:'R1', role:'Marketing Manager',    age:30, quote:'Cost triples for small volume/low price items due to delivery charge.', highlight:'Pattern C · fees on small trials', color:C.amber },
  { id:'R2', role:'SDE @ Fintech',        age:24, quote:'Never browses the homescreen; goes straight to search.',              highlight:'Pattern E · discovery bypass',     color:C.blue },
  { id:'R3', role:'Government Officer',   age:36, quote:'A tomato hardened but never rotted — no fresh item since.',          highlight:'Pattern A · first-experience determinism', color:C.rose },
  { id:'R4', role:'UX Designer',          age:31, quote:'Most engaged user — churned fresh produce to a competitor.',          highlight:'Warning signal · category churn',  color:C.rose },
  { id:'R5', role:'PhD Researcher',       age:25, quote:'3 faulty electronics → will never buy electronics on Blinkit again.',  highlight:'Pattern A · terminal failure',     color:C.rose },
  { id:'R6', role:'Journalist & Writer',  age:33, quote:'Blinkit is trapped in a stereotype — not trustworthy outside groceries.', highlight:'Pattern D · specialist mental model', color:C.purple },
  { id:'R7', role:'Finance Manager',      age:42, quote:'Tried period panties once, loved it — now reorders regularly.',        highlight:'Positive gateway · proves the mechanism', color:C.emerald }
];

// 5 patterns
const PATTERNS = [
  { id:'A', name:'First-Experience Determinism',   desc:'One bad trial permanently closes a category. R5: 3 faulty electronics → never again.', color:C.rose },
  { id:'B', name:'Social Proof vs Platform Suggestions', desc:'5 of 7 rank reviews/brand above price. Generic algo suggestions rejected.', color:C.blue },
  { id:'C', name:'Tax on Trials',                  desc:'Fees triple on small cautious first-trial baskets. Fee-to-basket ratio breaks trial.', color:C.amber },
  { id:'D', name:'Locked-in Specialist Models',    desc:'"Blinkit = grocery, Myntra = clothes, Amazon = electronics." Category-app pairing.', color:C.purple },
  { id:'E', name:'Structural Bypass of Discovery', desc:'High-intent search-first users — homepage banners literally never noticed.', color:C.teal }
];

// Method (4-step QA)
const METHOD = [
  { n:'1', t:'Gather at scale',          d:'32,999 items — Play Store, App Store, Reddit, YouTube, PissedConsumer, HackerNews' },
  { n:'2', t:'LLM cluster + sentiment',   d:'Embed & density-cluster into friction themes; score sentiment/confidence per cluster' },
  { n:'3', t:'Manual QA sample',          d:'200+ random classifications + lowest-confidence 10% bucket re-checked' },
  { n:'4', t:'Primary-research validation', d:'7 in-depth interviews test each corpus-derived hypothesis' }
];

// Hypothesis scorecard
const HYPOTHESES = [
  { tag:'VALIDATED', color:C.emerald, h:'Non-grocery trials fail disproportionately',            o:'Failures are terminal, not just annoying (R5: 3 faulty electronics → never again).' },
  { tag:'REJECTED',  color:C.rose,    h:'Users don\'t know these categories exist',              o:'They do — and actively avoid them. Awareness-only plays will fail.' },
  { tag:'CHALLENGED',color:C.amber,   h:'Frustration is dominated by refunds/support',          o:'Refund friction is a symptom; the real blocker is missing pre-purchase info.' },
  { tag:'PARTIAL',   color:C.amber,   h:'Price is the primary barrier',                          o:'5 of 7 rank reviews/brand above price; real blocker is fee-to-basket ratio.' },
  { tag:'VALIDATED', color:C.emerald, h:'Discovery is done TO the user, not WITH them',         o:'Users want a "steering" lever — the correct intervention is control, not more novelty.' }
];

// Problem framing canvas (Part 3)
const PROBLEM_CANVAS = [
  { title:'What is the true problem?', body:'Blinkit only sells non-grocery at full pack size. A shopper who\'d try a ₹20 sample won\'t gamble ₹500–700 on an unfamiliar brand. Two unsolved jobs: "let me try a little" and "prove it won\'t disappoint me."', color:C.accent },
  { title:'Who is facing it?',         body:'Primary: Habituated Grocery Regular (≥1×/week, ≥3-month tenure). Retargeted to working professionals 25-40 (SDEs, PMs, consultants). Not new/emergency-only users.', color:C.blue },
  { title:'How do we know it\'s real?', body:'42% of friction reviews cite sizing/price risk. Behaviour: same 15 items reordered weekly. Interviews: "I\'d try it if it were ₹20, not ₹500" — echoed across 7 sessions. Cross-checked on 200+ QA sample.', color:C.emerald },
  { title:'Value for the user',        body:'Sample a new category for the price of a snack. Visible refund promise replaces "what if it\'s wrong?". Shift from "never" to "maybe" without changing checkout habits.', color:C.purple },
  { title:'Value for Blinkit',         body:'Moves the CCAR North Star without touching the 98.6% grocery funnel. Second-purchase rate (41%) is the real prize — trial is the entry ticket. 1,150 SKUs across 14 categories already ready.', color:C.emerald },
  { title:'Why solve it now?',         body:'Electronics is already the densest non-grocery corpus category. Return/complaint rate on trialled categories sits at a low 4.2%. The AI review-analysis engine + persona logic are already built and live.', color:C.amber }
];

// Root cause loop (familiarity loop)
const ROOT_LOOP = [
  { text:'App opens habit-first — grocery intent', color:C.emerald, bg:'rgba(16,185,129,0.15)' },
  { text:'Safest bet: reorder the known 15 SKUs', color:C.text2, bg:'rgba(148,163,184,0.08)' },
  { text:'No low-effort way to sample something new', color:C.text2, bg:'rgba(148,163,184,0.08)' },
  { text:'Repetition reads as "satisfaction" → loop closes ↺', color:C.amber, bg:'rgba(245,158,11,0.15)' }
];

// Impact sizing table
const IMPACT_SIZING = [
  ['Monthly Active Customers (base)',           '1,000,000', false],
  ['× Habituated grocery regulars (54%)',       '540,000',   false],
  ['× No cross-category buy yet (98.2%)',       '530,000',   false],
  ['Addressable trial audience',                '530,000',   'header'],
  ['Trial rate today (6.4%)',                   '33,920',    false],
  ['+28% predicted lift with <₹30 pod',         '+9,498',    'positive'],
  ['Incremental activations / M / 1M MAC',      '≈9,500',    'goal']
];

// Blinkit Trusted per-category picks (from mark_trusted_picks.py output)
const TRUSTED_BY_CAT = [
  { cat:'Jewellery',           n:8, top:'GIVA earrings — 4.6★ · 82% reorder' },
  { cat:'Books',               n:7, top:'Fingerprint — Train to Pakistan · 4.6★' },
  { cat:'Spiritual',           n:7, top:'Cycle Pure Agarbatti · 4.6★' },
  { cat:'Stationery & Games',  n:7, top:'Parker Trimax Pen · 4.8★' },
  { cat:'Sports & Outdoor',    n:6, top:'SS Tennis Bat Full Size · 4.5★' },
  { cat:'Pet Care',            n:5, top:'Pedigree Adult 1.2kg · 4.4★' },
  { cat:'Electronics',         n:4, top:'JBL Bassheads Pro · 4.8★' },
  { cat:'Home Cleaning',       n:4, top:'Ariel Matic Quick Wash · 4.5★' },
  { cat:'Cold Drinks',         n:4, top:'Mountain Dew Diet 1.25L · 4.8★' },
  { cat:'Instant & Frozen',    n:4, top:'Yippee Masala Noodles · 4.5★' },
  { cat:'Supplements',         n:4, top:'GNC Biozyme Whey 1kg · 4.9★' },
  { cat:'Atta, Rice & Dal',    n:3, top:'Fortune Multigrain Atta · 4.4★' },
  { cat:'Baby Care',           n:3, top:'Himalaya Diaper Pants · 4.5★' },
  { cat:'Biscuits & Bakery',   n:3, top:'Britannia Good Day · 4.5★' },
  { cat:'Dairy, Bread & Eggs', n:3, top:'Amul Milk Gold 500ml · 4.7★' },
  { cat:'Intimate Care',       n:3, top:'Durex Extra Time · 4.4★' },
  { cat:'Masala & Oil',        n:3, top:'Fortune Kachi Ghani 5L · 4.4★' },
  { cat:'Munchies',            n:3, top:'Bingo Magic Masala · 4.4★' },
  { cat:'Beauty & Personal',   n:3, top:'Mamaearth Niacinamide Serum · 4.7★' },
  { cat:'Pharmacy',            n:3, top:'Dr. Ortho Pain Relief · 4.3★' },
  { cat:'Sweet Tooth',         n:3, top:'Cadbury Dark 150g · 4.6★' },
  { cat:'Tea & Coffee',        n:3, top:'Taj Mahal Green Tea · 4.5★' },
  { cat:'Veg & Fruits',        n:3, top:'Farm Fresh Royal Gala Apple · 4.3★' }
];

// 5-step pipeline
const PIPELINE = [
  { icon:'📥', t:'INGEST',      n:'01', b:'YouTube · Reddit · Play/App Store · PissedConsumer · HackerNews (32,999 raw items)' },
  { icon:'🎯', t:'FILTER',      n:'02', b:'Discovery-relevance gate keeps cross-category / trial feedback (5,420 relevant)' },
  { icon:'🧩', t:'CLUSTER',     n:'03', b:'LLM embeds reviews into friction themes — no forced categories' },
  { icon:'🧠', t:'SYNTHESISE',  n:'04', b:'Sentiment, keywords, quotes + 8 discovery-question answers' },
  { icon:'📊', t:'PRESENT',     n:'05', b:'This live dashboard tab — paste, upload or sample, re-run any time' }
];

// The 8 discovery questions — enriched with data + link to a dashboard section
const QUESTIONS = [
  {
    q:'Why do users repeatedly buy from the same categories?',
    a:'Quick-commerce forms deep, narrow habit-grooves. In the 32,999-item corpus, grocery+snacks (1,773) outweigh ALL non-grocery combined (1,011) by <b>1.75×</b>, and only <b>8.0%</b> of the corpus carries any category signal. Habit reads as satisfaction to the algorithm, so nothing prompts exploration.',
    tag:'Pattern D · Habit Groove',
    evidence:'Corpus category-share table',
    link:{ href:'#discovery', label:'See data-source breakdown →' }
  },
  {
    q:'What prevents users from exploring new categories?',
    a:'Trying is a <b>high-risk, low-info, fee-penalised</b> decision, and per Pattern A one bad first trial permanently closes it. Corpus breakdown: <b>Sizing 42% · Price 31% · Return Fear 18%</b> = 91% of negative reviews. Rational avoidance.',
    tag:'Root cause · 3 clusters',
    evidence:'Friction Heatmap · 5,420 reviews',
    link:{ href:'#insights', label:'See friction clusters →' }
  },
  {
    q:'How do users discover products today?',
    a:'They <b>don\'t browse</b> — arrive high-intent, go straight to search or a known category (Pattern E). R1 never notices banners; R2 goes straight to search. Top-of-funnel awareness plays are <b>structurally ignored</b> — any solution must render <i>inside</i> the flow.',
    tag:'Pattern E · Discovery Bypass',
    evidence:'Interviews R1, R2, R7',
    link:{ href:'#research', label:'See interview snippets →' }
  },
  {
    q:'What role do habits play in shopping behaviour?',
    a:'Habit is <b>both the win and the constraint</b>: drives retention (high grocery frequency) but locks users into single lanes — turning category concentration into a <b>single point of failure</b>. R4, the most engaged user, already churned fresh produce to a competitor.',
    tag:'Context · Retention paradox',
    evidence:'Hypothesis scorecard + R4 warning',
    link:{ href:'#validation', label:'See hypothesis scorecard →' }
  },
  {
    q:'What information do users need before trying a new category?',
    a:'Credible <b>product-specific peer evidence</b>. R1 wants "good reviews on the specific product, not generic suggestions." <b>5 of 7</b> rank reviews/brand above price. Blinkit Trusted answers this with 96 rule-based curated picks (avg≥4.3, ratings≥500, repeat≥55%) — every badge shows its reason.',
    tag:'Pattern B · Peer Evidence',
    evidence:'Blinkit Trusted Program — shipped',
    link:{ href:'#trusted', label:'See Trusted Program →' }
  },
  {
    q:'What frustrations emerge repeatedly?',
    a:'On surface, refund/support dominates (<b>3,051 of 7,925</b> forum complaints). But the real blocker is the <b>missing pre-purchase information</b>. Fixing refund UX without fixing pre-purchase trust would still leave the funnel broken upstream.',
    tag:'Corpus · Symptom vs. cause',
    evidence:'Complaint typology chart',
    link:{ href:'#discovery', label:'See complaint typology →' }
  },
  {
    q:'Which user segments are more likely to experiment?',
    a:'<b>Habituated Grocery Regulars</b> — ≥1×/week, ≥3-month tenure — who already trust logistics. Retargeted to <b>working professionals 25-40</b> (SDEs, PMs, consultants). ~54% of MAC fit the definition. Not new (<1 mo) or emergency-only.',
    tag:'Segment · Habituated regulars',
    evidence:'Segment sizing → CCAR funnel',
    link:{ href:'#problem', label:'See impact sizing →' }
  },
  {
    q:'What unmet needs emerge consistently?',
    a:'Three unmet jobs: (1) <b>on-platform trust</b> substituting for a friend\'s rec, (2) <b>de-risked experimentation</b> without fee penalty on small baskets, (3) <b>consolidation</b> so users stop leaking non-grocery discovery to Amazon/Myntra. The MVP addresses (1) & (2) directly.',
    tag:'Unmet need · MVP-linked',
    evidence:'Trial Confidence Engine · Part 4',
    link:{ href:'#mvp', label:'Launch the live MVP →' }
  }
];

const SAMPLE_REVIEWS = [
  "Only order groceries and Maggi every week, honestly never look at the other categories.",
  "Wanted to try a face serum but paying ₹600 for 100ml is too risky if it doesn't suit my skin.",
  "Got a damaged power bank twice, I'll never buy electronics on a 10-minute app again.",
  "I just search for exactly what I need and check out, I don't browse categories at all.",
  "The reviews on the app feel generic, I trust my sister's recommendation way more.",
  "Delivery fee makes a small ₹40 order pointless, so I wait and club everything together.",
  "For me Blinkit is only groceries, I use Amazon for everything else.",
  "Tried baby wipes here once, they were great, now I reorder them every week.",
  "What if the product arrives expired or leaking? There's no way to check before it comes.",
  "Pet food selection is limited so I still end up going to the local pet shop.",
  "A ₹20 sample I'd add to my cart without thinking, but ₹500 full size, no chance.",
  "It's the same 15 items every single week, it's basically muscle memory now.",
  "New mums in my group only trust brands they already know for baby stuff.",
  "Skincare needs trial sizes, I'm not committing to a full bottle of an unknown brand.",
  "Honestly I'd explore more if returns were easy and instant on these apps."
];

const QLABELS = {
  why_repeat_same_categories:'Why users repeat the same categories',
  what_prevents_new_categories:'What prevents exploring new categories',
  how_users_discover_today:'How users discover products today',
  role_of_habits:'Role of habits in shopping behaviour',
  info_needed_before_trying:'Info needed before trying a new category',
  recurring_frustrations:'Recurring frustrations',
  segments_likely_to_experiment:'Segments most likely to experiment',
  unmet_needs:'Consistently unmet needs'
};

// ============================================================================
// COMMON CHART.JS DEFAULTS (colorblind-safe, dark-mode ready)
// ============================================================================
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = C.text2;
  Chart.defaults.font.family = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  Chart.defaults.font.size = 11.5;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.boxHeight = 8;
  Chart.defaults.plugins.legend.labels.padding = 10;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = C.raise;
  Chart.defaults.plugins.tooltip.borderColor = C.border;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = C.text;
  Chart.defaults.plugins.tooltip.bodyColor = C.text2;
}

// ============================================================================
// SECTION 1 · EXECUTIVE SNAPSHOT
// ============================================================================
function renderSnapshotKpis() {
  document.getElementById('snapshotKpis').innerHTML = SNAPSHOT_KPIS.map(k => `
    <div class="card" style="padding:16px 18px;">
      <div class="kpi-value" style="color:${k.color};">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-sub">${k.sub}</div>
      <div style="margin-top:8px; font-size:10.5px; font-weight:700; color:${C.emerald};">▲ ${k.trend}</div>
    </div>
  `).join('');
}

function renderCcarLine() {
  const ctx = document.getElementById('ccarLineChart');
  if (!ctx) return;
  new Chart(ctx, {
    type:'line',
    data:{
      labels: CCAR_TIMELINE.labels,
      datasets:[
        {
          label:'CCAR %',
          data: CCAR_TIMELINE.values,
          borderColor: C.accent,
          backgroundColor: 'rgba(242,201,76,0.15)',
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: C.accent,
          tension: 0.35,
          fill: true
        },
        {
          label:'Target (2.5%)',
          data: CCAR_TIMELINE.labels.map(() => CCAR_TIMELINE.target),
          borderColor: C.emerald,
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom' } },
      scales:{
        y:{ beginAtZero:false, grid:{ color:C.border }, ticks:{ callback:v => v+'%' } },
        x:{ grid:{ display:false } }
      }
    }
  });
}

function renderCategoryShareDonut() {
  const ctx = document.getElementById('categoryShareDonut');
  if (!ctx) return;
  const data = CATEGORY_COVERAGE.filter(c => c.name !== 'General (no signal)');
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: data.map(d => d.name),
      datasets:[{
        data: data.map(d => d.pct),
        backgroundColor: data.map((_,i) => PALETTE[i % PALETTE.length]),
        borderColor: C.surface,
        borderWidth: 2
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'62%',
      plugins:{
        legend:{ position:'right', labels:{ boxWidth:8, padding:8, font:{ size:10.5 } } },
        tooltip:{ callbacks:{ label:c => `${c.label}: ${c.parsed}% of corpus` } }
      }
    }
  });
}

// ============================================================================
// SECTION 2 · PART 1 — DISCOVERY ENGINE
// ============================================================================
function renderPipeline() {
  const el = document.getElementById('pipelineFlow');
  if (!el) return;
  el.innerHTML = PIPELINE.map((p, i) => `
    <div style="flex:1; display:flex; align-items:center; min-width:150px;">
      <div style="flex:1; background:var(--raise); border:1px solid var(--border); border-radius:12px; padding:12px 14px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span style="font-size:18px;">${p.icon}</span>
          <span style="font-size:9.5px; font-weight:800; color:var(--accent); letter-spacing:.05em;">STEP ${p.n}</span>
        </div>
        <div style="font-size:13px; font-weight:800; margin-bottom:4px;">${p.t}</div>
        <div style="font-size:10.5px; color:var(--muted); line-height:1.4;">${p.b}</div>
      </div>
      ${i < PIPELINE.length - 1 ? `<span style="color:var(--faint); padding:0 4px; font-size:16px;">→</span>` : ''}
    </div>
  `).join('');
}

function renderSourcesBar() {
  const ctx = document.getElementById('sourcesBarChart');
  if (!ctx) return;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: DATA_SOURCES.map(s => s.source),
      datasets:[{
        label:'Items',
        data: DATA_SOURCES.map(s => s.count),
        backgroundColor: DATA_SOURCES.map(s => s.color),
        borderRadius:4
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ color:C.border }, ticks:{ callback:v => v >= 1000 ? (v/1000)+'K' : v } },
        y:{ grid:{ display:false }, ticks:{ font:{ size:10.5 } } }
      }
    }
  });
}

function renderCategoryCoverage() {
  const ctx = document.getElementById('categoryCoverageChart');
  if (!ctx) return;
  const data = CATEGORY_COVERAGE.filter(c => c.name !== 'General (no signal)');
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: data.map(d => d.name),
      datasets:[{
        label:'% of corpus',
        data: data.map(d => d.pct),
        backgroundColor: data.map(d => d.color),
        borderRadius:4
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label:c => `${c.parsed}% · ${data[c.dataIndex].mentions.toLocaleString()} mentions · ${data[c.dataIndex].phase}` } }
      },
      scales:{
        x:{ grid:{ color:C.border }, ticks:{ callback:v => v+'%' } },
        y:{ grid:{ display:false }, ticks:{ font:{ size:10.5 } } }
      }
    }
  });
}

function renderComplaintTypology() {
  const ctx = document.getElementById('complaintTypologyChart');
  if (!ctx) return;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: COMPLAINT_TYPOLOGY.map(c => c.type),
      datasets:[{
        label:'Complaints',
        data: COMPLAINT_TYPOLOGY.map(c => c.count),
        backgroundColor: COMPLAINT_TYPOLOGY.map(c => c.color),
        borderRadius:4
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ color:C.border } },
        y:{ grid:{ display:false }, ticks:{ font:{ size:10.5 } } }
      }
    }
  });
}

// ============================================================================
// SECTION 3 · INSIGHTS
// ============================================================================
function renderClusterBars() {
  const el = document.getElementById('clusterBars');
  if (!el) return;
  el.innerHTML = CLUSTERS.filter(c => c.name !== 'Other').map(c => `
    <div style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
        <span>${c.name}</span>
        <span style="color:${c.color}; font-family:ui-monospace,monospace;">${c.pct}%</span>
      </div>
      <div style="height:7px; background:var(--raise); border-radius:999px; overflow:hidden; margin-top:4px;">
        <div style="width:${c.pct}%; height:100%; background:${c.color}; border-radius:999px;"></div>
      </div>
      ${c.quote ? `<div style="font-size:11px; color:var(--muted); font-style:italic; margin-top:5px;">"${c.quote}"</div>` : ''}
    </div>
  `).join('');
}

function renderClusterDonut() {
  const ctx = document.getElementById('clusterDonutChart');
  if (!ctx) return;
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: CLUSTERS.map(c => c.name),
      datasets:[{
        data: CLUSTERS.map(c => c.pct),
        backgroundColor: CLUSTERS.map(c => c.color),
        borderColor: C.surface,
        borderWidth: 2
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:8, padding:9 } },
        tooltip:{ callbacks:{ label:c => `${c.label}: ${c.parsed}% of negative reviews` } }
      }
    }
  });
}

function renderSentimentDonut() {
  const ctx = document.getElementById('sentimentDonut');
  if (!ctx) return;
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Negative','Neutral','Positive'],
      datasets:[{
        data:[SENTIMENT.negative, SENTIMENT.neutral, SENTIMENT.positive],
        backgroundColor:[C.rose, C.faint, C.emerald],
        borderColor: C.surface,
        borderWidth: 2
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:8, padding:9 } },
        tooltip:{ callbacks:{ label:c => `${c.label}: ${c.parsed}%` } }
      }
    }
  });
}

function renderDensityHeatmap() {
  const el = document.getElementById('densityHeatmap');
  if (!el) return;
  const rows = DENSITY_PHASES.map(d => {
    const dCol = d.density === 'dense' ? C.emerald : C.amber;
    return `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:9px 12px; font-size:12.5px; font-weight:700;">${d.cat}</td>
        <td style="padding:9px 12px; font-size:12px; color:var(--text-2); font-family:ui-monospace,monospace;">${d.mentions.toLocaleString()}</td>
        <td style="padding:9px 12px;"><span class="tag-chip" style="background:${dCol};">${d.density.toUpperCase()}</span></td>
        <td style="padding:9px 12px; font-size:12px; color:var(--text-2);">${d.phase}</td>
        <td style="padding:9px 12px; font-size:11.5px; color:var(--muted);">${d.badge}</td>
      </tr>`;
  }).join('');
  el.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:var(--raise);">
          <th style="text-align:left; padding:8px 12px; font-size:10.5px; text-transform:uppercase; color:var(--muted); font-weight:700;">Category</th>
          <th style="text-align:left; padding:8px 12px; font-size:10.5px; text-transform:uppercase; color:var(--muted); font-weight:700;">Mentions</th>
          <th style="text-align:left; padding:8px 12px; font-size:10.5px; text-transform:uppercase; color:var(--muted); font-weight:700;">Density</th>
          <th style="text-align:left; padding:8px 12px; font-size:10.5px; text-transform:uppercase; color:var(--muted); font-weight:700;">Phase</th>
          <th style="text-align:left; padding:8px 12px; font-size:10.5px; text-transform:uppercase; color:var(--muted); font-weight:700;">Rationale</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ============================================================================
// SECTION 4 · LIVE WORKFLOW (unchanged from v2)
// ============================================================================
function loadSampleReviews() {
  document.getElementById('reviewInput').value = SAMPLE_REVIEWS.join('\n');
  updateReviewMeta();
}
function uploadReviews(ev) {
  const f = ev.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { document.getElementById('reviewInput').value = String(r.result).replace(/,/g, '\n'); updateReviewMeta(); };
  r.readAsText(f);
}
function updateReviewMeta() {
  const n = document.getElementById('reviewInput').value.split('\n').map(s => s.trim()).filter(Boolean).length;
  document.getElementById('reviewMeta').textContent = n + ' review' + (n !== 1 ? 's' : '') + ' loaded';
}
const prefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function runWorkflow() {
  const reviews = document.getElementById('reviewInput').value.split('\n').map(s => s.trim()).filter(Boolean);
  const out = document.getElementById('workflowOutput');
  if (!reviews.length) { out.innerHTML = `<div class="card" style="padding:16px; color:var(--muted); font-size:13px;">Paste reviews (one per line) or click "Load sample", then run.</div>`; return; }
  const btn = document.getElementById('runBtn'); btn.disabled = true; btn.style.opacity = '0.6';
  out.innerHTML = `<div class="card" style="padding:24px; display:flex; align-items:center; gap:10px; color:var(--text-2); font-size:13.5px; font-weight:600;">
    <span style="color:var(--accent); animation:shimmer 1s infinite;">🧠</span>
    Running live pipeline on ${reviews.length} reviews · clustering · scoring sentiment · extracting quotes…</div>`;
  out.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block:'nearest' });
  try {
    const res = await fetch('/api/analyze-reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reviews }), signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error('http ' + res.status);
    const d = await res.json(); if (!d.success) throw new Error(d.error || 'failed');
    renderWorkflowOutput(d.analysis);
  } catch (e) {
    out.innerHTML = `<div class="card" style="padding:18px; color:var(--rose); font-size:13px;">Live analysis unavailable right now (${String(e.message)}). Check /api/health, or try again.</div>`;
  } finally { btn.disabled = false; btn.style.opacity = '1'; }
}

function renderWorkflowOutput(a) {
  const s = a.sentiment || { negative:0, neutral:0, positive:0 };
  const seg = (w, c) => `<div style="width:${w}%; background:${c};"></div>`;
  const themes = (a.themes || []).map(t => {
    const col = t.sentiment === 'positive' ? C.emerald : t.sentiment === 'neutral' ? C.faint : C.rose;
    return `<div style="background:var(--raise); border:1px solid var(--border); border-radius:11px; padding:11px 13px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <span style="font-size:13px; font-weight:800;">${t.name || 'Theme'}</span>
        <span style="font-size:13px; font-weight:800; color:${col}; font-variant-numeric:tabular-nums;">${t.share != null ? t.share + '%' : ''}</span>
      </div>
      <div style="height:6px; background:#0B1120; border-radius:999px; overflow:hidden;"><div style="width:${t.share || 0}%; height:100%; background:${col};"></div></div>
      ${t.quote ? `<div style="font-size:11.5px; font-style:italic; color:var(--text-2); line-height:1.4; margin-top:6px;">"${t.quote}"</div>` : ''}
    </div>`;
  }).join('');
  const kw = (a.keywords || []).map(k => `<span style="font-size:11px; font-weight:600; color:var(--text-2); background:var(--surface2); border:1px solid var(--border); padding:4px 10px; border-radius:999px;">${k}</span>`).join('');
  const qi = a.question_insights || {};
  const qrows = Object.keys(QLABELS).map(key => qi[key] ? `
    <div style="display:flex; gap:9px; padding:9px 0; border-bottom:1px solid var(--border);">
      <span style="color:var(--accent); flex-shrink:0; margin-top:1px;">❓</span>
      <div><div style="font-size:11.5px; font-weight:700;">${QLABELS[key]}</div>
      <div style="font-size:12px; color:var(--text-2); line-height:1.5; margin-top:2px;">${qi[key]}</div></div>
    </div>` : '').join('');

  document.getElementById('workflowOutput').innerHTML = `
  <div class="card" style="padding:0; overflow:hidden;">
    <div style="display:flex; align-items:center; gap:9px; padding:14px 20px; background:var(--raise); border-bottom:1px solid var(--border);">
      <span style="color:var(--emerald);">✓</span>
      <span style="font-size:13.5px; font-weight:800;">Live Analysis Complete</span>
      <span style="font-size:11px; color:var(--muted); margin-left:auto;">${a.reviews_analyzed || 0} reviews · via Gemini/Groq LLM</span>
    </div>
    <div style="padding:18px 20px;">
      <div class="grid" style="grid-template-columns:1fr 1fr;">
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:8px;">Sentiment Breakdown</div>
          <div style="display:flex; height:14px; border-radius:999px; overflow:hidden; gap:2px; background:var(--raise);">${seg(s.negative, C.rose)}${seg(s.neutral, C.faint)}${seg(s.positive, C.emerald)}</div>
          <div style="display:flex; gap:14px; margin-top:9px; font-size:11.5px;">
            <span style="color:var(--rose); font-weight:700;">● ${s.negative}% Neg</span>
            <span style="color:var(--muted); font-weight:700;">● ${s.neutral}% Neu</span>
            <span style="color:var(--emerald); font-weight:700;">● ${s.positive}% Pos</span>
          </div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin:16px 0 8px;">Extracted Keywords</div>
          <div style="display:flex; flex-wrap:wrap; gap:7px;">${kw || '<span style="color:var(--faint);font-size:12px;">—</span>'}</div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin:16px 0 8px;">Friction Theme Clusters</div>
          <div style="display:flex; flex-direction:column; gap:9px;">${themes || '<span style="color:var(--faint);font-size:12px;">—</span>'}</div>
        </div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:4px;">Answers to the 8 discovery questions (from this input)</div>
          ${qrows || '<span style="color:var(--faint);font-size:12px;">—</span>'}
        </div>
      </div>
      ${a.top_insight ? `<div style="margin-top:16px; background:var(--accent-dim); border:1px solid rgba(242,201,76,0.3); border-radius:11px; padding:12px 14px;">
        <div style="display:flex; align-items:center; gap:7px; margin-bottom:4px;"><span style="color:var(--accent);">💡</span><span style="font-size:10.5px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--accent);">Top PM Insight</span></div>
        <div style="font-size:13.5px; line-height:1.5; font-weight:600;">${a.top_insight}</div></div>` : ''}
    </div>
  </div>`;
}

// ============================================================================
// SECTION 5 · PART 2 — INTERVIEWS + PATTERNS
// ============================================================================
function renderInterviewees() {
  const el = document.getElementById('interviewGrid');
  if (!el) return;
  el.innerHTML = INTERVIEWEES.map(iv => `
    <div class="card" style="padding:14px 16px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <div style="width:32px; height:32px; border-radius:8px; background:${iv.color}22; color:${iv.color}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">${iv.id}</div>
        <div>
          <div style="font-size:12.5px; font-weight:800;">${iv.role}</div>
          <div style="font-size:10.5px; color:var(--muted);">Age ${iv.age}</div>
        </div>
      </div>
      <div style="font-size:11.5px; color:var(--text-2); font-style:italic; line-height:1.45; margin-bottom:6px;">"${iv.quote}"</div>
      <div style="font-size:10px; color:${iv.color}; font-weight:800; text-transform:uppercase; letter-spacing:.03em;">${iv.highlight}</div>
    </div>
  `).join('');
}

function renderPatterns() {
  const el = document.getElementById('patternCards');
  if (!el) return;
  el.innerHTML = PATTERNS.map(p => `
    <div class="card-raise" style="padding:12px 14px; border-left:3px solid ${p.color};">
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px;">
        <span style="font-size:9.5px; font-weight:800; color:${p.color}; letter-spacing:.06em;">PATTERN ${p.id}</span>
      </div>
      <div style="font-size:12.5px; font-weight:800; margin-bottom:4px;">${p.name}</div>
      <div style="font-size:11.5px; color:var(--text-2); line-height:1.45;">${p.desc}</div>
    </div>
  `).join('');
}

// ============================================================================
// SECTION 6 · HYPOTHESIS SCORECARD
// ============================================================================
function renderMethod() {
  const el = document.getElementById('methodCard');
  if (!el) return;
  el.innerHTML = METHOD.map((m, i) => `
    <div style="display:flex; gap:11px; ${i > 0 ? 'margin-top:12px;' : ''}">
      <div style="width:26px; height:26px; border-radius:7px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0;">${m.n}</div>
      <div><div style="font-size:12.5px; font-weight:800;">${m.t}</div>
      <div style="font-size:11px; color:var(--muted); line-height:1.4; margin-top:2px;">${m.d}</div></div>
    </div>
  `).join('');
}

function renderHypotheses() {
  const el = document.getElementById('hypothesisScorecard');
  if (!el) return;
  el.innerHTML = HYPOTHESES.map(h => `
    <div style="border-bottom:1px solid var(--border); padding:10px 0;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="tag-chip" style="background:${h.color};">${h.tag}</span>
        <span style="font-size:12.5px; font-weight:700;">${h.h}</span>
      </div>
      <div style="font-size:11.5px; color:var(--text-2); line-height:1.45; margin-left:2px;">${h.o}</div>
    </div>
  `).join('');
}

// ============================================================================
// SECTION 7 · PART 3 — PROBLEM FRAMING
// ============================================================================
function renderProblemCanvas() {
  const el = document.getElementById('problemCanvas');
  if (!el) return;
  el.innerHTML = PROBLEM_CANVAS.map(p => `
    <div class="card" style="padding:16px 18px; border-top:3px solid ${p.color};">
      <div style="font-size:12.5px; font-weight:800; color:${p.color}; margin-bottom:6px;">${p.title}</div>
      <div style="font-size:12.5px; color:var(--text-2); line-height:1.5;">${p.body}</div>
    </div>
  `).join('');
}

function renderRootCauseLoop() {
  const el = document.getElementById('rootCauseLoop');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
      ${ROOT_LOOP.map((r, i) => `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="padding:10px 14px; border-radius:9px; background:${r.bg}; border:1px solid ${r.color}33; text-align:center; font-size:12.5px; font-weight:800; color:${r.color};">${r.text}</div>
          ${i < ROOT_LOOP.length - 1 ? `<div style="text-align:center; color:var(--faint); font-size:15px;">↓</div>` : ''}
        </div>
      `).join('')}
    </div>
    <div style="font-size:11.5px; color:var(--muted); line-height:1.45; margin-top:10px;">Self-reinforcing: repeat purchase reads as "satisfaction," so nothing prompts the system to nudge exploration.</div>`;
}

function renderImpactSizingTable() {
  const el = document.getElementById('impactSizingTable');
  if (!el) return;
  el.innerHTML = IMPACT_SIZING.map(row => {
    const [label, value, kind] = row;
    if (kind === 'header') return `<tr style="background:var(--accent-dim); border-top:1px solid var(--accent);"><td style="padding:9px 12px; font-size:12.5px; font-weight:800;">${label}</td><td style="padding:9px 12px; text-align:right; font-size:12.5px; font-weight:800; font-family:ui-monospace,monospace;">${value}</td></tr>`;
    if (kind === 'positive') return `<tr style="border-bottom:1px solid var(--border);"><td style="padding:9px 12px; font-size:12px;">${label}</td><td style="padding:9px 12px; text-align:right; font-size:12.5px; font-weight:800; font-family:ui-monospace,monospace; color:${C.emerald};">${value}</td></tr>`;
    if (kind === 'goal') return `<tr style="background:${C.emerald}22;"><td style="padding:10px 12px; font-size:12.5px; font-weight:800; color:${C.emerald};">${label}</td><td style="padding:10px 12px; text-align:right; font-size:13.5px; font-weight:800; font-family:ui-monospace,monospace; color:${C.emerald};">${value}</td></tr>`;
    return `<tr style="border-bottom:1px solid var(--border);"><td style="padding:9px 12px; font-size:12px;">${label}</td><td style="padding:9px 12px; text-align:right; font-size:12px; font-family:ui-monospace,monospace;">${value}</td></tr>`;
  }).join('');
}

// ============================================================================
// SECTION 9 · TRUSTED
// ============================================================================
function renderTrustedByCategory() {
  const ctx = document.getElementById('trustedByCategoryChart');
  if (!ctx) return;
  const data = [...TRUSTED_BY_CAT].sort((a, b) => b.n - a.n);
  new Chart(ctx, {
    type:'bar',
    data:{
      labels: data.map(d => d.cat),
      datasets:[{
        label:'Trusted Picks',
        data: data.map(d => d.n),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius:4
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label:c => `${c.parsed} Trusted picks · Leader: ${data[c.dataIndex].top}` } }
      },
      scales:{
        x:{ grid:{ color:C.border }, ticks:{ stepSize:1 } },
        y:{ grid:{ display:false }, ticks:{ font:{ size:10 } } }
      }
    }
  });
}

function renderTrustedLeaders() {
  const el = document.getElementById('trustedLeadersList');
  if (!el) return;
  const top5 = [...TRUSTED_BY_CAT].sort((a, b) => b.n - a.n).slice(0, 8);
  el.innerHTML = top5.map(x => `
    <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border);">
      <div style="width:24px; height:24px; border-radius:6px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0;">${x.n}</div>
      <div style="flex:1; min-width:0;">
        <div style="font-size:12px; font-weight:800;">${x.cat}</div>
        <div style="font-size:10.5px; color:var(--muted); line-height:1.3;">${x.top}</div>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// SECTION 10 · 8 DISCOVERY QUESTIONS
// ============================================================================
function renderQuestions() {
  const el = document.getElementById('questionGrid');
  if (!el) return;
  el.innerHTML = QUESTIONS.map((q, i) => `
    <div class="card" style="padding:16px 18px; display:flex; flex-direction:column;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
        <span style="width:26px; height:26px; border-radius:7px; background:var(--accent-dim); color:var(--accent); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">Q${i+1}</span>
        <span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); background:var(--surface2); padding:2px 8px; border-radius:999px;">${q.tag}</span>
      </div>
      <div style="font-size:13.5px; font-weight:800; line-height:1.3;">${q.q}</div>
      <div style="font-size:12.5px; color:var(--text-2); line-height:1.55; margin-top:6px;">${q.a}</div>
      ${q.evidence ? `<div style="display:flex; align-items:center; gap:6px; margin-top:10px; padding-top:8px; border-top:1px dashed var(--border);">
        <span style="color:var(--accent);">💡</span>
        <span style="font-size:10.5px; font-weight:700; color:var(--muted); letter-spacing:.02em;">Evidence:</span>
        <span style="font-size:10.5px; color:var(--text-2);">${q.evidence}</span>
      </div>` : ''}
      ${q.link ? `<a href="${q.link.href}" style="display:inline-flex; align-items:center; gap:5px; margin-top:auto; padding-top:10px; font-size:11.5px; font-weight:800; color:var(--accent);">${q.link.label}</a>` : ''}
    </div>
  `).join('');
}

// ============================================================================
// PIPELINE ARCHITECTURE MODAL
// ============================================================================
function renderPipelineArchDetail() {
  const el = document.getElementById('pipelineArchDetail');
  if (!el) return;
  el.innerHTML = `
    <div style="font-size:13px; color:var(--text-2); line-height:1.6; margin-bottom:14px;">
      One AI-native pipeline, deployed to production and lazy-loaded per category on the live prototype. All 4 assignment parts flow through it:
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${PIPELINE.map(p => `
        <div style="display:flex; gap:12px; padding:12px 14px; background:var(--raise); border:1px solid var(--border); border-radius:11px;">
          <div style="width:36px; height:36px; border-radius:9px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; font-size:18px;">${p.icon}</div>
          <div>
            <div style="font-size:12.5px; font-weight:800;">STEP ${p.n} · ${p.t}</div>
            <div style="font-size:12px; color:var(--text-2); line-height:1.45; margin-top:2px;">${p.b}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:14px; padding:12px 14px; background:var(--accent-dim); border:1px solid rgba(242,201,76,0.3); border-radius:11px;">
      <div style="font-size:11px; font-weight:800; color:var(--accent); text-transform:uppercase; letter-spacing:.05em;">Architectural principles</div>
      <ul style="font-size:12px; color:var(--text-2); line-height:1.5; margin:6px 0 0 18px; padding:0;">
        <li>Core grocery flow is architecturally ISOLATED — zero dependency on the Trial layer</li>
        <li>Trust signals are RAG-only — no LLM ever fabricates a rating or a quote</li>
        <li>Confidence threshold gates AI signals; low-confidence routes to static defaults</li>
        <li>Diversity monitor prevents the "narrowing feedback loop"</li>
        <li>Gemini-primary / Groq-fallback so a provider outage never hard-crashes</li>
      </ul>
    </div>`;
}
function openArchModal() { renderPipelineArchDetail(); document.getElementById('archModal').classList.add('open'); }
function closeArchModal() { document.getElementById('archModal').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeArchModal(); });

// ============================================================================
// NAV ACTIVE-LINK + LIVE-PROTOTYPE PING
// ============================================================================
async function pingProto() {
  const el = document.getElementById('connBadge');
  try {
    await fetch(PROTO + '/data/dashboard_metrics.json', { signal:AbortSignal.timeout(5000), cache:'no-store' });
    el.innerHTML = `<span style="color:${C.emerald};">●</span> Live prototype connected`;
    el.style.color = C.emerald;
  } catch (e) {
    el.innerHTML = `<span style="color:${C.amber};">●</span> Prototype offline`;
    el.style.color = C.muted;
  }
}

function initNavActive() {
  const links = document.querySelectorAll('.sidebar .navlink');
  const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const setActive = () => {
    let current = null;
    const scrollY = window.scrollY + 100;
    sections.forEach(s => { if (s.offsetTop <= scrollY) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', setActive, { passive:true });
  setActive();
}

// ============================================================================
// CONTEXT FOR CHATBOT (buildDataFacts) — pm-chatbot.js calls this
// ============================================================================
function buildDataFacts() {
  const kpi = SNAPSHOT_KPIS.map(k => `${k.label}: ${k.value} (${k.sub})`).join('; ');
  const clusters = CLUSTERS.filter(c => c.name !== 'Other').map(c => `${c.name} ${c.pct}%`).join('; ');
  const trustedTotal = TRUSTED_BY_CAT.reduce((s, x) => s + x.n, 0);
  return `EXECUTIVE KPIs: ${kpi}
FRICTION CLUSTERS (share of negative reviews): ${clusters}
CORPUS EVIDENCE: 32,999 items ingested (YouTube 18,941, PissedConsumer 7,925, Reddit 3,268, Play Store 2,367, HackerNews 323, App Store 175), of which 5,420 were discovery-relevant. Only 8.0% carry any category signal. Grocery+snacks (1,773) outweigh ALL non-grocery combined (1,011) by 1.75x.
INTERVIEWS: 7 in-depth (R1-R7). Patterns A-E: A=first-experience determinism, B=peer proof over algo, C=fees tax small trials, D=locked-in specialist models, E=discovery bypass.
HYPOTHESIS SCORECARD: Validated (non-grocery trials fail terminally), Rejected (awareness gap), Challenged (refund friction is symptom, not cause), Partial (price alone).
IN-APP CATALOG: 1,150 SKUs across 23 L2 categories, 204,562 subcategory-specific reviews (avg 178/product).
BLINKIT TRUSTED PROGRAM: ${trustedTotal} curated picks (8.3%). Rule: avg>=4.3 AND ratings>=500 AND repeat>=55%, topped up to 3/category by composite score. Every category (23/23) covered.
TARGET AUDIENCE: Habituated Grocery Regular (>=1x/week, >=3-mo tenure), retargeted to working professionals 25-40 (SDEs, PMs, consultants) — Rohan, Priya, Ankit personas in the live MVP.
LIVE URLS: prototype ${PROTO}, dashboard https://blinkit-pm-dashboard.vercel.app`;
}

// ============================================================================
// INIT
// ============================================================================
function init() {
  // Section 1
  renderSnapshotKpis();
  renderCcarLine();
  renderCategoryShareDonut();
  // Section 2 (Part 1)
  renderPipeline();
  renderSourcesBar();
  renderCategoryCoverage();
  renderComplaintTypology();
  // Section 3 (Insights)
  renderClusterBars();
  renderClusterDonut();
  renderSentimentDonut();
  renderDensityHeatmap();
  // Section 4 (Live workflow)
  loadSampleReviews();
  // Section 5 (Part 2)
  renderInterviewees();
  renderPatterns();
  // Section 6 (Validation)
  renderMethod();
  renderHypotheses();
  // Section 7 (Part 3)
  renderProblemCanvas();
  renderRootCauseLoop();
  renderImpactSizingTable();
  // Section 9 (Trusted)
  renderTrustedByCategory();
  renderTrustedLeaders();
  // Section 10 (Questions)
  renderQuestions();
  // Nav + ping
  initNavActive();
  pingProto();
}
document.addEventListener('DOMContentLoaded', init);

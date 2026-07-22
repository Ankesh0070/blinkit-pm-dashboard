// ============================================================================
// Blinkit PM Analytics Control Center — dark console
// KPIs · LIVE review-analysis workflow · 8 discovery Q&A · friction heatmap ·
// insight validation · MVP bridge · pipeline modal
// ============================================================================
const C = {
  accent:'#F2C94C', text:'#F1F5F9', text2:'#CBD5E1', muted:'#94A3B8', faint:'#64748B',
  emerald:'#10B981', rose:'#F43F5E', amber:'#F59E0B', blue:'#3B82F6',
  surface:'#1E293B', border:'rgba(148,163,184,0.18)'
};
const PROTO = 'https://blinkit-trial-confidence-layer.vercel.app';

// ---------- Lucide icons ----------
const IP = {
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  bolt:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4M12 17h.01"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trend:'<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  layers:'<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  chev:'<path d="m6 9 6 6 6-6"/>', close:'<path d="M18 6 6 18M6 6l12 12"/>',
  quote:'<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>', arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  brain:'<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>',
  branch:'<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  verify:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'
};
function icon(n, s = 18, w = 2) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${IP[n]}</svg>`; }

// ============================================================================
// DATA
// ============================================================================
const KPIS = [
  { icon:'msg',   label:'Total Reviews Analyzed', value:'5,420', sub:'Play Store &amp; App Store', color:C.blue,    bar:null },
  { icon:'alert', label:'Cross-Category Friction Score', value:'74%', sub:'High hesitation · Personal Care', color:C.rose, bar:74 },
  { icon:'target',label:'Top Friction Root Cause', value:'Price &amp; Pack-Size Uncertainty', valueSize:20, sub:'dominant negative cluster', color:C.amber, bar:null },
  { icon:'trend', label:'Predicted Trial Conversion Lift', value:'+28%', sub:'with Micro-Trial &lt; ₹30', color:C.emerald, bar:28, barMax:50 }
];

const CLUSTERS = [
  { name:'Sizing Risk', pct:42, color:C.rose,  quote:"Don't want to buy a 100ml serum without knowing if it suits my skin." },
  { name:'Price Barrier', pct:31, color:C.amber, quote:"₹500 for a new brand on 10-min delivery is too expensive to gamble." },
  { name:'Return Fear', pct:18, color:C.blue,  quote:"What if it arrives damaged or expired?" }
];

const QUESTIONS = [
  { q:'Why do users repeatedly buy from the same categories?', a:'Quick-commerce habit forms deep, narrow grooves — high frequency in grocery, near-zero horizontal exploration. The “Blinkit = grocery” model is reconfirmed on every high-intent open.', tag:'Pattern D' },
  { q:'What prevents users from exploring new categories?', a:'Trying a new category is a high-risk, low-information, fee-penalised decision where one bad first trial permanently closes it — users behave rationally by not trying.', tag:'Root cause' },
  { q:'How do users discover products today?', a:'They don’t browse — they arrive high-intent and go straight to search or a known category. Homepage banners are structurally ignored.', tag:'Pattern E' },
  { q:'What role do habits play in shopping behaviour?', a:'Habit is both the win and the constraint: it drives retention but locks users into single lanes — category concentration becomes a single point of failure.', tag:'Context' },
  { q:'What information do users need before trying a new category?', a:'Credible, specific peer evidence on the exact product — real reviews, ratings, repeat-purchase signals. Generic platform suggestions are explicitly rejected.', tag:'Pattern B' },
  { q:'What frustrations emerge repeatedly?', a:'Refund/support friction dominates complaints — but that’s a symptom. The real blocker is the missing pre-purchase information that prevents the trial entirely.', tag:'Corpus' },
  { q:'Which user segments are more likely to experiment?', a:'Habituated grocery regulars (≥1×/week, ≥3-month tenure) who already trust logistics — the shortest distance to behaviour change. Not new or emergency-only users.', tag:'Segment' },
  { q:'What unmet needs emerge consistently?', a:'On-platform trust that substitutes for a friend’s recommendation; de-risked experimentation without a fee penalty on small baskets; consolidation into fewer trusted platforms.', tag:'Unmet need' }
];

const METHOD = [
  { n:'1', t:'Gather at scale', d:'5,420 public items — Play Store, App Store, Reddit &amp; forums' },
  { n:'2', t:'LLM cluster + sentiment', d:'Embed &amp; density-cluster into friction themes; score sentiment/confidence' },
  { n:'3', t:'Manual QA sample', d:'200+ random classifications + the lowest-confidence 10% bucket re-checked' },
  { n:'4', t:'Primary-research validation', d:'7 in-depth interviews test each corpus-derived hypothesis' }
];
const HYPOTHESES = [
  { tag:'VALIDATED', color:C.emerald, h:'Non-grocery trials fail disproportionately', o:'Failures are terminal, not just annoying (R5: 3 faulty electronics → never again).' },
  { tag:'REJECTED', color:C.rose, h:'Users don’t know these categories exist', o:'They do — and actively avoid them. Awareness-only plays will fail.' },
  { tag:'CHALLENGED', color:C.amber, h:'Frustration is dominated by refunds/support', o:'Refund friction is a symptom; the real blocker is missing pre-purchase info.' },
  { tag:'PARTIAL', color:C.amber, h:'Price is the primary barrier', o:'5 of 7 rank reviews/brand above price; real blocker is the fee-to-basket ratio.' }
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

const PIPELINE = [
  { icon:'db',     t:'Play Store Customer Reviews', b:'5,420 raw reviews · Play Store, App Store &amp; forums (Blinkit / Instamart / Zepto)', tag:'raw signal' },
  { icon:'brain',  t:'LLM Clustering & Sentiment', b:'Embed → density-cluster into friction themes; score sentiment &amp; confidence per cluster', tag:'themes' },
  { icon:'bulb',   t:'PM Insight Hypothesis', b:'Name the root cause (Size &amp; Price hesitation) and derive a testable micro-trial hypothesis', tag:'insight' },
  { icon:'rocket', t:'Trial & Confidence Layer', b:'Ship the &lt;₹30 micro-trial MVP with refund + return badges — insight becomes execution', tag:'MVP action' }
];

// ============================================================================
// STATIC ICONS
// ============================================================================
function renderStaticIcons(){
  const m={ nv1:['grid',18], nv2:['branch',18], nvQ:['help',18], nv3:['layers',18], nvV:['verify',18], nv4:['rocket',18], nvPipe:['branch',17], hdrPipe:['branch',17],
    lb1:['target',15], lbWf:['branch',15], lbQ:['help',15], lb3:['layers',15], lbV:['verify',15],
    wfIcon:['db',18], wfBolt:['bolt',18], mIcon:['branch',22], mClose:['close',19], mVerify:['verify',20] };
  for(const [id,[n,s]] of Object.entries(m)){ const el=document.getElementById(id); if(el) el.innerHTML=icon(n,s); }
}

// ============================================================================
// KPIs
// ============================================================================
function renderKpis(){
  document.getElementById('kpiRow').innerHTML = KPIS.map(k=>`
    <div class="card" style="padding:16px 17px;">
      <div style="width:34px; height:34px; border-radius:9px; background:${k.color}22; display:flex; align-items:center; justify-content:center; color:${k.color};">${icon(k.icon,18)}</div>
      <div style="font-size:${k.valueSize||30}px; font-weight:800; line-height:1.12; margin-top:12px; color:${k.color==='#F43F5E'||k.color==='#10B981'?k.color:'var(--text)'};">${k.value}</div>
      <div style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-top:5px;">${k.label}</div>
      <div style="font-size:11px; color:var(--muted); margin-top:2px;">${k.sub}</div>
      ${k.bar!=null?`<div style="height:6px; background:var(--raise); border-radius:999px; margin-top:11px; overflow:hidden;"><div style="width:${(k.bar/(k.barMax||100))*100}%; height:100%; background:${k.color}; border-radius:999px;"></div></div>`:''}
    </div>`).join('');
}

// ============================================================================
// LIVE REVIEW-ANALYSIS WORKFLOW
// ============================================================================
function loadSampleReviews(){
  document.getElementById('reviewInput').value = SAMPLE_REVIEWS.join('\n');
  updateReviewMeta();
}
function uploadReviews(ev){
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => { document.getElementById('reviewInput').value = String(r.result).replace(/,/g, '\n'); updateReviewMeta(); };
  r.readAsText(f);
}
function updateReviewMeta(){
  const n = document.getElementById('reviewInput').value.split('\n').map(s=>s.trim()).filter(Boolean).length;
  document.getElementById('reviewMeta').textContent = n + ' review' + (n!==1?'s':'') + ' loaded';
}
const prefersReduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function runWorkflow(){
  const reviews = document.getElementById('reviewInput').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('workflowOutput');
  if(!reviews.length){ out.innerHTML = `<div class="card" style="padding:16px; color:var(--muted); font-size:13px;">Paste some reviews (one per line) or click “Load sample reviews”, then run.</div>`; return; }
  const btn = document.getElementById('runBtn'); btn.disabled = true; btn.style.opacity = '0.6';
  out.innerHTML = `<div class="card" style="padding:24px; display:flex; align-items:center; gap:10px; color:var(--text-2); font-size:13.5px; font-weight:600;">
    <span style="color:var(--accent); animation:shimmer 1s infinite;">${icon('brain',20)}</span>
    Running live pipeline on ${reviews.length} reviews · clustering · scoring sentiment · extracting quotes…</div>`;
  out.scrollIntoView({behavior:prefersReduced()?'auto':'smooth', block:'nearest'});
  try{
    const res = await fetch('/api/analyze-reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reviews }), signal: AbortSignal.timeout(30000) });
    if(!res.ok) throw new Error('http '+res.status);
    const d = await res.json(); if(!d.success) throw new Error(d.error||'failed');
    renderWorkflowOutput(d.analysis);
  }catch(e){
    out.innerHTML = `<div class="card" style="padding:18px; color:var(--rose); font-size:13px;">Live analysis unavailable right now (${String(e.message)}). Check /api/health, or try again.</div>`;
  }finally{ btn.disabled=false; btn.style.opacity='1'; }
}

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

function renderWorkflowOutput(a){
  const s = a.sentiment || { negative:0, neutral:0, positive:0 };
  const seg = (w,c)=>`<div style="width:${w}%; background:${c};"></div>`;
  const themes = (a.themes||[]).map(t=>{
    const col = t.sentiment==='positive'?C.emerald:t.sentiment==='neutral'?C.faint:C.rose;
    return `<div style="background:var(--raise); border:1px solid var(--border); border-radius:11px; padding:11px 13px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px;">
        <span style="font-size:13px; font-weight:800;">${t.name||'Theme'}</span>
        <span style="font-size:13px; font-weight:800; color:${col}; font-variant-numeric:tabular-nums;">${t.share!=null?t.share+'%':''}</span></div>
      <div style="height:6px; background:#0B1120; border-radius:999px; overflow:hidden;"><div style="width:${t.share||0}%; height:100%; background:${col};"></div></div>
      ${t.quote?`<div style="display:flex; gap:6px; margin-top:7px;"><span style="color:${col}; flex-shrink:0;">${icon('quote',13)}</span><span style="font-size:11.5px; font-style:italic; color:var(--text-2); line-height:1.4;">${t.quote}</span></div>`:''}
    </div>`; }).join('');
  const kw = (a.keywords||[]).map(k=>`<span style="font-size:11px; font-weight:600; color:var(--text-2); background:var(--surface2); border:1px solid var(--border); padding:4px 10px; border-radius:999px;">${k}</span>`).join('');
  const qi = a.question_insights || {};
  const qrows = Object.keys(QLABELS).map(key=> qi[key] ? `
    <div style="display:flex; gap:9px; padding:9px 0; border-bottom:1px solid var(--border);">
      <span style="color:var(--accent); flex-shrink:0; margin-top:1px;">${icon('help',15)}</span>
      <div><div style="font-size:11.5px; font-weight:700; color:var(--text);">${QLABELS[key]}</div>
      <div style="font-size:12px; color:var(--text-2); line-height:1.5; margin-top:2px;">${qi[key]}</div></div>
    </div>` : '').join('');

  document.getElementById('workflowOutput').innerHTML = `
  <div class="card" style="padding:0; overflow:hidden;">
    <div style="display:flex; align-items:center; gap:9px; padding:14px 20px; background:var(--raise); border-bottom:1px solid var(--border);">
      <span style="color:var(--emerald);">${icon('check',18,2.5)}</span>
      <span style="font-size:13.5px; font-weight:800;">Live Analysis Complete</span>
      <span style="font-size:11px; color:var(--muted); margin-left:auto;">${a.reviews_analyzed||0} reviews · via Gemini/Groq LLM</span>
    </div>
    <div style="padding:18px 20px;">
      <div class="grid g2" style="grid-template-columns:1fr 1fr;">
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:8px;">Sentiment Breakdown</div>
          <div style="display:flex; height:14px; border-radius:999px; overflow:hidden; gap:2px; background:var(--raise);">${seg(s.negative,C.rose)}${seg(s.neutral,C.faint)}${seg(s.positive,C.emerald)}</div>
          <div style="display:flex; gap:14px; margin-top:9px; font-size:11.5px;">
            <span style="color:var(--rose); font-weight:700;">● ${s.negative}% Neg</span>
            <span style="color:var(--muted); font-weight:700;">● ${s.neutral}% Neu</span>
            <span style="color:var(--emerald); font-weight:700;">● ${s.positive}% Pos</span></div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin:16px 0 8px;">Extracted Keywords</div>
          <div style="display:flex; flex-wrap:wrap; gap:7px;">${kw||'<span style="color:var(--faint);font-size:12px;">—</span>'}</div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin:16px 0 8px;">Friction Theme Clusters</div>
          <div style="display:flex; flex-direction:column; gap:9px;">${themes||'<span style="color:var(--faint);font-size:12px;">—</span>'}</div>
        </div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:4px;">Answers to the 8 discovery questions (from this input)</div>
          ${qrows||'<span style="color:var(--faint);font-size:12px;">—</span>'}
        </div>
      </div>
      ${a.top_insight?`<div style="margin-top:16px; background:var(--accent-dim); border:1px solid rgba(242,201,76,0.3); border-radius:11px; padding:12px 14px;">
        <div style="display:flex; align-items:center; gap:7px; margin-bottom:4px;"><span style="color:var(--accent);">${icon('bulb',16)}</span><span style="font-size:10.5px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--accent);">Top PM Insight</span></div>
        <div style="font-size:13.5px; color:var(--text); line-height:1.5; font-weight:600;">${a.top_insight}</div></div>`:''}
    </div>
  </div>`;
}

// ============================================================================
// 8 DISCOVERY Q&A
// ============================================================================
function renderQuestions(){
  document.getElementById('questionGrid').innerHTML = QUESTIONS.map((q,i)=>`
    <div class="card" style="padding:15px 17px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
        <span style="width:24px; height:24px; border-radius:7px; background:var(--accent-dim); color:var(--accent); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800;">Q${i+1}</span>
        <span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); background:var(--surface2); padding:2px 8px; border-radius:999px;">${q.tag}</span>
      </div>
      <div style="font-size:13px; font-weight:800; color:var(--text); line-height:1.3;">${q.q}</div>
      <div style="font-size:12px; color:var(--text-2); line-height:1.5; margin-top:6px;">${q.a}</div>
    </div>`).join('');
}

// ============================================================================
// INSIGHT VALIDATION
// ============================================================================
function renderValidation(){
  document.getElementById('methodCard').innerHTML =
    `<div style="font-size:12.5px; font-weight:700; color:var(--text-2); margin-bottom:12px;">Quality-control workflow</div>` +
    METHOD.map((m,i)=>`
      <div style="display:flex; gap:11px; ${i>0?'margin-top:12px;':''}">
        <div style="width:26px; height:26px; border-radius:7px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0;">${m.n}</div>
        <div><div style="font-size:12.5px; font-weight:800;">${m.t}</div><div style="font-size:11px; color:var(--muted); line-height:1.4;">${m.d}</div></div>
      </div>`).join('');

  const head = `<thead><tr style="text-align:left; color:var(--muted); font-size:10px; letter-spacing:.03em; text-transform:uppercase; border-bottom:1px solid var(--border);">
    <th style="padding:9px 16px; font-weight:700;">Outcome</th><th style="padding:9px 12px; font-weight:700;">Corpus hypothesis</th><th style="padding:9px 16px; font-weight:700;">Primary-research verdict</th></tr></thead>`;
  const rows = HYPOTHESES.map(r=>`<tr style="border-bottom:1px solid var(--border);">
    <td style="padding:11px 16px;"><span style="font-size:10px; font-weight:800; color:#0F172A; background:${r.color}; padding:3px 9px; border-radius:999px; white-space:nowrap;">${r.tag}</span></td>
    <td style="padding:11px 12px; font-weight:600; color:var(--text);">${r.h}</td>
    <td style="padding:11px 16px; color:var(--text-2); font-size:12px;">${r.o}</td></tr>`).join('');
  document.getElementById('validationTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
}

// ============================================================================
// FRICTION HEATMAP · STRATEGY · BRIDGE · PIPELINE (kept)
// ============================================================================
function renderClusters(){
  document.getElementById('clusterCard').innerHTML = CLUSTERS.map((c,i)=>`
    <div style="${i>0?'margin-top:16px;':''}">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:26px; height:26px; border-radius:7px; background:${c.color}22; color:${c.color}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">${i+1}</span>
          <span style="font-size:14px; font-weight:800;">${c.name}</span></div>
        <span style="font-size:15px; font-weight:800; color:${c.color}; font-variant-numeric:tabular-nums;">${c.pct}%</span></div>
      <div style="height:7px; background:var(--raise); border-radius:999px; overflow:hidden;"><div style="width:${c.pct}%; height:100%; background:${c.color}; border-radius:999px;"></div></div>
      <div style="display:flex; gap:7px; margin-top:8px; padding:9px 11px; background:var(--raise); border:1px solid var(--border); border-radius:10px;">
        <span style="color:${c.color}; flex-shrink:0;">${icon('quote',14)}</span>
        <span style="font-size:12px; font-style:italic; color:var(--text-2); line-height:1.45;">${c.quote}</span></div>
    </div>`).join('');
  const ctx=document.getElementById('clusterChart').getContext('2d');
  new Chart(ctx,{ type:'doughnut',
    data:{ labels:CLUSTERS.map(c=>c.name), datasets:[{ data:CLUSTERS.map(c=>c.pct), backgroundColor:CLUSTERS.map(c=>c.color), borderColor:'#1E293B', borderWidth:3 }] },
    options:{ cutout:'62%', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ color:C.text2, boxWidth:8, boxHeight:8, padding:12, usePointStyle:true, font:{size:11} } }, tooltip:{ callbacks:{ label:c=>`${c.label}: ${c.parsed}% of neg. reviews` } } } } });
}
function renderStrategy(){
  document.getElementById('pmStrategy').innerHTML=`
    <div class="card" style="padding:16px 18px; background:linear-gradient(135deg, rgba(242,201,76,0.14), rgba(16,185,129,0.10)); border:1px solid rgba(242,201,76,0.35); display:flex; align-items:center; gap:14px;">
      <div style="width:42px; height:42px; border-radius:11px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${icon('bulb',22)}</div>
      <div><div style="font-size:10.5px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:var(--accent); margin-bottom:3px;">PM Strategy Derived</div>
      <div style="font-size:14.5px; font-weight:700; color:var(--text); line-height:1.4;">Launch Micro-Trial SKUs (10ml @ ₹15–₹29) with a 100% Instant-Refund Guarantee — directly dissolving the Size, Price &amp; Return friction clusters above.</div></div>
    </div>`;
}
function renderBridge(){
  document.getElementById('bridge').innerHTML=`
    <div class="card" style="padding:22px 24px; background:linear-gradient(120deg, #111827 0%, #1E293B 55%, #172033 100%); border:1px solid var(--border-2); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
      <div style="display:flex; align-items:center; gap:15px;">
        <div style="width:50px; height:50px; border-radius:13px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${icon('rocket',26)}</div>
        <div><div style="font-size:11px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:var(--accent); margin-bottom:3px;">From Insight to Execution</div>
          <div style="font-size:17px; font-weight:800; line-height:1.25;">Test the AI-Powered Trial &amp; Confidence Engine <span style="color:var(--muted); font-weight:600; font-size:13px;">· Part 4 MVP</span></div>
          <div style="font-size:12.5px; color:var(--text-2); margin-top:4px;">The friction clusters above, shipped as a live micro-trial nudge with refund &amp; return badges.</div></div>
      </div>
      <a href="${PROTO}/prototype/trial-engine.html" target="_blank" rel="noopener" style="background:var(--accent); color:#0F172A; font-size:14px; font-weight:800; padding:14px 22px; border-radius:12px; display:flex; align-items:center; gap:9px; white-space:nowrap;">Launch Live Prototype App ${icon('arrow',17,2.5)}</a>
    </div>`;
}
function renderPipeline(){
  document.getElementById('pipelineFlow').innerHTML = PIPELINE.map((p,i)=>`
    <div style="flex:1; display:flex; align-items:center;">
      <div style="flex:1; background:var(--raise); border:1px solid var(--border); border-radius:14px; padding:16px 15px; min-height:184px; display:flex; flex-direction:column;">
        <div style="width:40px; height:40px; border-radius:10px; background:var(--accent); color:#0F172A; display:flex; align-items:center; justify-content:center; margin-bottom:11px;">${icon(p.icon,22)}</div>
        <div style="font-size:10px; font-weight:800; color:var(--accent); letter-spacing:.03em;">STEP ${i+1}</div>
        <div style="font-size:13.5px; font-weight:800; margin:3px 0 6px; line-height:1.2;">${p.t}</div>
        <div style="font-size:11px; color:var(--muted); line-height:1.45; flex:1;">${p.b}</div>
        <div style="font-size:10px; font-weight:700; color:#0F172A; background:var(--accent); align-self:flex-start; padding:2px 9px; border-radius:999px; margin-top:9px;">${p.tag}</div>
      </div>
      ${i<PIPELINE.length-1?`<span class="arrow" style="color:var(--faint); padding:0 4px;">${icon('arrow',24,2)}</span>`:''}
    </div>`).join('');
}
function openArchModal(){ renderPipeline(); document.getElementById('archModal').classList.add('open'); }
function closeArchModal(){ document.getElementById('archModal').classList.remove('open'); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape')closeArchModal(); });

async function pingProto(){
  const el=document.getElementById('connBadge');
  try{ await fetch(PROTO+'/data/dashboard_metrics.json',{signal:AbortSignal.timeout(5000),cache:'no-store'});
    el.innerHTML=`<span style="color:${C.emerald};">●</span> Live prototype connected`; el.style.color=C.emerald;
  }catch(e){ el.innerHTML=`<span style="color:${C.amber};">●</span> Prototype offline`; el.style.color=C.muted; }
}

function buildDataFacts(){
  const k=KPIS.map(x=>`${x.label.replace(/&amp;/g,'&')}: ${x.value.replace(/&lt;/g,'<')}`).join('; ');
  const cl=CLUSTERS.map(c=>`${c.name} ${c.pct}%`).join('; ');
  return `EXECUTIVE KPIs: ${k}\nFRICTION CLUSTERS (share of negative reviews): ${cl}\nPM STRATEGY: micro-trial SKUs 10ml @ ₹15–₹29 + instant refund + one-tap return.\nEvidence base: 5,420 public reviews + 7 interviews.`;
}

function init(){
  renderStaticIcons();
  renderKpis();
  loadSampleReviews();
  renderQuestions();
  renderClusters();
  renderStrategy();
  renderValidation();
  renderBridge();
  pingProto();
}
document.addEventListener('DOMContentLoaded', init);

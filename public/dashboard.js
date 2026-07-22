// Live-first, snapshot-fallback data layer. Tries the deployed Blinkit app's
// data endpoints first (freshest numbers); if that's unreachable (offline,
// deployment down, CORS change) it falls back to the bundled snapshot copy
// in /data-snapshot so this dashboard always renders something.
const LIVE_BASE = 'https://blinkit-trial-confidence-layer.vercel.app';
const FILES = ['dashboard_metrics', 'trust_signals_automated', 'user_profiles', 'category_density_flags'];

let DATA = {};
let SOURCES = {};

async function fetchWithFallback(name) {
    try {
        const r = await fetch(`${LIVE_BASE}/data/${name}.json`, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const j = await r.json();
        SOURCES[name] = 'live';
        return j;
    } catch (e) {
        console.warn(`Live fetch failed for ${name}, using bundled snapshot:`, e.message);
        const r2 = await fetch(`/data-snapshot/${name}.json`, { cache: 'no-store' });
        const j2 = await r2.json();
        SOURCES[name] = 'snapshot';
        return j2;
    }
}

async function loadAllData() {
    const results = await Promise.all(FILES.map(fetchWithFallback));
    FILES.forEach((name, i) => DATA[name] = results[i]);
}

function renderSourceBadge() {
    const el = document.getElementById('dataSourceBadge');
    if (!el) return;
    const vals = Object.values(SOURCES);
    const allLive = vals.every(s => s === 'live');
    const anyLive = vals.some(s => s === 'live');
    el.textContent = allLive ? '🟢 Live data' : (anyLive ? '🟡 Partially live' : '🟠 Snapshot (offline fallback)');
    el.className = 'text-xs font-semibold px-3 py-1.5 rounded-full ' +
        (allLive ? 'bg-emerald-500/15 text-emerald-400' : anyLive ? 'bg-amber-500/15 text-amber-400' : 'bg-orange-500/15 text-orange-400');
}

// ---- KPI tiles ----
function renderKpis() {
    const el = document.getElementById('kpiRow');
    const m = DATA.dashboard_metrics;
    el.innerHTML = m.kpis.map(k => `
        <div class="rounded-2xl p-5 border ${k.star ? 'border-amber-400/40 bg-gradient-to-br from-amber-400/10 to-transparent' : 'border-slate-700/60 bg-slate-800/40'} shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <span class="material-symbols-outlined text-2xl ${k.star ? 'text-amber-400' : 'text-sky-400'}">${k.icon}</span>
                ${k.star ? '<span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">North Star</span>' : ''}
            </div>
            <div class="text-3xl font-bold text-white leading-none mb-1">${k.value}</div>
            <div class="text-sm text-slate-300 font-medium">${k.label}</div>
            <div class="text-xs text-slate-500 mt-1">${k.sublabel}</div>
            ${k.trend != null ? `<div class="text-xs mt-2 font-semibold ${k.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}">${k.trend >= 0 ? '▲' : '▼'} ${Math.abs(k.trend)}% vs last period</div>` : ''}
        </div>`).join('');
}

// ---- Guardrails ----
function renderGuardrails() {
    const el = document.getElementById('guardrailRow');
    const m = DATA.dashboard_metrics;
    el.innerHTML = m.guardrails.map(g => `
        <div class="rounded-2xl p-4 border border-slate-700/60 bg-slate-800/40 flex items-center gap-3">
            <span class="material-symbols-outlined text-xl ${g.status === 'ok' ? 'text-emerald-400' : 'text-red-400'}">${g.status === 'ok' ? 'check_circle' : 'error'}</span>
            <div>
                <div class="text-lg font-bold text-white leading-none">${g.value}</div>
                <div class="text-xs text-slate-400 font-medium">${g.label}</div>
                <div class="text-[11px] text-slate-500">${g.note}</div>
            </div>
        </div>`).join('');
}

// ---- Category abandonment (bar chart w/ alert threshold line) ----
let abandonChartInstance = null;
function renderAbandonmentChart() {
    const m = DATA.dashboard_metrics;
    const ctx = document.getElementById('abandonChart').getContext('2d');
    const threshold = m.abandonment_alert_threshold;
    const labels = m.category_abandonment.map(c => `${c.emoji} ${c.name}`);
    const values = m.category_abandonment.map(c => c.value);
    if (abandonChartInstance) abandonChartInstance.destroy();
    abandonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Abandonment %',
                data: values,
                backgroundColor: values.map(v => v >= threshold ? 'rgba(248,113,113,0.75)' : 'rgba(56,189,248,0.65)'),
                borderRadius: 6
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                annotation: undefined
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' }, suggestedMax: Math.max(...values, threshold) + 10 }
            }
        }
    });
    document.getElementById('abandonNote').textContent =
        `Alert threshold: ${threshold}%. Categories above the line (red) are flagging worse-than-acceptable trial abandonment — per ProblemStatement.md this is "worse than no intervention."`;
}

// ---- Category density (dense vs sparse) ----
let densityChartInstance = null;
function renderDensityChart() {
    const cats = DATA.category_density_flags.categories;
    const entries = Object.entries(cats).filter(([id]) => id !== 'groceries_fresh' && id !== 'snacks_beverages');
    entries.sort((a, b) => b[1].mentions - a[1].mentions);
    const ctx = document.getElementById('densityChart').getContext('2d');
    if (densityChartInstance) densityChartInstance.destroy();
    densityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: entries.map(([id]) => id),
            datasets: [{
                label: 'Corpus mentions',
                data: entries.map(([, v]) => v.mentions),
                backgroundColor: entries.map(([, v]) => v.density_flag === 'dense' ? 'rgba(74,222,128,0.7)' : 'rgba(251,191,36,0.7)'),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });
}

// ---- Category signals table ----
function renderCategoryTable() {
    const sig = DATA.trust_signals_automated.category_signals;
    const density = DATA.category_density_flags.categories;
    const el = document.getElementById('categoryTableBody');
    const rows = Object.entries(sig).map(([id, s]) => {
        const d = density[id] || {};
        return `<tr class="border-b border-slate-700/40 hover:bg-slate-800/40">
            <td class="py-2 px-3 text-slate-200 font-medium">${s.display_name || id}</td>
            <td class="py-2 px-3 text-slate-400">${s.corpus_mentions ?? '—'}</td>
            <td class="py-2 px-3 text-slate-400">${s.avg_rating_rated_only ?? '—'}</td>
            <td class="py-2 px-3"><span class="text-xs font-semibold px-2 py-0.5 rounded-full ${d.density_flag === 'dense' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}">${d.density_flag || '—'}</span></td>
            <td class="py-2 px-3 text-slate-500 text-xs">${d.phase || s.phase || '—'}</td>
        </tr>`;
    }).join('');
    el.innerHTML = rows;
}

// ---- User profiles ----
function renderProfiles() {
    const users = DATA.user_profiles.users;
    const el = document.getElementById('profilesGrid');
    el.innerHTML = Object.values(users).map(u => `
        <div class="rounded-2xl p-4 border border-slate-700/60 bg-slate-800/40">
            <div class="flex items-center justify-between mb-2">
                <div class="font-semibold text-white">${u.persona}</div>
                ${u.is_ccar_active
                    ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">CCAR Active</span>'
                    : '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-600/30 text-slate-400">Not Active</span>'}
            </div>
            <div class="text-sm text-slate-400 mb-1">${u.total_orders_90d} orders / 90d</div>
            <div class="flex flex-wrap gap-1.5 mb-2">
                ${(u.categories_purchased_90d || []).map(c => `<span class="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">${c}</span>`).join('')}
            </div>
            <div class="text-xs text-slate-500">
                ${u.last_non_grocery_purchase ? `Last non-grocery: ${u.last_non_grocery_purchase.category} (${u.last_non_grocery_purchase.days_ago}d ago)` : 'No non-grocery purchase on record'}
            </div>
        </div>`).join('');
}

// ---- Compact facts block sent to the PM chatbot alongside each question ----
function buildDataFacts() {
    const m = DATA.dashboard_metrics;
    const kpiLines = m.kpis.map(k => `${k.label}: ${k.value}${k.trend != null ? ` (trend: ${k.trend >= 0 ? '+' : ''}${k.trend}% vs last period)` : ''}`).join('; ');
    const guardrailLines = m.guardrails.map(g => `${g.label}: ${g.value} (${g.status})`).join('; ');
    const abandonLines = m.category_abandonment.map(c => `${c.name}: ${c.value}%`).join('; ');
    const profileLines = Object.values(DATA.user_profiles.users).map(u =>
        `${u.persona} — ${u.total_orders_90d} orders/90d, categories: ${u.categories_purchased_90d.join(',')}, CCAR active: ${u.is_ccar_active}`).join(' | ');
    return `KPIs: ${kpiLines}\nGuardrails: ${guardrailLines}\nCategory abandonment %: ${abandonLines}\nUser profiles: ${profileLines}\n(Data source: ${Object.values(SOURCES).every(s => s === 'live') ? 'live deployment' : 'bundled snapshot'})`;
}

async function initDashboard() {
    await loadAllData();
    renderSourceBadge();
    renderKpis();
    renderGuardrails();
    renderAbandonmentChart();
    renderDensityChart();
    renderCategoryTable();
    renderProfiles();
}

document.addEventListener('DOMContentLoaded', initDashboard);

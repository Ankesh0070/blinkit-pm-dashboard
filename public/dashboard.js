// Live-first, snapshot-fallback data layer. Tries the deployed Blinkit app's
// data endpoints first (freshest numbers); if unreachable (offline, deployment
// down, CORS change) it falls back to the bundled snapshot in /data-snapshot
// so the dashboard always renders.
const LIVE_BASE = 'https://blinkit-trial-confidence-layer.vercel.app';
const FILES = ['dashboard_metrics', 'trust_signals_automated', 'user_profiles', 'category_density_flags'];

let DATA = {};
let SOURCES = {};

// ---- palette (matches CSS custom props in index.html) ----
const C = {
    ink: '#0b0b0b', ink2: '#52514e', muted: '#898781', grid: '#e8e7e2', baseline: '#c3c2b7',
    s: ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948'],
    good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b', accent: '#2a78d6', track: '#e8e7e2'
};

// Chart.js light-theme defaults (Power BI-ish)
Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif';
Chart.defaults.font.size = 11.5;
Chart.defaults.color = C.ink2;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.legend.labels.padding = 12;

const charts = {};

async function fetchWithFallback(name) {
    try {
        const r = await fetch(`${LIVE_BASE}/data/${name}.json`, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const j = await r.json();
        SOURCES[name] = 'live';
        return j;
    } catch (e) {
        console.warn(`Live fetch failed for ${name}, using snapshot:`, e.message);
        const r2 = await fetch(`/data-snapshot/${name}.json`, { cache: 'no-store' });
        SOURCES[name] = 'snapshot';
        return await r2.json();
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
    const txt = allLive ? '● Live data' : (anyLive ? '● Partially live' : '● Snapshot (offline)');
    const color = allLive ? C.good : (anyLive ? C.warning : C.serious);
    el.textContent = txt;
    el.style.background = allLive ? 'rgba(12,163,12,0.10)' : anyLive ? 'rgba(250,178,25,0.14)' : 'rgba(236,131,90,0.14)';
    el.style.color = color;
    document.getElementById('lastRefreshed').textContent = 'Refreshed ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ---- KPI cards ----
function renderKpis() {
    const el = document.getElementById('kpiRow');
    el.innerHTML = DATA.dashboard_metrics.kpis.map(k => {
        const star = k.star;
        const trend = k.trend;
        const trendHtml = trend != null
            ? `<div style="font-size:11.5px; font-weight:600; margin-top:8px; color:${trend >= 0 ? C.good : C.critical};">
                 <span class="material-symbols-outlined" style="font-size:15px;">${trend >= 0 ? 'trending_up' : 'trending_down'}</span> ${Math.abs(trend)}% vs last period
               </div>` : '<div style="height:8px;"></div>';
        return `<div class="tile" style="${star ? 'border-top:3px solid ' + C.accent + ';' : ''}">
            <div style="display:flex; align-items:center; justify-content:space-between;">
                <span class="material-symbols-outlined" style="font-size:22px; color:${star ? C.accent : C.muted};">${k.icon}</span>
                ${star ? `<span style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:${C.accent}; background:rgba(42,120,214,0.10); padding:2px 7px; border-radius:999px;">North Star</span>` : ''}
            </div>
            <div style="font-size:30px; font-weight:700; line-height:1.05; margin-top:10px;">${k.value}</div>
            <div style="font-size:13px; font-weight:600; color:var(--ink-2); margin-top:2px;">${k.label}</div>
            <div style="font-size:11px; color:var(--muted); margin-top:1px;">${k.sublabel}</div>
            ${trendHtml}
        </div>`;
    }).join('');
}

// ---- CCAR gauge (half-doughnut, progress toward target) ----
function renderGauge() {
    const ccar = DATA.dashboard_metrics.kpis.find(k => k.id === 'ccar');
    const val = parseFloat(ccar.value);       // e.g. 1.8
    const target = 5;                          // 5% target
    const filled = Math.min(val, target);
    const ctx = document.getElementById('ccarGauge').getContext('2d');
    if (charts.gauge) charts.gauge.destroy();
    charts.gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['CCAR', 'Remaining to target'],
            datasets: [{
                data: [filled, Math.max(target - filled, 0)],
                backgroundColor: [C.accent, C.track],
                borderWidth: 0, circumference: 180, rotation: 270
            }]
        },
        options: {
            cutout: '72%', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
    document.getElementById('gaugeCenter').innerHTML =
        `<div style="font-size:34px; font-weight:700; line-height:1;">${ccar.value}</div>
         <div style="font-size:11.5px; font-weight:600; color:${ccar.trend >= 0 ? C.good : C.critical}; margin-top:2px;">
            <span class="material-symbols-outlined" style="font-size:14px;">${ccar.trend >= 0 ? 'trending_up' : 'trending_down'}</span> ${Math.abs(ccar.trend)}%
         </div>
         <div style="font-size:10.5px; color:var(--muted); margin-top:2px;">0% ————— target ${target}%</div>`;
}

// ---- Donut: category density mix (dense vs sparse) ----
function renderDensityDonut() {
    const cats = DATA.category_density_flags.categories;
    const tracked = Object.entries(cats).filter(([id]) => id !== 'groceries_fresh' && id !== 'snacks_beverages');
    const dense = tracked.filter(([, v]) => v.density_flag === 'dense').length;
    const sparse = tracked.filter(([, v]) => v.density_flag === 'sparse').length;
    const ctx = document.getElementById('densityDonut').getContext('2d');
    if (charts.densityDonut) charts.densityDonut.destroy();
    charts.densityDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Dense', 'Sparse'],
            datasets: [{ data: [dense, sparse], backgroundColor: [C.good, C.warning], borderColor: '#fff', borderWidth: 2 }]
        },
        options: {
            cutout: '68%', responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed} categories` } }
            }
        }
    });
    document.getElementById('densityCenter').innerHTML =
        `<div style="font-size:28px; font-weight:700; line-height:1; margin-top:-18px;">${dense + sparse}</div>
         <div style="font-size:10.5px; color:var(--muted);">categories</div>`;
}

// ---- Donut: electronics complaint typology ----
function renderComplaintDonut() {
    const sig = DATA.trust_signals_automated.category_signals.electronics;
    const cb = (sig && sig.complaint_breakdown) || {};
    let entries = Object.entries(cb).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 5);
    const otherSum = entries.slice(5).reduce((s, [, v]) => s + v, 0);
    if (otherSum > 0) top.push(['other_rest', otherSum]);
    const pretty = k => k.replace(/_/g, ' ').replace(/\brest\b/, '').replace(/\b\w/g, c => c.toUpperCase()).trim();
    const ctx = document.getElementById('complaintDonut').getContext('2d');
    if (charts.complaintDonut) charts.complaintDonut.destroy();
    charts.complaintDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: top.map(([k]) => pretty(k)),
            datasets: [{ data: top.map(([, v]) => v), backgroundColor: C.s.slice(0, top.length), borderColor: '#fff', borderWidth: 2 }]
        },
        options: {
            cutout: '58%', responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 8, padding: 8, font: { size: 10.5 } } },
                tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed}` } }
            }
        }
    });
}

// small plugin: horizontal threshold line for the abandonment chart
const thresholdLine = {
    id: 'thresholdLine',
    afterDraw(chart, args, opts) {
        if (opts.value == null) return;
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        const yPos = y.getPixelForValue(opts.value);
        ctx.save();
        ctx.beginPath(); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.critical;
        ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = C.critical; ctx.font = '600 10px system-ui';
        ctx.fillText(`alert ${opts.value}%`, right - 62, yPos - 5);
        ctx.restore();
    }
};

// ---- Column chart: category abandonment ----
function renderAbandonmentChart() {
    const m = DATA.dashboard_metrics;
    const threshold = m.abandonment_alert_threshold;
    const data = m.category_abandonment;
    const ctx = document.getElementById('abandonChart').getContext('2d');
    if (charts.abandon) charts.abandon.destroy();
    charts.abandon = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(c => c.name),
            datasets: [{
                label: 'Abandonment %',
                data: data.map(c => c.value),
                backgroundColor: data.map(c => c.value >= threshold ? C.critical : C.accent),
                borderRadius: 4, maxBarThickness: 46
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, thresholdLine: { value: threshold }, tooltip: { callbacks: { label: c => `${c.parsed}% abandon` } } },
            scales: {
                x: { ticks: { color: C.muted, font: { size: 10 }, maxRotation: 40, minRotation: 0 }, grid: { display: false }, border: { color: C.baseline } },
                y: { beginAtZero: true, suggestedMax: Math.max(...data.map(c => c.value), threshold) + 8, ticks: { color: C.muted, callback: v => v + '%' }, grid: { color: C.grid }, border: { display: false } }
            }
        },
        plugins: [thresholdLine]
    });
    document.getElementById('abandonNote').textContent =
        `Alert threshold ${threshold}% — bars above the dashed line (red) flag worse-than-acceptable trial abandonment ("worse than no intervention").`;
}

// ---- Horizontal bar: category signal density ----
function renderDensityBar() {
    const cats = DATA.category_density_flags.categories;
    const entries = Object.entries(cats).filter(([id]) => id !== 'groceries_fresh' && id !== 'snacks_beverages')
        .sort((a, b) => b[1].mentions - a[1].mentions);
    const ctx = document.getElementById('densityBar').getContext('2d');
    if (charts.densityBar) charts.densityBar.destroy();
    charts.densityBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: entries.map(([, v]) => v.display_name || null).map((n, i) => n || (DATA.trust_signals_automated.category_signals[entries[i][0]]?.display_name) || entries[i][0]),
            datasets: [{
                label: 'Corpus mentions',
                data: entries.map(([, v]) => v.mentions),
                backgroundColor: entries.map(([, v]) => v.density_flag === 'dense' ? C.good : C.warning),
                borderRadius: 4, maxBarThickness: 20
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed} mentions` } } },
            scales: {
                x: { beginAtZero: true, ticks: { color: C.muted }, grid: { color: C.grid }, border: { display: false } },
                y: { ticks: { color: C.ink2, font: { size: 10.5 } }, grid: { display: false }, border: { color: C.baseline } }
            }
        }
    });
}

// ---- Category signals table (no Phase column) ----
function renderCategoryTable() {
    const sig = DATA.trust_signals_automated.category_signals;
    const density = DATA.category_density_flags.categories;
    const el = document.getElementById('categoryTableBody');
    el.innerHTML = Object.entries(sig).map(([id, s]) => {
        const d = density[id] || {};
        const dense = d.density_flag === 'dense';
        return `<tr style="border-bottom:1px solid var(--grid);">
            <td style="padding:9px 18px; font-weight:600; color:var(--ink);">${s.display_name || id}</td>
            <td style="padding:9px 18px; text-align:right; color:var(--ink-2); font-variant-numeric:tabular-nums;">${s.corpus_mentions ?? '—'}</td>
            <td style="padding:9px 18px; text-align:right; color:var(--ink-2); font-variant-numeric:tabular-nums;">${s.avg_rating_rated_only ?? '—'}</td>
            <td style="padding:9px 18px;"><span style="font-size:11px; font-weight:600; padding:2px 9px; border-radius:999px; background:${dense ? 'rgba(12,163,12,0.10)' : 'rgba(250,178,25,0.14)'}; color:${dense ? C.good : '#b07d00'};">${d.density_flag || '—'}</span></td>
        </tr>`;
    }).join('');
}

// ---- Guardrails ----
function renderGuardrails() {
    const el = document.getElementById('guardrailRow');
    el.innerHTML = DATA.dashboard_metrics.guardrails.map(g => {
        const ok = g.status === 'ok';
        return `<div class="tile" style="flex-direction:row; align-items:center; gap:12px;">
            <span class="material-symbols-outlined" style="font-size:26px; color:${ok ? C.good : C.critical};">${ok ? 'check_circle' : 'error'}</span>
            <div>
                <div style="font-size:19px; font-weight:700; line-height:1;">${g.value}</div>
                <div style="font-size:12px; font-weight:600; color:var(--ink-2); margin-top:2px;">${g.label}</div>
                <div style="font-size:11px; color:var(--muted);">${g.note}</div>
            </div>
        </div>`;
    }).join('');
}

// ---- User profiles ----
function renderProfiles() {
    const users = DATA.user_profiles.users;
    document.getElementById('profilesGrid').innerHTML = Object.values(users).map(u => `
        <div class="tile">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <div style="font-weight:700; font-size:13.5px;">${u.persona}</div>
                ${u.is_ccar_active
                    ? `<span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:rgba(12,163,12,0.10); color:${C.good};">CCAR Active</span>`
                    : `<span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:#eef0ee; color:var(--muted);">Not Active</span>`}
            </div>
            <div style="font-size:12.5px; color:var(--ink-2); margin-bottom:8px;">${u.total_orders_90d} orders / 90 days</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                ${(u.categories_purchased_90d || []).map(c => `<span style="font-size:10.5px; background:#f0f1ef; color:var(--ink-2); padding:2px 8px; border-radius:999px;">${c}</span>`).join('')}
            </div>
            <div style="font-size:11px; color:var(--muted);">
                ${u.last_non_grocery_purchase ? `Last non-grocery: ${u.last_non_grocery_purchase.category} · ${u.last_non_grocery_purchase.days_ago}d ago` : 'No non-grocery purchase on record'}
            </div>
        </div>`).join('');
}

// ---- Compact facts block for the PM chatbot ----
function buildDataFacts() {
    const m = DATA.dashboard_metrics;
    const kpiLines = m.kpis.map(k => `${k.label}: ${k.value}${k.trend != null ? ` (trend ${k.trend >= 0 ? '+' : ''}${k.trend}% vs last period)` : ''}`).join('; ');
    const guardrails = m.guardrails.map(g => `${g.label}: ${g.value} (${g.status})`).join('; ');
    const abandon = m.category_abandonment.map(c => `${c.name}: ${c.value}%`).join('; ');
    const profiles = Object.values(DATA.user_profiles.users).map(u =>
        `${u.persona} — ${u.total_orders_90d} orders/90d, categories: ${u.categories_purchased_90d.join(',')}, CCAR active: ${u.is_ccar_active}`).join(' | ');
    return `KPIs: ${kpiLines}\nGuardrails: ${guardrails}\nCategory abandonment %: ${abandon} (alert threshold ${m.abandonment_alert_threshold}%)\nUser profiles: ${profiles}\n(Data source: ${Object.values(SOURCES).every(s => s === 'live') ? 'live deployment' : 'bundled snapshot'})`;
}

async function initDashboard() {
    await loadAllData();
    renderSourceBadge();
    renderKpis();
    renderGauge();
    renderDensityDonut();
    renderComplaintDonut();
    renderAbandonmentChart();
    renderDensityBar();
    renderCategoryTable();
    renderGuardrails();
    renderProfiles();
}

document.addEventListener('DOMContentLoaded', initDashboard);

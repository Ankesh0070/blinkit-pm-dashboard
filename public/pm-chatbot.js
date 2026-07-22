// PM Insights Assistant — answers questions about THIS project's strategy,
// metrics, and methodology (CCAR, phases, edge cases, guardrails), grounded
// server-side in the condensed DOCS/ knowledge base plus whatever live/
// snapshot dashboard data this page has loaded (see dashboard.js). Light theme,
// inline styles (no Tailwind on this page).
let pmChatHistory = [];
let isPmChatOpen = false;

const PMC = { accent: '#2a78d6', accent2: '#4a3aa7', ink: '#0b0b0b', ink2: '#52514e', muted: '#898781', border: 'rgba(11,11,11,0.10)', surface: '#ffffff', panel: '#f4f4f2' };

function injectPmChatbot() {
    if (document.getElementById('pmChatWidget')) return;
    const html = `
    <div id="pmChatWidget" style="position:fixed; bottom:26px; right:26px; z-index:110; display:flex; flex-direction:column; align-items:flex-end; pointer-events:none;">
        <div id="pmChatWindow" style="pointer-events:none; opacity:0; transform:scale(.9); width:380px; height:520px; max-height:75vh; background:${PMC.surface}; border-radius:16px; box-shadow:0 12px 40px rgba(11,11,11,.18); border:1px solid ${PMC.border}; display:flex; flex-direction:column; overflow:hidden; margin-bottom:14px; transition:opacity .2s ease, transform .2s ease; transform-origin:bottom right;">
            <div style="background:linear-gradient(135deg, ${PMC.accent}, ${PMC.accent2}); display:flex; align-items:center; justify-content:space-between; padding:14px 16px; color:#fff;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:20px;">insights</span>
                    <span style="font-weight:600; font-size:14px;">PM Insights Assistant</span>
                </div>
                <button onclick="togglePmChat()" style="background:transparent; border:none; color:#fff; cursor:pointer; display:flex; padding:2px; border-radius:999px;"><span class="material-symbols-outlined" style="font-size:20px;">close</span></button>
            </div>
            <div id="pmChatMessages" style="flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:${PMC.panel};">
                <div style="align-self:flex-start; max-width:90%; background:${PMC.surface}; padding:12px; border-radius:14px 14px 14px 4px; color:${PMC.ink}; font-size:13px; border:1px solid ${PMC.border}; white-space:pre-wrap; line-height:1.5;">Hi! Ask me anything about this project — CCAR, why electronics launched first, the edge cases, the rollout, guardrails, or the current dashboard numbers.

Aap Hindi ya kisi bhi Indian language mein bhi pooch sakte hain.</div>
            </div>
            <div style="padding:12px; background:${PMC.surface}; border-top:1px solid ${PMC.border}; display:flex; gap:8px; align-items:center;">
                <input type="text" id="pmChatInput" placeholder="Ask about CCAR, research, edge cases..." style="flex:1; background:${PMC.panel}; border:1px solid ${PMC.border}; border-radius:999px; padding:9px 15px; font-size:13px; color:${PMC.ink}; outline:none;" onkeypress="handlePmChatKeyPress(event)">
                <button onclick="sendPmMessage()" style="background:${PMC.accent}; border:none; color:#fff; cursor:pointer; padding:9px; border-radius:999px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(42,120,214,.35);"><span class="material-symbols-outlined" style="font-size:20px;">send</span></button>
            </div>
        </div>
        <button id="pmChatFab" onclick="togglePmChat()" style="pointer-events:auto; width:56px; height:56px; background:linear-gradient(135deg, ${PMC.accent}, ${PMC.accent2}); border:none; color:#fff; border-radius:999px; box-shadow:0 6px 20px rgba(42,120,214,.4); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .15s ease;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'"><span class="material-symbols-outlined" style="font-size:28px;">insights</span></button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function togglePmChat() {
    const win = document.getElementById('pmChatWindow');
    isPmChatOpen = !isPmChatOpen;
    if (isPmChatOpen) {
        win.style.pointerEvents = 'auto'; win.style.opacity = '1'; win.style.transform = 'scale(1)';
        setTimeout(() => document.getElementById('pmChatInput').focus(), 100);
    } else {
        win.style.pointerEvents = 'none'; win.style.opacity = '0'; win.style.transform = 'scale(.9)';
    }
}

function handlePmChatKeyPress(e) { if (e.key === 'Enter') sendPmMessage(); }

function appendPmMessage(role, content) {
    const messagesDiv = document.getElementById('pmChatMessages');
    const div = document.createElement('div');
    const user = role === 'user';
    div.style.cssText = `align-self:${user ? 'flex-end' : 'flex-start'}; max-width:90%; padding:12px; border-radius:${user ? '14px 14px 4px 14px' : '14px 14px 14px 4px'}; font-size:13px; line-height:1.5; white-space:pre-wrap; border:1px solid ${PMC.border}; background:${user ? '#eaf2fc' : PMC.surface}; color:${user ? '#123a63' : PMC.ink};`;
    div.textContent = content;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendPmLoading() {
    const messagesDiv = document.getElementById('pmChatMessages');
    const div = document.createElement('div');
    const id = 'pm-loading-' + Date.now();
    div.id = id;
    div.style.cssText = `align-self:flex-start; max-width:85%; background:${PMC.surface}; padding:14px; border-radius:14px 14px 14px 4px; display:flex; gap:5px; align-items:center; border:1px solid ${PMC.border};`;
    div.innerHTML = `<span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite;"></span><span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite .15s;"></span><span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite .3s;"></span>`;
    if (!document.getElementById('pmbKeyframes')) {
        const st = document.createElement('style'); st.id = 'pmbKeyframes';
        st.textContent = '@keyframes pmb{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}';
        document.head.appendChild(st);
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return id;
}
function removePmLoading(id) { const el = document.getElementById(id); if (el) el.remove(); }

function localPmFallback(text) {
    if (text.toLowerCase().includes('ccar')) return 'CCAR (Cross-Category Activation Rate) is the North Star: % of Monthly Active Customers who buy from at least 1 new L2 category in a month, with a 90-day lookback. (AI assistant is offline — canned answer.)';
    return "I couldn't reach the AI assistant right now (offline or no API key). Try again shortly, or check /api/health.";
}

async function sendPmMessage() {
    const input = document.getElementById('pmChatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendPmMessage('user', text);
    pmChatHistory.push({ role: 'user', content: text });

    const loadingId = appendPmLoading();
    let replyText;
    try {
        const dataFacts = (typeof buildDataFacts === 'function') ? buildDataFacts() : null;
        const res = await fetch('/api/pm-chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: pmChatHistory.slice(-8), dataFacts }),
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) throw new Error('http ' + res.status);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'chat failed');
        replyText = data.reply;
    } catch (e) {
        replyText = localPmFallback(text);
    }
    removePmLoading(loadingId);
    pmChatHistory.push({ role: 'assistant', content: replyText });
    appendPmMessage('assistant', replyText);
}

document.addEventListener('DOMContentLoaded', injectPmChatbot);

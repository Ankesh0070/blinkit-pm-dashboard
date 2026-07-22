// PM Insights Assistant — answers questions about THIS project's strategy,
// metrics, and methodology (CCAR, phases, edge cases, guardrails), grounded
// server-side in the condensed DOCS/ knowledge base plus whatever live/
// snapshot dashboard data this page has loaded (see dashboard.js).
let pmChatHistory = [];
let isPmChatOpen = false;

function injectPmChatbot() {
    if (document.getElementById('pmChatWidget')) return;
    const html = `
    <div id="pmChatWidget" class="fixed bottom-8 right-8 z-[110] flex flex-col items-end pointer-events-none">
        <div id="pmChatWindow" class="pointer-events-none opacity-0 scale-90 w-[380px] h-[520px] max-h-[75vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden mb-4 transition-[opacity,transform] duration-200 ease-out origin-bottom-right">
            <div class="bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-between p-4 text-white">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined">insights</span>
                    <span class="font-semibold text-sm">PM Insights Assistant</span>
                </div>
                <button onclick="togglePmChat()" class="hover:bg-white/10 rounded-full p-1 transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            <div id="pmChatMessages" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-950">
                <div class="self-start max-w-[90%] bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-slate-200 text-sm border border-slate-700 whitespace-pre-wrap">
Hi! Ask me anything about this project — CCAR, why electronics launched first, the edge cases, the phased rollout, guardrails, or the current dashboard numbers.

Aap Hindi ya kisi bhi Indian language mein bhi pooch sakte hain.
                </div>
            </div>
            <div class="p-3 bg-slate-900 border-t border-slate-700 flex gap-2 items-center">
                <input type="text" id="pmChatInput" placeholder="Ask about CCAR, phases, edge cases..." class="flex-1 bg-slate-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-100 border-none placeholder:text-slate-500" onkeypress="handlePmChatKeyPress(event)">
                <button onclick="sendPmMessage()" class="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-500 transition-colors flex items-center justify-center shadow-md">
                    <span class="material-symbols-outlined text-[20px]">send</span>
                </button>
            </div>
        </div>
        <button id="pmChatFab" onclick="togglePmChat()" class="pointer-events-auto w-14 h-14 bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">insights</span>
        </button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function togglePmChat() {
    const win = document.getElementById('pmChatWindow');
    isPmChatOpen = !isPmChatOpen;
    if (isPmChatOpen) {
        win.classList.remove('pointer-events-none', 'opacity-0', 'scale-90');
        win.classList.add('pointer-events-auto', 'opacity-100', 'scale-100');
    } else {
        win.classList.remove('pointer-events-auto', 'opacity-100', 'scale-100');
        win.classList.add('pointer-events-none', 'opacity-0', 'scale-90');
    }
}

function handlePmChatKeyPress(e) { if (e.key === 'Enter') sendPmMessage(); }

function appendPmMessage(role, content) {
    const messagesDiv = document.getElementById('pmChatMessages');
    const div = document.createElement('div');
    div.className = `max-w-[90%] p-3 rounded-2xl text-sm border whitespace-pre-wrap ${
        role === 'user' ? 'self-end bg-sky-600/20 border-sky-700/40 text-sky-100 rounded-tr-sm' : 'self-start bg-slate-800 border-slate-700 text-slate-200 rounded-tl-sm'
    }`;
    div.textContent = content;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendPmLoading() {
    const messagesDiv = document.getElementById('pmChatMessages');
    const div = document.createElement('div');
    const id = 'pm-loading-' + Date.now();
    div.id = id;
    div.className = 'self-start max-w-[85%] bg-slate-800 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center border border-slate-700 h-10';
    div.innerHTML = '<div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.1s"></div><div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div>';
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return id;
}
function removePmLoading(id) { const el = document.getElementById(id); if (el) el.remove(); }

// Local, no-AI fallback so the widget still says something useful if both
// Gemini and Groq are unreachable (offline demo, no keys, etc.).
function localPmFallback(text) {
    const t = text.toLowerCase();
    if (t.includes('ccar')) return 'CCAR (Cross-Category Activation Rate) is the North Star metric: % of Monthly Active Customers who buy from at least 1 new L2 category in a month, with a 90-day lookback window. (AI assistant is offline — this is a canned answer.)';
    return "I couldn't reach the AI assistant right now (offline or no API key configured). Try again shortly, or check /api/health.";
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

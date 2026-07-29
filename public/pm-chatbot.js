// PM Insights Assistant — dark-console theme, grounded server-side in the
// DOCS knowledge base + live dashboard facts (see dashboard.js buildDataFacts).
let pmChatHistory = [];
let isPmChatOpen = false;
const PMC = { accent:'#F2C94C', bg:'#1E293B', deep:'#0F172A', ink:'#F1F5F9', ink2:'#CBD5E1', muted:'#94A3B8', border:'rgba(148,163,184,0.18)' };

function injectPmChatbot() {
  if (document.getElementById('pmChatWidget')) return;
  const html = `
  <div id="pmChatWidget" style="position:fixed; bottom:26px; right:26px; z-index:120; display:flex; flex-direction:column; align-items:flex-end; pointer-events:none;">
    <div id="pmChatWindow" style="pointer-events:none; opacity:0; transform:scale(.9); width:380px; height:520px; max-height:75vh; background:${PMC.bg}; border-radius:16px; box-shadow:0 18px 50px rgba(0,0,0,.5); border:1px solid ${PMC.border}; display:flex; flex-direction:column; overflow:hidden; margin-bottom:14px; transition:opacity .2s ease, transform .2s ease; transform-origin:bottom right;">
      <div style="background:${PMC.deep}; display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid ${PMC.border};">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="color:${PMC.accent};"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span>
          <span style="font-weight:700; font-size:14px; color:${PMC.ink};">PM Insights Assistant</span>
        </div>
        <button onclick="togglePmChat()" style="background:transparent; border:none; color:${PMC.muted}; cursor:pointer; display:flex; padding:2px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <div id="pmChatMessages" style="flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:${PMC.deep};">
        <div style="align-self:flex-start; max-width:90%; background:${PMC.bg}; padding:12px; border-radius:14px 14px 14px 4px; color:${PMC.ink}; font-size:13px; border:1px solid ${PMC.border}; white-space:pre-wrap; line-height:1.5;">Ask me anything about this case study — CCAR, the friction clusters, why electronics launched first, the roadmap, or the current dashboard numbers.

Aap Hindi ya kisi bhi Indian language mein bhi pooch sakte hain.</div>
      </div>
      <div style="padding:12px; background:${PMC.bg}; border-top:1px solid ${PMC.border}; display:flex; gap:8px; align-items:center;">
        <input type="text" id="pmChatInput" placeholder="Ask about clusters, CCAR, strategy..." style="flex:1; background:${PMC.deep}; border:1px solid ${PMC.border}; border-radius:999px; padding:9px 15px; font-size:13px; color:${PMC.ink}; outline:none;" onkeypress="handlePmChatKeyPress(event)">
        <button onclick="sendPmMessage()" style="background:${PMC.accent}; border:none; color:${PMC.deep}; cursor:pointer; padding:9px; border-radius:999px; display:flex; align-items:center; justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
      </div>
    </div>
    <button id="pmChatFab" onclick="togglePmChat()" style="pointer-events:auto; width:56px; height:56px; background:${PMC.accent}; border:none; color:${PMC.deep}; border-radius:999px; box-shadow:0 6px 22px rgba(242,201,76,.4); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .15s ease;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></button>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function togglePmChat() {
  const win = document.getElementById('pmChatWindow');
  isPmChatOpen = !isPmChatOpen;
  if (isPmChatOpen) { win.style.pointerEvents='auto'; win.style.opacity='1'; win.style.transform='scale(1)'; setTimeout(()=>document.getElementById('pmChatInput').focus(),100); }
  else { win.style.pointerEvents='none'; win.style.opacity='0'; win.style.transform='scale(.9)'; }
}
function handlePmChatKeyPress(e){ if(e.key==='Enter') sendPmMessage(); }

// Safe HTML escape — content still comes from an LLM, so we sanitize
// everything and then whitelist only the Markdown-style anchor links
// [label](#section) and **bold** the LLM uses when citing dashboard sections.
function pmSanitize(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function pmMarkupToHtml(raw) {
  let html = pmSanitize(raw);

  // [label](#anchor) → clickable in-page link
  html = html.replace(/\[([^\]]{1,120})\]\(#([a-zA-Z][\w-]{0,30})\)/g,
    (_, label, anchor) => `<a href="#${anchor}" onclick="pmScrollAndClose('${anchor}')" style="color:${PMC.accent}; font-weight:800; text-decoration:underline; text-underline-offset:2px;">${label}</a>`);

  // **bold** and *italic*
  html = html.replace(/\*\*([^*]{1,120})\*\*/g, '<b>$1</b>');
  html = html.replace(/(^|\W)\*([^*\n]{1,80})\*(?=\W|$)/g, '$1<i>$2</i>');

  // Convert markdown bullet lines starting with "- " or "* " into <ul><li>.
  // Split into logical blocks (paragraphs) separated by blank lines, then
  // detect and wrap contiguous bullet runs into a list.
  const blocks = html.split(/\n{2,}/);
  const out = blocks.map(block => {
    const lines = block.split(/\n/).map(l => l.trim()).filter(l => l.length);
    if (!lines.length) return '';
    // A block is a bullet list only if MOST lines start with a bullet marker.
    const bulletLines = lines.filter(l => /^[-*]\s+/.test(l));
    if (bulletLines.length >= Math.max(2, Math.ceil(lines.length * 0.6))) {
      const items = bulletLines.map(l =>
        `<li style="margin:5px 0; line-height:1.5;">${l.replace(/^[-*]\s+/, '')}</li>`
      ).join('');
      const preface = lines.filter(l => !/^[-*]\s+/.test(l)).join('<br>');
      return (preface ? `<div>${preface}</div>` : '') +
        `<ul style="margin:6px 0 6px 20px; padding:0; list-style:disc;">${items}</ul>`;
    }
    // Otherwise treat as a paragraph, preserving single line breaks as <br>.
    return `<p style="margin:6px 0; line-height:1.55;">${lines.join('<br>')}</p>`;
  }).join('');

  return out || html;
}
function pmScrollAndClose(anchor) {
  const el = document.getElementById(anchor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (isPmChatOpen) togglePmChat();
  return false;
}

function appendPmMessage(role, content) {
  const md = document.getElementById('pmChatMessages');
  const div = document.createElement('div');
  const user = role === 'user';
  const wsRule = user ? 'white-space:pre-wrap;' : '';
  div.style.cssText = `align-self:${user?'flex-end':'flex-start'}; max-width:92%; padding:12px 14px; border-radius:${user?'14px 14px 4px 14px':'14px 14px 14px 4px'}; font-size:13px; line-height:1.5; ${wsRule} border:1px solid ${PMC.border}; background:${user?'rgba(242,201,76,0.14)':PMC.bg}; color:${PMC.ink};`;
  if (user) div.textContent = content;
  else      div.innerHTML   = pmMarkupToHtml(content);
  md.appendChild(div); md.scrollTop = md.scrollHeight;
}
function appendPmLoading() {
  const md = document.getElementById('pmChatMessages');
  const div = document.createElement('div'); const id = 'pm-loading-' + Date.now(); div.id = id;
  div.style.cssText = `align-self:flex-start; max-width:85%; background:${PMC.bg}; padding:14px; border-radius:14px 14px 14px 4px; display:flex; gap:5px; align-items:center; border:1px solid ${PMC.border};`;
  div.innerHTML = `<span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite;"></span><span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite .15s;"></span><span style="width:6px;height:6px;background:${PMC.muted};border-radius:999px;display:inline-block;animation:pmb 1s infinite .3s;"></span>`;
  if (!document.getElementById('pmbKeyframes')) { const st=document.createElement('style'); st.id='pmbKeyframes'; st.textContent='@keyframes pmb{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}'; document.head.appendChild(st); }
  md.appendChild(div); md.scrollTop = md.scrollHeight; return id;
}
function removePmLoading(id){ const el=document.getElementById(id); if(el) el.remove(); }

function localPmFallback(text){
  if (text.toLowerCase().includes('ccar')) return 'CCAR (Cross-Category Activation Rate) is the North Star: % of MAC buying from ≥1 new L2 category in a month, 90-day lookback. (AI assistant offline — canned answer.)';
  return "I couldn't reach the AI assistant right now (offline or no API key). Try again shortly.";
}

async function sendPmMessage() {
  const input = document.getElementById('pmChatInput'); const text = input.value.trim(); if (!text) return;
  input.value = ''; appendPmMessage('user', text); pmChatHistory.push({ role:'user', content:text });
  const loadingId = appendPmLoading(); let replyText;
  try {
    const dataFacts = (typeof buildDataFacts === 'function') ? buildDataFacts() : null;
    const res = await fetch('/api/pm-chat', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ messages: pmChatHistory.slice(-8), dataFacts }), signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error('http'); const data = await res.json(); if (!data.success) throw new Error('fail');
    replyText = data.reply;
  } catch (e) { replyText = localPmFallback(text); }
  removePmLoading(loadingId); pmChatHistory.push({ role:'assistant', content:replyText }); appendPmMessage('assistant', replyText);
}

document.addEventListener('DOMContentLoaded', injectPmChatbot);

// Node "Parse" — colle ce code dans le node n8n
const r = $input.item.json;
const bp = $('Build Prompt').item.json;

const ct = r.content || [];
let t = '';
for (let i = ct.length - 1; i >= 0; i--) {
  if (ct[i].type === 'text' && ct[i].text) { t = ct[i].text; break; }
}
if (!t) throw new Error('No text block in Claude response');

let inner = t;
const m = t.match(/<result>([\s\S]*?)<\/result>/);
if (m) inner = m[1];

// Strip markdown code fences
const BT3 = String.fromCharCode(96, 96, 96);
inner = inner.replace(new RegExp('^\\s*' + BT3 + '(?:json)?\\s*', 'm'), '');
inner = inner.replace(new RegExp('\\s*' + BT3 + '\\s*$', 'm'), '');
inner = inner.trim();

let js = inner;
if (!js.startsWith('{')) {
  const j = inner.match(/\{[\s\S]*\}/);
  if (!j) throw new Error('No JSON found');
  js = j[0];
}

let p;
try { p = JSON.parse(js); }
catch (e) { throw new Error('Parse failed: ' + e.message + ' | ' + js.slice(0, 300)); }

const ss = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.replace(/<br\s*\/?>/gi, '\n').trim();
  if (Array.isArray(v)) return v.join('\n\n');
  return String(v);
};

return { json: {
  pageId: bp.pid,
  notionUrl: bp.nu,
  nom: bp.nm,
  contact: bp.ct,
  resumeCall: ss(p.resumeCall),
  sentiment: ss(p.sentiment) || 'Neutre',
  actionItemsStr: (Array.isArray(p.actionItems) ? p.actionItems : []).map((a, i) => (i + 1) + '. ' + a).join('\n'),
  prochaineAction: ss(p.prochaineAction),
  dateProchaineAction: ss(p.dateProchaineAction),
  statutRecommande: ss(p.statutRecommande) || 'Qualifié',
  newInteractions: (bp.ni || 0) + 1,
  portraitContactStr: ss(p.portraitContactUpdated),
  portraitEntrepriseStr: ss(p.portraitEntrepriseUpdated)
}};

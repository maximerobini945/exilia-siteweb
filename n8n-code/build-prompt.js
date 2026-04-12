// Node "Build Prompt" — colle ce code dans le node n8n
const ext = $('Extract').item.json;
const nr = $input.item.json;
const res = nr.results || [];
if (!res.length) throw new Error('No lead found for email: ' + ext.le + '. Attendees: ' + ext.att);

const pg = res[0];
const pr = pg.properties || {};
const gt = (p) => {
  if (!p) return '';
  if (p.title) return p.title.map(t => t.plain_text || '').join('');
  if (p.rich_text) return p.rich_text.map(t => t.plain_text || '').join('');
  if (p.email) return p.email || '';
  if (p.phone_number) return p.phone_number || '';
  if (p.select) return (p.select || {}).name || '';
  if (typeof p.number === 'number') return String(p.number);
  return '';
};

const ld = {
  pageId: pg.id,
  nom: gt(pr['Nom entreprise']),
  contact: gt(pr['Contact principal']),
  role: gt(pr['Rôle']),
  statut: gt(pr['Statut']),
  portrait: gt(pr['Portrait entreprise']).slice(0, 500),
  pain: gt(pr['Pain points']).slice(0, 500),
  tagline: gt(pr['Tagline entreprise']),
  inter: pr["Nombre d'interactions"] ? (pr["Nombre d'interactions"].number || 0) : 0,
};

const L = [];
L.push('Post-call analyst for Excilia (Swiss AI consulting for PMEs romandes). Analyze this call and produce a structured CRM update. ALL output in FRENCH.');
L.push('');
L.push('=== EXISTING LEAD ===');
L.push('Company: ' + ld.nom + ' | Contact: ' + ld.contact + (ld.role ? ' (' + ld.role + ')' : '') + ' | Status: ' + ld.statut);
L.push('Portrait: ' + ld.portrait);
L.push('Pain points: ' + ld.pain);
L.push('Tagline: ' + ld.tagline);
L.push('');
L.push('=== CALL DATA (from Fireflies via Notion) ===');
L.push('Title: ' + ext.title);
L.push('Attendees: ' + ext.att);
L.push('');
L.push('Overview: ' + ext.ov);
L.push('Gist: ' + ext.gs);
L.push('Summary: ' + ext.ns);
L.push('Bullet Notes: ' + ext.bn);
L.push('Action Items (Fireflies): ' + ext.ai);
L.push('');
L.push('CRITICAL: NEVER INVENT. Only use facts from the call data or existing CRM. If the prospect corrected info, UPDATE. If new info, ADD. Unknown = null.');
L.push('');
L.push('Output raw JSON in <result></result>. NO markdown fences.');
L.push('<result>{"resumeCall":"2-3 paragraphes résumé structuré","sentiment":"Positif|Neutre|Mitigé|Négatif","actionItems":["item1","item2"],"prochaineAction":"next step","dateProchaineAction":"YYYY-MM-DD","statutRecommande":"Qualifié|Audit fait|Proposition|Client|Nurture","portraitContactUpdated":["p1","p2"],"portraitEntrepriseUpdated":["p1","p2"]}</result>');

return { json: {
  pid: ld.pageId,
  nu: 'https://www.notion.so/' + ld.pageId.replace(/-/g, ''),
  nm: ld.nom,
  ct: ld.contact,
  ni: ld.inter,
  pr: L.join('\n'),
}};

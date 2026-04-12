// Node "Extract" — paste this into the Code node in n8n
const d = $input.item.json.data ? $input.item.json.data.transcript : null;
if (!d) throw new Error('No transcript data from Fireflies');

const att = d.meeting_attendees || [];
const maxPat = ['maxime', 'robini', 'excilia'];
const ext = att.filter(a => {
  const e = (a.email || '').toLowerCase();
  return e && !maxPat.some(p => e.includes(p));
});

const leadEmail = ext.length ? ext[0].email : '';
const leadName = ext.length ? (ext[0].name || ext[0].displayName || '') : '';
const s = d.summary || {};
const an = (d.analytics || {}).sentiments || {};

// Condense transcript to ~3000 words
const sents = d.sentences || [];
let wc = 0, co = '';
for (const x of sents) {
  const t = x.text || '';
  const w = t.split(/\s+/).length;
  if (wc + w > 3000) break;
  co += (x.speaker_name || '?') + ': ' + t + '\n';
  wc += w;
}

const toS = (v) => Array.isArray(v) ? v.join('\n') : (v || '');

return { json: {
  meetingId: d.id || '',
  title: d.title || '',
  date: d.dateString || d.date || '',
  duration: d.duration || 0,
  le: leadEmail,
  leadName,
  allAttendees: att.map(a => (a.name || '') + ' <' + (a.email || '') + '>').join(', '),
  summaryOverview: s.overview || '',
  actionItems: toS(s.action_items),
  topicsDiscussed: toS(s.topics_discussed),
  keywords: toS(s.keywords),
  sentPos: an.positive_pct || 0,
  sentNeu: an.neutral_pct || 0,
  sentNeg: an.negative_pct || 0,
  transcript: co.slice(0, 15000)
}};

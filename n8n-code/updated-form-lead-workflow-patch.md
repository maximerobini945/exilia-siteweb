# Mise à jour du Workflow A : Form → Notion Lead

## Ce qui change

Ajouter un node **"Telegram Alert Immédiat"** entre "Create Lead Notion" et "Trigger Deep Research".

## Node à ajouter manuellement dans n8n

### Telegram Alert Immédiat (après Create Lead Notion, avant Trigger Deep Research)

- **Type** : Telegram > Send Message
- **Chat ID** : `8764256190`
- **Parse mode** : HTML
- **Text** (expression) :

```
={{ (() => {
  const f = $('Map Form Fields').item.json;
  const lines = [];
  
  lines.push('📋 <b>NOUVEAU LEAD</b> — À contacter');
  lines.push('');
  if (f.contactPrincipal) lines.push('👤 ' + f.contactPrincipal);
  if (f.email) lines.push('📧 ' + f.email);
  if (f.telephone) lines.push('📱 ' + f.telephone);
  if (f.rawFormData?.company) lines.push('🏢 ' + f.rawFormData.company + (f.taille ? ' · ' + f.taille + ' pers.' : ''));
  if (f.rawFormData?.budget) lines.push('💰 Budget : ' + f.budget);
  if (f.secteur && f.secteur !== 'Autre') lines.push('🏭 ' + f.secteur);
  if (f.enjeuPrincipal) lines.push('💬 "' + f.enjeuPrincipal.substring(0, 100) + (f.enjeuPrincipal.length > 100 ? '...' : '') + '"');
  if (f.timing) lines.push('📅 Timing : ' + f.timing);
  lines.push('');
  lines.push('→ <b>À contacter</b> (appel non encore réservé)');
  lines.push('');
  lines.push('📄 <i>Le briefing IA complet arrive dans ~1 min ↓</i>');
  
  return lines.join('\n');
})() }}
```

### Connexion
1. Create Lead Notion → **Telegram Alert Immédiat**
2. Telegram Alert Immédiat → **Trigger Deep Research**

Ainsi le flow est :
```
Webhook → Map Fields → Create Notion → Telegram Alert Immédiat → Trigger Deep Research
                                                                       ↓
                                                        (Workflow B: Claude Research → HTML → Telegram Document)
```

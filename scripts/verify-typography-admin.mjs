import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const origin = 'http://127.0.0.1:3134';
const privatePrefix = '.okno-secrets/numeric-size-2026-10-14';
const key = (await readFile('.env.local', 'utf8')).match(/^OKNO_CMS_ADMIN_TOKEN\s*=\s*["']?([^\n"']+)/m)?.[1].trim();
if (!key) throw new Error('Existing owner credential is missing.');
async function request(method = 'GET', body) {
  const response = await fetch(`${origin}/api/admin/content`, { method, headers: { Authorization: `Bearer ${key}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error}`);
  return result;
}
const isType = id => id.startsWith('typography.');
const clean = fields => Object.fromEntries(Object.entries(fields).filter(([id]) => !isType(id)));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
let state = await request();
const action = process.argv[2];
if (action === 'backup') {
  if (Object.keys(state.draft).length || Object.keys(state.draftCollections).length) throw new Error('Existing owner drafts must be preserved; QA cannot publish them.');
  await writeFile(`${privatePrefix}-original.json`, JSON.stringify(state), { mode: 0o600, flag: 'wx' });
  console.log(`Private original preserved at published revision ${state.revision}; zero drafts.`);
} else if (action === 'stage-all') {
  const bindings = JSON.parse(await readFile('src/data/typographySections.json','utf8'));
  const roles = ['display','heading','subheading','body','caption'];
  const values = {};
  const ranges = {display:[47,73],heading:[31,49],subheading:[21,27],body:[14,19],caption:[9,11]};
  for (const {scope} of bindings) {
    const prefix=`typography.section.${scope}`;
    for (const role of roles) {
      values[`${prefix}.${role}-size`] = String(ranges[role][1]);
      values[`${prefix}.${role}-mobile-size`] = String(ranges[role][0]);
    }
  }
  const original = JSON.parse(await readFile(`${privatePrefix}-original.json`,'utf8'));
  if (!same(clean(state.published),clean(original.published)) || !same(state.publishedCollections,original.publishedCollections)) throw new Error('Owner content changed; stop QA.');
  if (Object.keys(state.draft).length || Object.keys(state.draftCollections).length) throw new Error('Owner drafts changed; stop QA.');
  const beforeStage = state.published;
  const entries=Object.entries(values);
  for(let index=0;index<entries.length;index+=100) state=await request('PATCH',{values:Object.fromEntries(entries.slice(index,index+100)),revision:state.revision,draftRevision:state.draftRevision});
  const live=await (await fetch(`${origin}/api/site-content`)).json();
  if(!same(live.published,beforeStage))throw new Error('Draft leaked to visitors.');
  await writeFile(`${privatePrefix}-expected.json`,JSON.stringify(values),{mode:0o600});
  console.log(`All ${entries.length} typography controls saved privately; visitor snapshot unchanged.`);
} else if(action==='publish') {
  state=await request('PUT',{revision:state.revision,draftRevision:state.draftRevision});
  await writeFile(`${privatePrefix}-revision.json`,JSON.stringify({revision:state.revision,draftRevision:state.draftRevision}),{mode:0o600});
  console.log(`Published typography QA revision ${state.revision}; zero remaining drafts.`);
} else if(action==='check') {
  const original=JSON.parse(await readFile(`${privatePrefix}-original.json`,'utf8'));
  const live=await (await fetch(`${origin}/api/site-content`)).json();
  if(!same(live.published,state.published))throw new Error('Public snapshot differs.');
  if(!same(clean(state.published),clean(original.published))||!same(state.publishedCollections,original.publishedCollections))throw new Error('Owner content changed.');
  console.log(`Authenticated/public snapshots agree at revision ${state.revision}; original copy and collections retained.`);
} else if(action==='restore') {
  const original=JSON.parse(await readFile(`${privatePrefix}-original.json`,'utf8'));
  const expected=JSON.parse(await readFile(`${privatePrefix}-expected.json`,'utf8'));
  const ours=new Set(Object.keys(expected));
  const other=fields=>Object.fromEntries(Object.entries(fields).filter(([id])=>!ours.has(id)));
  if(!same(other(state.published),other(original.published))||!same(state.publishedCollections,original.publishedCollections)||Object.keys(state.draft).length||Object.keys(state.draftCollections).length||Object.entries(expected).some(([id,value])=>state.published[id]!==value))throw new Error('Concurrent owner edits block QA restoration.');
  const raw=await readFile('.okno-content/content.json','utf8'),fresh=JSON.parse(raw);
  if(fresh.revision!==state.revision||fresh.draftRevision!==state.draftRevision)throw new Error('Content revision changed during restoration.');
  const restored={...fresh,published:original.published,draft:original.draft,publishedCollections:original.publishedCollections,draftCollections:original.draftCollections,revision:fresh.revision+1,draftRevision:fresh.draftRevision+1};
  const temp='.okno-content/typography-restoration.tmp';
  await writeFile(temp,JSON.stringify(restored,null,2),{mode:0o600});
  if((await readFile('.okno-content/content.json','utf8'))!==raw)throw new Error('Concurrent file mutation blocks restoration.');
  await rename(temp,'.okno-content/content.json');
  const final=await request();
  if(!same(final.published,original.published)||!same(final.publishedCollections,original.publishedCollections)||Object.keys(final.draft).length)throw new Error('Restoration validation failed.');
  const digest=createHash('sha256').update(JSON.stringify({published:final.published,collections:final.publishedCollections})).digest('hex');
  console.log(`Original fields/collections restored exactly at revision ${final.revision}; zero drafts; content hash ${digest}.`);
} else throw new Error('Use backup, stage-all, publish, check, restore.');

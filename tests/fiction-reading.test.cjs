"use strict";
const test=require("node:test"), assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path");
const root=path.resolve(__dirname,".."), M=require("../fiction/runtime/model.js");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,"fiction/content/telanas",p),"utf8"));
const prefix="dragon-knight/volume-01/";
const book=read(prefix+"book.json"), en=read(prefix+"editions/en.json"), de=read(prefix+"editions/de.json"), after=read(prefix+"afterword.json"), refs=read(prefix+"contextual-lexicon.json"), lex=read("lexicon.json");
const models={en:M.readerModel(book,en,after),de:M.readerModel(book,de,after)};
test("Published reader content is complete, localized and anchored",()=>{
 assert.equal(book.state,"published");assert.equal(book.contentMode,"released");assert.ok(!book.source);
 for(const [l,model] of Object.entries(models)){
  assert.equal(model.sections.length,11);
  assert.equal(model.sections.slice(0,10).reduce((n,s)=>n+s.blocks.length,0),5389);
  assert.equal(model.anchors.size,1+11+5389+17);
  assert.equal(model.illustrations.size,10);
  for(const a of book.spoilerMilestones)assert.ok(model.anchors.has(a),l+" "+a);
  for(const r of refs.references[l]){
   const x=model.anchors.get(r.paragraphAnchor||r.anchor);assert.ok(x);
   assert.ok(model.sections[x.section].blocks[x.index].text.includes(r.text));
  }
  for(const e of lex.entries)for(const f of e.fragments)for(const link of f.readerLinks||[])assert.ok(model.anchors.has(link.anchor),link.anchor);
 }
 assert.equal(book.spoilerMilestones.length,32);
});
test("Shared spoiler gate hides existence and every dependent field until eligible",()=>{
 let cases=0;
 const gates=[];
 function collect(o){if(!o||typeof o!=="object")return;if(o.visibility)gates.push(o.visibility);Object.values(o).forEach(collect);}
 collect(lex);
 const states=[M.empty()];
 for(let i=0;i<book.chapters.length;i++)states.push(M.through(M.empty(),book,i));
 for(const a of [...book.spoilerMilestones,...book.localizedSpoilerMilestones.map(m=>m.id)])states.push(M.markAnchors(M.empty(),book,[a]));
 states.push({...M.empty(),fullSpoilers:true});
 for(const p of states){
  for(const g of gates){
   const w=p.worlds.telanas,completed=w?.completedChapters?.[g.story]?.[g.book]||[],reached=w?.reached?.[g.story]?.[g.book]||[];
   const expected=p.fullSpoilers||g.mode==="always"||completed.includes(g.chapter)||(g.mode==="reached-anchor"&&[g.anchor,g.legacyAnchor].filter(Boolean).some(a=>reached.includes(a)));
   assert.equal(M.allowed(p,"telanas",g),expected);cases++;
  }
  for(const l of ["en","de"]){
   const visible=M.visibleLexicon(lex,p,l),ids=new Set(visible.map(e=>e.id));
   for(const e of lex.entries){
    const entry=visible.find(x=>x.id===e.id),ok=g=>M.allowed(p,"telanas",g);
    assert.equal(Boolean(entry),ok(e.visibility));
    if(!entry)continue;
    const eligible=(e.summaryUpdates||[]).filter(s=>ok(s.visibility));
    assert.equal(entry.summary,eligible.at(-1)?.text[l]||e.labels[l].summary);
    assert.equal(entry.sections.length,(e.sections||[]).filter(x=>ok(x.visibility)).length);
    assert.equal(entry.fragments.length,e.fragments.filter(x=>ok(x.visibility)).length);
    assert.equal(entry.relationships.length,(e.relationships||[]).filter(x=>ids.has(x.target)&&ok(x.visibility)).length);
   }
  }
 }
 assert.ok(cases>8000);
 assert.equal(M.visibleLexicon(lex,{...M.empty(),fullSpoilers:true},"en").length,66);
 assert.ok(M.visibleLexicon(lex,M.empty(),"en").length<66);
});
test("Progress is monotonic and language changes preserve semantic position",()=>{
 const p=M.empty();M.through(p,book,5);M.through(p,book,1);
 assert.equal(M.completed(p,book).length,6);
 M.markAnchors(p,book,[book.spoilerMilestones[0]]);M.markAnchors(p,book,[]);
 assert.equal(M.reached(p,book).length,1);
 for(const a of book.spoilerMilestones)assert.equal(M.resolve(models.de,a,models.en),a);
 assert.equal(M.resolve(models.en,"unknown"),"contents");
 M.through(p,book,-1,true);assert.equal(M.completed(p,book).length,0);assert.equal(M.reached(p,book).length,0);
});
test("Search and category filtering only see eligible entries",()=>{
 const safe=M.visibleLexicon(lex,M.empty(),"en");
 const hidden=lex.entries.find(x=>!safe.some(e=>e.id===x.id));
 assert.ok(hidden);assert.ok(!M.search(safe,hidden.labels.en.title,"","appearance","en").some(x=>x.id===hidden.id));
 for(const c of lex.categories){
  assert.ok(M.search(safe,"",c.id,"alphabetical","en").every(x=>x.categories.includes(c.id)));
 }
});

test("Every curated reference is unlocked at its own reading position in both languages",()=>{
 for(const [l,model] of Object.entries(models)){
  assert.equal(refs.references[l].length,69);
  for(const ref of refs.references[l]){
   const target=ref.paragraphAnchor||ref.anchor;
   const p=M.empty(),position=model.anchors.get(target);
   M.through(p,book,position.section-1);
   M.markAnchors(p,book,M.milestonesThrough(model,[target]));
   assert.ok(M.allowed(p,book.world,lex.entries.find(e=>e.id===ref.entry).visibility),l+" "+ref.entry);
  }
 }
});

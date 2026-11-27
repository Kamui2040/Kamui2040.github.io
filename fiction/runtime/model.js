/* Public reading model. All visibility decisions are shared by reader and lexicon. */
(function (scope) {
  "use strict";
  const key = "library-spoiler-profile-v3";
  const identity = book => [book.world, book.story, book.id].join("/");
  const empty = () => ({version:3,fullSpoilers:false,worlds:{}});
  const read = (storage, name, fallback) => {
    try { const value=JSON.parse(storage.getItem(name)); return value ?? fallback; }
    catch { return fallback; }
  };
  const write = (storage,name,value) => { try { storage.setItem(name,JSON.stringify(value)); } catch {} };
  const unique = values => [...new Set(Array.isArray(values)?values.filter(x=>typeof x==="string"):[])];
  function profile(storage) {
    const raw=read(storage,key,null);
    return raw?.version===3 && raw.worlds && typeof raw.worlds==="object"
      ? raw : empty();
  }
  function worldState(p,b) {
    p.worlds[b.world] ||= {};
    const w=p.worlds[b.world];
    w.completedChapters ||= {};
    w.reached ||= {};
    w.completedChapters[b.story] ||= {};
    w.reached[b.story] ||= {};
    w.completedChapters[b.story][b.id]=unique(w.completedChapters[b.story][b.id]);
    w.reached[b.story][b.id]=unique(w.reached[b.story][b.id]);
    return w;
  }
  const completed=(p,b)=>unique(p.worlds?.[b.world]?.completedChapters?.[b.story]?.[b.id]);
  const reached=(p,b)=>unique(p.worlds?.[b.world]?.reached?.[b.story]?.[b.id]);
  function through(p,b,index,replace=false) {
    const w=worldState(p,b), ids=b.chapters.slice(0,index+1).map(c=>c.id);
    w.completedChapters[b.story][b.id]=unique(replace?ids:[...completed(p,b),...ids]);
    if(replace) w.reached[b.story][b.id]=[];
    return p;
  }
  function markAnchors(p,b,ids) {
    const w=worldState(p,b),allowed=new Set([...b.spoilerMilestones,...(b.localizedSpoilerMilestones||[]).map(m=>m.id)]);
    w.reached[b.story][b.id]=unique([...reached(p,b),...ids.filter(id=>allowed.has(id))]);
    return p;
  }
  function allowed(p,world,g) {
    if(p.fullSpoilers===true)return true;
    if(!g||g.mode==="always")return true;
    if(!["completed-chapter","reached-anchor"].includes(g.mode)||!g.story||!g.book||!g.chapter)return false;
    const b={world,story:g.story,id:g.book};
    return completed(p,b).includes(g.chapter)||(g.mode==="reached-anchor"&&[g.anchor,g.legacyAnchor].filter(Boolean).some(a=>reached(p,b).includes(a)));
  }
  function visibleLexicon(data,p,lang) {
    const ok=g=>allowed(p,data.world,g);
    const eligible=data.entries.filter(e=>ok(e.visibility));
    const ids=new Set(eligible.map(e=>e.id));
    return eligible.map(e=>{
      const updates=(e.summaryUpdates||[]).filter(s=>ok(s.visibility));
      return {id:e.id,categories:e.categories,title:e.labels[lang].title,
        fullName:e.labels[lang].fullName||"",summary:updates.length?updates.at(-1).text[lang]:e.labels[lang].summary,
        appearanceOrder:e.appearanceOrder,chronologyOrder:e.chronologyOrder,
        sections:(e.sections||[]).filter(s=>ok(s.visibility)).map(s=>({title:s.labels[lang],text:s.text[lang]})),
        fragments:(e.fragments||[]).filter(f=>ok(f.visibility)).map(f=>({id:f.id,chapter:f.visibility?.chapter,text:f.text[lang],links:(f.readerLinks||[]).map(l=>({anchor:l.anchor,story:l.story,book:l.book,label:l.labels[lang]}))})),
        relationships:(e.relationships||[]).filter(r=>ids.has(r.target)&&ok(r.visibility)).map(r=>({target:r.target,label:r.labels[lang]}))
      };
    });
  }
  function readerModel(book,edition,afterword) {
    const lang=edition.locale;
    const sections=[...book.chapters.map((c,i)=>({id:c.id,label:c.labels[lang],blocks:edition.chapters[i].blocks,chapter:true})),
      ...book.backMatter.map(c=>({id:c.id,label:c.labels[lang],blocks:afterword.locales[lang].blocks,chapter:false}))];
    const anchors=new Map([["contents",{section:-1,index:-1}]]);
    sections.forEach((s,i)=>{anchors.set(s.id,{section:i,index:-1});s.blocks.forEach((b,j)=>anchors.set(b.id,{section:i,index:j}));});
    const milestones=new Map(book.spoilerMilestones.map(id=>[id,anchors.get(id)]));
    for(const item of book.localizedSpoilerMilestones||[]){
      const loc=anchors.get(item.paragraphs[lang].anchor);
      if(loc)milestones.set(item.id,loc);
    }
    return {book,lang,sections,anchors,milestones,illustrations:new Map(book.illustrations.map(x=>[x.id,x]))};
  }
  function milestonesThrough(model,ids) {
    const rank=x=>x.section*100000+x.index;
    const max=Math.max(-Infinity,...ids.map(id=>model.anchors.get(id)).filter(Boolean).map(rank));
    return [...model.milestones].filter(([id,pos])=>pos&&rank(pos)<=max).map(([id])=>id);
  }
  function resolve(model,anchor,prior) {
    if(model.anchors.has(anchor))return anchor;
    if(prior?.anchors.has(anchor)){
      const {section,index}=prior.anchors.get(anchor);
      const a=prior.sections[section],b=model.sections[section];
      if(a&&b){if(index<0)return b.id;return b.blocks[Math.round(index/Math.max(1,a.blocks.length-1)*Math.max(0,b.blocks.length-1))]?.id||b.id;}
    }
    return "contents";
  }
  function search(entries,query,category,order,lang) {
    const q=query.trim().toLocaleLowerCase(lang);
    const result=entries.filter(e=>(!category||e.categories.includes(category))&&(!q||[e.title,e.fullName,e.summary,...e.sections.map(x=>x.title+" "+x.text),...e.fragments.map(x=>x.text),...e.relationships.map(r=>r.label+" "+(entries.find(x=>x.id===r.target)?.title||""))].some(x=>x.toLocaleLowerCase(lang).includes(q))));
    return result.sort((a,b)=>order==="alphabetical"?a.title.localeCompare(b.title,lang):order==="chronological"?(a.chronologyOrder??a.appearanceOrder)-(b.chronologyOrder??b.appearanceOrder):a.appearanceOrder-b.appearanceOrder);
  }
  const api={key,identity,empty,read,write,profile,completed,reached,through,markAnchors,allowed,visibleLexicon,readerModel,milestonesThrough,resolve,search};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else scope.LibraryModel=api;
})(typeof window!=="undefined"?window:globalThis);

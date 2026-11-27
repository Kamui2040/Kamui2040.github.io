/* Reader and Lexicon UI. Released prose is inserted as text, not executable HTML. */
(() => {
  "use strict";
  const M=window.LibraryModel, root=document.documentElement, page=document.body.dataset.page;
  const isReader=page==="fictionReader";
  const base="/fiction/content/telanas/dragon-knight/volume-01/";
  const reader="/fiction/telanas/dragon-knight/volume-01/read/";
  const lexicon="/fiction/telanas/lexicon/";
  const $=s=>document.querySelector(s);
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const button=(text,fn,cls="reading-button")=>{const b=node("button",text,cls);b.type="button";b.addEventListener("click",fn);return b;};
  const link=(text,url,cls="text-link")=>{const a=node("a",text,cls);a.href=url;return a;};
  const get=async path=>{const r=await fetch(path);if(!r.ok)throw new Error("HTTP "+r.status);return r.json();};
  const memory=new Map();
  const storage={getItem:k=>{try{return localStorage.getItem(k);}catch{return memory.get(k)||null;}},setItem:(k,v)=>{memory.set(k,v);try{localStorage.setItem(k,v);}catch{}}};
  const lang=()=>root.lang==="de"?"de":"en";
  const words={
    en:{fullscreen:"Fullscreen",exitFullscreen:"Exit fullscreen",topControls:"Show top controls",bottomControls:"Show bottom controls",contents:"Contents",bookmark:"Save place",remove:"Remove",bookmarks:"Bookmarks",noBookmarks:"No saved places yet.",previous:"Previous",next:"Next",spread:"Book spread",single:"Single page",continuous:"Continuous",layout:"Layout",settings:"Reading settings",theme:"Page theme",light:"Light",dark:"Dark",parchment:"Parchment",typeface:"Typeface",serif:"Book serif",sans:"Sans serif",size:"Text size",spacing:"Line spacing",progress:"Chapter completion",ask:"Ask",automatic:"Automatic",manual:"Manual",finish:"Mark chapter finished",finished:"Chapter completed",read:"Read",lexicon:"Lexicon",back:"Back to book",error:"The released content could not be loaded.",all:"All",search:"Search visible entries",noResults:"No matching entries.",order:"Sort order",appearance:"First appearance",alphabetical:"Alphabetical",chronological:"Chronological",through:"Spoilers through",none:"No completed chapters",full:"Full spoilers",relationships:"Relationships",revealed:"Revealed book details",close:"Close",volumeComplete:"Volume completed",page:"Page",noEdition:"This edition is unavailable."},
    de:{fullscreen:"Vollbild",exitFullscreen:"Vollbild verlassen",topControls:"Obere Steuerung anzeigen",bottomControls:"Untere Steuerung anzeigen",contents:"Inhalt",bookmark:"Stelle speichern",remove:"Entfernen",bookmarks:"Lesezeichen",noBookmarks:"Noch keine gespeicherten Stellen.",previous:"Zurück",next:"Weiter",spread:"Doppelseite",single:"Einzelseite",continuous:"Fortlaufend",layout:"Lesemodus",settings:"Leseeinstellungen",theme:"Seitendesign",light:"Hell",dark:"Dunkel",parchment:"Pergament",typeface:"Schriftart",serif:"Buch-Serifenschrift",sans:"Sans-Serif",size:"Textgröße",spacing:"Zeilenabstand",progress:"Kapitelabschluss",ask:"Nachfragen",automatic:"Automatisch",manual:"Manuell",finish:"Kapitel als gelesen markieren",finished:"Kapitel abgeschlossen",read:"Lesen",lexicon:"Lexikon",back:"Zum Buch",error:"Der veröffentlichte Inhalt konnte nicht geladen werden.",all:"Alle",search:"Sichtbare Einträge durchsuchen",noResults:"Keine passenden Einträge.",order:"Sortierung",appearance:"Erstes Auftreten",alphabetical:"Alphabetisch",chronological:"Chronologisch",through:"Spoiler bis",none:"Keine abgeschlossenen Kapitel",full:"Alle Spoiler",relationships:"Beziehungen",revealed:"Enthüllte Buchdetails",close:"Schließen",volumeComplete:"Band abgeschlossen",page:"Seite",noEdition:"Diese Ausgabe ist nicht verfügbar."}
  };
  const t=k=>words[lang()][k]||k;
  let book,data,afterword,context,model,editionCache={},p,bookKey;
  let section=-1,current="contents",pages=[],pageIndex=0,renderEpoch=0,observer=null,resizeTimer,navigating=false;
  let category="",order=M.read(storage,"library-lexicon-sort","appearance"),query="",openedEntry=null,returnFocus=null;
  if(!["appearance","alphabetical","chronological"].includes(order))order="appearance";
  const prefsKey="library-reader-presentation-v1",positionKey="library-reader-position-v2",marksKey="library-reader-bookmarks-v3";
  let prefs=M.read(storage,prefsKey,{})||{};
  const choices={theme:["light","dark","parchment"],typeface:["serif","sans"],fontSize:["0.9","1","1.1","1.2"],lineHeight:["1.5","1.75","2"]};
  const defaults={theme:"dark",typeface:"serif",fontSize:"1",lineHeight:"1.75"};
  for(const k of Object.keys(choices))prefs[k]=choices[k].includes(String(prefs[k]))?String(prefs[k]):defaults[k];
  let layout="spread",progressMode="ask";
  try {const a=localStorage.getItem("library-reader-layout"),b=localStorage.getItem("library-reader-progress-mode-v1");if(["spread","single","continuous"].includes(a))layout=a;if(["ask","automatic","manual"].includes(b))progressMode=b;}catch{}
  const writeProfile=()=>M.write(storage,M.key,p);
  const refreshProfile=()=>{p=M.profile(storage);};
  const visible=()=>M.visibleLexicon(data,p,lang());
  const visibleEntry=id=>visible().find(e=>e.id===id);
  const entryURL=id=>lexicon+"?entry="+encodeURIComponent(id);
  const passageURL=l=>reader+"#"+encodeURIComponent(l.anchor);
  function showEntry(id,updateURL=false){
    window.LibraryReadingView?.hidePreview();
    const e=visibleEntry(id);if(!e)return false;
    openedEntry=id;
    const d=$("#fiction-entry-dialog"),content=$("#fiction-entry-content");
    const heading=node("h2",e.title);heading.id="fiction-entry-heading";
    content.replaceChildren(heading);
    if(e.fullName&&e.fullName!==e.title)content.append(node("p",e.fullName));
    content.append(node("p",e.summary));
    for(const s of e.sections)content.append(node("h3",s.title),node("p",s.text));
    if(e.fragments.length){content.append(node("h3",t("revealed")));for(const f of e.fragments){
      const block=node("section");block.dataset.fragment=f.id;
      if(f.chapter){const label=book.chapters.find(c=>c.id===f.chapter)?.labels[lang()];if(label)block.append(node("h4",label));}
      block.append(node("p",f.text));
      for(const l of f.links){
        const a=link(l.label,passageURL(l));if(isReader)a.addEventListener("click",()=>d.close());block.append(a);
      }
      content.append(block);
    }}
    if(e.relationships.length){
      content.append(node("h3",t("relationships")));
      const list=node("ul");
      for(const r of e.relationships){const target=visibleEntry(r.target);if(!target)continue;const item=node("li");item.append(button(r.label+": "+target.title,()=>showEntry(r.target,updateURL)));list.append(item);}
      content.append(list);
    }
    if(!d.open){returnFocus=document.activeElement;d.showModal();}
    if(updateURL)history.replaceState(null,"",entryURL(id));
    return true;
  }
  function localize(){
    document.querySelectorAll("[data-reading-copy]").forEach(e=>{e.textContent=t(e.dataset.readingCopy);});
    if(isReader){
      $("[data-language]").setAttribute("aria-label",lang()==="de"?"Sprache":"Language");
      window.LibraryReadingView?.localize();
    }
    document.querySelectorAll("[data-reading-placeholder]").forEach(e=>{e.placeholder=t(e.dataset.readingPlaceholder);});
  }
  function lexRender(){
    refreshProfile();localize();
    const entries=visible(),filters=$("#fiction-categories"),result=$("#fiction-results"),progress=$("#fiction-progress");
    const eligible=new Set(entries.flatMap(e=>e.categories));
    if(category&&!eligible.has(category))category="";
    filters.replaceChildren();
    for(const c of [{id:"",labels:{en:words.en.all,de:words.de.all}},...data.categories.filter(c=>eligible.has(c.id))]){
      const b=button(c.labels[lang()],()=>{category=c.id;lexRender();});
      b.setAttribute("aria-pressed",String(category===c.id));filters.append(b);
    }
    const currentProgress=M.completed(p,book);
    progress.replaceChildren(new Option(t("none"),"-1"),...book.chapters.map((c,i)=>new Option(c.labels[lang()],String(i))));
    const selected=book.chapters.findLastIndex(c=>currentProgress.includes(c.id));
    if(M.reached(p,book).length)progress.append(new Option(lang()==="de"?"Nur abgeschlossene Kapitel berücksichtigen":"Use completed chapters only","reset"));
    progress.value=String(selected);
    $("#fiction-order").value=order;
    $("#fiction-full-spoilers").checked=p.fullSpoilers===true;
    const list=M.search(entries,query,category,order,lang());
    result.replaceChildren();
    if(!list.length)result.append(node("p",t("noResults")));
    for(const e of list){
      const card=node("article",undefined,"fiction-lexicon-card"),h=node("h2",e.title);
      card.dataset.entry=e.id;card.append(h,node("p",e.summary),button(e.title,()=>showEntry(e.id,true),"reading-button entry-link"));
      card.lastChild.textContent=lang()==="de"?"Eintrag öffnen":"Open entry";card.lastChild.setAttribute("aria-label",(lang()==="de"?"Eintrag öffnen: ":"Open entry: ")+e.title);
      result.append(card);
    }
    if(openedEntry&&$("#fiction-entry-dialog").open){
      if(!showEntry(openedEntry))$("#fiction-entry-dialog").close();
    }
  }
  function savedPosition(){
    const state=M.read(storage,positionKey,{});
    return state?.books?.[bookKey]?.[lang()]||M.read(storage,"library-reader-position-v1",{})?.books?.[bookKey]||"contents";
  }
  function savePosition(){
    const state=M.read(storage,positionKey,{version:2,books:{}})||{version:2,books:{}};
    state.version=2;state.books||={};state.books[bookKey]||={};state.books[bookKey][lang()]=current;
    M.write(storage,positionKey,state);
  }
  function marks(){return M.read(storage,marksKey,{})?.books?.[bookKey]?.[lang()]||M.read(storage,"library-reader-bookmarks-v2",{})?.books?.[bookKey]?.[lang()]||[];}
  function toggleMark(anchor=current){
    const state=M.read(storage,marksKey,{version:3,books:{}})||{version:3,books:{}};
    state.version=3;state.books||={};state.books[bookKey]||={};
    const items=marks(),i=items.findIndex(x=>x.anchor===anchor);
    state.books[bookKey][lang()]=i>=0?items.filter((_,j)=>j!==i):[...items,{anchor,sectionId:model.sections[model.anchors.get(anchor)?.section]?.id||"contents"}];
    M.write(storage,marksKey,state);renderMarks();
  }
  function renderMarks(){
    const out=$("#reader-marks");out.replaceChildren();
    const items=marks().filter(x=>model.anchors.has(x.anchor));
    if(!items.length)out.append(node("p",t("noBookmarks")));
    for(const m of items){
      const row=node("div",undefined,"reader-mark");
      row.append(button(model.sections[model.anchors.get(m.anchor).section]?.label||t("contents"),()=>go(m.anchor)),button(t("remove"),()=>toggleMark(m.anchor)));out.append(row);
    }
    const b=$("#reader-bookmark"),saved=items.some(x=>x.anchor===current);
    b.textContent=saved?"★ "+t("remove"):"☆ "+t("bookmark");b.setAttribute("aria-pressed",String(saved));
  }
  function applyPrefs(){
    const area=$("#reader-area");for(const [k,v] of Object.entries(prefs))area.dataset[k]=v;
    document.body.dataset.readerTheme=prefs.theme;
    area.style.setProperty("--reader-size",prefs.fontSize);area.style.setProperty("--reader-leading",prefs.lineHeight);
    for(const k of Object.keys(choices))$("#reader-pref-"+k).value=prefs[k];
    $("#reader-layout").value=layout;$("#reader-progress-mode").value=progressMode;
  }
  function updateToc(){
    $("#reader-chapter").replaceChildren(new Option(t("contents"),"contents"),...model.sections.map(s=>new Option(s.label,s.id)));
    $("#reader-chapter").value=section<0?"contents":model.sections[section].id;
    renderMarks();
  }
  function syncControls(){
    $("#reader-position").textContent=section<0?t("contents"):model.sections[section].label+(layout==="continuous"?"":" · "+t("page")+" "+(pageIndex+1)+" / "+pages.length);
    $("#reader-chapter").value=section<0?"contents":model.sections[section].id;
    $("#reader-prev").disabled=section<0;
    $("#reader-next").disabled=section===model.sections.length-1&&(layout==="continuous"||pageIndex+step()>=pages.length);
    renderMarks();
  }
  const spread=()=>layout==="spread"&&window.innerWidth>=980;
  const step=()=>spread()?2:1;
  function paragraph(block,withLinks=true){
    const p=node("p");p.id=block.id;p.dataset.anchor=block.id;
    const refs=withLinks?(context.references[lang()]||[]).filter(r=>(r.paragraphAnchor||r.anchor)===block.id&&visibleEntry(r.entry)):[];
    let text=block.text||"";
    if(!refs.length){p.textContent=text;return p;}
    let ranges=[];
    for(const r of refs){
      let at=-1;for(let i=0;i<r.occurrence;i++){at=text.indexOf(r.text,at+1);if(at<0)break;}
      if(at>=0)ranges.push({at,end:at+r.text.length,r});
    }
    ranges.sort((a,b)=>a.at-b.at);let cursor=0;
    for(const r of ranges){if(r.at<cursor)continue;const b=node("span",text.slice(r.at,r.end),"reader-inline-ref");
      b.setAttribute("role","button");b.tabIndex=0;
      b.addEventListener("click",()=>showEntry(r.r.entry));
      b.addEventListener("keydown",event=>{
        if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();showEntry(r.r.entry);}
      });
      b.dataset.entry=r.r.entry;b.dataset.anchorRef=block.id;
      p.append(document.createTextNode(text.slice(cursor,r.at)),b);cursor=r.end;}
    p.append(document.createTextNode(text.slice(cursor)));return p;
  }
  function blockNode(b,withLinks=true){
    if(b.type==="paragraph"||b.type==="signature")return paragraph(b,withLinks);
    if(b.type==="scene-break"){const hr=node("div","⁂","reader-scene");hr.id=b.id;hr.dataset.anchor=b.id;return hr;}
    if(b.type==="illustration"){
      const img=node("img",undefined,"reader-illustration");img.src=base+model.illustrations.get(b.asset).src;img.alt=b.alt;img.id=b.id;img.dataset.anchor=b.id;return img;
    }
    if(b.type==="link"){const a=link(b.label,b.url);a.id=b.id;a.dataset.anchor=b.id;return a;}
    return node("span");
  }
  function tocContent(){
    const n=node("div",undefined,"reader-contents");
    n.append(node("h2",book.labels[lang()].contents));
    for(const s of model.sections)n.append(button(s.label,()=>go(s.id)));
    return n;
  }
  function pageNode(items,measure=false,withLinks=!measure){
    const n=node("article",undefined,"reader-sheet");
    if(measure)n.classList.add("reader-measure");
    for(const item of items){
      if(item.type==="contents")n.append(tocContent());
      else if(item.type==="title"){const h=node("h2",item.text,"reader-chapter-title");h.dataset.anchor=item.id;n.append(h);}
      else n.append(blockNode(item,withLinks));
    }
    return n;
  }
  function paginate(targetSection=section){
    if(targetSection<0)return [[{type:"contents",id:"contents"}]];
    const s=model.sections[targetSection],illustrations=s.blocks.filter(b=>b.type==="illustration"&&b.placement==="before-title");
    const result=[[{type:"title",id:s.id,text:s.label}],...illustrations.map(b=>[b])];
    if(!illustrations.length&&spread())result.push([]);
    const probe=$("#reader-probe");probe.replaceChildren();const sheet=pageNode([],true);probe.append(sheet);
    let currentPage=[];
    const flush=()=>{if(currentPage.length)result.push(currentPage);currentPage=[];sheet.replaceChildren();};
    for(const b of s.blocks){
      if(illustrations.includes(b))continue;
      if(b.type==="scene-break")flush();
      if(b.type==="illustration"&&b.placement==="full-page"){flush();result.push([b]);continue;}
      const el=blockNode(b,false);sheet.append(el);
      if(sheet.scrollHeight>sheet.clientHeight+1&&currentPage.length){el.remove();flush();sheet.append(el);}
      currentPage.push(b);
    }
    flush();probe.replaceChildren();return result;
  }
  function reachedNow(ids){
    refreshProfile();const before=M.reached(p,book).length;
    M.markAnchors(p,book,M.milestonesThrough(model,ids));
    if(M.reached(p,book).length!==before)writeProfile();
  }
  function refreshInline(){
    if(!model||section<0)return;
    const blocks=new Map(model.sections[section].blocks.filter(b=>b.type==="paragraph").map(b=>[b.id,b]));
    const allowed=new Set(visible().map(e=>e.id));
    const byAnchor=new Map();
    for(const r of context.references[lang()]||[]){
      const a=r.paragraphAnchor||r.anchor;
      if(!byAnchor.has(a))byAnchor.set(a,[]);
      if(allowed.has(r.entry))byAnchor.get(a).push(r.entry);
    }
    for(const el of document.querySelectorAll("#reader-pages p[data-anchor]")){
      const id=el.dataset.anchor,b=blocks.get(id);if(!b||!byAnchor.has(id))continue;
      const current=[...el.querySelectorAll(".reader-inline-ref")].map(x=>x.dataset.entry);
      const desired=byAnchor.get(id);
      if(JSON.stringify(current.sort())!==JSON.stringify(desired.slice().sort()))el.replaceChildren(...paragraph(b).childNodes);
    }
  }
  function completion(confirmed=false){
    const row=$("#reader-completion");row.replaceChildren();
    if(section<0||section>=book.chapters.length)return;
    refreshProfile();
    if(M.completed(p,book).includes(model.sections[section].id)){row.textContent=M.completed(p,book).length===book.chapters.length?t("volumeComplete"):t("finished");return;}
    if(progressMode==="manual")return;
    if(progressMode==="automatic"){if(confirmed){M.through(p,book,section);writeProfile();row.textContent=t("finished");}return;}
    row.append(button(t("finish"),()=>{M.through(p,book,section);writeProfile();completion();}));
  }
  function drawPaged(anchor){
    const found=anchor==="__last__"?pages.length-1:pages.findIndex(items=>items.some(b=>b.id===anchor));
    pageIndex=Math.max(0,found);
    if(spread())pageIndex-=pageIndex%2;
    displayPaged(anchor);
  }
  function displayPaged(preferred){
    const stage=$("#reader-pages"),shown=pages.slice(pageIndex,pageIndex+step());
    observer?.disconnect();stage.className="reader-pages"+(spread()?" reader-spread":"");
    const ids=shown.flat().map(x=>x.id).filter(Boolean);
    reachedNow(ids);
    stage.replaceChildren(...shown.map(items=>pageNode(items)));
    if(spread()&&shown.length===1&&section>=0)stage.append(pageNode([]));
    current=preferred&&ids.includes(preferred)?preferred:ids[0]||model.sections[section]?.id||"contents";
    savePosition();syncControls();
    $("#reader-completion").replaceChildren();
    if(section>=0&&pageIndex+step()>=pages.length)completion();
  }
  function drawContinuous(anchor){
    const stage=$("#reader-pages");observer?.disconnect();stage.className="reader-pages reader-continuous";
    if(section<0){stage.replaceChildren(tocContent());current="contents";savePosition();syncControls();return;}
    const s=model.sections[section],title=node("h2",s.label,"reader-chapter-title");title.dataset.anchor=s.id;title.id=s.id;
    const n=node("article",undefined,"reader-continuous-sheet");n.append(title,...s.blocks.map(b=>blockNode(b)));
    stage.replaceChildren(n);current=anchor;savePosition();syncControls();$("#reader-completion").replaceChildren();
    const end=node("div",undefined,"reader-end-sentinel");n.append(end);
    const observed=[...n.querySelectorAll("[data-anchor]")];
    const epoch=renderEpoch;
    observer=new IntersectionObserver(entries=>{
      if(epoch!==renderEpoch)return;
      const seen=entries.filter(e=>e.isIntersecting).map(e=>e.target.dataset.anchor).filter(Boolean);
      if(seen.length){reachedNow(seen);current=seen[0];savePosition();renderMarks();}
      if(entries.some(e=>e.target===end&&e.isIntersecting))completion(true);
      // Re-evaluate curated links only after their explicit milestone has been reached.
      if(seen.length)refreshInline();
    },{threshold:.55});
    observed.forEach(el=>observer.observe(el));observer.observe(end);
    const target=document.getElementById(anchor);if(target&&anchor!==s.id)requestAnimationFrame(()=>target.scrollIntoView({block:"start"}));
  }
  async function go(anchor,scroll=true,last=false){
    if(!model)return;
    window.LibraryReadingView?.hidePreview();
    window.LibraryPageTurn?.cancel();
    navigating=true;
    const id=M.resolve(model,anchor);
    section=model.anchors.get(id).section;current=id;
    const epoch=++renderEpoch;
    observer?.disconnect();applyPrefs();
    if(scroll)window.scrollTo({top:0,behavior:"instant"});
    await document.fonts.ready;
    if(epoch!==renderEpoch)return;
    const stage=$("#reader-pages");
    const top=stage.getBoundingClientRect().top+window.scrollY;
    const immersive=document.body.classList.contains("reader-immersive");
    $("#reader-area").style.setProperty("--sheet-height",Math.max(420,Math.floor(window.innerHeight-top-(immersive?8:76)))+"px");
    if(layout==="continuous")drawContinuous(id);
    else{
      stage.className="reader-pages"+(spread()?" reader-spread":"");
      pages=paginate();drawPaged(last?"__last__":id);
    }
    navigating=false;updateToc();
  }
  function turn(direction){
    if(!model||navigating||window.LibraryPageTurn?.busy||$("#fiction-entry-dialog").open)return;
    window.LibraryReadingView?.hidePreview();
    if(layout==="continuous"){const i=section+direction;if(i>=-1&&i<model.sections.length)go(i<0?"contents":model.sections[i].id);return;}
    let destinationSection=section,destinationPages=pages,target=pageIndex+direction*step();
    if(target<0||target>=pages.length){
      destinationSection=section+direction;
      if(destinationSection< -1||destinationSection>=model.sections.length)return;
      destinationPages=paginate(destinationSection);
      target=direction<0?destinationPages.length-1:0;
      if(spread())target-=target%2;
    }
    const crossSection=destinationSection!==section;
    const commit=()=>{
      if(crossSection&&direction>0&&section>=0&&pageIndex+step()>=pages.length)completion(true);
      section=destinationSection;pages=destinationPages;pageIndex=target;
      displayPaged();
      if(crossSection)window.scrollTo({top:0,behavior:"instant"});
    };
    const stage=$("#reader-pages");
    const displayed=[...stage.children].filter(n=>n.classList.contains("reader-sheet"));
    const useRight=spread()&&direction>0&&displayed.length>1;
    const source=displayed[useRight?1:0];
    const destinationLeft=destinationPages[target]||[],destinationRight=destinationPages[target+1]||[];
    const underlay=pageNode(useRight?destinationRight:destinationLeft,false,false);
    const reverse=pageNode(spread()&&direction<0?destinationRight:destinationLeft,false,false);
    if(!window.LibraryPageTurn?.start({direction,source,underlay,reverse,commit}))commit();
  }
  function pageSurfaceClick(event){
    if(!model||navigating||layout==="continuous"||event.defaultPrevented||event.button!==0||
       event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||$("#fiction-entry-dialog").open)return;
    if(!(event.target instanceof Element)||event.target.closest("button,a,input,select,textarea,summary,label,dialog,[role=button],[contenteditable=true],.reader-toolbar,.reader-pagination,#reader-completion,.reader-chrome,.reader-top-dock,.reader-bottom-dock,.reader-edge-tab"))return;
    const selection=window.getSelection();
    if(selection&&!selection.isCollapsed&&selection.toString().trim())return;
    const rect=$("#reader-pages").getBoundingClientRect();
    if(event.clientY<rect.top||event.clientY>rect.bottom)return;
    const pages=[...$("#reader-pages").children].filter(n=>n.classList.contains("reader-sheet"));
    if(!pages.length)return;
    const left=pages[0].getBoundingClientRect(),right=pages.at(-1).getBoundingClientRect();
    turn(event.clientX<(left.left+right.right)/2?-1:1);
  }
  async function loadEdition(){
    window.LibraryPageTurn?.cancel();
    window.LibraryReadingView?.hidePreview();
    const prior=model,old=current,l=lang();
    const edition=editionCache[l]||(editionCache[l]=await get(base+book.editions[l]));
    if(l!==lang())return;
    model=M.readerModel(book,edition,afterword);
    localize();updateToc();
    await go(prior?M.resolve(model,old,prior):M.resolve(model,decodeURIComponent(location.hash.slice(1))||savedPosition()));
    if(openedEntry&&$("#fiction-entry-dialog").open&&!showEntry(openedEntry))$("#fiction-entry-dialog").close();
  }
  async function init(){
    try{
      [book,data,afterword,context]=await Promise.all([get(base+"book.json"),get("/fiction/content/telanas/lexicon.json"),get(base+"afterword.json"),get(base+"contextual-lexicon.json")]);
      bookKey=M.identity(book);refreshProfile();
      const d=$("#fiction-entry-dialog");$("#fiction-entry-close").addEventListener("click",()=>d.close());
      d.addEventListener("close",()=>{
        const id=openedEntry;openedEntry=null;$("#fiction-entry-content").replaceChildren();
        if(!isReader)history.replaceState(null,"",lexicon);
        if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
        else if(isReader&&returnFocus?.dataset.entry){
          const el=[...document.querySelectorAll(".reader-inline-ref")].find(n=>n.dataset.entry===returnFocus.dataset.entry&&n.dataset.anchorRef===returnFocus.dataset.anchorRef);
          el?.focus({preventScroll:true});
        }
        else if(!isReader&&id)[...document.querySelectorAll(".fiction-lexicon-card")].find(n=>n.dataset.entry===id)?.querySelector("button")?.focus({preventScroll:true});
        returnFocus=null;
      });
      if(isReader){
        window.LibraryReadingView?.init({
          lookup:id=>{refreshProfile();return visibleEntry(id);},
          translate:t,
          relayout:()=>{if(model)go(current,false);},
          isBusy:()=>navigating||Boolean(window.LibraryPageTurn?.busy)||$("#fiction-entry-dialog").open
        });
        $("#reader-prev").addEventListener("click",()=>turn(-1));$("#reader-next").addEventListener("click",()=>turn(1));
        $("#reader-bookmark").addEventListener("click",()=>toggleMark());
        $("#reader-chapter").addEventListener("change",e=>go(e.target.value));
        $("#reader-layout").addEventListener("change",e=>{layout=e.target.value;try{localStorage.setItem("library-reader-layout",layout);}catch{}go(current,false);});
        $("#reader-progress-mode").addEventListener("change",e=>{progressMode=e.target.value;try{localStorage.setItem("library-reader-progress-mode-v1",progressMode);}catch{}go(current,false);});
        for(const k of Object.keys(choices))$("#reader-pref-"+k).addEventListener("change",e=>{prefs[k]=e.target.value;M.write(storage,prefsKey,prefs);go(current,false);});
        window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>go(current,false),180);});
        window.addEventListener("hashchange",()=>go(decodeURIComponent(location.hash.slice(1))));
        document.addEventListener("click",pageSurfaceClick);
        document.addEventListener("keydown",e=>{
          if(layout==="continuous"||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented||e.target.closest("input,select,textarea,dialog,[contenteditable=true]")||$("#fiction-entry-dialog").open)return;
          if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();turn(e.key==="ArrowLeft"?-1:1);}
        });
        await loadEdition();
      }else{
        const params=new URLSearchParams(location.search);category=params.get("category")||"";
        $("#fiction-search").addEventListener("input",e=>{query=e.target.value;lexRender();});
        $("#fiction-order").addEventListener("change",e=>{order=e.target.value;M.write(storage,"library-lexicon-sort",order);lexRender();});
        $("#fiction-progress").addEventListener("change",e=>{refreshProfile();const v=e.target.value==="reset"?book.chapters.findLastIndex(c=>M.completed(p,book).includes(c.id)):Number(e.target.value);M.through(p,book,v,true);writeProfile();lexRender();});
        $("#fiction-full-spoilers").addEventListener("change",e=>{p.fullSpoilers=e.target.checked;writeProfile();lexRender();});
        lexRender();if(params.get("entry"))showEntry(params.get("entry"),true);
      }
      $("[data-language]").addEventListener("change",()=>isReader?loadEdition():lexRender());
      document.addEventListener("click",e=>{for(const d of document.querySelectorAll(".reader-popover[open],.reader-settings[open]"))if(!d.contains(e.target))d.open=false;});
      window.addEventListener("storage",e=>{if(e.key===M.key){refreshProfile();if(!isReader)lexRender();else {window.LibraryReadingView?.hidePreview();window.LibraryPageTurn?.cancel();refreshInline();if($("#fiction-entry-dialog").open&&openedEntry&&!showEntry(openedEntry))$("#fiction-entry-dialog").close();}}});
      document.body.dataset.readingReady="true";
    }catch(error){console.error(error);$("#reading-error").textContent=t("error");document.body.dataset.readingReady="error";}
  }
  init();
})();

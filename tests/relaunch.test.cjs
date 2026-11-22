"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const crypto=require("node:crypto");
const {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");
const file=p=>fs.readFileSync(path.join(root,p),"utf8");
const pages={"home":file("index.html"),"links":file("links/index.html"),"news":file("news/index.html"),
 "about":file("about/index.html"),"note":file("about/notes/why-i-started-making-things/index.html")};
const notes=JSON.parse(file("about/posts.json"));
const relaunchNote=file("about/notes/site-and-social-relaunch/index.html");
const context={window:{}};
vm.runInNewContext(file("relaunch-copy.js"),context,{filename:"relaunch-copy.js"});
const translations=context.window.K2040_COPY;
vm.runInNewContext(file("relaunch-site-news.js"),context,{filename:"relaunch-site-news.js"});
const manifest=JSON.parse(file("relaunch-destinations.json"));
const keys=obj=>Object.keys(obj).sort();
const lookup=(obj,key)=>key.split(".").reduce((a,k)=>a?.[k],obj);
const digest=p=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,p))).digest("hex");
test("K2040 logo and owner-approved frame stay unchanged",()=>{
 assert.equal(digest("assets/k2040-approved-horizontal-wordmark.avif"),"21c6be8722955f64919535dfce03ed50c5de2afeec0595009397782f0450d0d6");
 assert.equal(digest("assets/k2040-two-quarter-frame.svg"),"586cf43baea755f64ee7e20a4ca29d81c0e7ef84fd06c980e0d5bb0ea6309fb4");
});
test("Five complete static pages have unique h1 and landmarks",()=>{
 for(const [name,html] of Object.entries(pages)){
  assert.equal((html.match(/<h1\b/g)||[]).length,1,name);
  assert.equal((html.match(/<main\b/g)||[]).length,1,name);
  assert.ok(html.includes('href="#main"'),name);
  assert.ok(html.includes('id="main"'),name);
  assert.ok(html.includes('data-page="'+(name==="note"?"about":name)+'"'),name);
  assert.ok(html.includes('class="primary-nav"'),name);
  assert.ok(html.includes('class="mobile-nav"'),name);
  assert.ok(html.includes('aria-expanded="false"'),name);
 }
});
test("New site imports no old UI code, CSS or nested dropdowns",()=>{
 const retired=["styles.css","site.js","home-site.js","navigation.css","responsive.css",
 "home-redesign.css","shared/k2040-chrome.js","brand-2026.css","sci-fi-chrome.css","mobile-navigation.css"];
 for(const [name,html] of Object.entries(pages)){
  for(const old of retired) assert.ok(!html.includes('src="/'+old+'"')&&!html.includes('href="/'+old+'"'),name+": "+old);
  assert.ok(!html.includes("<details")&&!html.includes("global-menu")&&!html.includes("menu-panel"));
  for(const modern of ["relaunch.css","relaunch.js","relaunch-copy.js"])
   assert.ok(html.includes('"/'+modern+'"'),modern);
  assert.ok(!html.includes('"/relaunch-news.js"'),"historic news feed must not load");
  if(name==="home" || name==="news")assert.ok(html.includes('"/relaunch-site-news.js"'));
 }
});
test("Four distinct nav destinations including a real About page",()=>{
 for(const [name,html] of Object.entries(pages)){
  const primary=html.match(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/);
  const mobile=html.match(/<nav id="mobile-site-nav"[\s\S]*?<div class="mobile-nav__inner shell">([\s\S]*?)<\/div>/);
  assert.ok(primary&&mobile,name+" missing navigation");
  for(const content of [primary[1],mobile[1]]){
   assert.equal((content.match(/<a href=/g)||[]).length,4,name+" navigation must have four links");
   for(const href of ["/#projects","/news/","/about/","/links/"])
     assert.ok(content.includes('href="'+href+'"'),name+": "+href);
   assert.ok(!content.includes('href="/#about"'),name);
   if(name==="about"||name==="note")assert.ok(content.includes('href="/about/" aria-current="page"'));
  }
  if(name!=="about") assert.ok(!html.includes('id="about"'),name);
 }
});
test("About is a standalone introduction and notes, not duplicate project cards",()=>{
 const html=pages.about;
 assert.ok(html.includes('class="about-intro"'));
 assert.ok(html.includes('class="notes-section"'));
 assert.ok(html.includes('class="notes-grid"'));
 assert.equal((html.match(/class="note-card"/g)||[]).length,notes.length);
 assert.ok(!html.includes('class="project-card"'));
 assert.ok(!html.includes('class="update-list"'));
 assert.ok(html.includes('href="/news/"'));
});
test("About name uses the approved brand wordmark, not a text greeting",()=>{
 const html=pages.about;
 assert.match(html,/<h1 id="about-title" class="about-intro__wordmark"><img src="\/assets\/k2040-approved-horizontal-wordmark\.avif" alt="K2040" width="856" height="245"><\/h1>/);
 assert.ok(!html.includes('data-copy="about.title"'));
 assert.ok(!html.includes("I'm K2040."));
 assert.equal((html.match(/k2040-approved-horizontal-wordmark\.avif/g)||[]).length,2);
 for(const [language,dictionary] of Object.entries(translations)){
  assert.equal(dictionary.about.title,"K2040",language);
  assert.ok(!dictionary.meta.about.includes("I'm K2040"),language);
  assert.ok(dictionary.meta.about.includes("K2040"),language);
 }
 const css=file("relaunch.css");
 assert.ok(css.includes(".about-intro__wordmark img"));
 assert.ok(css.includes("width: min(100%, 360px)"));
 assert.ok(css.includes("width: min(100%, 280px)"));
});
test("About introduction and first story reflect only owner-provided background",()=>{
 const expectedIntro={
  en:"I'm an independent developer.",
  de:"Ich bin unabhängiger Entwickler.",
  "pt-PT":"Sou um programador independente.",
  es:"Soy desarrollador independiente.",
  fr:"Je suis développeur indépendant."
 };
 for(const [lang,phrase] of Object.entries(expectedIntro)){
  assert.ok(translations[lang].about.intro.startsWith(phrase),lang);
  assert.ok(translations[lang].about.intro.includes("Telanas - the dragon knight"),lang);
 }
 assert.equal(notes.length,2);
 const personal=notes.find(entry=>entry.slug==="why-i-started-making-things");
 assert.ok(personal);
 for(const [lang,entry] of Object.entries(personal.translations)){
  const body=entry.paragraphs.join(" ");
  assert.ok(body.includes("Telanas - the dragon knight"),lang);
  assert.equal(entry.paragraphs.length,5,lang);
  assert.ok(entry.title&&entry.excerpt);
 }
 assert.ok(!pages.about.includes('href="/about/notes/a-place-for-notes/"'));
});
test("Notes are real static permalinks with escaped multilingual text",()=>{
 assert.ok(notes.length>0);
 for(const entry of notes){
  assert.match(entry.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(entry.date,/^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(keys(entry.translations),["de","en","es","fr","pt-PT"]);
  for(const [lang,post] of Object.entries(entry.translations)){
   assert.ok(post.title && post.excerpt && post.paragraphs.length>0);
   const html=entry.slug==="site-and-social-relaunch" ? relaunchNote : pages.note;
   assert.ok(html.includes('data-post-locale="'+lang+'"'));
  }
  assert.ok(pages.about.includes('href="/about/notes/'+entry.slug+'/"'));
  const html=entry.slug==="site-and-social-relaunch" ? relaunchNote : pages.note;
  assert.ok(html.includes('datetime="'+entry.date+'"'));
 }
 assert.ok(pages.note.includes('data-note-title'));
 assert.ok(pages.note.includes('data-note-summary'));
 assert.ok(pages.note.includes('class="note-article__body"'));
 assert.ok(pages.note.includes('href="/about/"'));
 assert.ok(pages.note.includes('href="/news/"'));
 assert.ok(file("relaunch.css").includes('[data-post-locale] { display: none !important; }'));
 assert.ok(file("relaunch.js").includes('localizedPostTitle'));
});
test("Desktop nav and independent mobile nav have no nested submenus",()=>{
 const home=pages.home;
 assert.equal((home.match(/class="primary-nav"/g)||[]).length,1);
 assert.equal((home.match(/class="mobile-nav"/g)||[]).length,1);
 assert.equal((home.match(/data-menu-toggle/g)||[]).length,1);
 assert.ok(file("relaunch.js").includes('event.key==="Escape"'));
 assert.ok(file("relaunch.css").includes("@media (max-width: 820px)"));
});
test("Homepage uses a compact project-first hero without duplicate logo",()=>{
 const html=pages.home;
 for(const value of ['hero__top','hero__copy','hero__topics','hero__topic','project-grid','home-news'])
  assert.ok(html.includes(value),value);
 assert.ok(!html.includes("hero__stage"));
 assert.ok(!html.includes("hero__symbol"));
 assert.ok(!html.includes("hero__frame"));
 assert.equal((html.match(/k2040-approved-horizontal-wordmark\.avif/g)||[]).length,1,
  "approved logo must appear in the site navigation only");
 assert.ok(html.includes('id="projects-heading"'));
 assert.ok(html.includes('aria-labelledby="projects-heading"'));
 assert.equal((html.match(/class="project-card"/g)||[]).length,3);
 assert.equal((html.match(/class="hero__topic"/g)||[]).length,3);
 assert.ok(html.includes('href="/links/"'));
});
test("Game projects section name is consistent across pages and translations",()=>{
 const labels={
  en:"Game projects",
  de:"Spielprojekte",
  "pt-PT":"Projetos de jogos",
  es:"Proyectos de juegos",
  fr:"Projets de jeux"
 };
 for(const [lang,label] of Object.entries(labels)){
  assert.equal(translations[lang].project.gaming,label);
  assert.ok(translations[lang].footer.description.startsWith(label+" · "));
  assert.ok(translations[lang].hero.caption.startsWith(label+" · "));
 }
 for(const [page,html] of Object.entries(pages)){
  assert.ok(html.includes('data-copy="footer.description">Game projects ·'),page);
  if(page==="home"||page==="links")assert.ok(html.includes('data-copy="project.gaming">Game projects'),page);
 }
 assert.equal((pages.home.match(/data-copy="project.gaming">Game projects/g)||[]).length,2);
});
test("Hero project navigation points to existing cards and never to offline sites",()=>{
 const html=pages.home;
 for(const id of ["gaming","fiction","android"]){
  assert.ok(html.includes('href="#project-'+id+'"'),id+" link missing");
  assert.ok(html.includes('id="project-'+id+'"'),id+" target missing");
 }
 assert.ok(!/<a[^>]+href="https:\/\/kamui2040.github.io\/(?:K2040-Android-Releases|K2040-Gaming-Mods|The-Library)/.test(html));
});
test("Approved compact corner geometry and responsive hierarchy",()=>{
 const css=file("relaunch.css");
 assert.ok(css.includes('background: var(--corner) center / contain no-repeat'));
 assert.ok(css.includes('.hero::before, .hero::after'));
 assert.ok(css.includes('transform: rotate(180deg)'));
 assert.ok(css.includes('grid-template-columns: repeat(3,minmax(0,1fr))'));
 assert.ok(css.includes('grid-template-columns: 1fr; margin-inline: 22px'));
 assert.ok(!css.includes('.hero__stage'));
 assert.ok(css.includes("@media (max-width: 600px)"));
 assert.ok(css.includes("overflow-wrap: anywhere"));
});
test("Narrow-screen CSS protects project titles and keeps touch controls usable",()=>{
 const css=file("relaunch.css");
 assert.ok(css.includes("min-width: 0;\n  overflow-wrap: anywhere;"),"project cards may not force horizontal scrolling");
 assert.ok(css.includes(".project-grid, .directory-grid { grid-template-columns: minmax(0,1fr); }"));
 assert.ok(css.includes(".note-card { grid-template-columns: minmax(0,1fr) auto;"));
 assert.ok(css.includes("@media (max-width: 350px)"));
 assert.ok(css.includes("grid-template-columns: minmax(0,1fr);\n    row-gap: 2px;"));
 assert.ok(css.includes(".control { min-height: 44px;"));
 assert.ok(css.includes("hyphens: auto;"));
});
test("Light and dark palettes have independent accessible text tokens",()=>{
 const css=file("relaunch.css");
 assert.ok(css.includes(':root[data-theme="dark"]'));
 assert.ok(css.includes(':root:not([data-theme="light"])'));
 assert.ok(css.includes('--hero-ink: #f1ecfa'));
 assert.ok(css.includes('--hero-ink: #282c54'));
 assert.ok(css.includes(':focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion: reduce'));
});
test("All translated UI keys exist in all five languages",()=>{
 assert.deepEqual(keys(translations),["de","en","es","fr","pt-PT"]);
 const used=new Set(Object.values(pages).flatMap(html=>[...html.matchAll(/data-copy(?:-aria)?="([^"]+)"/g)].map(x=>x[1])));
 for(const [lang,d] of Object.entries(translations)){
  for(const key of used){
   const text=lookup(d,key);
   assert.ok(typeof text==="string"&&text.trim(),lang+" missing "+key);
  }
  for(const name of ["home","news","links","about"]){
   assert.ok(d.meta[name]&&d.meta[name+"Desc"],lang+": meta "+name);
  }
 }
});
test("Theme toggle is uniquely bound to the button, never document root",()=>{
 for(const [name,html] of Object.entries(pages)){
  assert.ok(html.includes('button type="button" class="control theme-btn" data-theme-toggle'),name);
  assert.ok(!html.includes('class="control theme-btn" data-theme '),name);
 }
 const js=file("relaunch.js");
 assert.ok(js.includes('document.querySelector("button[data-theme-toggle]")'));
 assert.ok(!js.includes('document.querySelector("[data-theme]")'));
});
test("Supported languages selectable and persist without old storage dependency",()=>{
 const html=pages.home;
 assert.deepEqual([...html.matchAll(/<option value="([^"]+)"/g)].map(x=>x[1]),["en","de","pt-PT","es","fr"]);
 const js=file("relaunch.js");
 assert.ok(js.includes('safeWrite("k2040-language"'));
 assert.ok(js.includes('safeWrite("k2040-theme"'));
 assert.ok(js.includes("textContent = value"));
 assert.ok(!js.includes("innerHTML"));
});
test("Public links manifest contains only approved hosts",()=>{
 const expected={"github":"github.com","instagram":"www.instagram.com","facebook":"www.facebook.com",
 "threads":"www.threads.com","nexus":"www.nexusmods.com","ko-fi":"ko-fi.com","crypto-donations":"trocador.app","patreon":"www.patreon.com"};
 assert.deepEqual(keys(manifest),keys(expected));
 for(const [label,href] of Object.entries(manifest)){
  const parsed=new URL(href);
  assert.equal(parsed.protocol,"https:");
  assert.equal(parsed.hostname,expected[label]);
  assert.ok(pages.links.includes(href.replaceAll("&","&amp;")));
 }
 const crypto=new URL(manifest["crypto-donations"]);
 assert.equal(crypto.searchParams.get("ticker_to"),"xmr");
 assert.equal(crypto.searchParams.get("network_to"),"Mainnet");
 assert.equal(crypto.searchParams.get("donation"),"True");
 assert.equal(crypto.searchParams.get("direct"),"True");
});
test("Links introduction is compact and Patreon lives among social profiles",()=>{
 const html=pages.links;
 const css=file("relaunch.css");
 assert.ok(html.includes('class="page-intro directory-intro"'));
 assert.ok(html.includes('class="directory-intro__heading"'));
 assert.ok(css.includes(".directory-intro + .directory-group { padding-top: 26px; }"));
 assert.ok(css.includes(".directory-intro { grid-template-columns: 1fr;"));
 const profile=html.split('aria-labelledby="profile-title">')[1].split("</section>")[0];
 const support=html.split('aria-labelledby="support-title">')[1].split("</section>")[0];
 assert.ok(profile.includes("<strong>Patreon</strong>"));
 assert.ok(!support.includes("Patreon"));
 assert.ok(profile.indexOf("Nexus Mods") < profile.indexOf("Patreon"));
 assert.ok(profile.indexOf("Patreon") < profile.indexOf("<strong>X</strong>"));
 assert.ok(profile.includes('href="https://www.patreon.com/cw/k2040"'));
 assert.ok(profile.includes('<strong>Patreon</strong><span>patreon.com/cw/k2040</span>'));
 assert.ok(!profile.includes('class="directory-item directory-item--unavailable"><strong>Patreon'));
 assert.equal((support.match(/class="directory-item directory-item--support"/g)||[]).length,2);
});
test("Unverified platforms and offline project sites are non-clickable",()=>{
 const html=pages.links;
 for(const name of ["Patreon","TikTok",">X<"]){
  assert.ok(html.includes(name),name);
 }
 assert.equal((html.match(/class="directory-item directory-item--unavailable"/g)||[]).length,5);
 assert.ok(html.includes('href="https://www.patreon.com/cw/k2040"'));
 assert.ok(!html.includes('href="https://kamui2040.github.io/K2040-Gaming-Mods/'));
});
test("Relaunch notice is a short, localized blog entry featured first in news",()=>{
 const post=notes.find(entry=>entry.slug==="site-and-social-relaunch");
 assert.ok(post,"missing original relaunch blog entry");
 assert.equal(post.date,"2026-11-22");
 assert.equal(post.featureInNews,true);
 assert.equal(notes[0].slug,post.slug,"newest blog notice should lead About");
 assert.ok(pages.about.indexOf('/about/notes/site-and-social-relaunch/') <
           pages.about.indexOf('/about/notes/why-i-started-making-things/'));
 assert.ok(relaunchNote.includes('data-note-title'));
 assert.ok(relaunchNote.includes('data-note-summary'));
 assert.ok(relaunchNote.includes('datetime="2026-11-22"'));
 assert.ok(relaunchNote.includes('href="/about/"'));
 const siteNews=context.window.K2040_SITE_NEWS;
 assert.equal(siteNews.length,1);
 const entry=siteNews[0];
 assert.equal(entry.id,"site-site-and-social-relaunch");
 assert.equal(entry.pinned,false);
 assert.equal(entry.href,"/about/notes/site-and-social-relaunch/");
 assert.equal(entry.date,post.date);
 for(const [lang,body] of Object.entries(post.translations)){
  assert.equal(body.paragraphs.length,2,lang);
  assert.ok(body.title && body.excerpt);
  assert.equal(entry.strings[lang].title,body.title,lang);
  assert.equal(entry.strings[lang].summary,body.excerpt,lang);
  assert.equal(entry.strings[lang].category,"K2040",lang);
 }
 assert.ok(pages.home.includes('src="/relaunch-site-news.js"'));
 assert.ok(pages.news.includes('src="/relaunch-site-news.js"'));
 assert.ok(!pages.about.includes('src="/relaunch-site-news.js"'));
 assert.ok(!pages.note.includes('src="/relaunch-site-news.js"'));
 const runtime=file("relaunch.js");
 assert.ok(runtime.includes('let updates=[...siteUpdates]'));
 assert.ok(!runtime.includes('...siteUpdates,...library,...android,...gaming'));
 assert.ok(runtime.includes('Date.parse(b.publishedAt || b.date+"T00:00:00Z")'));
 assert.ok(runtime.includes('new URL(value,location.href)'));
});
test("First relaunch teaser is generated without duplicating post copy",()=>{
 const source=file("relaunch-site-news.js");
 assert.ok(source.startsWith("/* Generated from about/posts.json"));
 assert.ok(source.includes("window.K2040_SITE_NEWS"));
 const files=["about/posts.json","relaunch-site-news.js","about/notes/site-and-social-relaunch/index.html"];
 assert.ok(files.every(name=>fs.existsSync(path.join(root,name))));
});
test("Fresh-launch News contains only the new site announcement",()=>{
 const siteNews=context.window.K2040_SITE_NEWS;
 assert.equal(siteNews.length,1);
 assert.equal(siteNews[0].id,"site-site-and-social-relaunch");
 assert.equal(siteNews[0].href,"/about/notes/site-and-social-relaunch/");
 assert.ok(!fs.existsSync(path.join(root,"relaunch-news.js")),"obsolete Library feed must be removed");
 assert.equal(context.window.K2040_NEWS,undefined);
 const runtime=file("relaunch.js");
 for(const obsolete of ["window.K2040_NEWS","importFeed","loadFeeds","K2040_CONTENT","K2040_GAMING_UPDATES",
   "/K2040-Android-Releases/updates/latest.js","/K2040-Gaming-Mods/updates/2026.js"])
    assert.ok(!runtime.includes(obsolete),"unexpected historic news reference: "+obsolete);
 assert.ok(runtime.includes('const relaunchFeedSources = Object.freeze([]);'),"new feeds must start disconnected");
 assert.ok(runtime.includes('const newFeedItems = async source =>'),"future relaunch feed importer must remain");
 assert.ok(runtime.includes('const loadRelaunchFeeds = async () =>'),"automatic reload needed after subsite relaunch");
 for(const [name,html] of Object.entries(pages))assert.ok(!html.includes('"/relaunch-news.js"'),name);
});
test("Future relaunch-only feeds reject legacy, mismatched and unpublished entries", async()=>{
 const js=file("relaunch.js");
 const start=js.indexOf("  const newFeedItems = async source => {");
 const end=js.indexOf("  const loadRelaunchFeeds = async () => {",start);
 assert.ok(start>0 && end>start);
 const source={
  path:"/K2040-Gaming-Mods/updates/relaunch.json",
  project:"game-projects",launchId:"relaunch-2026"
 };
 const good={id:"new",date:"2026-11-22",publishedAt:"2026-11-22T17:00:00+01:00",
  relaunch:true,launchId:source.launchId,projectId:source.project,
  strings:{en:{title:"A new public post"}}};
 const historical={...good,id:"legacy",relaunch:false};
 const wrongLaunch={...good,id:"wrong-launch",launchId:"old-version"};
 const future={...good,id:"scheduled",date:"2999-01-01",publishedAt:"2999-01-01T12:00:00Z"};
 let calls=0;
 let payload={
  schema:"k2040-relaunch-v1",project:source.project,launchId:source.launchId,
  entries:[good,historical,wrongLaunch,future]
 };
 const scope={
  fetch:async (path,opts)=>{
   calls++;
   assert.equal(path,source.path);
   assert.equal(opts.mode,"same-origin");
   assert.equal(opts.credentials,"omit");
   return {ok:true,json:async()=>payload};
  },
  validDate:date=>/^\d{4}-\d{2}-\d{2}$/.test(date),
  Date,
 };
 const importer=vm.runInNewContext(js.slice(start,end)+"\nnewFeedItems;",scope);
 const accepted=await importer(source);
 assert.equal(accepted.length,1);
 assert.equal(accepted[0].id,"new");
 assert.equal(calls,1);
 assert.equal((await importer({...source,path:"/K2040-Gaming-Mods/updates/2026.js"})).length,0);
 assert.equal(calls,1,"legacy endpoints should not even be fetched");
 payload={...payload,schema:"legacy"};
 assert.equal((await importer(source)).length,0);
 payload={...payload,schema:"k2040-relaunch-v1",launchId:"old-version"};
 assert.equal((await importer(source)).length,0);
});
test("News dates sorted and unsafe links filtered in UI logic",()=>{
 const js=file("relaunch.js");
 assert.ok(js.includes('Date.parse(b.publishedAt || b.date+"T00:00:00Z")'));
 assert.ok(js.includes('new URL(value,location.href)'));
 assert.ok(!js.includes("new Function"));
 assert.ok(!js.includes('script.onload=()=>finish(true)'));
 assert.ok(!js.includes('script.onerror=()=>finish(false)'));
 assert.ok(js.includes('["https:","http:"]'));
 assert.ok(js.includes('K2040-Gaming-Mods|K2040-Android-Releases|The-Library'));
});
test("Static builder is reproducible",()=>{
 const files=["index.html","news/index.html","links/index.html","about/index.html",
  "about/notes/why-i-started-making-things/index.html",
  "about/notes/site-and-social-relaunch/index.html","relaunch-site-news.js"];
 const before=files.map(digest);
 const out=spawnSync("python3",["tools/build_site.py"],{cwd:root,encoding:"utf8"});
 assert.equal(out.status,0,out.stderr);
 assert.deepEqual(files.map(digest),before);
});

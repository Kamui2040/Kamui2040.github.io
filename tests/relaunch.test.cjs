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
 for(const value of ['hero__top','hero__copy','project-grid','home-news'])
  assert.ok(html.includes(value),value);
 assert.ok(!html.includes("hero__stage"));
 assert.ok(!html.includes("hero__symbol"));
 assert.ok(!html.includes("hero__frame"));
 assert.equal((html.match(/k2040-approved-horizontal-wordmark\.avif/g)||[]).length,1,
  "approved logo must appear in the site navigation only");
 assert.ok(html.includes('id="projects-heading"'));
 assert.ok(html.includes('aria-labelledby="projects-heading"'));
 assert.equal((html.match(/class="project-card"/g)||[]).length,3);
 assert.ok(!html.includes("hero__topic"));
 assert.ok(!html.includes("project-card__number"));
 assert.ok(!html.includes("small-label"));
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
 assert.equal((pages.home.match(/data-copy="project.gaming">Game projects/g)||[]).length,1);
});
test("Project selection uses full-card links with fiction non-clickable",()=>{
 const html=pages.home;
 for(const id of ["gaming","android"]){
  assert.ok(html.includes('<a class="project-card" id="project-'+id+'" href="/'+id+'/"'),id);
  assert.ok(html.includes('aria-labelledby="project-'+id+'-heading"'),id);
 }
 assert.ok(html.includes('<article class="project-card" id="project-fiction">'));
 assert.ok(html.includes('data-copy="project.offline">Coming soon'));
 assert.ok(html.includes('data-copy="project.title">Projects'));
 assert.ok(!html.includes('hero__topics'));
});
test("Approved compact corner geometry and responsive hierarchy",()=>{
 const css=file("relaunch.css");
 assert.ok(css.includes('background: var(--corner) center / contain no-repeat'));
 assert.ok(css.includes('.hero::before, .hero::after'));
 assert.ok(css.includes('transform: rotate(180deg)'));
 assert.ok(css.includes('grid-template-columns: repeat(3, minmax(0, 1fr))'));
 assert.ok(!css.includes('.hero__topic'));
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
  for(const name of ["home","news","links","about","gaming","gamingMods","gamingNews","android","androidApps","androidNews"]){
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
 assert.equal((html.match(/class="directory-item directory-item--unavailable"/g)||[]).length,3);
 assert.ok(html.includes('class="directory-item" href="/gaming/"'));
 assert.ok(html.includes('href="https://www.patreon.com/cw/k2040"'));
 assert.ok(!html.includes('href="https://kamui2040.github.io/K2040-Gaming-Mods/'));
});
test("Relaunch notice is a short, localized blog entry included in news",()=>{
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
 assert.equal(siteNews.length,1+JSON.parse(file("gaming/posts.json")).length+JSON.parse(file("android/posts.json")).length);
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
 assert.ok(runtime.includes('siteUpdates.filter(item=>item.projectId==="game-projects")'));
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
test("News contains only the site announcement and authored current project posts",()=>{
 const siteNews=context.window.K2040_SITE_NEWS;
 assert.equal(siteNews.length,1+JSON.parse(file("gaming/posts.json")).length+JSON.parse(file("android/posts.json")).length);
 assert.equal(siteNews[0].id,"site-site-and-social-relaunch");
 assert.equal(siteNews[0].href,"/about/notes/site-and-social-relaunch/");
 assert.ok(!fs.existsSync(path.join(root,"relaunch-news.js")),"obsolete Library feed must be removed");
 assert.equal(context.window.K2040_NEWS,undefined);
 const runtime=file("relaunch.js");
 for(const obsolete of ["window.K2040_NEWS","importFeed","loadFeeds","K2040_CONTENT","K2040_GAMING_UPDATES",
   "/K2040-Android-Releases/updates/latest.js","/K2040-Gaming-Mods/updates/2026.js"])
    assert.ok(!runtime.includes(obsolete),"unexpected historic news reference: "+obsolete);
 assert.ok(runtime.includes('siteUpdates.filter(item=>item.projectId==="game-projects")'));
 assert.ok(!runtime.includes("newFeedItems"),"single generated feed replaces external importers");
 for(const [name,html] of Object.entries(pages))assert.ok(!html.includes('"/relaunch-news.js"'),name);
});
test("New gaming announcements enter the shared news index exactly once",()=>{
 const catalog=JSON.parse(file("gaming/catalog.json"));
 const posts=JSON.parse(file("gaming/posts.json"));
 const entries=context.window.K2040_SITE_NEWS.filter(x=>x.projectId==="game-projects");
 assert.equal(entries.length,posts.length);
 assert.equal(new Set(entries.map(x=>x.id)).size,entries.length);
 for(const p of posts){
   const entry=entries.find(x=>x.id==="gaming-"+p.slug);
   assert.ok(entry);
   assert.ok(catalog.mods.some(m=>m.slug===p.mod));
   assert.equal(entry.href,"/gaming/news/"+p.slug+"/");
   assert.ok(fs.existsSync(path.join(root,entry.href,"index.html")));
   for(const lang of Object.keys(translations)){
     assert.equal(entry.strings[lang].title,p.translations[lang].title);
     assert.equal(entry.strings[lang].summary,p.translations[lang].excerpt);
   }
 }
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
  "about/notes/site-and-social-relaunch/index.html","relaunch-site-news.js",...["gaming/index.html","gaming/mods/index.html","gaming/news/index.html"],...JSON.parse(file("gaming/catalog.json")).mods.map(m=>"gaming/mods/"+m.slug+"/index.html"),...JSON.parse(file("gaming/posts.json")).map(p=>"gaming/news/"+p.slug+"/index.html"),"android/index.html","android/apps/index.html","android/news/index.html",...JSON.parse(file("android/catalog.json")).apps.map(a=>"android/apps/"+a.slug+"/index.html")];
 const before=files.map(digest);
 const out=spawnSync("python3",["tools/build_site.py"],{cwd:root,encoding:"utf8"});
 assert.equal(out.status,0,out.stderr);
 assert.deepEqual(files.map(digest),before);
});

test("Standalone and replacer have distinct official destinations and reciprocal links",()=>{
 const mods=JSON.parse(file("gaming/catalog.json")).mods;
 const a=mods.find(m=>m.slug==="pinup-magazines"),b=mods.find(m=>m.slug==="pinup-magazines-standalone");
 assert.equal(a.nexus,"https://www.nexusmods.com/fallout4/mods/111814");
 assert.equal(b.nexus,"https://www.nexusmods.com/fallout4/mods/111851");
 for(const [m,other] of [[a,b],[b,a]]){
  const html=file("gaming/mods/"+m.slug+"/index.html");
  assert.ok(html.includes('href="'+m.nexus+'"'));
  assert.ok(html.includes('href="/gaming/mods/'+other.slug+'/"'));
 }
});

test("All restored Nexus catalogue entries have unique destinations, localized descriptions and promotional art",()=>{
 const catalog=JSON.parse(file("gaming/catalog.json"));
 const mods=catalog.mods;
 assert.equal(new Set(mods.map(m=>m.nexus)).size,mods.length);
 const index=file("gaming/mods/index.html");
 for(const m of mods){
  assert.deepEqual(Object.keys(m.description).sort(),Object.keys(translations).sort());
  const detail=file("gaming/mods/"+m.slug+"/index.html");
  assert.ok(index.includes('href="/gaming/mods/'+m.slug+'/"'));
  assert.ok(detail.includes('href="'+m.nexus+'"'));
  if(m.promo){
   assert.ok(fs.existsSync(path.join(root,m.promo.src)));
   assert.ok(index.includes(m.promo.src));
   assert.ok(detail.includes(m.promo.src));
   assert.equal(detail.includes('id="gallery-heading"'),m.images.length>0||!!m.feature_post);
   assert.ok(Object.keys(m.overview).length===5);
  }
 }
 for(const id of [109575,105464,105461,105775,110911,905,906,31,111814,111851])
  assert.ok(mods.some(m=>m.nexus.endsWith("/"+id)),String(id));
});

test("Standalone release uses distinct approved header and all three gallery compositions",()=>{
 const catalog=JSON.parse(file("gaming/catalog.json"));
 const mod=catalog.mods.find(m=>m.slug==="pinup-magazines-standalone");
 const post=JSON.parse(file("gaming/posts.json")).find(p=>p.slug===mod.slug);
 assert.equal(mod.promo.src,"/assets/gaming/pinup-standalone-promo.webp");
 assert.deepEqual(post.artwork.map(a=>a.src),["pulp-adventures","retro-life-and-science","life-in-the-wasteland"].map(n=>"/assets/gaming/pinup-standalone-"+n+".webp"));
 for(const page of ["gaming/mods/"+mod.slug+"/index.html","gaming/news/"+mod.slug+"/index.html"]){
  const detail=file(page);
  assert.equal((detail.match(/class="gallery-item"/g)||[]).length,3);
  assert.ok(!detail.includes("promo-framed"));
  assert.ok(!detail.includes("pinup-standalone-preview-"));
 }
 assert.ok(file("gaming/mods/index.html").includes(mod.promo.src));
 assert.ok(file("gaming/mods/"+mod.slug+"/index.html").includes(mod.promo.src));
});
test("Historical captures and release history stay on detail pages, not current news",()=>{
 const mods=JSON.parse(file("gaming/catalog.json")).mods;
 for(const m of mods){
  const detail=file("gaming/mods/"+m.slug+"/index.html");
  if(m.images.length){
   assert.ok(detail.includes("capture-image"));
   for(const pic of m.images)assert.ok(fs.existsSync(path.join(root,pic.src)));
  }
  if(m.changelog){
   assert.ok(detail.includes("mod-changelog"));
   assert.equal((detail.match(/<li><strong>/g)||[]).length,m.changelog.length);
  }
 }
});

test("Both magazine editions retain their published release history in newest-first order",()=>{
 const mods=JSON.parse(file("gaming/catalog.json")).mods;
 const a=mods.find(m=>m.slug==="pinup-magazines");
 const b=mods.find(m=>m.slug==="pinup-magazines-standalone");
 assert.deepEqual(a.changelog.map(r=>r.version),["1.0"]);
 assert.deepEqual(b.changelog.map(r=>r.version),["1.1","1.0"]);
 assert.ok(a.changelog[0].text.includes("130 new pin-up magazine covers"));
 assert.ok(b.changelog[0].text.includes("Vortex XML error"));
 for(const m of [a,b]){
  const html=file("gaming/mods/"+m.slug+"/index.html");
  assert.ok(html.includes("mod-changelog"));
  for(const r of m.changelog)assert.ok(html.includes("<strong>"+r.version+"</strong>"));
 }
});

test("Quick Attach Menu and Quest Journal follow the verified Nexus release histories",()=>{
 const mods=JSON.parse(file("gaming/catalog.json")).mods;
 const qam=mods.find(m=>m.slug==="quick-attach-menu");
 const journal=mods.find(m=>m.slug==="quest-journal");
 assert.deepEqual(qam.changelog.map(e=>e.version),["0.5.222","0.5.220","0.5.219","0.5.216","0.5.213","0.5.199","0.5.198","0.5.197","0.5.192","0.5.181","0.5.180"]);
 assert.ok(qam.changelog[0].text.includes("Hunting Rifle"));
 assert.ok(qam.changelog[4].text.includes("controller navigation"));
 assert.deepEqual(journal.changelog.map(e=>e.version),["0.0.2"]);
 for(const m of [qam,journal]){
  const html=file("gaming/mods/"+m.slug+"/index.html");
  let last=html.indexOf("mod-changelog");
  assert.ok(last>=0);
  for(const e of m.changelog){
   const pos=html.indexOf("<strong>"+e.version+"</strong>",last);
   assert.ok(pos>last);
   last=pos;
  }
 }
});

test("Latest confirmed release is featured automatically before the game directory",()=>{
 const mods=JSON.parse(file("gaming/catalog.json")).mods;
 const posts=JSON.parse(file("gaming/posts.json"));
 const releases=mods.filter(m=>m.feature_post).map(m=>({mod:m,post:posts.find(p=>p.slug===m.feature_post)}))
  .sort((a,b)=>b.post.date.localeCompare(a.post.date)||b.post.slug.localeCompare(a.post.slug));
 const {mod,post}=releases[0];
 const home=file("gaming/index.html"),index=file("gaming/mods/index.html");
 const start=home.indexOf("class=\"gaming-section latest-release\"");
 assert.ok(start>=0 && start<home.indexOf("class=\"game-tiles\""));
 const feature=home.slice(start,home.indexOf("</section>",start));
 assert.ok(feature.includes(mod.promo?.src||post.artwork[0].src));
 assert.ok(feature.includes("href=\"/gaming/mods/"+mod.slug+"/\""));
 assert.ok(feature.includes("href=\""+mod.nexus+"\""));
 assert.ok(feature.includes("datetime=\""+post.date+"\""));
 assert.equal((index.match(/class="mod-release-label"/g)||[]).length,1);
 assert.ok(index.indexOf("href=\"/gaming/mods/"+mod.slug+"/\"")<index.indexOf("href=\"/gaming/mods/pinup-magazines/\"")||mod.slug==="pinup-magazines");
 for(const l of Object.keys(translations))assert.ok(translations[l].gaming.latestRelease);
});

test("Android catalogue exposes three released apps, verified channel links and historical media",()=>{
 const apps=JSON.parse(file("android/catalog.json")).apps;
 assert.deepEqual(apps.map(a=>a.slug),["vectorint","geojoystick","esca-agnellis"]);
 assert.deepEqual(apps[0].stores.slice(0,2).map(s=>s.version),["0.0.8","0.0.11"]);
 for(const a of apps){
  const html=file("android/apps/"+a.slug+"/index.html");
  assert.ok(file("android/apps/index.html").includes("/android/apps/"+a.slug+"/"));
  assert.ok(html.includes('href="'+a.privacy+'"'));
  for(const s of a.stores)assert.ok(html.includes('href="'+s.url.replaceAll("&","&amp;")+'"'));
  for(const m of [a.promo,...a.images])assert.ok(fs.existsSync(path.join(root,m.src))&&html.includes(m.src));
  assert.ok(html.includes(a.capture));
  for(const lang of Object.keys(translations))assert.ok(a.description[lang]&&a.overview[lang]&&translations[lang].android);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,3);
 }
 assert.ok(pages.home.includes('href="/android/"'));
 assert.ok(pages.links.includes('class="directory-item" href="/android/"'));
 assert.ok(file("android/index.html").includes('class="gaming-section latest-release"'));
 assert.ok(file("android/index.html").includes('data-copy="android.featured"'));
 assert.equal(JSON.parse(file("android/posts.json")).length,0);
});

test("Runtime page metadata is valid across every generated page and locale, including missing metadata keys",()=>{
 function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!e.name.startsWith(".")?walk(path.join(dir,e.name)):e.isFile()&&e.name==="index.html"?[path.join(dir,e.name)]:[]);
 }
 const decode=s=>s.replaceAll("&amp;","&").replaceAll("&#x27;","'").replaceAll("&quot;",'"').replaceAll("&lt;","<").replaceAll("&gt;",">");
 const js=file("relaunch.js");
 for(const p of walk(root)){
  const html=fs.readFileSync(p,"utf8");
  const page=html.match(/data-page="([^"]+)"/)[1];
  const title=decode(html.match(/<title>([^<]+)<\/title>/)[1]);
  const description=decode(html.match(/<meta name="description" content="([^"]+)"/)[1]);
  for(const lang of Object.keys(translations)){
   const desc={content:description};
   const noop=()=>{};
   const rootNode={dataset:{}};
   const localizedNode=key=>{
    const match=html.match(new RegExp('<(?:h1|p)[^>]*'+key+'[^>]*>(.*?)</(?:h1|p)>','s'));
    const value=match?.[1].match(new RegExp('data-post-locale="'+lang+'">([^<]+)'));
    return value?{querySelector:()=>({textContent:decode(value[1])})}:null;
   };
   const document={documentElement:rootNode,body:{dataset:{page}},title,
    querySelector:sel=>sel==='meta[name="description"]'?desc:sel==='[data-note-title]'?localizedNode('data-note-title'):sel.startsWith('[data-note-summary]')?localizedNode('data-note-summary'):null,
    querySelectorAll:()=>[],addEventListener:noop};
   const window={K2040_COPY:translations,addEventListener:noop};
   vm.runInNewContext(js,{document,window,localStorage:{getItem:key=>key==="k2040-language"?lang:null},navigator:{languages:[lang]},matchMedia:()=>({matches:false,addEventListener:noop})});
   assert.ok(document.title.trim()&&!["undefined","null"].includes(document.title),p+" "+lang);
   assert.ok(desc.content.trim()&&!["undefined","null"].includes(desc.content),p+" "+lang);
   if(["gamingMod","androidApp"].includes(page))assert.equal(document.title,title,p);
  }
 }
});

test("APKPure listings match each released Android app package",()=>{
 const apps=JSON.parse(file("android/catalog.json")).apps;
 for(const a of apps){
  const links=a.stores.filter(s=>s.name==="APKPure");
  assert.equal(links.length,1,a.slug);
  const expected="https://apkpure.com/"+a.slug+"/"+a.package;
  assert.equal(links[0].url,expected);
  assert.equal(links[0].version,undefined);
  assert.ok(file("android/apps/"+a.slug+"/index.html").includes('href="'+expected+'"'));
 }
});

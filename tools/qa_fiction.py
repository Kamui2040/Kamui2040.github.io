#!/usr/bin/env python3
"""Local Firefox interaction and exhaustive released chapter pagination tests."""
import pathlib,sys,os,json,socket,subprocess,tempfile,time
root=pathlib.Path(__file__).resolve().parent.parent;driver=root/'tools/qa_browser.py'
if len(sys.argv)!=2: raise SystemExit("Usage: python3 tools/qa_fiction.py <temporary-output-directory>")
sys.argv=[str(driver),sys.argv[1]]
ns={'__file__':str(driver)}
exec(compile(driver.read_text().split('server=http.server.ThreadingHTTPServer',1)[0],str(driver),'exec'),ns)
server=ns["http"].server.ThreadingHTTPServer(("127.0.0.1",0),ns["Handler"])
ns["threading"].Thread(target=server.serve_forever,daemon=True).start()
origin="http://127.0.0.1:"+str(server.server_address[1]);reader=origin+'/fiction/telanas/dragon-knight/volume-01/read/';lex=origin+'/fiction/telanas/lexicon/'
checks=[]
with tempfile.TemporaryDirectory(prefix='k2040-reading-qa-') as profile:
 port=ns['free_port']();pathlib.Path(profile,'user.js').write_text(f'user_pref("marionette.port",{port});\n')
 proc=subprocess.Popen(['firefox','--headless','--no-remote','--marionette','--profile',profile,'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 sock=None
 try:
  for _ in range(150):
   try:sock=socket.create_connection(('127.0.0.1',port),.18);sock.settimeout(30);break
   except OSError:time.sleep(.12)
  assert sock;ns['recvmsg'](sock)
  b=ns['Browser'](sock);b.call('WebDriver:NewSession',{'capabilities':{'alwaysMatch':{'browserName':'firefox'}}})
  def wait(script,limit=15):
   until=time.monotonic()+limit
   while time.monotonic()<until:
    r=b.js(script)
    if r:return r
    time.sleep(.08)
   raise AssertionError(script)
  def ok(name,flag):
   assert flag,name;checks.append(name);print('PASS',name,flush=True)
  def choose(id,val):
   b.js('const e=document.getElementById('+json.dumps(id)+');e.value='+json.dumps(val)+';e.dispatchEvent(new Event("change",{bubbles:true}));return true;')
   time.sleep(.2)
  def go(url):
   b.open(url);wait('return document.body.dataset.readingReady==="true"')
  b.size(1440,950);go(reader)
  ok('contents and eleven sections',b.js('return document.querySelectorAll("#reader-chapter option").length===12&&document.querySelector(".reader-contents")!==null'))
  choose('reader-chapter','dk-v01-prologue')
  wait('return document.querySelector(".reader-illustration")?.complete&&document.querySelector(".reader-illustration")?.naturalWidth>0')
  ok('title and illustration facing spread',b.js('return document.querySelectorAll("#reader-pages .reader-sheet").length===2&&!!document.querySelector(".reader-sheet:first-child h2")&&!!document.querySelector(".reader-sheet:nth-child(2) img")'))
  b.screenshot('reader-spread-opening.png')
  b.js('document.getElementById("reader-next").click();return true;')
  ok('physical turn starts with two paper faces',b.js('return LibraryPageTurn.busy&&!!document.querySelector(".reader-page-turn-front")&&!!document.querySelector(".reader-page-turn-back")'))
  ok('physical turn retains original reading position',b.js('return document.getElementById("reader-position").textContent.includes("1 /")'))
  wait('return !LibraryPageTurn.busy&&document.querySelector("#reader-pages p[data-anchor]")!==null')
  ok('physical turn commits and cleans its layer',b.js('return !document.querySelector(".reader-page-turn-layer")&&document.getElementById("reader-position").textContent.includes("3 /")'))
  ok('page turn shows prose',b.js('return [...document.querySelectorAll("#reader-pages .reader-sheet")].every(p=>p.scrollHeight<=p.clientHeight+2)'))
  def edge_click(direction, adjacent=False):
   b.js("const direction="+str(direction)+",adjacent="+json.dumps(adjacent)+";"+"""
     const r=document.querySelector("#reader-pages").getBoundingClientRect();
     const x=direction<0?r.left+(adjacent?-8:8):r.right+(adjacent?8:-8);
     const y=r.top+r.height*.55;
     const target=document.elementFromPoint(x,y);
     if(!target)throw Error("Missing page navigation target");
     target.dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:x,clientY:y,button:0}));
     return true;
   """)
  edge_click(-1,True)
  ok('left adjacent space starts backward turn',b.js('return LibraryPageTurn.busy&&document.querySelector(".reader-page-turn-layer").dataset.turnSide==="left"'))
  wait('return !LibraryPageTurn.busy')
  ok('left adjacent space returns one spread',b.js('return document.getElementById("reader-position").textContent.includes("1 /")'))
  edge_click(1)
  ok('right page edge starts forward turn',b.js('return LibraryPageTurn.busy&&document.querySelector(".reader-page-turn-layer").dataset.turnSide==="right"'))
  wait('return !LibraryPageTurn.busy')
  ok('right page edge advances one spread',b.js('return document.getElementById("reader-position").textContent.includes("3 /")'))
  b.js('document.getElementById("reader-bookmark").click();return true;')
  ok('bookmark saved',b.js('return document.querySelectorAll(".reader-mark").length===1'))
  saved=b.js('return JSON.parse(localStorage.getItem("library-reader-position-v2")).books["telanas/dragon-knight/volume-01"].en')
  go(reader)
  ok('reading position restored',b.js('return JSON.parse(localStorage.getItem("library-reader-position-v2")).books["telanas/dragon-knight/volume-01"].en')==saved)
  choose('reader-layout','continuous')
  wait('return !!document.querySelector(".reader-continuous-sheet")')
  ok('continuous chapter and all 131 blocks',b.js('return document.querySelectorAll(".reader-continuous-sheet [data-anchor]").length===132'))
  choose('reader-layout','single')
  wait('return !!document.querySelector("#reader-pages .reader-sheet")')
  ok('single page layout',b.js('return document.querySelectorAll("#reader-pages .reader-sheet").length===1'))
  choose('reader-pref-theme','parchment')
  ok('parchment selection',b.js('return document.getElementById("reader-area").dataset.theme==="parchment"'))
  choose('reader-pref-fontSize','1.2')
  choose('reader-pref-lineHeight','2')
  ok('typography settings',b.js('return document.getElementById("reader-area").dataset.fontSize==="1.2"&&document.getElementById("reader-area").dataset.lineHeight==="2"'))
  b.js('const s=document.querySelector("[data-language]");s.value="de";s.dispatchEvent(new Event("change",{bubbles:true}));return true;')
  wait('return document.documentElement.lang==="de"&&document.getElementById("reader-position").textContent.includes("Prolog")')
  ok('German localized reader',True)
  b.size(500,850);time.sleep(.5)
  ok('mobile reader no horizontal overflow',b.js('return document.documentElement.scrollWidth<=innerWidth+2'))
  b.screenshot('reader-mobile.png')
  b.js('localStorage.removeItem("library-spoiler-profile-v3");return true;')
  go(lex)
  safe=b.js('return document.querySelectorAll(".fiction-lexicon-card").length')
  ok('default spoilers hidden',0<safe<66)
  ok('categories derive from eligible data',b.js('return document.querySelectorAll("#fiction-categories button").length<13'))
  b.js('document.getElementById("fiction-full-spoilers").click();return true;')
  ok('explicit full spoilers reveals 66 entries',b.js('return document.querySelectorAll(".fiction-lexicon-card").length')==66)
  b.js('document.querySelector(".entry-link").click();return true;')
  ok('Lexicon detail dialog',b.js('return document.getElementById("fiction-entry-dialog").open&&!!document.querySelector("#fiction-entry-content h2")'))
  b.js('document.getElementById("fiction-entry-close").click();document.getElementById("fiction-full-spoilers").click();return true;')
  ok('spoilers rehidden',b.js('return document.querySelectorAll(".fiction-lexicon-card").length')==safe)
  b.js('const s=document.getElementById("fiction-search");s.value="zzzz-no-match-zzzz";s.dispatchEvent(new Event("input",{bubbles:true}));return true;')
  ok('search filters',b.js('return document.querySelectorAll(".fiction-lexicon-card").length')==0)
  b.js('const s=document.getElementById("fiction-search");s.value="";s.dispatchEvent(new Event("input",{bubbles:true}));return true;')
  choose('fiction-progress','9')
  ok('manual chapter progress reveals more',b.js('return document.querySelectorAll(".fiction-lexicon-card").length')>safe)
  ok('Lexicon mobile no horizontal overflow',b.js('return document.documentElement.scrollWidth<=innerWidth+2'))
  b.size(1440,950);b.screenshot('lexicon-desktop.png')
  print('PASS browser smoke:',len(checks),'checks',flush=True)
  # Check the full released text and every illustration appears exactly once in chapter pagination.
  b.size(1440,950);go(reader)
  prefix=root/"fiction/content/telanas/dragon-knight/volume-01"
  manifest=json.loads((prefix/"book.json").read_text())
  pages_checked=0;blocks_checked=0
  for lang in ("en","de"):
   b.js('const s=document.querySelector("[data-language]");s.value='+json.dumps(lang)+';s.dispatchEvent(new Event("change",{bubbles:true}));return true;')
   time.sleep(.3)
   choose("reader-layout","spread");choose("reader-pref-fontSize","1");choose("reader-pref-lineHeight","1.75");choose("reader-progress-mode","manual")
   edition=json.loads((prefix/"editions"/(lang+".json")).read_text())
   for chapter in edition["chapters"]:
    choose("reader-chapter",chapter["id"])
    wait('return document.querySelector("#reader-pages [data-anchor]")?.dataset.anchor==='+json.dumps(chapter["id"]))
    out=b.call("WebDriver:ExecuteAsyncScript",{"script":r"""
      const chapter=arguments[0],done=arguments[arguments.length-1];
      let ids=[],over=[],count=0;
      function check(){
       const sheets=[...document.querySelectorAll("#reader-pages .reader-sheet")];
       for(const p of sheets){
        if(p.scrollHeight>p.clientHeight+2)over.push({height:p.clientHeight,scroll:p.scrollHeight,anchor:p.querySelector("[data-anchor]")?.dataset.anchor});
        ids.push(...[...p.querySelectorAll("[data-anchor]")].map(x=>x.dataset.anchor));
       }
       count+=sheets.length;
       const pos=document.querySelector("#reader-position").textContent.match(/(\d+) \/ (\d+)$/);
       if(!pos||Number(pos[1])+sheets.length>Number(pos[2])){done({ids,over,count});return;}
       document.querySelector("#reader-next").click();
       // Exercise the real turn commit for every page, without spending a
       // second on each of the hundreds of already-tested animations.
       const layer=document.querySelector(".reader-page-turn-layer");
       if(layer)layer.getAnimations({subtree:true}).forEach(a=>a.finish());
       function afterTurn(){if(LibraryPageTurn.busy)setTimeout(afterTurn,10);else check();}
       setTimeout(afterTurn,0);
      }check();""","args":[chapter["id"]]})["value"]
    expected=[chapter["id"]]+[x["id"] for x in chapter["blocks"] if x["type"]=="illustration"]+[x["id"] for x in chapter["blocks"] if x["type"]!="illustration"]
    assert out["ids"]==expected,(lang,chapter["id"],len(out["ids"]),len(expected))
    assert not out["over"],(lang,chapter["id"],out["over"][:3])
    pages_checked+=out["count"];blocks_checked+=len(expected)-1
  print("PASS exhaustive pagination:",pages_checked,"sheets,",blocks_checked,"semantic blocks",flush=True)
  # An exact semantic reference opens the same entry as the dedicated lexicon.
  b.js('localStorage.removeItem("library-spoiler-profile-v3");return true;')
  go(reader+"#dk-v01-ch01-calist")
  wait('return !!document.querySelector("#reader-pages #dk-v01-ch01-calist .reader-inline-ref")')
  b.js('document.querySelector("#reader-pages #dk-v01-ch01-calist .reader-inline-ref").click();return true;')
  ok("contextual reference opens an eligible entry",b.js('return document.querySelector("#fiction-entry-dialog").open'))
  title=b.js('return document.querySelector("#fiction-entry-heading").textContent')
  b.js('document.getElementById("fiction-entry-dialog").close();return true;')
  wait('return !document.querySelector("#fiction-entry-dialog").open')
  b.js("""
    const term=document.querySelector("#reader-pages #dk-v01-ch01-calist .reader-inline-ref");
    term.dispatchEvent(new PointerEvent("pointerover",{bubbles:true,pointerType:"mouse"}));
    return true;
  """)
  wait('return !document.querySelector("#reader-quick-view").hidden')
  ok("compact preview matches visible entry without related entries",b.js('return document.querySelector("#reader-quick-view strong").textContent==='+json.dumps(title)+'&&document.querySelectorAll("#reader-quick-view p").length===1&&!document.querySelector("#reader-quick-view a,#reader-quick-view ul,#reader-quick-view section")'))
  b.js('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return true;')
  ok("preview dismissal clears text",b.js('return document.querySelector("#reader-quick-view").hidden&&!document.querySelector("#reader-quick-view").textContent'))
  # Test the CSS fullscreen fallback independently of the platform fullscreen permission.
  b.js('Object.defineProperty(document.documentElement,"requestFullscreen",{value:undefined,configurable:true});document.getElementById("reader-fullscreen").click();return true;')
  wait('return document.body.classList.contains("reader-immersive")&&!!document.querySelector("#reader-pages #dk-v01-ch01-calist")')
  ok("immersive mode preserves semantic anchor",b.js('return !!document.querySelector("#reader-pages #dk-v01-ch01-calist")'))
  b.js('document.body.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientY:3}));return true;')
  wait('return getComputedStyle(document.querySelector(".reader-top-dock")).opacity==="1"')
  ok("top edge reveals fullscreen exit",b.js('return document.getElementById("reader-fullscreen").getAttribute("aria-pressed")==="true"'))
  b.js('document.body.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientY:innerHeight-3}));return true;')
  wait('return getComputedStyle(document.querySelector(".reader-bottom-dock")).opacity==="1"')
  ok("bottom edge reveals page controls",b.js('return getComputedStyle(document.querySelector(".reader-top-dock")).opacity==="0"'))
  b.js('document.body.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientY:innerHeight/2}));return true;')
  wait('return getComputedStyle(document.querySelector(".reader-bottom-dock")).opacity==="0"')
  b.js('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return true;')
  wait('return !document.body.classList.contains("reader-immersive")')
  ok("escape restores normal reading view",b.js('return !document.querySelector(".reader-top-dock")&&!!document.querySelector(".reader-chrome")'))
  go(lex+"?entry=calist")
  ok("reader and Lexicon share visible entry",b.js('return document.querySelector("#fiction-entry-dialog").open&&document.querySelector("#fiction-entry-heading").textContent')==title)
  print("PASS complete reader regression:",len(checks),"interaction checks",flush=True)
  b.call('WebDriver:DeleteSession')
 finally:
  if sock:sock.close()
  proc.terminate()
  try:proc.wait(timeout=10)
  except subprocess.TimeoutExpired:proc.kill();proc.wait()
  server.shutdown()

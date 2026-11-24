#!/usr/bin/env python3
"""Local-only Firefox/Marionette browser QA, standard library only.

No account login, external browser service, or cloud CI.
Run: python3 tools/qa_browser.py /path/to/private-qa-output
"""
from __future__ import annotations
import base64
import http.server
import json
import pathlib
import socket
import subprocess
import sys
import tempfile
import threading
import time

ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else pathlib.Path(tempfile.mkdtemp(prefix="k2040-qa-"))
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):
        super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*args):
        pass
def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1",0))
        return sock.getsockname()[1]
def recvmsg(sock):
    header=b""
    while not header.endswith(b":"):
        data=sock.recv(1)
        if not data: raise RuntimeError("Marionette disconnected")
        header+=data
    n=int(header[:-1])
    data=b""
    while len(data)<n:
        packet=sock.recv(n-len(data))
        if not packet: raise RuntimeError("Incomplete response")
        data+=packet
    return json.loads(data)
class Browser:
    def __init__(self,sock):
        self.sock=sock
        self.num=0
    def call(self,method,params=None):
        self.num+=1
        request=json.dumps([0,self.num,method,params or {}]).encode()
        self.sock.sendall(str(len(request)).encode()+b":"+request)
        response=recvmsg(self.sock)
        if response[0]!=1 or response[1]!=self.num:
            raise RuntimeError("Protocol mismatch: "+str(response)[:240])
        if response[2] is not None:
            raise RuntimeError(method+" "+str(response[2])[:450])
        return response[3]
    def js(self,expression):
        return self.call("WebDriver:ExecuteScript",{"script":expression,"args":[]})["value"]
    def open(self,url):
        self.call("WebDriver:Navigate",{"url":url})
    def size(self,w,h):
        self.call("WebDriver:SetWindowRect",{"width":w,"height":h})
    def screenshot(self,name):
        result=self.call("WebDriver:TakeScreenshot",{"full":False,"highlights":[]})
        payload=result["value"] if isinstance(result,dict) else result
        (OUT/name).write_bytes(base64.b64decode(payload))
def require(flag,reason):
    if not flag: raise AssertionError(reason)
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
sock=None
proc=None
checks=[]
try:
    with tempfile.TemporaryDirectory(prefix="k2040-firefox-") as profile:
        port=free_port()
        pathlib.Path(profile,"user.js").write_text(
            f'user_pref("marionette.port",{port});\nuser_pref("browser.shell.checkDefaultBrowser",false);\n')
        with (OUT/"firefox.log").open("w") as err:
            proc=subprocess.Popen(["firefox","--headless","--no-remote","--marionette","--profile",profile,"about:blank"],stdout=err,stderr=err)
            for _ in range(160):
                if proc.poll() is not None:raise RuntimeError("Firefox exited")
                try:
                    sock=socket.create_connection(("127.0.0.1",port),.18)
                    sock.settimeout(25)
                    break
                except OSError:time.sleep(.12)
            require(sock is not None,"Could not connect to Firefox Marionette")
            greeting=recvmsg(sock)
            require(greeting.get("marionetteProtocol")==3,"Wrong Marionette protocol")
            b=Browser(sock)
            b.call("WebDriver:NewSession",{"capabilities":{"alwaysMatch":{"browserName":"firefox"}}})
            origin="http://127.0.0.1:"+str(server.server_address[1])
            for pathname,width,height,theme,language in [
                ("/",1440,900,"dark","en"),
                ("/",1024,768,"light","fr"),
                ("/",768,850,"light","de"),
                ("/",500,850,"dark","es"),
                ("/links/",1440,900,"light","en"),
                ("/links/",500,850,"dark","pt-PT"),
                ("/news/",1440,900,"dark","de"),
                ("/news/",500,850,"light","en"),
                ("/about/",1440,900,"light","en"),
                ("/about/",500,850,"dark","fr"),
                ("/about/notes/why-i-started-making-things/",1440,900,"dark","de"),
                ("/about/notes/why-i-started-making-things/",500,850,"light","pt-PT"),
                ("/about/notes/site-and-social-relaunch/",1440,900,"dark","es"),
                ("/about/notes/site-and-social-relaunch/",500,850,"light","fr"),
                ("/gaming/",1440,900,"dark","en"),
                ("/gaming/",500,850,"light","de"),
                ("/gaming/mods/",1440,900,"light","fr"),
                ("/gaming/mods/",500,850,"dark","pt-PT"),
                ("/gaming/mods/quick-attach-menu/",1440,900,"dark","en"),
                ("/gaming/mods/quest-journal/",500,850,"light","es"),
                ("/gaming/news/",500,850,"dark","fr")
            ]:
                b.size(width,height)
                b.open(origin+pathname)
                b.js(f'localStorage.setItem("k2040-theme",{json.dumps(theme)});localStorage.setItem("k2040-language",{json.dumps(language)});')
                b.open(origin+pathname)
                time.sleep(.25)
                result=b.js('''return {
                    path:location.pathname,
                    width:innerWidth,
                    overflow:document.documentElement.scrollWidth-innerWidth,
                    theme:document.documentElement.dataset.theme,
                    lang:document.documentElement.lang,
                    title:document.title,
                    menuVisible:getComputedStyle(document.querySelector(".menu-btn")).display!=="none",
                    primaryVisible:getComputedStyle(document.querySelector(".primary-nav")).display!=="none",
                    legacyMenus:document.querySelectorAll(".global-menu,.menu-panel,details").length,
                    brandLoaded:[...document.querySelectorAll(".brand img")].every(img=>img.complete&&img.naturalWidth>0),
                    projectCards:document.querySelectorAll(".project-card").length,
                    heroHeight:document.querySelector(".hero")?.getBoundingClientRect().height||0,
                    heroTopicLinks:document.querySelectorAll(".hero__topics a").length,
                    heroTopicsValid:[...document.querySelectorAll(".hero__topics a")].every(a=>a.getAttribute("href")?.startsWith("#") && document.getElementById(a.getAttribute("href").slice(1))),
                    wordmarkInstances:document.querySelectorAll('img[src*="k2040-approved-horizontal-wordmark"]').length,
                    profileLinks:document.querySelectorAll(".directory-item[href]").length,
                    newsItems:document.querySelectorAll(".update-card").length,
                    firstNewsTitle:document.querySelector(".update-card h3")?.textContent||null,
                    firstNewsHref:document.querySelector(".update-card .update-card__link")?.getAttribute("href")||null,
                    featuredNewsTitle:window.K2040_SITE_NEWS?.[0]?.strings?.[document.documentElement.lang]?.title||null,
                    noteCards:document.querySelectorAll(".note-card").length,
                    noteArticle:!!document.querySelector(".note-article"),
                    activeNoteLocales:[...document.querySelectorAll("[data-post-locale]")].filter(el=>getComputedStyle(el).display!=="none").map(el=>el.dataset.postLocale),
                    aboutActive:!!document.querySelector('.primary-nav a[href="/about/"][aria-current="page"]'),
                    aboutWordmark:(() => {const image=document.querySelector(".about-intro__wordmark img");return image ? {loaded:image.complete&&image.naturalWidth===856,alt:image.alt,inside:!!image.closest("h1"),width:image.getBoundingClientRect().width,parentWidth:image.closest(".about-intro__title").getBoundingClientRect().width} : null;})(),
                    mainPresent:!!document.querySelector("#main"),
                    copyPresent:!!document.querySelector("[data-copy]"),
                    bodyBg:getComputedStyle(document.body).backgroundColor,
                    themeAction:document.querySelector("button[data-theme-toggle] span").textContent,
                    menuExpanded:document.querySelector("[data-menu-toggle]").getAttribute("aria-expanded")
                };''')
                require(result["overflow"]<=2,(pathname,width,"overflow",result["overflow"]))
                require(result["theme"]==theme,(pathname,"theme",result))
                expected_bg="rgb(16, 22, 34)" if theme=="dark" else "rgb(243, 243, 249)"
                require(result["bodyBg"]==expected_bg,(pathname,"computed theme colors",result))
                require(result["lang"]==language,(pathname,"language",result))
                require(result["legacyMenus"]==0,(pathname,"old dropdown found"))
                require(result["brandLoaded"],(pathname,"approved wordmark absent"))
                require(result["mainPresent"],(pathname,"main absent"))
                require(result["copyPresent"],(pathname,"i18n absent"))
                require(result["menuVisible"]==(result["width"]<=820),(pathname,"mobile menu breakpoint",result))
                require(result["primaryVisible"]==(result["width"]>820),(pathname,"desktop nav breakpoint",result))
                if pathname in ("/","/news/"):
                    require(result["newsItems"]==1,("fresh launch must show exactly one News entry",result))
                    require(result["firstNewsTitle"]==result["featuredNewsTitle"],
                            ("relaunch notice not first / translated",result))
                    require(result["firstNewsHref"] and result["firstNewsHref"].endswith("/about/notes/site-and-social-relaunch/"),
                            ("relaunch news link not pointing to its blog post",result))
                if pathname=="/":
                    require(result["projectCards"]==3,("project cards",result))
                    require(result["heroTopicLinks"]==3 and result["heroTopicsValid"],("hero project links",result))
                    require(result["wordmarkInstances"]==1,("duplicate logo",result))
                    require(0 < result["heroHeight"] <= (420 if result["width"]>820 else 660),
                            ("oversized hero",result))
                    if result["menuVisible"]:
                        b.js('document.querySelector("[data-menu-toggle]").click();return true;')
                        time.sleep(.3)
                        state=b.js('''
                          const button=document.querySelector("[data-menu-toggle]");
                          const nav=document.querySelector(".mobile-nav");
                          const main=document.querySelector("#main");
                          return {expanded:button.getAttribute("aria-expanded"), visible:getComputedStyle(nav).visibility,
                          navBottom:nav.getBoundingClientRect().bottom, mainTop:main.getBoundingClientRect().top};''')
                        require(state["expanded"]=="true" and state["visible"]=="visible",("menu didn't open",state))
                        require(state["navBottom"]<=state["mainTop"]+2,("menu overlaps page",state))
                        escaped=b.js('''
                          document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
                          return document.querySelector("[data-menu-toggle]").getAttribute("aria-expanded");''')
                        require(escaped=="false","Escape failed to close navigation")
                        time.sleep(.35)
                if pathname=="/links/":
                    require(result["profileLinks"]==9,("active external links",result))
                    directory=b.js('''
                      const header=document.querySelector(".directory-intro");
                      const profiles=document.querySelector("#profile-title").closest("section");
                      const support=document.querySelector("#support-title").closest("section");
                      const patreon=[...profiles.querySelectorAll(".directory-item")].find(el=>el.querySelector("strong")?.textContent==="Patreon");
                      return {introHeight:header.getBoundingClientRect().height,
                        profilesTop:profiles.getBoundingClientRect().top,
                        patreonInProfiles:!!patreon,
                        patreonActive:patreon?.tagName==="A" && patreon.href==="https://www.patreon.com/cw/k2040",
                        patreonInSupport:support.textContent.includes("Patreon"),
                        supportLinks:support.querySelectorAll(".directory-item[href]").length};''')
                    require(directory["patreonInProfiles"] and directory["patreonActive"] and not directory["patreonInSupport"],
                            ("Patreon grouping",directory))
                    require(directory["supportLinks"]==2,("support links",directory))
                    require(directory["introHeight"]<260,("oversized directory intro",directory))
                    require(directory["profilesTop"]<470,("profiles pushed below visible area",directory))
                if pathname=="/about/":
                    require(result["noteCards"]==2,("About blog entries missing",result))
                    require(result["aboutActive"],("About nav current",result))
                    require(result["aboutWordmark"] and result["aboutWordmark"]["loaded"] and result["aboutWordmark"]["inside"] and result["aboutWordmark"]["alt"]=="K2040",
                            ("approved About wordmark failed to load",result))
                    require(result["aboutWordmark"]["width"] <= result["aboutWordmark"]["parentWidth"] + 2,
                            ("About wordmark does not fit",result))
                    require(len(result["activeNoteLocales"])>=2 and all(lang==language for lang in result["activeNoteLocales"]),
                            ("Blog preview locale visibility",result))
                    hrefs=b.js('''return [...document.querySelectorAll(".note-card h3 a")].map(a=>a.getAttribute("href"));''')
                    require(hrefs[:2]==["/about/notes/site-and-social-relaunch/","/about/notes/why-i-started-making-things/"],
                            ("Relaunch post should lead About",hrefs))
                if pathname.startswith("/about/notes/"):
                    require(result["noteArticle"] and result["aboutActive"],("Note article / nav missing",result))
                    require(len(result["activeNoteLocales"])>=4 and all(lang==language for lang in result["activeNoteLocales"]),
                            ("Article locale visibility",result))
                    note=b.js('''return {
                       title:document.title,
                       description:document.querySelector('meta[name="description"]').content,
                       back:!!document.querySelector('.note-back a[href="/about/"]'),
                       heading:document.querySelector("[data-note-title]")?.innerText
                    };''')
                    require(note["back"] and note["heading"],("Note navigation/title",note))
                    require(note["title"].startswith(note["heading"].strip()),("Note title not localized",note))
                    require(note["description"] and len(note["description"])>=8,("Note description missing",note))
                if pathname.startswith("/gaming/"):
                    game=b.js('''return {
                      switchHome:!!document.querySelector('.site-switch a[href="/"]'),
                      switchGaming:!!document.querySelector('.site-switch a[href="/gaming/"][aria-current="page"]'),
                      tiles:document.querySelectorAll(".game-tile").length,
                      mods:document.querySelectorAll(".mod-card").length,
                      pictures:[...document.querySelectorAll("main img[src]")].every(i=>i.loading==="lazy"||i.complete&&i.naturalWidth>0),
                      title:document.title,
                      modLink:!!document.querySelector('.mod-header a[href^="https://www.nexusmods.com/"]'),
                      activeLocales:[...document.querySelectorAll("[data-post-locale]")].filter(el=>getComputedStyle(el).display!=="none").map(el=>el.dataset.postLocale)
                    };''')
                    require(game["switchHome"] and game["switchGaming"],("website switch",game))
                    require(game["pictures"],("gaming image decoding",game))
                    require(all(l==language for l in game["activeLocales"]),("gaming localization",game))
                    if pathname=="/gaming/": require(game["tiles"]==3 and result["newsItems"]==0,("gaming home",game))
                    if pathname=="/gaming/mods/": require(game["mods"]==8,("catalogue",game))
                    if pathname.startswith("/gaming/mods/") and pathname!="/gaming/mods/":
                        require(game["modLink"],("official mod link",game))
                        outcome=b.js('''const a=document.querySelector(".gallery-item"),d=document.querySelector(".gaming-lightbox");
                          a.click();const first=d.querySelector("img").src;
                          d.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));
                          const second=d.querySelector("img").src; const opened=d.open;
                          d.querySelector("[data-gallery-close]").click();
                          return {opened,changed:first!==second,closed:!d.open};''')
                        require(outcome["opened"] and outcome["changed"] and outcome["closed"],("gallery interaction",outcome))
                    if pathname=="/gaming/news/": require(result["newsItems"]==0,("unpublished gaming news",result))
                    b.screenshot("gaming-"+pathname.strip("/").replace("/","-")+"-"+str(width)+"-"+theme+".png")
                checks.append({"path":pathname,"size":result["width"],"theme":theme,"locale":language,"news":result["newsItems"],"bg":result["bodyBg"],"action":result["themeAction"]})
                time.sleep(.9)
                if pathname=="/" and width==1440: b.screenshot("home-desktop-dark.png")
                if pathname=="/" and width==500: b.screenshot("home-mobile-dark-v2.png")
                if pathname=="/links/" and width==1440: b.screenshot("links-desktop-light.png")
                if pathname=="/links/" and width==500: b.screenshot("links-mobile-dark.png")
                if pathname=="/about/" and width==1440: b.screenshot("about-desktop-light.png")
                if pathname=="/about/" and width==500: b.screenshot("about-mobile-dark.png")
                if pathname.startswith("/about/notes/") and width==500: b.screenshot("note-mobile-light.png")
            # Test controls independently of persisted initial state.
            b.size(550,850)
            b.open(origin+"/")
            outcome=b.js('''
              const t=document.querySelector("button[data-theme-toggle]");
              const old=document.documentElement.dataset.theme;
              t.click();
              const next=document.documentElement.dataset.theme;
              const sel=document.querySelector("[data-language]");
              sel.value="de";sel.dispatchEvent(new Event("change",{bubbles:true}));
              return {old,next,themeSaved:localStorage.getItem("k2040-theme"),
                lang:document.documentElement.lang,
                languageSaved:localStorage.getItem("k2040-language"),
                title:document.querySelector("#main-title").textContent};''')
            require(outcome["old"]!=outcome["next"] and outcome["next"]==outcome["themeSaved"],("toggle",outcome))
            require(outcome["lang"]=="de" and outcome["languageSaved"]=="de",("language",outcome))
            require("Geschichten" in outcome["title"],("translated heading",outcome))
            # Regression: saved <html data-theme> must not capture the button's click handler.
            for route in ("/", "/news/", "/links/", "/about/", "/about/notes/why-i-started-making-things/", "/about/notes/site-and-social-relaunch/"):
                for saved_theme in ("dark", "light"):
                    b.open(origin+route)
                    b.js(f'localStorage.setItem("k2040-theme",{json.dumps(saved_theme)});return true;')
                    b.open(origin+route)
                    state=b.js('''
                      const root=document.documentElement;
                      const button=document.querySelector("button[data-theme-toggle]");
                      const before=root.dataset.theme;
                      const storeBefore=localStorage.getItem("k2040-theme");
                      const targetNodes=[
                        document.body,
                        document.querySelector("main"),
                        document.querySelector(".masthead"),
                        document.querySelector("#main h1")
                      ];
                      for(const node of targetNodes) node.click();
                      const afterUnrelatedClicks=root.dataset.theme;
                      const storeAfterUnrelatedClicks=localStorage.getItem("k2040-theme");
                      button.click();
                      const afterButton=root.dataset.theme;
                      const storeAfterButton=localStorage.getItem("k2040-theme");
                      button.click();
                      return {before,storeBefore,afterUnrelatedClicks,
                        storeAfterUnrelatedClicks,afterButton,storeAfterButton,
                        backToOriginal:root.dataset.theme};''')
                    require(state["before"]==saved_theme,(route,"initial saved theme",state))
                    require(state["storeBefore"]==saved_theme,(route,"initial saved storage",state))
                    require(state["afterUnrelatedClicks"]==saved_theme,(route,"unexpected theme toggle from background click",state))
                    require(state["storeAfterUnrelatedClicks"]==saved_theme,(route,"unexpected theme persistence from background click",state))
                    opposite="light" if saved_theme=="dark" else "dark"
                    require(state["afterButton"]==opposite and state["storeAfterButton"]==opposite,
                            (route,"explicit theme button failed",state))
                    require(state["backToOriginal"]==saved_theme,(route,"second button toggle failed",state))
            checks.append({"regression":"theme-click-isolation","cases":12,"status":"PASS"})
            b.call("WebDriver:DeleteSession")
    (OUT/"browser-results.json").write_text(json.dumps(checks,indent=2)+"\n")
    print(f"PASS Firefox: {len(checks)-1} layout cases, 12 persisted-theme click-isolation cases, relaunch first, notes, gaming and news")
finally:
    if sock:sock.close()
    if proc:
        proc.terminate()
        try:proc.wait(timeout=8)
        except subprocess.TimeoutExpired:proc.kill()
    server.shutdown()

"""Generate released Android app pages from a dedicated public catalogue."""
from datetime import date
from html import escape
from urllib.parse import urlparse
import json
import re

def load(root,langs):
    data=json.loads((root/"android/catalog.json").read_text())
    posts=json.loads((root/"android/posts.json").read_text())
    assert set(data)=={"apps"}
    def translated(d):
        assert set(d)==set(langs) and all(isinstance(v,str) and v.strip() for v in d.values())
    def media(m):
        assert re.fullmatch(r"/assets/android/[a-z0-9.-]+\.webp",m["src"])
        assert (root/m["src"].lstrip("/")).is_file()
        assert (m["width"],m["height"])==(1920,1080)
    seen=set()
    for a in data["apps"]:
        assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",a["slug"]) and a["slug"] not in seen
        seen.add(a["slug"])
        assert a["title"].strip() and re.fullmatch(r"[a-zA-Z0-9_.]+",a["package"])
        assert date.fromisoformat(a["date"])<=date.today()
        translated(a["description"]);translated(a["overview"]);media(a["promo"])
        assert a["images"]
        for m in a["images"]:media(m);translated(m["caption"])
        assert re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+",a["capture"])
        assert re.fullmatch(r"https://github\.com/Kamui2040/[A-Za-z0-9_.-]+",a["source"])
        assert re.fullmatch(re.escape(a["source"])+r"/blob/v[0-9.]+/PRIVACY\.md",a["privacy"])
        assert [s["name"] for s in a["stores"][:2]]==["GitHub","F-Droid"]
        assert a["stores"][0]["url"]==a["source"]+"/releases"
        assert a["stores"][1]["url"]=="https://f-droid.org/packages/"+a["package"]+"/"
        hosts={"GitHub":"github.com","F-Droid":"f-droid.org","ONEstore":"m.onestore.net","Uptodown":a["slug"]+".en.uptodown.com","OpenAPK":"www.openapk.net"}
        for s in a["stores"]:
            u=urlparse(s["url"])
            assert u.scheme=="https" and u.netloc==hosts[s["name"]]
        versions=[tuple(map(int,r["version"].split("."))) for r in a["history"]]
        assert versions==sorted(set(versions),reverse=True)
        assert all(r["text"].strip() for r in a["history"])
    assert isinstance(posts,list)
    post_ids=set()
    for p in posts:
        assert set(p)=={"slug","app","date","translations","release"}
        assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",p["slug"]) and p["slug"] not in post_ids
        post_ids.add(p["slug"])
        assert p["app"] in seen and type(p["release"]) is bool and date.fromisoformat(p["date"])<=date.today()
        assert set(p["translations"])==set(langs)
        for t in p["translations"].values():
            assert set(t)=={"title","excerpt","paragraphs"} and t["title"].strip() and t["excerpt"].strip() and t["paragraphs"] and all(s.strip() for s in t["paragraphs"])
    return data,posts

def news_entries(data,langs):
    catalog,posts=data
    names={a["slug"]:a["title"] for a in catalog["apps"]}
    return [{"id":"android-"+p["slug"],"projectId":"android-apps","date":p["date"],"pinned":False,"href":"/android/news/"+p["slug"]+"/","strings":{l:{"category":names[p["app"]],"title":p["translations"][l]["title"],"summary":p["translations"][l]["excerpt"]} for l in langs}} for p in sorted(posts,key=lambda p:(p["date"],p["slug"]),reverse=True)]

def pages(data,langs,head,header,footer,copy,localized):
    catalog,posts=data
    apps=sorted(catalog["apps"],key=lambda a:a["date"],reverse=True)
    by_slug={a["slug"]:a for a in apps}
    def c(k,v):return copy("android."+k,v)
    def tr(d):return "".join(f'<span data-post-locale="{l}">{escape(d[l])}</span>' for l in langs)
    def link(a):return "/android/apps/"+a["slug"]+"/"
    def button(h,k,v,cls="action"):return f'<a class="{cls}" href="{escape(h,quote=True)}">{c(k,v)}</a>'
    def picture(m,alt=""):return f'<img class="mod-promo" src="{m["src"]}" width="{m["width"]}" height="{m["height"]}" alt="{escape(alt,quote=True)}" decoding="async">'
    def wrap(kind,title,desc,uri,body):return head(kind,title+" — K2040",desc,uri)+header(kind)+body+footer()
    def cards():
        return "".join(f'<article class="mod-card app-card"><a class="mod-card-art" href="{link(a)}" aria-label="{escape(a["title"],quote=True)}">{picture(a["promo"])}</a><h3><a href="{link(a)}">{escape(a["title"])}</a></h3><p>{tr(a["description"])}</p>{button(link(a),"details","View app","text-link")}</article>' for a in apps)
    intro=c("intro","Explore released Android apps and their official downloads.")
    released=[p for p in posts if p["release"]]
    newest=max(released,key=lambda p:(p["date"],p["slug"]),default=None)
    a=by_slug[newest["app"]] if newest else apps[0]
    label=c("latestRelease","Latest release") if newest else c("featured","Featured app")
    date_line=f'<time datetime="{newest["date"]}">{newest["date"]}</time>' if newest else ""
    featured=f'<section class="gaming-section latest-release" aria-labelledby="latest-release-heading"><h2 id="latest-release-heading">{label}</h2><article class="release-feature"><a class="release-feature-art" href="{link(a)}" aria-label="{escape(a["title"],quote=True)}">{picture(a["promo"])}</a><div class="release-feature-copy">{date_line}<h3><a href="{link(a)}">{escape(a["title"])}</a></h3><p>{tr(a["description"])}</p><div class="actions">{button(link(a),"details","View app")}{button(link(a)+"#downloads","downloads","Downloads","action action--quiet")}</div></div></article></section>'
    result={}
    body=f'<main id="main" class="shell gaming-main"><section class="hero gaming-hero"><div class="hero__top"><div class="hero__copy"><p class="eyebrow">K2040 / Android</p><h1>{c("title","Android apps")}</h1><p class="hero__intro">{intro}</p></div><div class="actions">{button("/android/apps/","browse","Browse apps")}</div></div></section>{featured}<section class="gaming-section"><h2>{c("released","Released apps")}</h2><div class="mod-grid">{cards()}</div></section><section class="gaming-section gaming-news-panel"><div class="section__top"><h2>{c("news","Android news")}</h2>{button("/android/news/","allNews","All Android news","text-link")}</div><div class="update-list" data-updates aria-live="polite"></div></section></main>'
    result["android/index.html"]=wrap("android","Android apps","Released Android apps and official downloads.","/android/",body)
    body=f'<main id="main" class="shell gaming-main"><header class="page-intro gaming-intro"><p class="eyebrow">K2040 / Android</p><h1>{c("released","Released apps")}</h1><p>{intro}</p></header><div class="mod-grid">{cards()}</div></main>'
    result["android/apps/index.html"]=wrap("androidApps","Released apps","Released Android apps.","/android/apps/",body)
    for a in apps:
        figures=[]
        for m in a["images"]:
            alts=" ".join(f'data-alt-{l.lower()}="{escape(m["caption"][l],quote=True)}"' for l in langs)
            figures.append(f'<figure><a class="gallery-item" href="{m["src"]}"><img src="{m["src"]}" width="{m["width"]}" height="{m["height"]}" alt="{escape(m["caption"]["en"],quote=True)}" {alts} loading="lazy" decoding="async"></a><figcaption>{tr(m["caption"])}</figcaption></figure>')
        gallery=f'<section class="gaming-section" aria-labelledby="gallery-heading"><h2 id="gallery-heading">{c("screenshots","Screenshots")}</h2><p class="capture-note">{c("capture","Screenshots from app version")} {a["capture"]}. {c("captureNote","The current interface may differ.")}</p><div class="gaming-gallery">{"".join(figures)}</div><dialog class="gaming-lightbox" aria-labelledby="gallery-heading"><div class="lightbox-tools"><button type="button" data-gallery-prev class="control">{copy("gaming.previous","Previous")}</button><button type="button" data-gallery-next class="control">{copy("gaming.next","Next")}</button><button type="button" data-gallery-close class="control">{copy("gaming.close","Close")}</button></div><img alt=""><p class="lightbox-caption" aria-live="polite"></p></dialog></section>'
        stores="".join(f'<a class="directory-item" href="{escape(s["url"],quote=True)}"><strong>{s["name"]}</strong><span>{escape(s.get("version","")) if "version" in s else c("storeVersion","See store for version")}</span></a>' for s in a["stores"])
        history="".join(f'<li><strong>{e["version"]}</strong><p lang="en">{escape(e["text"])}</p></li>' for e in a["history"])
        body=f'<main id="main" class="shell gaming-main"><div class="note-back">{button("/android/apps/","back","Back to all apps","text-link")}</div><article><header class="mod-header">{picture(a["promo"])}<div class="mod-header-copy"><p class="eyebrow">Android</p><h1>{escape(a["title"])}</h1><p>{tr(a["description"])}</p>{button("#downloads","downloads","Downloads")}</div></header><section class="gaming-section mod-overview"><p>{tr(a["overview"])}</p></section>{gallery}<section class="gaming-section" id="downloads"><h2>{c("downloads","Downloads")}</h2><p>{c("channelNote","Versions and signatures can differ by distribution channel. Check the selected platform before updating or switching builds.")}</p><div class="directory-grid">{stores}</div><div class="actions">{button(a["source"],"source","Source code","action action--quiet")}{button(a["privacy"],"privacy","Privacy policy","action action--quiet")}</div></section><section class="gaming-section mod-changelog"><h2>{c("history","Release history")}</h2><p>{c("historyNote","Selected public release notes (English), newest first.")}</p><ol class="release-history">{history}</ol></section><p class="capture-note">{c("credits","Artwork and screenshot compositions: K2040. Source repositories contain licensing and attribution details.")}</p></article></main>'
        result[link(a).lstrip("/")+"index.html"]=wrap("androidApp",a["title"],a["description"]["en"],link(a),body)
    result["android/news/index.html"]=wrap("androidNews","Android news","New Android announcements.","/android/news/",f'<main id="main" class="shell gaming-main"><header class="page-intro gaming-intro"><p class="eyebrow">K2040 / Android</p><h1>{c("news","Android news")}</h1></header><section class="gaming-section"><div class="update-list" data-updates aria-live="polite"></div></section></main>')
    for p in posts:
        a=by_slug[p["app"]]
        uri="/android/news/"+p["slug"]+"/"
        paragraphs="".join(f'<p data-post-locale="{l}">{escape(s)}</p>' for l in langs for s in p["translations"][l]["paragraphs"])
        body=f'<main id="main" class="shell gaming-main"><div class="note-back">{button("/android/news/","allNews","All Android news","text-link")}</div><article class="note-article"><header class="note-article__header"><p class="eyebrow">{escape(a["title"])}</p><time datetime="{p["date"]}">{p["date"]}</time><h1 data-note-title>{localized(p,"title")}</h1><p data-note-summary>{localized(p,"excerpt")}</p></header><div class="note-article__body">{paragraphs}</div>{button(link(a),"details","View app")}</article></main>'
        result[uri.lstrip("/")+"index.html"]=wrap("androidArticle",p["translations"]["en"]["title"],p["translations"]["en"]["excerpt"],uri,body)
    return result

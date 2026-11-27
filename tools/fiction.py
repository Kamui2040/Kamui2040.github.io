"""Literary catalogue pages. Published editions are separate from interface locales."""
from html import escape
import json
from urllib.parse import urlparse

def load(root):
    data=json.loads((root/"fiction/catalog.json").read_text())
    media=json.loads((root/"fiction/media.json").read_text())
    indexed={m["path"]:m for m in media}
    assert len(indexed)==len(media)
    for m in media:
        p=root/m["path"].lstrip("/")
        assert p.is_file() and p.is_relative_to(root) and not p.is_symlink()
        assert p.stat().st_size==m["bytes"]
    for w in data["worlds"]:
        assert w["id"]=="telanas"
        for s in w["series"]:
            assert s["id"]=="dragon-knight"
            for b in s["books"]:
                assert b["id"]=="volume-01" and set(b["labels"])=={"en","de"}
                assert b["cover"] in indexed and b["chapters"]==10 and b["illustrations"]==10
                assert [e["language"] for e in b["editions"]]==["en","de"]
                for e in b["editions"]:
                    assert {f["format"] for f in e["files"]}=={"pdf","epub"}
                    for f in e["files"]:
                        assert f["sha256"]==indexed[f["path"]]["sha256"]
                assert {s["name"] for s in b["stores"]}=={"Lulu","Google Play Books"}
                for store in b["stores"]:
                    u=urlparse(store["url"])
                    assert u.scheme=="https" and u.netloc in {"www.lulu.com","play.google.com"} and store["language"]=="en"
    return data

def pages(data,langs,head,header,footer,copy):
    world=data["worlds"][0];series=world["series"][0];book=series["books"][0]
    base="/fiction/";world_url=base+world["id"]+"/";series_url=world_url+series["id"]+"/";book_url=series_url+book["id"]+"/"
    reader_url=book_url+"read/";lexicon_url=world_url+"lexicon/"
    def c(k,v):return copy("fiction."+k,v)
    def tr(key):
        return "".join(f'<span data-post-locale="{l}" lang="{("de" if l=="de" else "en")}">{escape(book["labels"]["de" if l=="de" else "en"][key])}</span>' for l in langs)
    def link(h,k,v,cls="action"):
        return f'<a class="{cls}" href="{escape(h,quote=True)}">{c(k,v)}</a>'
    def cover():
        alts=" ".join(f'data-alt-{l.lower()}="{escape(book["coverAlt"]["de" if l=="de" else "en"],quote=True)}"' for l in langs)
        return f'<img class="fiction-cover" src="{book["cover"]}" width="1024" height="1536" alt="{escape(book["coverAlt"]["en"],quote=True)}" {alts} decoding="async">'
    def hero(kind,kicker,title,description,actions):
        return f'<section class="fiction-hero {kind}"><div class="fiction-hero-copy"><p class="eyebrow">{kicker}</p><h1>{title}</h1><p class="fiction-lead">{description}</p>{f'<div class="actions">{actions}</div>' if actions else ""}</div></section>'
    def featured():
        return f'<article class="fiction-book-feature"><a class="fiction-cover-link" href="{book_url}">{cover()}</a><div><p class="eyebrow">{c("released","Published volume")} · K2040</p><h2>{tr("series")}</h2><h3>{tr("volume")}</h3><p>{c("synopsis","Calist Griffith grows up around his family’s forge, drawn between the responsibilities of home and a growing curiosity about the wider world.")}</p><p class="fiction-facts">{c("facts","10 chapters · 10 illustrations · English and German")}</p><div class="actions">{link(reader_url,"read","Begin reading")}{link(book_url,"book","View book","action action--quiet")}</div></div></article>'
    def wrap(kind,title,description,uri,body):
        return head(kind,title,description,uri)+header(kind)+f'<main id="main" class="shell fiction-main">{body}</main>'+footer()
    results={}
    rootbody=hero("fiction-library",c("eyebrow","K2040 / Fiction"),c("title","The Library"),c("intro","Original fiction, illustrated editions and worlds to explore."),"")
    rootbody+=f'<section class="fiction-section"><div class="fiction-section-heading"><h2>{c("worlds","Worlds")}</h2></div><a class="fiction-world-card" href="{world_url}"><div class="fiction-world-art" aria-hidden="true"></div><div><p class="eyebrow">{c("fantasy","Fantasy")}</p><h3>Telanas</h3><p>{c("worldIntro","The world of The Dragon Knight, told one volume at a time.")}</p><span class="text-link">{c("explore","Explore Telanas")}</span></div></a></section><section class="fiction-section">{featured()}</section>'
    results["fiction/index.html"]=wrap("fiction","The Library — K2040","Original fiction and illustrated editions.",base,rootbody)
    body=hero("fiction-landscape","The Library / Telanas","Telanas",c("worldIntro","The world of The Dragon Knight, told one volume at a time."),link(reader_url,"read","Begin reading")+link(series_url,"series","Explore the series","action action--quiet"))
    body+=f'<section class="fiction-section">{featured()}</section><section class="fiction-section fiction-lexicon-preview"><div class="fiction-lexicon-art" aria-hidden="true"></div><div><h2>{c("lexicon","Lexicon")}</h2><p>{c("lexiconIntro","A spoiler-aware reference to the world, its characters, places and events.")}</p>{link(lexicon_url,"openLexicon","Open the Lexicon")}</div></section>'
    results["fiction/telanas/index.html"]=wrap("fictionWorld","Telanas — The Library","The world of The Dragon Knight.",world_url,body)
    body=f'<nav class="fiction-back">{link(world_url,"backWorld","Back to Telanas","text-link")}</nav><header class="fiction-editorial"><p class="eyebrow">Telanas</p><h1 data-note-title>{tr("series")}</h1><p class="fiction-lead">{c("seriesIntro","An illustrated coming-of-age fantasy about family, craft, responsibility and belonging.")}</p></header><section class="fiction-section">{featured()}</section>'
    results["fiction/telanas/dragon-knight/index.html"]=wrap("fictionSeries","The Dragon Knight — The Library","An illustrated fantasy series set in Telanas.",series_url,body)
    editions=""
    for e in book["editions"]:
        lang=e["language"];label="English" if lang=="en" else "Deutsch"
        buttons="".join(f'<a class="action action--quiet" href="{f["path"]}" download>{f["format"].upper()} · {f["bytes"]/1_000_000:.1f} MB</a>' for f in e["files"])
        stores="".join(f'<a class="text-link" href="{escape(s["url"],quote=True)}">{escape(s["name"])}</a>' for s in book["stores"] if s["language"]==lang)
        editions+=f'<article class="fiction-edition"><h3 lang="{lang}">{label}</h3><p lang="{lang}">{escape(book["labels"][lang]["series"])} — {escape(book["labels"][lang]["volume"])}</p><p class="fiction-facts">{e["pages"]} {c("pdfPages","PDF pages")}</p><div class="actions">{buttons}</div>{f"<div class=fiction-store-links>{stores}</div>" if stores else ""}</article>'
    body=f'<nav class="fiction-back">{link(series_url,"backSeries","Back to series","text-link")}</nav><article class="fiction-book-detail"><div>{cover()}</div><header><p class="eyebrow">Telanas · K2040</p><p class="fiction-series-name">{tr("series")}</p><h1 data-note-title>{tr("volume")}</h1><p class="fiction-lead">{c("synopsis","Calist Griffith grows up around his family’s forge, drawn between the responsibilities of home and a growing curiosity about the wider world.")}</p><p class="fiction-facts">{c("facts","10 chapters · 10 illustrations · English and German")}</p><div class="actions">{link(reader_url,"read","Begin reading")}{link("#editions","editions","Editions","action action--quiet")}</div></header></article><section class="fiction-section" id="editions"><div class="fiction-section-heading"><h2>{c("editions","Editions")}</h2><p>{c("editionIntro","Download the complete illustrated volume in your preferred format. English storefront editions are also available.")}</p></div><div class="fiction-editions">{editions}</div></section><p class="fiction-note">{c("rights","Text and artwork by K2040. All rights reserved.")}</p>'
    results["fiction/telanas/dragon-knight/volume-01/index.html"]=wrap("fictionBook","The Dragon Knight: Volume 1 — Home","The first illustrated volume of The Dragon Knight.",book_url,body)
    def text(key,fallback):return f'<span data-reading-copy="{key}">{fallback}</span>'
    dialog='<dialog id="fiction-entry-dialog" class="fiction-entry-dialog" aria-labelledby="fiction-entry-heading"><div id="fiction-entry-content"></div><button type="button" id="fiction-entry-close" class="reading-button" data-reading-copy="close">Close</button></dialog>'
    body=f'''<p id="reading-error" role="alert"></p>
    <div id="reader-area" data-theme="dark">
      <div class="reader-toolbar"><label class="reading-field">{text("contents","Contents")}<select id="reader-chapter" aria-label="Contents"></select></label>
        <label class="reading-field">{text("layout","Layout")}<select id="reader-layout"><option value="spread" data-reading-copy="spread">Book spread</option><option value="single" data-reading-copy="single">Single page</option><option value="continuous" data-reading-copy="continuous">Continuous</option></select></label>
        <details class="reader-popover"><summary data-reading-copy="bookmarks">Bookmarks</summary><div class="reader-popover-panel" id="reader-marks"></div></details>
        <button type="button" id="reader-bookmark" class="reading-button" aria-pressed="false">Save place</button>
        <button type="button" id="reader-fullscreen" class="reading-button" aria-pressed="false" data-reading-copy="fullscreen">Fullscreen</button>
        <details class="reader-settings"><summary data-reading-copy="settings">Reading settings</summary>
          <div class="reading-settings-grid">
           <label class="reading-field">{text("theme","Page theme")}<select id="reader-pref-theme"><option value="dark" data-reading-copy="dark">Dark</option><option value="light" data-reading-copy="light">Light</option><option value="parchment" data-reading-copy="parchment">Parchment</option></select></label>
           <label class="reading-field">{text("typeface","Typeface")}<select id="reader-pref-typeface"><option value="serif" data-reading-copy="serif">Book serif</option><option value="sans" data-reading-copy="sans">Sans serif</option></select></label>
           <label class="reading-field">{text("size","Text size")}<select id="reader-pref-fontSize"><option value="0.9">90%</option><option value="1">100%</option><option value="1.1">110%</option><option value="1.2">120%</option></select></label>
           <label class="reading-field">{text("spacing","Line spacing")}<select id="reader-pref-lineHeight"><option value="1.5">1.5</option><option value="1.75">1.75</option><option value="2">2</option></select></label>
           <label class="reading-field">{text("progress","Chapter completion")}<select id="reader-progress-mode"><option value="ask" data-reading-copy="ask">Ask</option><option value="automatic" data-reading-copy="automatic">Automatic</option><option value="manual" data-reading-copy="manual">Manual</option></select></label>
          </div>
        </details>
      </div>
      <div class="reader-workspace">

        <section class="reader-stage"><div id="reader-pages" class="reader-pages" aria-label="Book pages"></div><div id="reader-probe" aria-hidden="true" inert></div>
        <div class="reader-bottom-dock"><div class="reader-pagination"><button type="button" id="reader-prev" class="reading-button" data-reading-copy="previous">Previous</button><span id="reader-position" aria-live="polite"></span><button type="button" id="reader-next" class="reading-button" data-reading-copy="next">Next</button></div><div id="reader-completion" aria-live="polite"></div></div></section>
      </div>
    </div>{dialog}'''
    reader_header=f'''<header class="reader-chrome shell">
      <a class="reader-brand" href="/fiction/" aria-label="The Library"><img src="/assets/k2040-approved-horizontal-wordmark.avif" width="856" height="245" alt="K2040"></a>
      <h1>{tr("series")}</h1>
      <nav aria-label="Reader navigation"><a class="text-link" href="{book_url}" data-reading-copy="back">Back to book</a><a class="text-link" href="{lexicon_url}" data-reading-copy="lexicon">Lexicon</a></nav>
      <label class="reader-language"><span class="visually-hidden">Language</span><select class="control" data-language aria-label="Language"><option value="en">EN</option><option value="de">DE</option></select></label>
    </header>'''
    results[reader_url.lstrip("/")+"index.html"]=head("fictionReader","The Dragon Knight — Reader","Read the released illustrated volume.",reader_url)+reader_header+f'<main id="main" class="shell fiction-main">{body}</main></body></html>'

    body=f'''<header class="lexicon-hero"><div><p class="eyebrow">The Library / Telanas</p><h1>{c("lexicon","Lexicon")}</h1><p class="fiction-lead">{c("lexiconIntro","A spoiler-aware reference to the world, its characters, places and events.")}</p></div><div class="fiction-lexicon-art" aria-hidden="true"></div></header><p id="reading-error" role="alert"></p>
    <section class="reading-filters"><label class="reading-field">{text("through","Spoilers through")}<select id="fiction-progress"><option value="-1">No completed chapters</option></select></label><label class="reading-check"><input type="checkbox" id="fiction-full-spoilers">{text("full","Full spoilers")}</label><label class="reading-field">{text("search","Search visible entries")}<input id="fiction-search" type="search" data-reading-placeholder="search"></label><label class="reading-field">{text("order","Order")}<select id="fiction-order"><option value="appearance" data-reading-copy="appearance">First appearance</option><option value="alphabetical" data-reading-copy="alphabetical">Alphabetical</option><option value="chronological" data-reading-copy="chronological">Chronological</option></select></label></section>
    <nav id="fiction-categories" aria-label="Lexicon categories"></nav><section id="fiction-results" class="fiction-results" aria-live="polite"></section>{dialog}'''
    results[lexicon_url.lstrip("/")+"index.html"]=wrap("fictionLexicon","Telanas — Lexicon","Browse spoiler-aware reference entries.",lexicon_url,body)
    return results

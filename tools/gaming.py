"""Generate the Gaming website from its own catalogue and new announcements."""
from datetime import date
from html import escape
from urllib.parse import urlparse
import json
import re

SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")

def load(root, langs):
    catalog = json.loads((root/"gaming/catalog.json").read_text(encoding="utf-8"))
    posts = json.loads((root/"gaming/posts.json").read_text(encoding="utf-8"))
    assert set(catalog)=={"games","mods"}
    def translations(values):
        assert set(values)==set(langs)
        assert all(isinstance(v,str) and v.strip() for v in values.values())
    def media(obj):
        assert re.fullmatch(r"/assets/gaming/[a-z0-9.-]+",obj["src"])
        assert (root/obj["src"].lstrip("/")).is_file()
        assert all(type(obj[k]) is int and obj[k]>0 for k in ("width","height"))
    games={g["id"]:g for g in catalog["games"]}
    assert len(games)==len(catalog["games"])
    for g in games.values():
        assert SLUG.fullmatch(g["id"]) and g["title"].strip()
        media(g["art"])
    seen=set()
    for mod in catalog["mods"]:
        assert SLUG.fullmatch(mod["slug"]) and mod["slug"] not in seen
        seen.add(mod["slug"])
        assert mod["game"] in games and mod["title"].strip()
        url=urlparse(mod["nexus"])
        assert url.scheme=="https" and url.netloc=="www.nexusmods.com"
        assert re.fullmatch(r"/"+mod["game"]+r"/mods/[0-9]+",url.path)
        assert not url.query and not url.fragment
        translations(mod["description"])
        if "promo" in mod:
            media(mod["promo"])
            assert "feature_post" not in mod
        for pic in mod["images"]:
            media(pic); translations(pic["caption"])
    for mod in catalog["mods"]:
        related=mod.get("related_mods",[])
        assert isinstance(related,list) and len(related)==len(set(related))
        assert all(slug in seen and slug!=mod["slug"] for slug in related)
    assert isinstance(posts,list)
    seen=set()
    for post in posts:
        assert set(post)=={"slug","date","mod","translations","artwork"}
        assert SLUG.fullmatch(post["slug"]) and post["slug"] not in seen
        seen.add(post["slug"])
        assert post["mod"] in {m["slug"] for m in catalog["mods"]}
        assert date.fromisoformat(post["date"]).isoformat()==post["date"] and date.fromisoformat(post["date"])<=date.today()
        assert set(post["translations"])==set(langs)
        for body in post["translations"].values():
            assert set(body)=={"title","excerpt","paragraphs"}
            assert all(isinstance(body[k],str) and body[k].strip() for k in ("title","excerpt"))
            assert isinstance(body["paragraphs"],list) and body["paragraphs"] and all(isinstance(p,str) and p.strip() for p in body["paragraphs"])
        for pic in post["artwork"]:
            media(pic); translations(pic["caption"])
    post_index={p["slug"]:p for p in posts}
    for mod in catalog["mods"]:
        if "overview" in mod:
            assert set(mod["overview"])==set(langs)
            assert all(isinstance(v,list) and v and all(isinstance(t,str) and t.strip() for t in v) for v in mod["overview"].values())
        if "feature_post" in mod:
            assert mod["feature_post"] in post_index
            featured=post_index[mod["feature_post"]]
            assert featured["mod"]==mod["slug"] and featured["artwork"]
            assert not mod["images"], "Use a single gallery source for featured mods"
    return catalog,posts

def news_entries(data,langs):
    catalog,posts=data
    names={g["id"]:g["title"] for g in catalog["games"]}
    mods={m["slug"]:m for m in catalog["mods"]}
    return [
        {"id":"gaming-"+p["slug"],"projectId":"game-projects","date":p["date"],"pinned":False,
         "href":"/gaming/news/"+p["slug"]+"/",
         "strings":{l:{"category":names[mods[p["mod"]]["game"]],"title":p["translations"][l]["title"],
                       "summary":p["translations"][l]["excerpt"]} for l in langs}}
        for p in sorted(posts,key=lambda p:(p["date"],p["slug"]),reverse=True)
    ]

def pages(data,langs,head,header,footer,copy,localized):
    catalog,posts=data
    games={g["id"]:g for g in catalog["games"]}
    mods={m["slug"]:m for m in catalog["mods"]}
    result={}
    post_index={p["slug"]:p for p in posts}
    def c(key,fallback):return copy("gaming."+key,fallback)
    def wrap(kind,title,desc,uri,body):
        return head(kind,title+" — K2040",desc,uri)+header(kind)+body+footer()
    def translated(d):
        return "".join(f'<span data-post-locale="{l}">{escape(d[l])}</span>' for l in langs)
    def art(g):
        a=g["art"]
        return f'<img class="game-art" src="{a["src"]}" width="{a["width"]}" height="{a["height"]}" alt="" decoding="async">'
    def button(href,key,fallback,style="action"):
        return f'<a class="{style}" href="{escape(href,quote=True)}">{c(key,fallback)}</a>'
    def modlink(mod):
        return "/gaming/mods/"+mod["slug"]+"/"
    def feature_art(m):
        post=post_index.get(m.get("feature_post"))
        a=post["artwork"][0] if post else m.get("promo")
        if not a:return ""
        return f'<img class="mod-promo" src="{a["src"]}" width="{a["width"]}" height="{a["height"]}" alt="" decoding="async">'
    def modcard(m):
        image=feature_art(m)
        return f'<article class="mod-card">{f'<a class="mod-card-art" href="{modlink(m)}" aria-label="{escape(m["title"],quote=True)}">{image}</a>' if image else ""}<h3><a href="{modlink(m)}">{escape(m["title"])}</a></h3><p>{translated(m["description"])}</p>{button(modlink(m),"details","View mod","text-link")}</article>'
    def gallery(images,kind):
        if not images:return ""
        label=c("screenshots","Screenshots") if kind=="shots" else c("art","Promotional artwork")
        figures=[]
        for pic in images:
            caption=pic["caption"]
            alts=" ".join(f'data-alt-{l.lower()}="{escape(caption[l],quote=True)}"' for l in langs)
            figures.append(f'<figure><a class="gallery-item" href="{pic["src"]}"><img src="{pic["src"]}" width="{pic["width"]}" height="{pic["height"]}" alt="{escape(caption["en"],quote=True)}" {alts} loading="lazy" decoding="async"></a><figcaption>{translated(caption)}</figcaption></figure>')
        return f'<section class="gaming-section" aria-labelledby="gallery-heading"><h2 id="gallery-heading">{label}</h2><div class="gaming-gallery">{"".join(figures)}</div><dialog class="gaming-lightbox" aria-labelledby="gallery-heading"><div class="lightbox-tools"><button type="button" data-gallery-prev class="control">{c("previous","Previous")}</button><button type="button" data-gallery-next class="control">{c("next","Next")}</button><button type="button" data-gallery-close class="control">{c("close","Close")}</button></div><img alt=""><p class="lightbox-caption" aria-live="polite"></p></dialog></section>'
    tiles=[]
    for g in games.values():
        count=sum(m["game"]==g["id"] for m in mods.values())
        tiles.append(f'<a class="game-tile" href="/gaming/mods/#{g["id"]}">{art(g)}<div><h3>{escape(g["title"])}</h3><p>{count} {c("mods","Mods")}</p></div></a>')
    intro=c("intro","Browse my released mods by game. Download the current versions and read installation instructions on Nexus Mods.")
    body=f'''<main id="main" class="shell gaming-main"><section class="hero gaming-hero"><div class="hero__top"><div class="hero__copy"><p class="eyebrow">K2040 / Gaming</p><h1>{c("title","Game mods and tools")}</h1><p class="hero__intro">{intro}</p></div><div class="actions">{button("/gaming/mods/","browse","Browse mods")}</div></div></section>
<section class="gaming-section"><h2>{c("byGame","Browse by game")}</h2><div class="game-tiles">{"".join(tiles)}</div></section>
<section class="gaming-section gaming-news-panel"><div class="section__top"><h2>{c("latest","Latest gaming news")}</h2>{button("/gaming/news/","allNews","All gaming news","text-link")}</div><div class="update-list" data-updates aria-live="polite"></div></section></main>'''
    result["gaming/index.html"]=wrap("gaming","Game mods and tools","Browse released game mods.","/gaming/",body)
    groups=[]
    for g in games.values():
        cards="".join(modcard(m) for m in mods.values() if m["game"]==g["id"])
        groups.append(f'<section id="{g["id"]}" class="gaming-section game-group"><div class="game-group-header">{art(g)}<h2>{escape(g["title"])}</h2></div><div class="mod-grid">{cards}</div></section>')
    body=f'<main id="main" class="shell gaming-main"><header class="page-intro gaming-intro"><p class="eyebrow">K2040 / Gaming</p><h1>{c("released","Released mods")}</h1><p>{intro}</p></header>{"".join(groups)}</main>'
    result["gaming/mods/index.html"]=wrap("gamingMods","Released mods","Browse released game mods.","/gaming/mods/",body)
    for mod in mods.values():
        game=games[mod["game"]]
        desc=mod["description"]["en"]
        title=translated({l:mod["title"] for l in langs})
        featured=post_index.get(mod.get("feature_post"))
        overview="".join(f'<p data-post-locale="{l}">{escape(line)}</p>' for l in langs for line in mod.get("overview",{}).get(l,[]))
        introduction=f'<section class="gaming-section mod-overview">{overview}</section>' if overview else ""
        preview=gallery(featured["artwork"],"art") if featured else gallery(mod["images"],"shots")
        news_link=button("/gaming/news/"+featured["slug"]+"/","news","Gaming news","text-link") if featured else ""
        related="".join(f'<a class="text-link" href="{modlink(mods[slug])}">{escape(mods[slug]["title"])}</a>' for slug in mod.get("related_mods",[]))
        body=f'''<main id="main" class="shell gaming-main"><div class="note-back">{button("/gaming/mods/","back","Back to all mods","text-link")}</div>
<article class="mod-detail"><header class="mod-header">{feature_art(mod) or art(game)}<div class="mod-header-copy"><p class="eyebrow">{escape(game["title"])}</p><h1 data-note-title>{title}</h1><p data-note-summary>{translated(mod["description"])}</p>{button(mod["nexus"],"nexus","Open on Nexus Mods")}</div></header>
{introduction}{preview}<section class="gaming-section mod-download"><p>{c("official","For the latest downloads, compatibility, installation instructions and credits, see the official mod page.")}</p><div class="actions">{button(mod["nexus"],"nexus","Open on Nexus Mods")}{news_link}{related}</div></section></article></main>'''
        uri=modlink(mod)
        result[uri.lstrip("/")+"index.html"]=wrap("gamingMod",mod["title"],desc,uri,body)
    body=f'<main id="main" class="shell gaming-main"><header class="page-intro gaming-intro"><p class="eyebrow">K2040 / Gaming</p><h1>{c("news","Gaming news")}</h1></header><section class="gaming-section"><div class="update-list" data-updates aria-live="polite"></div></section></main>'
    result["gaming/news/index.html"]=wrap("gamingNews","Gaming news","New gaming announcements.","/gaming/news/",body)
    for post in posts:
        mod=mods[post["mod"]]
        uri="/gaming/news/"+post["slug"]+"/"
        content="".join(f'<p data-post-locale="{l}">{escape(line)}</p>' for l in langs for line in post["translations"][l]["paragraphs"])
        body=f'''<main id="main" class="shell gaming-main"><div class="note-back">{button("/gaming/news/","allNews","All gaming news","text-link")}</div><article class="note-article"><header class="note-article__header"><p class="eyebrow">{escape(games[mod["game"]]["title"])}</p><time datetime="{post["date"]}">{post["date"]}</time><h1 data-note-title>{localized(post,"title")}</h1><p data-note-summary>{localized(post,"excerpt")}</p></header><div class="note-article__body">{content}</div>{gallery(post["artwork"],"art")}<div class="actions">{button(modlink(mod),"details","View mod")}{button(mod["nexus"],"nexus","Open on Nexus Mods","action action--quiet")}</div></article></main>'''
        result[uri.lstrip("/")+"index.html"]=wrap("gamingArticle",post["translations"]["en"]["title"],post["translations"]["en"]["excerpt"],uri,body)
    return result

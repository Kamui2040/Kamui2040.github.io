(()=>{
  "use strict";
  const root=document.documentElement;
  const themeKey="k2040-theme";
  const languageKey="k2040-language";
  const languages=["en","de","pt-PT","es","fr"];
  const darkQuery=window.matchMedia("(prefers-color-scheme: dark)");
  const read=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
  const write=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
  const storedTheme=read(themeKey);
  if(storedTheme==="light"||storedTheme==="dark")root.dataset.theme=storedTheme;

  const normalize=(value)=>{
    if(typeof value!=="string")return null;
    const tag=value.trim().toLowerCase();
    if(tag==="en"||tag.startsWith("en-"))return"en";
    if(tag==="de"||tag.startsWith("de-"))return"de";
    if(tag==="pt"||tag.startsWith("pt-"))return"pt-PT";
    if(tag==="es"||tag.startsWith("es-"))return"es";
    if(tag==="fr"||tag.startsWith("fr-"))return"fr";
    return null;
  };

  const detectLanguage=()=>{
    const hash=normalize(location.hash.slice(1));
    if(hash)return hash;
    const stored=read(languageKey);
    if(languages.includes(stored))return stored;
    const candidates=Array.isArray(navigator.languages)&&navigator.languages.length?navigator.languages:[navigator.language];
    for(const candidate of candidates){const supported=normalize(candidate);if(supported)return supported}
    return"en";
  };

  let language=detectLanguage();
  const dictionary=()=>window.K2040_TRANSLATIONS?.[language]||window.K2040_TRANSLATIONS?.en||{};
  const t=(path)=>{
    let value=dictionary();
    for(const part of path.split(".")){if(!value||typeof value!=="object"||!(part in value))return null;value=value[part]}
    return typeof value==="string"?value:null;
  };
  const localStrings=(entry)=>entry?.strings?.[language]||entry?.strings?.en||{};
  const theme=()=>root.dataset.theme==="light"||root.dataset.theme==="dark"?root.dataset.theme:(darkQuery.matches?"dark":"light");

  const createBrandIcon=(brand)=>{
    const icon=document.createElement("span");
    icon.className=`brand-icon brand-icon--${brand}`;
    icon.setAttribute("aria-hidden","true");
    if(brand==="github"){
      const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("viewBox","0 0 16 16");
      svg.setAttribute("focusable","false");
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("fill","currentColor");
      path.setAttribute("d","M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.77c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z");
      svg.append(path);
      icon.append(svg);
    }else icon.textContent="N";
    return icon;
  };

  const decorateBrandLink=(link)=>{
    const brand=link?.dataset.brand;
    if(!brand)return;
    const currentLabel=[...link.childNodes]
      .filter((node)=>!(node.nodeType===1&&node.classList.contains("brand-icon")))
      .map((node)=>node.textContent)
      .join("").trim();
    const label=currentLabel||link.dataset.brandLabel;
    if(!label)return;
    link.dataset.brandLabel=label;
    link.classList.add("brand-link",`brand-link--${brand}`);
    link.replaceChildren(createBrandIcon(brand),document.createTextNode(label));
  };

  const decorateBrandLinks=()=>document.querySelectorAll("a[data-brand]").forEach(decorateBrandLink);

  const updateThemeButton=(button)=>{
    if(!button)return;
    const next=theme()==="dark"?"light":"dark";
    const icon=button.querySelector(".theme-toggle-icon");
    const label=button.querySelector("[data-theme-label]");
    button.setAttribute("aria-pressed",String(theme()==="dark"));
    button.setAttribute("aria-label",t(next==="dark"?"controls.switchToDark":"controls.switchToLight")||"");
    if(icon)icon.textContent=next==="dark"?"☾":"☀";
    if(label)label.textContent=t(next==="dark"?"controls.dark":"controls.light")||"";
  };

  const translateStatic=()=>{
    root.lang=language;
    root.dataset.language=language;
    if(!document.body.classList.contains("project-detail-page")){
      document.title=t("meta.title")||"K2040 Projects";
      const meta=document.querySelector('meta[name="description"]');
      if(meta)meta.content=t("meta.description")||meta.content;
    }
    document.querySelectorAll("[data-i18n]").forEach((el)=>{const value=t(el.dataset.i18n);if(value)el.textContent=value});
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el)=>{const value=t(el.dataset.i18nAriaLabel);if(value)el.setAttribute("aria-label",value)});
    document.querySelectorAll("[data-i18n-alt]").forEach((el)=>{const value=t(el.dataset.i18nAlt);if(value)el.setAttribute("alt",value)});
    const select=document.querySelector("[data-language-select]");
    if(select)select.value=language;
  };

  const renderProjects=()=>{
    const grid=document.querySelector("[data-project-grid]");
    const template=document.querySelector("#project-card-template");
    if(!grid||!template)return;
    grid.replaceChildren();
    for(const project of window.K2040_CONTENT?.projects||[]){
      const strings=localStrings(project);
      const fragment=template.content.cloneNode(true);
      const article=fragment.querySelector(".project-card");
      const artwork=fragment.querySelector("[data-project-art]");
      if(artwork){
        article.classList.add("project-card--visual");
        if(project.image){
          const image=document.createElement("img");
          image.src=project.image;
          image.alt="";
          image.loading="lazy";
          image.decoding="async";
          artwork.append(image);
        }
      }
      fragment.querySelector("[data-project-label]").textContent=strings.label||"";
      fragment.querySelector("[data-project-title]").textContent=strings.title||"";
      fragment.querySelector("[data-project-description]").textContent=strings.description||"";
      const meta=fragment.querySelector("[data-project-meta]");
      if(meta&&project.cardMeta?.length){
        const tagKeys={Linux:"linux",Gameplay:"gameplay",Windows:"windows",Tools:"tools",AiO:"aio","Single patches":"singlePatches",Released:"released"};
        meta.replaceChildren(...project.cardMeta.map((item)=>{
          const tag=document.createElement("span");
          tag.textContent=t(`tags.${tagKeys[item]||""}`)||item;
          return tag;
        }));
      }
      fragment.querySelector("[data-project-status]").textContent=t(project.available?"status.available":"status.planned")||"";
      fragment.querySelector("[data-project-action]").textContent=t(project.available?"actions.open":"actions.planned")||"";
      if(project.image&&!artwork){
        article.classList.add("project-card--artwork");
        article.replaceChildren();
        const image=document.createElement("img");
        image.src=project.image;
        image.alt=`${strings.title||"Project"} project card`;
        image.loading="lazy";
        image.decoding="async";
        article.append(image);
      }
      if(project.available&&project.href){
        const link=document.createElement("a");
        for(const attribute of article.attributes)link.setAttribute(attribute.name,attribute.value);
        link.href=project.href;
        link.setAttribute("aria-label",strings.title||"Open project");
        link.append(...article.childNodes);
        article.replaceWith(link);
      }else article.setAttribute("aria-disabled","true");
      grid.append(fragment);
    }
  };

  const updateTime=(update)=>{
    const value=Date.parse(`${update?.date||""}T00:00:00Z`);
    return Number.isNaN(value)?null:value;
  };

  const sortedUpdates=()=>[...(window.K2040_CONTENT?.updates||[])]
    .map((update,index)=>({update,index,time:updateTime(update)}))
    .sort((left,right)=>{
      if(left.time===null&&right.time===null)return left.index-right.index;
      if(left.time===null)return 1;
      if(right.time===null)return-1;
      if(left.time!==right.time)return right.time-left.time;
      return left.index-right.index;
    })
    .map(({update})=>update);

  const renderUpdates=()=>{
    const list=document.querySelector("[data-update-list]");
    const template=document.querySelector("#update-card-template");
    if(!list||!template)return;
    list.replaceChildren();
    for(const update of sortedUpdates()){
      const strings=localStrings(update);
      const fragment=template.content.cloneNode(true);
      const time=fragment.querySelector("[data-update-date]");
      time.dateTime=update.date;
      time.textContent=new Intl.DateTimeFormat(language,{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(`${update.date}T00:00:00Z`));
      fragment.querySelector("[data-update-category]").textContent=strings.category||"";
      fragment.querySelector("[data-update-title]").textContent=strings.title||"";
      fragment.querySelector("[data-update-summary]").textContent=strings.summary||"";
      const link=fragment.querySelector("[data-update-link]");
      if(update.href){link.href=update.href;link.dataset.brand="nexus";link.textContent="Nexus Mods";decorateBrandLink(link)}else link.remove();
      list.append(fragment);
    }
  };

  let screenshotDialog;
  let screenshotTrigger;
  const openScreenshot=(screenshot,trigger)=>{
    if(!screenshotDialog){
      screenshotDialog=document.createElement("dialog");
      screenshotDialog.className="screenshot-dialog";
      const close=document.createElement("button");
      close.type="button";
      close.className="screenshot-dialog-close";
      close.setAttribute("aria-label",t("detail.closeScreenshot")||"Close full-screen screenshot");
      close.textContent="×";
      const image=document.createElement("img");
      image.className="screenshot-dialog-image";
      screenshotDialog.append(close,image);
      close.addEventListener("click",()=>screenshotDialog.close());
      screenshotDialog.addEventListener("click",(event)=>{if(event.target===screenshotDialog)screenshotDialog.close()});
      screenshotDialog.addEventListener("close",()=>{screenshotTrigger?.focus();screenshotTrigger=null});
      document.body.append(screenshotDialog);
    }
    const image=screenshotDialog.querySelector("img");
    image.src=screenshot.src;
    image.alt=screenshot.alt||"Project screenshot";
    screenshotTrigger=trigger;
    screenshotDialog.showModal();
    screenshotDialog.querySelector("button").focus();
  };

  const renderScreenshots=()=>{
    const section=document.querySelector("[data-project-screenshots]");
    const grid=document.querySelector("[data-screenshot-grid]");
    const screenshots=window.K2040_PROJECT?.screenshots;
    if(!section||!grid||!Array.isArray(screenshots)||screenshots.length===0)return;
    grid.replaceChildren();
    for(const screenshot of screenshots){
      if(!screenshot?.src)continue;
      const figure=document.createElement("figure");
      const image=document.createElement("img");
      image.src=screenshot.src;
      image.alt=screenshot.alt||"Project screenshot";
      image.loading="lazy";
      image.decoding="async";
      const button=document.createElement("button");
      button.type="button";
      button.className="screenshot-open";
      button.setAttribute("aria-label",`${t("detail.openFullSize")||"Open full size"}: ${screenshot.caption||image.alt}`);
      button.append(image);
      button.addEventListener("click",()=>openScreenshot(screenshot,button));
      figure.append(button);
      if(screenshot.caption){const caption=document.createElement("figcaption");caption.textContent=screenshot.caption;figure.append(caption)}
      grid.append(figure);
    }
    if(grid.childElementCount)section.hidden=false;
  };

  const initProjectMenu=()=>{
    const menu=document.querySelector("[data-project-menu]");
    if(!menu)return;
    const summary=menu.querySelector("summary");
    const menuPanel=menu.querySelector(".project-menu-panel");
    const modsPanel=menu.querySelector(".project-menu-mods");
    const buttons=[...menu.querySelectorAll("[data-project-game-button]")];
    const panels=[...menu.querySelectorAll("[data-project-game-panel]")];
    let layoutFrame=0;
    let desktopLayout=window.innerWidth>1100;
    const updateDirection=()=>{
      cancelAnimationFrame(layoutFrame);
      layoutFrame=requestAnimationFrame(()=>{
        if(!menu.open||!summary||!menuPanel||!modsPanel)return;
        menuPanel.style.setProperty("--project-menu-shift","0px");
        menu.classList.remove("project-menu--flip");
        const availableHeight=Math.max(120,window.innerHeight-menuPanel.getBoundingClientRect().top-8);
        menuPanel.style.setProperty("--project-menu-max-height",`${Math.round(availableHeight)}px`);
        const modsVisible=!modsPanel.hidden;
        if(window.innerWidth>1100){
          const trigger=summary.getBoundingClientRect();
          const firstWidth=menuPanel.offsetWidth||220;
          const secondWidth=modsVisible?(modsPanel.offsetWidth||280):0;
          const gap=modsVisible?9:0;
          const margin=16;
          const fitsRight=trigger.left+firstWidth+gap+secondWidth<=window.innerWidth-margin;
          const fitsLeft=trigger.right-firstWidth-gap-secondWidth>=margin;
          menu.classList.toggle("project-menu--flip",!fitsRight&&fitsLeft);
        }
        requestAnimationFrame(()=>{
          const panelRect=menuPanel.getBoundingClientRect();
          const modsRect=modsVisible?modsPanel.getBoundingClientRect():null;
          const margin=8;
          const left=modsRect?Math.min(panelRect.left,modsRect.left):panelRect.left;
          const right=modsRect?Math.max(panelRect.right,modsRect.right):panelRect.right;
          let shift=0;
          if(right>window.innerWidth-margin)shift=window.innerWidth-margin-right;
          if(left+shift<margin)shift+=margin-(left+shift);
          menuPanel.style.setProperty("--project-menu-shift",`${Math.round(shift)}px`);
        });
      });
    };
    const selectGame=(game)=>{
      modsPanel.hidden=false;
      buttons.forEach((button)=>button.setAttribute("aria-selected",String(button.dataset.projectGameButton===game)));
      panels.forEach((panel)=>panel.hidden=panel.dataset.projectGamePanel!==game);
      updateDirection();
    };
    const collapseDesktop=()=>{
      buttons.forEach((button)=>button.setAttribute("aria-selected","false"));
      panels.forEach((panel)=>{panel.hidden=true});
      modsPanel.hidden=true;
      updateDirection();
    };
    const restoreNarrow=()=>{
      if(buttons.length===0)return;
      const selected=buttons.find((button)=>button.getAttribute("aria-selected")==="true");
      selectGame((selected||buttons[0]).dataset.projectGameButton);
    };
    buttons.forEach((button)=>button.addEventListener("click",()=>selectGame(button.dataset.projectGameButton)));
    menu.addEventListener("toggle",()=>{
      if(!menu.open){updateDirection();return}
      if(window.innerWidth>1100)collapseDesktop();else restoreNarrow();
    });
    window.addEventListener("resize",()=>{
      const nextDesktop=window.innerWidth>1100;
      if(nextDesktop!==desktopLayout){
        if(nextDesktop&&menu.open)collapseDesktop();
        if(!nextDesktop)restoreNarrow();
        desktopLayout=nextDesktop;
      }
      updateDirection();
    },{passive:true});
  };

  const apply=()=>{translateStatic();renderProjects();renderUpdates();renderScreenshots();decorateBrandLinks();updateThemeButton(document.querySelector("[data-theme-toggle]"))};
  const init=()=>{
    const themeButton=document.querySelector("[data-theme-toggle]");
    const languageSelect=document.querySelector("[data-language-select]");
    apply();
    initProjectMenu();
    themeButton?.addEventListener("click",()=>{const next=theme()==="dark"?"light":"dark";root.dataset.theme=next;write(themeKey,next);updateThemeButton(themeButton)});
    languageSelect?.addEventListener("change",()=>{if(!languages.includes(languageSelect.value))return;language=languageSelect.value;write(languageKey,language);if(normalize(location.hash.slice(1)))history.replaceState(null,"",location.pathname+location.search);apply()});
    const onSystemTheme=()=>{if(!root.dataset.theme)updateThemeButton(themeButton)};
    darkQuery.addEventListener?.("change",onSystemTheme);
    if(!darkQuery.addEventListener)darkQuery.addListener?.(onSystemTheme);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

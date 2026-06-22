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
    document.title=t("meta.title")||"K2040 Projects";
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.content=t("meta.description")||meta.content;
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
      fragment.querySelector("[data-project-label]").textContent=strings.label||"";
      fragment.querySelector("[data-project-title]").textContent=strings.title||"";
      fragment.querySelector("[data-project-description]").textContent=strings.description||"";
      fragment.querySelector("[data-project-status]").textContent=t(project.available?"status.available":"status.planned")||"";
      fragment.querySelector("[data-project-action]").textContent=t(project.available?"actions.open":"actions.planned")||"";
      if(project.available&&project.href){
        const link=document.createElement("a");
        for(const attribute of article.attributes)link.setAttribute(attribute.name,attribute.value);
        link.href=project.href;
        link.append(...article.childNodes);
        article.replaceWith(link);
      }else article.setAttribute("aria-disabled","true");
      grid.append(fragment);
    }
  };

  const renderUpdates=()=>{
    const list=document.querySelector("[data-update-list]");
    const template=document.querySelector("#update-card-template");
    if(!list||!template)return;
    list.replaceChildren();
    for(const update of window.K2040_CONTENT?.updates||[]){
      const strings=localStrings(update);
      const fragment=template.content.cloneNode(true);
      const time=fragment.querySelector("[data-update-date]");
      time.dateTime=update.date;
      time.textContent=new Intl.DateTimeFormat(language,{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(`${update.date}T00:00:00Z`));
      fragment.querySelector("[data-update-category]").textContent=strings.category||"";
      fragment.querySelector("[data-update-title]").textContent=strings.title||"";
      fragment.querySelector("[data-update-summary]").textContent=strings.summary||"";
      const link=fragment.querySelector("[data-update-link]");
      if(update.href){link.href=update.href;link.textContent=t("actions.readMore")||"Read more"}else link.remove();
      list.append(fragment);
    }
  };

  const apply=()=>{translateStatic();renderProjects();renderUpdates();updateThemeButton(document.querySelector("[data-theme-toggle]"))};
  const init=()=>{
    const themeButton=document.querySelector("[data-theme-toggle]");
    const languageSelect=document.querySelector("[data-language-select]");
    apply();
    themeButton?.addEventListener("click",()=>{const next=theme()==="dark"?"light":"dark";root.dataset.theme=next;write(themeKey,next);updateThemeButton(themeButton)});
    languageSelect?.addEventListener("change",()=>{if(!languages.includes(languageSelect.value))return;language=languageSelect.value;write(languageKey,language);apply()});
    const onSystemTheme=()=>{if(!root.dataset.theme)updateThemeButton(themeButton)};
    darkQuery.addEventListener?.("change",onSystemTheme);
    if(!darkQuery.addEventListener)darkQuery.addListener?.(onSystemTheme);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

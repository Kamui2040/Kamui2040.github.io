/* Optional fullscreen presentation and compact, spoiler-aware contextual previews. */
(() => {
  "use strict";
  const body=document.body, root=document.documentElement;
  if(body.dataset.page!=="fictionReader")return;
  const $=s=>document.querySelector(s);
  let callbacks, active=false, nativeFullscreen=false, busy=false;
  let previewTarget=null, previewTimer=0, topDock, headerSlot, toolbarSlot, topTab, bottomTab;
  const header=$(".reader-chrome"), toolbar=$(".reader-toolbar"), bottom=$(".reader-bottom-dock"), toggle=$("#reader-fullscreen");
  const preview=document.createElement("aside");
  preview.id="reader-quick-view";preview.className="reader-quick-view";preview.setAttribute("role","tooltip");preview.hidden=true;
  body.append(preview);
  function hidePreview(){
    clearTimeout(previewTimer);previewTimer=0;
    if(previewTarget)previewTarget.removeAttribute("aria-describedby");
    previewTarget=null;preview.hidden=true;preview.replaceChildren();
  }
  function showPreview(target){
    if(!target.isConnected||callbacks.isBusy()||target.closest("[inert]")){hidePreview();return;}
    const entry=callbacks.lookup(target.dataset.entry);
    if(!entry){hidePreview();return;}
    const title=document.createElement("strong");title.textContent=entry.title;
    const summary=document.createElement("p");summary.textContent=entry.summary;
    preview.replaceChildren(title);
    if(entry.fullName&&entry.fullName!==entry.title){
      const name=document.createElement("small");name.textContent=entry.fullName;preview.append(name);
    }
    preview.append(summary);preview.hidden=false;
    target.setAttribute("aria-describedby",preview.id);
    const r=target.getBoundingClientRect(),box=preview.getBoundingClientRect(),gap=10;
    const x=Math.max(8,Math.min(innerWidth-box.width-8,r.left+(r.width-box.width)/2));
    const preferred=r.top-box.height-gap;
    const y=preferred>=8?preferred:Math.max(8,Math.min(innerHeight-box.height-8,r.bottom+gap));
    preview.style.left=x+"px";preview.style.top=y+"px";
  }
  function schedulePreview(target,delay){
    if(previewTarget===target)return;
    hidePreview();previewTarget=target;
    previewTimer=setTimeout(()=>showPreview(target),delay);
  }
  function localize(){
    if(!callbacks)return;
    toggle.textContent=callbacks.translate(active?"exitFullscreen":"fullscreen");
    toggle.setAttribute("aria-pressed",String(active));
    topTab?.setAttribute("aria-label",callbacks.translate("topControls"));
    bottomTab?.setAttribute("aria-label",callbacks.translate("bottomControls"));
  }
  function setDock(which,show){
    body.classList.toggle("reader-show-"+which,show);
  }
  function revealAt(event){
    if(!active||event.pointerType==="touch")return;
    const target=event.target;
    if(!(target instanceof Element))return;
    const top=event.clientY<=28||topDock.contains(target);
    const low=event.clientY>=innerHeight-28||bottom.contains(target);
    setDock("top",top);setDock("bottom",low);
  }
  function edgeTab(which){
    const b=document.createElement("button");
    b.type="button";b.className="reader-edge-tab reader-edge-"+which;
    b.textContent=which==="top"?"⌄":"⌃";
    b.addEventListener("click",e=>{
      e.stopPropagation();hidePreview();
      const show=!body.classList.contains("reader-show-"+which);
      setDock(which,show);
      if(show)setDock(which==="top"?"bottom":"top",false);
    });
    return b;
  }
  function setImmersive(next){
    if(active===next)return;
    hidePreview();window.LibraryPageTurn?.cancel();
    active=next;
    if(active){
      // Keep the original nodes, handlers, language selector and preferences.
      // Place them in a non-layout-affecting dock only while immersive.
      headerSlot=document.createComment("reader-header");
      toolbarSlot=document.createComment("reader-toolbar");
      header.before(headerSlot);toolbar.before(toolbarSlot);
      topDock=document.createElement("div");topDock.className="reader-top-dock";
      topDock.append(header,toolbar);body.prepend(topDock);
      topTab=edgeTab("top");bottomTab=edgeTab("bottom");
      body.append(topTab,bottomTab);
    }else{
      headerSlot.replaceWith(header);toolbarSlot.replaceWith(toolbar);
      topDock.remove();topTab.remove();bottomTab.remove();
      topDock=topTab=bottomTab=null;
    }
    body.classList.toggle("reader-immersive",active);
    setDock("top",false);setDock("bottom",false);
    localize();
    toggle.blur();
    callbacks.relayout();
  }
  async function changeFullscreen(){
    if(busy)return;
    busy=true;
    try{
      if(active){
        if(document.fullscreenElement){await document.exitFullscreen();}
        setImmersive(false);nativeFullscreen=false;
      }else{
        // Request native fullscreen from the user's click. The CSS-only
        // immersive fallback remains usable on browsers that disallow it.
        if(root.requestFullscreen){
          try{await root.requestFullscreen();nativeFullscreen=!!document.fullscreenElement;}catch{nativeFullscreen=false;}
        }
        setImmersive(true);
      }
    }finally{busy=false;}
  }
  function init(options){
    callbacks=options;localize();
    toggle.addEventListener("click",changeFullscreen);
    document.addEventListener("fullscreenchange",()=>{
      if(document.fullscreenElement===root){nativeFullscreen=true;setImmersive(true);}
      else if(nativeFullscreen){nativeFullscreen=false;setImmersive(false);}
    });
    document.addEventListener("pointermove",revealAt,{passive:true});
    document.addEventListener("pointerout",event=>{if(active&&event.pointerType!=="touch"&&!event.relatedTarget){setDock("top",false);setDock("bottom",false);}});
    document.addEventListener("pointerdown",event=>{
      hidePreview();
      if(active&&event.target instanceof Element&&!event.target.closest(".reader-top-dock,.reader-bottom-dock,.reader-edge-tab")){
        setDock("top",false);setDock("bottom",false);
      }
    },true);
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"){
        hidePreview();
        if(active&&!document.fullscreenElement&&!$("#fiction-entry-dialog").open){
          setImmersive(false);event.preventDefault();
        }
      }
    });
    const pages=$("#reader-pages");
    pages.addEventListener("pointerover",event=>{
      if(event.pointerType!=="mouse"&&event.pointerType!=="pen")return;
      const term=event.target.closest?.(".reader-inline-ref");
      if(term&&!term.contains(event.relatedTarget))schedulePreview(term,300);
    });
    pages.addEventListener("pointerout",event=>{
      if(previewTarget&&!previewTarget.contains(event.relatedTarget))hidePreview();
    });
    pages.addEventListener("focusin",event=>{
      const term=event.target.closest?.(".reader-inline-ref");
      if(term&&term.matches(":focus-visible"))schedulePreview(term,150);
    });
    pages.addEventListener("focusout",event=>{if(previewTarget&&!previewTarget.contains(event.relatedTarget))hidePreview();});
    document.addEventListener("scroll",hidePreview,true);
    window.addEventListener("resize",hidePreview);
    // Remove any displayed content if the referenced paragraph is replaced.
    new MutationObserver(()=>{if(previewTarget&&!previewTarget.isConnected)hidePreview();}).observe(pages,{childList:true,subtree:true});
  }
  window.LibraryReadingView=Object.freeze({init,hidePreview,localize});
})();

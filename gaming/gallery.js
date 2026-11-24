/* Accessible enhancement of ordinary full-image links. */
(() => {
  "use strict";
  const dialog=document.querySelector(".gaming-lightbox");
  const links=[...document.querySelectorAll(".gallery-item")];
  if (!dialog || !links.length || typeof dialog.showModal!=="function") return;
  const image=dialog.querySelector("img"), caption=dialog.querySelector(".lightbox-caption");
  let index=0, opener=null;
  const prev=dialog.querySelector("[data-gallery-prev]"), next=dialog.querySelector("[data-gallery-next]");
  const close=dialog.querySelector("[data-gallery-close]");
  const show=i=>{
    index=(i+links.length)%links.length;
    const link=links[index], source=link.querySelector("img");
    image.src=link.href; image.alt=source.alt; caption.textContent=source.alt;
  };
  prev.disabled=next.disabled=links.length<2;
  links.forEach((link,i)=>link.addEventListener("click",e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
    e.preventDefault(); opener=link; show(i); dialog.showModal(); close.focus();
  }));
  prev.addEventListener("click",()=>show(index-1));
  next.addEventListener("click",()=>show(index+1));
  close.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();show(index+(e.key==="ArrowLeft"?-1:1));}
  });
  dialog.addEventListener("close",()=>{image.removeAttribute("src");opener?.focus();});
})();

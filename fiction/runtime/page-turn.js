/* Soft physical paper turn: transient, inert visual layer; commit only at completion. */
(() => {
  "use strict";
  const spread = document.querySelector("#reader-pages");
  if (!spread) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTurn = null;
  let turnToken = 0;

  const clonePage = (source, face) => {
    const clone = source.cloneNode(true);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach(child => child.removeAttribute("id"));
    for (const node of [clone, ...clone.querySelectorAll("[data-anchor], [data-anchor-ref]")]) {
      node.removeAttribute("data-anchor");
      node.removeAttribute("data-anchor-ref");
    }
    clone.classList.add("reader-page-turn-" + face);
    clone.inert = true;
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };

  const dispose = turn => {
    turn.animations.forEach(animation => animation.cancel());
    spread.classList.remove("is-page-turning");
    turn.layer.remove();
    turn.inertStates.forEach(([node, previous]) => { node.inert = previous; });
  };

  const clearTurn = () => {
    turnToken++;
    if (!activeTurn) return;
    const turn = activeTurn;
    activeTurn = null;
    dispose(turn);
    turn.rollback();
  };

  const finishTurn = prepared => {
    if (prepared.token !== turnToken || activeTurn?.layer !== prepared.layer) return;
    const turn = activeTurn;
    activeTurn = null;
    try { prepared.commit(); }
    finally { dispose(turn); }
  };

  const playPreparedTurn = (prepared) => {
    if (!prepared.layer.isConnected || prepared.token !== turnToken || activeTurn?.layer !== prepared.layer) return;

    const directionSign = prepared.direction < 0 ? 1 : -1;
    const duration = 1020;
    const turnEasing = "cubic-bezier(.22,.08,.18,1)";

    const sheetAnimation = prepared.sheet.animate([
      {
        offset: 0,
        transform: "translateZ(0) rotateY(0deg) skewY(0deg) scaleX(1)",
        boxShadow: "0 0 0 rgba(0,0,0,0)"
      },
      {
        offset: 0.12,
        transform: `translateZ(4px) rotateY(${directionSign * 5}deg) skewY(${directionSign * .5}deg) scaleX(.999)`,
        boxShadow: "0 4px 6px rgba(0,0,0,.06)"
      },
      {
        offset: 0.28,
        transform: `translateZ(12px) rotateY(${directionSign * 20}deg) skewY(${directionSign * 1.1}deg) scaleX(.994)`,
        boxShadow: "0 8px 12px rgba(0,0,0,.11)"
      },
      {
        offset: 0.47,
        transform: `translateZ(24px) rotateY(${directionSign * 54}deg) skewY(${directionSign * 1.5}deg) scaleX(.986)`,
        boxShadow: "0 14px 20px rgba(0,0,0,.18)"
      },
      {
        offset: 0.63,
        transform: `translateZ(32px) rotateY(${directionSign * 92}deg) skewY(${directionSign * .7}deg) scaleX(.98)`,
        boxShadow: "0 17px 24px rgba(0,0,0,.21)"
      },
      {
        offset: 0.79,
        transform: `translateZ(23px) rotateY(${directionSign * 130}deg) skewY(${directionSign * -.45}deg) scaleX(.987)`,
        boxShadow: "0 12px 17px rgba(0,0,0,.15)"
      },
      {
        offset: 0.92,
        transform: `translateZ(10px) rotateY(${directionSign * 160}deg) skewY(${directionSign * -.2}deg) scaleX(.996)`,
        boxShadow: "0 6px 9px rgba(0,0,0,.08)"
      },
      {
        offset: 1,
        transform: `translateZ(0) rotateY(${directionSign * 180}deg) skewY(0deg) scaleX(1)`,
        boxShadow: "0 0 0 rgba(0,0,0,0)"
      }
    ], {
      duration,
      easing: turnEasing,
      fill: "forwards"
    });

    const frontAnimation = prepared.front.animate([
      { offset: 0, filter: "brightness(1)", opacity: 1 },
      { offset: 0.25, filter: "brightness(1.025)", opacity: 1 },
      { offset: 0.58, filter: "brightness(.97)", opacity: 1 },
      { offset: 0.621, filter: "brightness(.9)", opacity: 1 },
      { offset: 0.622, filter: "brightness(.9)", opacity: 0 },
      { offset: 1, filter: "brightness(.88)", opacity: 0 }
    ], {
      duration,
      easing: turnEasing,
      fill: "forwards"
    });

    const backAnimation = prepared.back.animate([
      { offset: 0, filter: "brightness(.8)", opacity: 0 },
      { offset: 0.58, filter: "brightness(.83)", opacity: 0 },
      { offset: 0.621, filter: "brightness(.86)", opacity: 0 },
      { offset: 0.622, filter: "brightness(.86)", opacity: 1 },
      { offset: 0.82, filter: "brightness(.94)", opacity: 1 },
      { offset: 1, filter: "brightness(1)", opacity: 1 }
    ], {
      duration,
      easing: turnEasing,
      fill: "forwards"
    });

    const edgeAnimation = prepared.edge.animate([
      { offset: 0, transform: "translateZ(2px) rotateY(0deg) scaleX(.22)", opacity: 0, filter: "brightness(1)" },
      { offset: 0.08, transform: `translateZ(5px) rotateY(${directionSign * 8}deg) scaleX(.42)`, opacity: .42, filter: "brightness(1.03)" },
      { offset: 0.22, transform: `translateZ(10px) rotateY(${directionSign * 16}deg) scaleX(.68)`, opacity: .76, filter: "brightness(1.06)" },
      { offset: 0.43, transform: `translateZ(18px) rotateY(${directionSign * 24}deg) scaleX(.94)`, opacity: .94, filter: "brightness(1.08)" },
      { offset: 0.62, transform: `translateZ(22px) rotateY(${directionSign * 18}deg) scaleX(1.06)`, opacity: .9, filter: "brightness(.98)" },
      { offset: 0.79, transform: `translateZ(15px) rotateY(${directionSign * 10}deg) scaleX(.82)`, opacity: .64, filter: "brightness(.93)" },
      { offset: 0.93, transform: `translateZ(7px) rotateY(${directionSign * 4}deg) scaleX(.46)`, opacity: .28, filter: "brightness(.91)" },
      { offset: 1, transform: "translateZ(2px) rotateY(0deg) scaleX(.24)", opacity: 0, filter: "brightness(.91)" }
    ], {
      duration,
      easing: "cubic-bezier(.2,.08,.18,1)",
      fill: "forwards"
    });

    const animations = [sheetAnimation, frontAnimation, backAnimation, edgeAnimation];
    activeTurn.animations = animations;

    Promise.all(animations.map((animation) => animation.finished))
      .then(() => finishTurn(prepared))
      .catch(() => {});

    window.setTimeout(() => {
      finishTurn(prepared);
    }, duration + 180);
  };

  const start = ({direction, source, underlay, reverse, commit}) => {
    if (activeTurn) return true;
    if (reducedMotion.matches || spread.classList.contains("reader-continuous") ||
        !source || typeof source.animate !== "function") return false;

    const token = ++turnToken;
    const sourceRect = source.getBoundingClientRect();
    const spreadRect = spread.getBoundingClientRect();
    const front = clonePage(source, "front");
    const back = clonePage(reverse, "back");
    const layer = document.createElement("div");
    layer.className = "reader-page-turn-layer";
    layer.dataset.turnSide = direction < 0 ? "left" : "right";
    layer.setAttribute("aria-hidden", "true");
    layer.inert = true;
    Object.assign(layer.style, {
      left: (sourceRect.left - spreadRect.left) + "px",
      top: (sourceRect.top - spreadRect.top) + "px",
      width: sourceRect.width + "px",
      height: sourceRect.height + "px"
    });
    const sheet = document.createElement("div");
    sheet.className = "reader-page-turn-sheet";
    sheet.style.transformOrigin = direction < 0 ? "right center" : "left center";
    const edge = document.createElement("span");
    edge.className = "reader-page-turn-edge";
    sheet.append(front, back, edge);
    layer.append(sheet);

    const inertStates = Array.from(spread.children, node => [node, node.inert]);
    const rollback = () => {
      if (underlay.parentNode === spread) underlay.replaceWith(source);
    };
    try {
      inertStates.forEach(([node]) => { node.inert = true; });
      underlay.inert = true;
      underlay.setAttribute("aria-hidden", "true");
      source.replaceWith(underlay);
      spread.append(layer);
      spread.classList.add("is-page-turning");
      activeTurn = {layer, animations: [], rollback, inertStates};
      playPreparedTurn({token, direction, commit, layer, sheet, front, back, edge});
    } catch {
      clearTurn();
      inertStates.forEach(([node, previous]) => { node.inert = previous; });
      rollback();
      layer.remove();
      spread.classList.remove("is-page-turning");
      return false;
    }
    return true;
  };

  window.LibraryPageTurn = Object.freeze({
    start, cancel: clearTurn, get busy() { return Boolean(activeTurn); }
  });
  window.addEventListener("resize", clearTurn);
  reducedMotion.addEventListener("change", clearTurn);
})();

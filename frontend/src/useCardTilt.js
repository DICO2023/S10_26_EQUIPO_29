import {useEffect, useRef} from 'react';

// Keep hover on an inner surface so filtering and entrance transforms stay independent.
export function useCardTilt() {
 const ref = useRef(null);
 useEffect(() => {
  const card = ref.current;
  const surface = card.querySelector('.card-surface');
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let frame = 0;
  let x = .5, y = .5;
  const reset = () => {
   cancelAnimationFrame(frame);
   frame = 0;
   surface.removeAttribute('data-hover');
   surface.style.removeProperty('transform');
  };
  const move = event => {
   if (!enabled.matches || event.pointerType === 'touch' || card.dataset.exiting === 'true') return;
   const bounds = card.getBoundingClientRect();
   x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
   y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
   if (frame) return;
   frame = requestAnimationFrame(() => {
    frame = 0;
    surface.dataset.hover = 'true';
    surface.style.transform = `perspective(1100px) rotateX(${( .5-y)*4}deg) rotateY(${(x-.5)*4}deg)`;
    surface.style.setProperty('--glare-x', `${x*100}%`);
    surface.style.setProperty('--glare-y', `${y*100}%`);
   });
  };
  const visibility = () => { if (document.hidden) reset(); };
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', reset);
  card.addEventListener('pointercancel', reset);
  enabled.addEventListener('change', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', reset, {passive:true});
  document.addEventListener('visibilitychange', visibility);
  return () => {
   reset();
   card.removeEventListener('pointermove', move);
   card.removeEventListener('pointerleave', reset);
   card.removeEventListener('pointercancel', reset);
   enabled.removeEventListener('change', reset);
   window.removeEventListener('blur', reset);
   window.removeEventListener('scroll', reset);
   document.removeEventListener('visibilitychange', visibility);
  };
 }, []);
 return ref;
}

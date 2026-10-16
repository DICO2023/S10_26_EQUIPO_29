import {memo, useEffect, useRef} from 'react';
import artwork from './assets/hero-layers.json';

// Original Figma layers, pre-rendered once so animation never recomputes blur.
// Only decorative transforms change; React never renders on animation frames.
export const HeroLights = memo(function HeroLights({inputRef}) {
 const root = useRef(null);
 useEffect(() => {
  const host = root.current;
  const input = inputRef.current;
  const layers = [...host.querySelectorAll('.hero-light-stage img')];
  const burns = [...host.querySelectorAll('.hero-film-burn')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const particles = layers.map(() => ({x:0,y:0,vx:0,vy:0,scale:1,vs:0}));
  let frame = 0, last = 0, time = 0, energy = 0, visible = true, pulse = 0, warmth = 0;
  function excite() {
   if (motion.matches) return;
   energy = Math.min(1, energy + .22);
   pulse++;
   particles.forEach((p,i) => {
    p.vx += Math.sin(i * 2.4 + pulse) * 35;
    p.vy -= 28 + 22 * Math.cos(i * 1.8 + pulse);
   });
  }
  function tick(now) {
   const dt = Math.min((now - (last || now))/1000, .033);
   last = now;
   time += dt * (.45 + energy * .8);
   energy *= Math.exp(-dt * .85);
   warmth += (energy - warmth) * (1 - Math.exp(-dt * 3));
   burns.forEach((burn,i) => {
    burn.style.opacity = (warmth * (i ? .48 : .62)).toFixed(3);
    burn.style.transform = `translate3d(0,${-warmth*18}px,0) scale(${1+warmth*.06})`;
   });
   particles.forEach((p,i) => {
    const phase = i * 1.73;
    const tx = Math.sin(time * .72 + phase) * (16 + energy * 62);
    const ty = Math.cos(time * .61 + phase) * (20 + energy * 76) - energy * 45;
    const ts = 1 + Math.sin(time * 1.3 + phase) * (.025 + energy * .14);
    p.vx += ((tx-p.x)*16-p.vx*5)*dt;
    p.vy += ((ty-p.y)*16-p.vy*5)*dt;
    p.vs += ((ts-p.scale)*22-p.vs*6)*dt;
    p.x += p.vx*dt; p.y += p.vy*dt; p.scale += p.vs*dt;
    layers[i].style.transform = `translate3d(${p.x/artwork[i].width*100}%,${p.y/artwork[i].height*100}%,0) scale(${p.scale})`;
   });
   frame = requestAnimationFrame(tick);
  }
  function sync() {
   cancelAnimationFrame(frame); last=0;
   host.dataset.running=String(!motion.matches && !document.hidden && visible);
   if (motion.matches) {
    energy=0; warmth=0;
    burns.forEach(burn => {burn.style.opacity='0';burn.style.transform='none';});
    layers.forEach(layer => {layer.style.transform='none';});
   } else if (!document.hidden && visible) frame=requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;sync();});
  observer.observe(host);
  input?.addEventListener('input',excite);
  motion.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
  return () => {
   cancelAnimationFrame(frame);observer.disconnect();
   input?.removeEventListener('input',excite);
   motion.removeEventListener('change',sync);
   document.removeEventListener('visibilitychange',sync);
  };
 },[inputRef]);
 return <div ref={root} className="hero-lights" aria-hidden="true"><div className="hero-light-stage">{artwork.map(layer => <img key={layer.src} src={layer.src} alt="" draggable="false" style={{position:'absolute',left:layer.x/1425*100+'%',top:layer.y/625*100+'%',width:layer.width/1425*100+'%',height:layer.height/625*100+'%'}}/>)}</div><div className="hero-film-burn burn-left"/><div className="hero-film-burn burn-right"/></div>;
});

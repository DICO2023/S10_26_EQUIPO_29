import {useLayoutEffect,useRef,useState} from 'react';

export function useAnimatedCatalog(tools){
 const [displayed,setDisplayed]=useState(tools);
 const latest=useRef(tools),positions=useRef(new Map());latest.current=tools;
 const key=tools.map(tool=>tool.name).join('|');
 useLayoutEffect(()=>{
  const grid=document.querySelector('.grid');
  if(!grid)return;
  const cards=[...grid.children],wanted=new Set(latest.current.map(tool=>tool.name));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  let delay=0,removed=false,timer;
  cards.forEach((card,index)=>{
   delete card.dataset.exiting;card.inert=false;
   if(wanted.has(card.getAttribute('aria-label')))return;
   removed=true;
   const rect=card.getBoundingClientRect();
   const onScreen=rect.bottom>0&&rect.top<innerHeight;
   const row=Math.floor(index/columns),rowSize=Math.min(columns,cards.length-row*columns);
   const stagger=onScreen?Math.min(row*60,120)+(rowSize-1-index%columns)*40:0;
   card.style.setProperty('--exit-delay',`${stagger}ms`);
   card.getAnimations().filter(animation=>animation.effect?.getKeyframes().some(frame=>frame.opacity!==undefined)).forEach(animation=>animation.cancel());
   card.dataset.exiting='true';card.inert=true;
   if(onScreen)delay=Math.max(delay,240+stagger);
  });
  const commit=()=>{
   const mounted=new Set(cards.map(card=>card.getAttribute('aria-label')));
   grid.dataset.restoring=String(cards.length>0&&latest.current.some(tool=>!mounted.has(tool.name)));
   positions.current=new Map(cards.filter(card=>wanted.has(card.getAttribute('aria-label'))).map(card=>[card.getAttribute('aria-label'),card.getBoundingClientRect()]));
   setDisplayed(latest.current);
  };
  if(removed&&!motion.matches&&delay)timer=setTimeout(commit,delay);else commit();
  const reduce=()=>{if(motion.matches){clearTimeout(timer);commit();}};
  motion.addEventListener('change',reduce);
  return()=>{clearTimeout(timer);motion.removeEventListener('change',reduce);cards.forEach(card=>{delete card.dataset.exiting;card.inert=false;});};
 },[key]);
 useLayoutEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const animations=[];
  document.querySelectorAll('.grid > .tool-card').forEach(card=>{
   const before=positions.current.get(card.getAttribute('aria-label'));
   if(!before)return;
   const after=card.getBoundingClientRect(),x=before.left-after.left,y=before.top-after.top;
   if(x||y)animations.push(card.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'}));
  });
  positions.current.clear();
  return()=>animations.forEach(animation=>animation.cancel());
 },[displayed]);
 return displayed;
}

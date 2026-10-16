import React, {useLayoutEffect,useRef} from 'react';

export function RevealHeading({as:Tag='h2',text,mobileBreak=false}){
 let offset=0;
 return <Tag className="reveal-heading" aria-label={text}>{text.split(' ').map((word,index)=>{
  const start=offset;offset+=Array.from(word).length+1;
  return <React.Fragment key={index}>{index>0&&(mobileBreak&&index===2?<><br className="mobile-break"/>{' '}</>:' ')}<span className="reveal-word" aria-hidden="true">{Array.from(word).map((letter,i)=><span className="letter-mask" key={i}><span className="reveal-letter" style={{'--letter-delay':`${Math.min(start+i,36)*12}ms`}}>{letter}</span></span>)}</span></React.Fragment>;
 })}</Tag>;
}

export function usePageReveal(contentKey){
 const nextHeadingAt=useRef(0),catalogReadyAt=useRef(0),cardAnimations=useRef(new Set());
 useLayoutEffect(()=>()=>{cardAnimations.current.forEach(animation=>animation.cancel());},[]);
 useLayoutEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const groups=[
   ['.nav > .brand, .nav nav a',60],
   ['.hero-inner > h1, .hero-inner > .intro, .hero-inner > .composer',100],
   ['#catalogo > .section-top h2, #catalogo .search-box, #catalogo .filter-button',0],
   ['.categories > button',35],
   ['.filters > label',45],
   ['.results-meta',0],
   ['.grid > .tool-card',65],
   ['.proposal h2, .proposal > p, .stack > div, .proposal > .architecture, .proposal > .text-link',55],
   ['.empty, .loading, footer > *',65],
  ];
  const targets=[],pendingTargets=[];
  let prepareFrame=0,revealFrame=0,cancelled=false;
  const play=(element,keyframes,options)=>{
   const animation=element.animate(keyframes,options);
   cardAnimations.current.add(animation);
   const release=()=>cardAnimations.current.delete(animation);
   animation.onfinish=release;animation.oncancel=release;
  };
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting);
   const now=performance.now();
   // Establish the title's completion time before scheduling its section.
   for(const {target} of visible){
    if(target.matches('.reveal-heading')&&!motion.matches){
     const delay=Math.max(parseFloat(target.style.getPropertyValue('--reveal-delay'))||0,nextHeadingAt.current-now);
     target.style.setProperty('--reveal-delay',`${delay}ms`);
     nextHeadingAt.current=now+delay+300;
     if(target.closest('#catalogo')){
      catalogReadyAt.current=now+delay+160;
     }
    }
   }
   const grid=document.querySelector('.grid');
   const columns=grid?getComputedStyle(grid).gridTemplateColumns.split(' ').length:1;
   const cards=grid?[...grid.children]:[];
   const visibleCards=visible.filter(({target})=>target.matches('.tool-card'));
   const firstRow=visibleCards.length?Math.min(...visibleCards.map(({target})=>Math.floor(cards.indexOf(target)/columns))):0;
   for(const {target} of visible){
    if(target.closest('#catalogo')&&!target.matches('.reveal-heading')&&!motion.matches){
     let offset=0,stagger=parseFloat(target.style.getPropertyValue('--reveal-delay'))||0;
     if(target.matches('.search-box'))offset=0;
     else if(target.matches('.filter-button'))offset=40;
     else if(target.matches('.categories > button'))offset=70;
     else if(target.matches('.results-meta'))offset=100;
     else if(target.matches('.tool-card')){
      const index=cards.indexOf(target);
      const row=Math.floor(index/columns);
      stagger=(row-firstRow)*(columns*65+45)+(index%columns)*65;
      offset=140;
     }
     target.style.setProperty('--reveal-delay',`${Math.max(0,catalogReadyAt.current+offset-now)+stagger}ms`);
    }
    target.dataset.reveal='visible';observer.unobserve(target);
    if(target.matches('.tool-card')&&!motion.matches){
     // Explicit keyframes avoid browser coalescing the mount and reveal styles.
     const from='0 -20px';
     play(target,[{opacity:0,translate:from},{opacity:1,translate:'0 0'}],{
      duration:520,delay:(parseFloat(target.style.getPropertyValue('--reveal-delay'))||0)+(grid?.dataset.restoring==='true'?140:0),
      easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'
     });
    }else if(!motion.matches){
     const delay=parseFloat(target.style.getPropertyValue('--reveal-delay'))||0;
     if(target.matches('.reveal-heading')){
      target.querySelectorAll('.reveal-letter').forEach(letter=>play(letter,
       [{transform:'translateY(115%)'},{transform:'translateY(0)'}],
       {duration:520,delay:delay+(parseFloat(letter.style.getPropertyValue('--letter-delay'))||0),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
     }else{
      play(target,[{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],
       {duration:580,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
     }
    }
   }
  },{threshold:.08});
  for(const [selector,step] of groups)document.querySelectorAll(selector).forEach((el,i)=>{
   targets.push(el);
   if(el.dataset.reveal==='visible')return;
   el.style.setProperty('--reveal-delay',`${Math.min(i*step,260)}ms`);
   el.dataset.reveal=motion.matches?'visible':'pending';
   if(!motion.matches){
    pendingTargets.push(el);
   }
  });
  // Reveal the app only after every entrance target has its initial state.
  document.getElementById('root').removeAttribute('data-reveal-boot');
  // Paint the hidden state before observing any new reveal target, including
  // headings on initial load and cards restored after filtering.
  if(pendingTargets.length)document.fonts.ready.then(()=>{
   if(cancelled)return;
   prepareFrame=requestAnimationFrame(()=>{
    revealFrame=requestAnimationFrame(()=>pendingTargets.forEach(el=>{
     if(el.isConnected&&el.dataset.reveal==='pending')observer.observe(el);
    }));
   });
  });
  const showFocused=e=>{const el=e.target.closest('[data-reveal]');if(el){cardAnimations.current.forEach(animation=>{if(el.contains(animation.effect?.target))animation.cancel();});el.dataset.reveal='visible';el.style.setProperty('--reveal-delay','0ms');observer.unobserve(el);}};
  const reduce=()=>{if(motion.matches){targets.forEach(el=>el.dataset.reveal='visible');cardAnimations.current.forEach(animation=>animation.cancel());observer.disconnect();}};
  document.addEventListener('focusin',showFocused);motion.addEventListener('change',reduce);
  return()=>{cancelled=true;cancelAnimationFrame(prepareFrame);cancelAnimationFrame(revealFrame);observer.disconnect();document.removeEventListener('focusin',showFocused);motion.removeEventListener('change',reduce);};
 },[contentKey]);
}

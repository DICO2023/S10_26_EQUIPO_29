import {captureCover,animateCover,bounds} from './coverTransition';
import {useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
const readId=()=>location.hash.startsWith('#herramienta/')?location.hash.slice(13):null;
const ease='cubic-bezier(.22,1,.36,1)';
export function useToolNavigation(){
 const [id,setId]=useState(readId);
 const current=useRef(id),saved=useRef({y:0,focus:null}),busy=useRef(false),cleanup=useRef(()=>{});
 function change(next){
  if(next===current.current)return;
  cleanup.current();
  const opening=next!==null;
  const source=opening?document.querySelector(`[data-tool-id="${CSS.escape(next)}"] .tool-card-intro`):document.querySelector('.detail-cover');
  const sourceRect=source?bounds(source):null;
  const start=captureCover(source);
  const previousView=document.querySelector(current.current===null?'#landing-view':'.tool-detail');
  const backdrop=previousView?.cloneNode(true);
  const previousRect=previousView?bounds(previousView):null;
  const sourceVisible=sourceRect&&sourceRect.top<innerHeight&&sourceRect.top+sourceRect.height>66;
  if(opening&&current.current===null)saved.current={y:scrollY,focus:document.activeElement};
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
  current.current=next;
  flushSync(()=>setId(next));
  window.scrollTo({top:opening?0:saved.current.y,behavior:'instant'});
  const target=opening?document.querySelector('.detail-cover'):document.querySelector(`[data-tool-id="${CSS.escape(source?.dataset.toolId||'')}"] .tool-card-intro`);
  const targetRect=target?bounds(target):null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations=[];let disposeCover=()=>{};
  let finished=false;
  busy.current=true;
  const finish=()=>{
   if(finished)return;finished=true;
   animations.forEach(a=>a.cancel());disposeCover();backdrop?.remove();
   if(target)target.style.visibility='';
   busy.current=false;
   if(opening)document.querySelector('#detail-title')?.focus({preventScroll:true});
   else if(saved.current.focus?.isConnected)saved.current.focus.focus({preventScroll:true});
  };
  cleanup.current=finish;
  if(!reduced&&start&&sourceVisible&&targetRect&&targetRect.top<innerHeight&&targetRect.top+targetRect.height>66){
   // Keep the outgoing screen in place while its cover grows out of it.
   if(backdrop&&previousRect){
    backdrop.removeAttribute('id');backdrop.removeAttribute('hidden');backdrop.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    backdrop.setAttribute('aria-hidden','true');backdrop.inert=true;
    backdrop.classList.add('transition-backdrop');
    Object.assign(backdrop.style,{position:'fixed',left:`${previousRect.left}px`,top:`${previousRect.top}px`,width:`${previousRect.width}px`,zIndex:'4',pointerEvents:'none',margin:'0'});
    document.body.append(backdrop);
    const a=backdrop.animate([{opacity:1},{opacity:0}],{duration:opening?420:340,delay:80,easing:ease,fill:'both'});animations.push(a);
   }
   disposeCover=animateCover(start,captureCover(target),target,{opening,onFinish:finish});
  }else if(!reduced){
   const view=document.querySelector(opening?'.tool-detail':'#landing-view');
   const a=view?.animate([{opacity:0},{opacity:1}],{duration:180,easing:ease});
   if(a){animations.push(a);a.finished.then(finish).catch(()=>{});}else finish();
  }else finish();
  if(opening&&!reduced){
   const body=document.querySelector('.detail-body');
   body?.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,delay:sourceVisible?380:0,easing:ease,fill:'backwards'});
  }
 }
 useEffect(()=>{
  const sync=()=>change(readId());
  window.addEventListener('hashchange',sync);
  return()=>{window.removeEventListener('hashchange',sync);cleanup.current();};
 },[]);
 function open(next,focus){
  if(busy.current)return;
  focus?.focus({preventScroll:true});
  history.pushState({...history.state,openbridgeDetail:true},'',`#herramienta/${next}`);change(next);
 }
 function back(){
  if(busy.current)return;
  if(history.state?.openbridgeDetail)history.back();
  else {history.replaceState(null,'','#catalogo');change(null);requestAnimationFrame(()=>document.querySelector('#catalogo')?.scrollIntoView());}
 }
 function toLanding(hash){
  if(busy.current)return;
  history.pushState(null,'',hash);change(null);
  requestAnimationFrame(()=>document.querySelector(hash)?.scrollIntoView({behavior:'instant'}));
 }
 return {id,open,back,toLanding};
}

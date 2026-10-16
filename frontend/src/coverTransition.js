const easing='cubic-bezier(.22,1,.36,1)';
export const bounds=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};};
const geometry=r=>({left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
function textStyle(el){const s=getComputedStyle(el);return {fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,fontStyle:s.fontStyle,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,color:s.color};}
export function captureCover(el){
 if(!el)return null;
 const style=getComputedStyle(el),items=[];
 function add(key,node){if(!node)return;const s=getComputedStyle(node),r=bounds(node);if(r.width<2||r.height<2)return;items.push({key,node:node.cloneNode(true),rect:r,style:{...textStyle(node),filter:s.filter,opacity:s.opacity,background:s.background,borderRadius:s.borderRadius,padding:s.padding,objectFit:s.objectFit}});}
 add('title',el.querySelector('h1,h3'));
 add('logo',el.querySelector('.tool-logo img,.brand-logo,.detail-identity>img'));
 add('watermark',el.querySelector('.card-watermark img,.brand-watermark,.detail-watermark'));
 el.querySelectorAll('.tool-tags>span').forEach((tag,i)=>add(`tag-${i}`,tag));
 // Preserve each word's painted position across different paragraph wrapping.
 const paragraph=el.querySelector('p');
 if(paragraph){
  const walker=document.createTreeWalker(paragraph,NodeFilter.SHOW_TEXT);let node,index=0;
  while((node=walker.nextNode()))for(const match of node.textContent.matchAll(/\S+/g)){
   const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
   const r=range.getBoundingClientRect(),span=document.createElement('span');span.textContent=match[0];
   items.push({key:`word-${index++}`,node:span,rect:{left:r.left,top:r.top,width:r.width,height:r.height},style:{...textStyle(paragraph),lineHeight:`${r.height}px`}});
  }
 }
 const backgroundHost=el.matches('.tool-card-intro')?el.closest('.card-surface'):el;
 return {rect:bounds(el),background:getComputedStyle(backgroundHost).background,backgroundSize:`${bounds(backgroundHost).width}px ${bounds(backgroundHost).height}px`,items};
}
export function animateCover(start,end,target,{opening,onFinish}){
 const duration=opening?560:460,animations=[],nodes=[];
 document.documentElement.classList.add('cover-in-flight');
 const surface=document.createElement('div');surface.className='cover-transition';
 Object.assign(surface.style,{position:'fixed',zIndex:'20',pointerEvents:'none',background:start.background,backgroundSize:start.backgroundSize,backgroundRepeat:'no-repeat',overflow:'hidden'});
 surface.setAttribute('aria-hidden','true');surface.inert=true;document.body.append(surface);nodes.push(surface);
 const animate=(node,frames,options={})=>{const a=node.animate(frames,{duration,easing,fill:'both',...options});animations.push(a);return a;};
 const cover=animate(surface,[{...geometry(start.rect),borderRadius:opening?'24px 24px 0 0':'0px',backgroundSize:start.backgroundSize},{...geometry(end.rect),borderRadius:opening?'0px':'24px 24px 0 0',backgroundSize:end.backgroundSize}]);
 // Crossfade the two authentic backgrounds without replacing the cover at the end.
 const finishBackground=document.createElement('div');Object.assign(finishBackground.style,{position:'absolute',inset:'0',background:end.background,backgroundSize:end.backgroundSize});surface.append(finishBackground);animate(finishBackground,[{opacity:0},{opacity:1}]);
 for(const item of start.items){
  const dest=end.items.find(i=>i.key===item.key);if(!dest)continue;
  const piece=item.node;piece.removeAttribute('id');piece.removeAttribute('class');piece.setAttribute('aria-hidden','true');piece.inert=true;
  Object.assign(piece.style,{...item.style,position:'fixed',zIndex:item.key==='watermark'?'20':'21',margin:'0',boxSizing:'border-box',pointerEvents:'none',whiteSpace:'nowrap',transform:'none',minHeight:'0',maxWidth:'none',display:'block'});
  if(item.key==='watermark'){
   // Keep the artwork inside the changing cover, including its rounded corners.
   piece.style.position='absolute';piece.style.zIndex='0';surface.append(piece);
   const local=(r,parent)=>({...r,left:r.left-parent.left,top:r.top-parent.top});
   animate(piece,[{...geometry(local(item.rect,start.rect)),opacity:item.style.opacity},{...geometry(local(dest.rect,end.rect)),opacity:dest.style.opacity}]);
  }else{
   document.body.append(piece);nodes.push(piece);
   animate(piece,[{...geometry(item.rect),...item.style},{...geometry(dest.rect),...dest.style}]);
  }
 }
 target.style.visibility='hidden';
 let done=false;
 const dispose=()=>{if(done)return;done=true;document.documentElement.classList.remove('cover-in-flight');target.style.visibility='';animations.forEach(a=>a.cancel());nodes.forEach(n=>n.remove());};
 cover.finished.then(()=>{dispose();onFinish();}).catch(()=>{});
 return dispose;
}

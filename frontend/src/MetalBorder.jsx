import {memo,useEffect,useRef} from 'react';
import {metalEase,metalGeometry,metalIntensity,metalPlaybackRate,metalEntryEnergy} from './metalGeometry.mjs';

export const MetalBorder=memo(function MetalBorder(){
 const root=useRef(null),canvas=useRef(null),media=useRef(null);
 useEffect(()=>{
  const host=root.current,form=host.parentElement,video=media.current,output=canvas.current;
  const ctx=output.getContext('2d'),mask=document.createElement('canvas'),mc=mask.getContext('2d'),reveal=document.createElement('canvas'),rc=reveal.getContext('2d'),glow=document.createElement('canvas'),gc=glow.getContext('2d');
  if(!ctx||!mc||!rc||!gc)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let focused=false,visible=true,failed=false,mp4=false,active=false,running=false;
  let timer=0,raf=0,vfc=0,last=0,elapsed=0,progress=0,entry=0,w=1,h=1,dpr=1,geometry,paths=[],maskProgress=-1,disposed=false;
  const pad=18;
  function buildMask(){
   if(progress===maskProgress)return;
   maskProgress=progress;
   rc.clearRect(0,0,mask.width,mask.height);rc.save();rc.scale(dpr,dpr);rc.translate(pad,pad);
   rc.lineWidth=2;rc.strokeStyle='#fff';rc.lineCap='butt';
   // Average overlapping prefixes to feather the last 24 CSS pixels.
   // Additive coverage keeps the two routes seamless at their shared endpoints.
   rc.globalCompositeOperation='lighter';rc.globalAlpha=1/12;
   for(let i=0;i<12;i++){
    const length=Math.max(0,Math.min(geometry.length,progress*(geometry.length+24)-(i+.5)*2));
    if(!length)continue;
    rc.setLineDash([geometry.length,geometry.length]);rc.lineDashOffset=geometry.length-length;
    paths.forEach(path=>rc.stroke(path));
   }
   rc.restore();
   mc.clearRect(0,0,mask.width,mask.height);mc.drawImage(reveal,0,0);
   // Expand the light source before blurring; a 2px source alone vanishes
   // against the hero. Remove the whole interior, not just the thin stroke.
   gc.clearRect(0,0,glow.width,glow.height);gc.save();
   gc.shadowColor='rgba(255,255,255,.7)';gc.shadowBlur=10*dpr;gc.globalAlpha=.65;
   for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])gc.drawImage(reveal,dx*dpr,dy*dpr);
   gc.shadowBlur=0;gc.globalAlpha=1;gc.globalCompositeOperation='destination-out';
   gc.scale(dpr,dpr);gc.beginPath();gc.roundRect(pad,pad,w,h,12);gc.fill();gc.restore();
  }
  function draw(){
   if(!geometry)return;
   ctx.clearRect(0,0,output.width,output.height);
   if(!failed&&!motion.matches&&video.readyState<2)return;
   buildMask();
   const energy=(failed||motion.matches)?0:metalEntryEnergy(elapsed);
   const intensity=metalIntensity(elapsed)*(1+.35*energy);
   ctx.globalCompositeOperation='source-over';
   if(!failed&&!motion.matches){ctx.globalAlpha=Math.min(1,intensity*(.88+.12*(1-Math.min(elapsed/4000,1))**3+.18*energy));ctx.drawImage(glow,0,0);}
   ctx.globalAlpha=(failed||motion.matches)?.45:intensity;ctx.drawImage(mask,0,0);ctx.globalAlpha=1;
   ctx.globalCompositeOperation='source-in';
   if(!failed&&!motion.matches&&video.readyState>=2){
    // Disturb the material inside the fixed mask, never the input or its outline.
    const inset=.035*energy,vw=video.videoWidth,vh=video.videoHeight;
    const x=inset*(.5+.5*Math.sin(elapsed/260)),y=inset*(.5+.5*Math.sin(elapsed/370+.8));
    ctx.filter=energy>.001?`saturate(${1+.8*energy}) brightness(${1+.28*energy})`:'none';
    ctx.drawImage(video,x*vw,y*vh,vw*(1-inset),vh*(1-inset),0,0,output.width,output.height);
    ctx.filter='none';
   }
   else {ctx.fillStyle='#ddd';ctx.fillRect(0,0,output.width,output.height);}
   ctx.globalCompositeOperation='source-over';
  }
  function stop(){clearTimeout(timer);cancelAnimationFrame(raf);raf=0;if(vfc&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(vfc);vfc=0;video.pause();last=0;}
  function videoFrame(){   vfc=0;if(!running||disposed)return;draw();vfc=video.requestVideoFrameCallback(videoFrame);}
  function tick(now){
   if(!running)return;
   if(video.readyState<2){last=0;raf=requestAnimationFrame(tick);return;}
   if(last)elapsed+=now-last;last=now;
   video.playbackRate=metalPlaybackRate(elapsed);
   progress=metalEase(Math.min(elapsed/1800,1));host.dataset.progress=progress.toFixed(4);
   host.dataset.phase=elapsed<1800?'entering':elapsed<4000?'settling':'reflecting';draw();
   if(elapsed<4000)raf=requestAnimationFrame(tick);
   else if(video.requestVideoFrameCallback){raf=0;vfc=video.requestVideoFrameCallback(videoFrame);}
   else timer=window.setTimeout(()=>{raf=requestAnimationFrame(tick);},33);
  }
  function fallback(){if(disposed)return;failed=true;sync();}
  function sync(){
   stop();active=focused&&!form.classList.contains('invalid');host.dataset.active=String(active);
   running=active&&visible&&!document.hidden&&!motion.matches&&!failed;host.dataset.running=String(running);
   if(visible&&!document.hidden&&!motion.matches&&!failed&&!video.getAttribute('src')){
    video.src=video.canPlayType('video/webm')?'/assets/hero/liquid-metal.webm':'/assets/hero/liquid-metal.mp4';
    video.load();
   }
   if((motion.matches||failed)&&active){progress=1;host.dataset.phase='static';draw();}
   else if(running){
    if(!video.getAttribute('src'))video.src=video.canPlayType('video/webm')?'/assets/hero/liquid-metal.webm':'/assets/hero/liquid-metal.mp4';
    const promise=video.play();promise?.catch(error=>{if(error.name!=='AbortError'&&running)fallback();});
    tick(performance.now());
   }
  }
  function enter(){if(!focused){focused=true;elapsed=0;progress=0;maskProgress=-1;host.dataset.entry=String(++entry);draw();}sync();}
  function leave(e){if(!form.contains(e.relatedTarget)){focused=false;sync();}}
  function mediaError(){if(!mp4){mp4=true;video.src='/assets/hero/liquid-metal.mp4';sync();}else fallback();}
  const resize=new ResizeObserver(()=>{
   const rect=form.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(devicePixelRatio||1,1.5);
   output.width=mask.width=reveal.width=glow.width=Math.ceil((w+pad*2)*dpr);output.height=mask.height=reveal.height=glow.height=Math.ceil((h+pad*2)*dpr);
   output.style.left=output.style.top=-pad+'px';output.style.width=(w+pad*2)+'px';output.style.height=(h+pad*2)+'px';
   geometry=metalGeometry(w,h);paths=[new Path2D(geometry.upper),new Path2D(geometry.lower)];maskProgress=-1;draw();
  });
  const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});
  const invalid=new MutationObserver(sync);
  resize.observe(form);intersection.observe(form);invalid.observe(form,{attributes:true,attributeFilter:['class']});
  form.addEventListener('focusin',enter);form.addEventListener('focusout',leave);video.addEventListener('error',mediaError);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  if(form.contains(document.activeElement))enter();else sync();
  return()=>{disposed=true;running=false;stop();resize.disconnect();intersection.disconnect();invalid.disconnect();form.removeEventListener('focusin',enter);form.removeEventListener('focusout',leave);video.removeEventListener('error',mediaError);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);video.removeAttribute('src');video.load();};
 },[]);
 return <div ref={root} className="metal-border" aria-hidden="true"><canvas ref={canvas}/><video ref={media} muted loop playsInline preload="auto" tabIndex={-1}/></div>;
});

// Solve both coordinates of CSS cubic-bezier(.65,0,.35,1).
export function metalEase(t){
 if(t<=0)return 0;if(t>=1)return 1;
 let lo=0,hi=1,s=0;
 for(let i=0;i<24;i++){s=(lo+hi)/2;const x=3*(1-s)**2*s*.65+3*(1-s)*s*s*.35+s**3;if(x<t)lo=s;else hi=s;}
 return 3*(1-s)*s*s+s**3;
}
export function metalGeometry(w,h){
 const r=Math.min(11,(w-2)/2,(h-2)/2),c=1+r,q=r/Math.sqrt(2),sx=c-q,sy=c-q,ex=w-c+q,ey=h-c+q;
 const upper=`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${c} 1 H ${w-c} A ${r} ${r} 0 0 1 ${w-1} ${c} V ${h-c} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
 const lower=`M ${sx} ${sy} A ${r} ${r} 0 0 0 1 ${c} V ${h-c} A ${r} ${r} 0 0 0 ${c} ${h-1} H ${w-c} A ${r} ${r} 0 0 0 ${ex} ${ey}`;
 return {upper,lower,length:w+h-4-4*r+Math.PI*r};
}

// CSS ease-in-out: solve its x coordinate before evaluating luminance.
export function metalIntensity(elapsed){
 const t=Math.max(0,Math.min(elapsed/2200,1));
 let lo=0,hi=1,s=t;
 for(let i=0;i<24;i++){s=(lo+hi)/2;const x=3*(1-s)**2*s*.42+3*(1-s)*s*s*.58+s**3;if(x<t)lo=s;else hi=s;}
 return .18+.47*(3*(1-s)*s*s+s**3);
}

// Initial energy dissipates once per focus entry; typing never recharges it.
export function metalPlaybackRate(elapsed){
 const t=Math.max(0,Math.min(elapsed/4000,1));
 return 1.05+4.2*(1-t)**3;
}

// Gentle attack, then a one-off decay; no flash on the first frame.
export function metalEntryEnergy(elapsed){
 const t=Math.max(0,Math.min(elapsed/4000,1));
 return Math.sin(Math.min(Math.max(elapsed,0)/900,1)*Math.PI/2)*(1-t)**2;
}

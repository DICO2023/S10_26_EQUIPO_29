# Run from the repository root with a local copy of the supplied reference video. Requires numpy and ffmpeg.
import subprocess,sys,numpy as np
raw=subprocess.check_output(['ffmpeg','-v','error','-i',sys.argv[1],'-vf','fps=30,crop=260:260:230:230','-f','rawvideo','-pix_fmt','rgb24','-'])
frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,260,260,3)
w,h=768,288
y,x=np.mgrid[-1:1:complex(h),-1:1:complex(w)]
a=np.arctan2(y,x)+.10*np.sin(x*2+y)
r=121+2*np.sin(x*2-y*2)
sx=np.clip(np.rint(130+np.cos(a)*r).astype(int),0,259);sy=np.clip(np.rint(130+np.sin(a)*r).astype(int),0,259)
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r','30','-i','-','-an','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart','landing/public/assets/hero/liquid-metal.mp4'],stdin=subprocess.PIPE)
for i in range(1440):
 t=(1-np.cos(2*np.pi*i/1440))/2*(len(frames)-1);j=int(t);k=min(j+1,len(frames)-1)
 f=frames[j,sy,sx].astype(float)*(1-(t-j))+frames[k,sy,sx]*(t-j)
 luminance=f@np.array([.2126,.7152,.0722])
 f=(luminance[...,None]+.80*(f-luminance[...,None]))*.90+10
 # Burn only existing warm reflections; keep chrome and blue regions intact.
 warmth=np.clip((f[...,0]-f[...,2]-12)/80,0,1)[...,None]
 copper=np.stack([f[...,0]*1.12+8,f[...,1]*.78,f[...,2]*.60],axis=-1)
 f=f*(1-warmth*.65)+copper*(warmth*.65)
 p.stdin.write(np.uint8(np.clip(f,0,255)).tobytes())
p.stdin.close();assert p.wait()==0
subprocess.run(['ffmpeg','-v','error','-y','-i','landing/public/assets/hero/liquid-metal.mp4','-an','-c:v','libvpx-vp9','-cpu-used','4','-crf','32','-b:v','0','landing/public/assets/hero/liquid-metal.webm'],check=True)
print('Rendered seamless 48s material, 768x288, 30fps')

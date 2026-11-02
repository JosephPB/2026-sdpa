"""Exact array diagrams used before Matplotlib is introduced in the lecture."""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parent
assets=ROOT/'assets'
RGB=np.array(Image.open(assets/'duck.png').convert('RGB'))
duck=np.array([[0,0,0,0,0,1,1,1,0,0],[0,0,0,0,1,1,0,1,1,1],[0,0,0,0,1,1,1,1,0,0],[1,0,0,1,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,0,0,0,0]])
def save(name,w,h,content):
 (assets/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img"><rect width="100%" height="100%" fill="white"/>{content}</svg>')
def text(x,y,s,size=26):return f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" fill="#242424">{s}</text>'
def grid(array,ox,oy,sx=35,sy=35,nums=False):
 out=''
 for r,row in enumerate(array):
  for c,v in enumerate(row):
   x,y=ox+c*sx,oy+r*sy
   out+=f'<rect x="{x}" y="{y}" width="{sx}" height="{sy}" fill="{"#222" if v else "#fff"}" stroke="#bbb" stroke-width="1"/>'
   if nums:out+=f'<text x="{x+sx/2}" y="{y+sy*.7}" text-anchor="middle" font-family="Menlo,monospace" font-size="20" fill="{"white" if v else "#888"}">{v}</text>'
 return out
save('duck-binary.svg',440,340,grid(duck,25,25,39,39))
save('duck-slices.svg',1200,305,grid(duck[:3,4:10],70,50,43,43)+grid(duck[:,::-1],650,5,40,40))
# A channel is a two-dimensional plane; the three planes form the channel axis.
def channel_planes(array,ox=0,oy=0,scale=1):
 out=''
 for ch,name in enumerate(['Red','Green','Blue']):
  tx=ox+ch*425*scale;ty=oy+(155-ch*42)*scale
  out+=text(tx+40*scale,ty-24*scale,f'{name} (channel {ch})',25*scale)
  for r in range(7):
   for c in range(10):
    x=tx+(c*30+r*9)*scale;y=ty+r*30*scale
    colour=[0,0,0];value=int(array[r,c,ch])
    # Each plane displays the intensity of its own colour component.
    colour[ch]=value
    out+=f'<polygon points="{x},{y} {x+30*scale},{y} {x+39*scale},{y+30*scale} {x+9*scale},{y+30*scale}" fill="rgb({colour[0]},{colour[1]},{colour[2]})" stroke="#aaa" stroke-width=".8"/>'
 return out
save('rgb-channels.svg',1320,410,channel_planes(RGB,10,0))
# Composite front faces remain visibly volumes, with three channel layers.
def volume(array,ox,oy,s=1):
 out=''
 for ch in [2,1,0]:
  shift=ch*15*s
  out+=f'<polygon points="{ox+shift},{oy-shift} {ox+350*s+shift},{oy-shift} {ox+420*s+shift},{oy+245*s-shift} {ox+70*s+shift},{oy+245*s-shift}" fill="{["#fff","#e5f2e5","#e9edf8"][ch]}" stroke="#777" stroke-width="2"/>'
 for r in range(7):
  for c in range(10):
   x=ox+(c*35+r*10)*s;y=oy+r*35*s
   colour=','.join(str(int(v)) for v in array[r,c])
   out+=f'<polygon points="{x},{y} {x+35*s},{y} {x+45*s},{y+35*s} {x+10*s},{y+35*s}" fill="rgb({colour})" stroke="#ccc" stroke-width=".7"/>'
 out+=text(ox+315*s,oy+283*s,'3 channels',22*s)
 return out
save('video-frames.svg',1250,380,text(70,35,'Frame 0')+text(710,35,'Frame 1')+volume(RGB,65,90)+volume(RGB[:,::-1],705,90))
tinted=(RGB*np.array([.5,1,1])).astype(np.uint8)
save('rgb-tint.svg',1250,370,text(65,35,'Original')+text(705,35,'Half the red channel')+volume(RGB,65,85,.95)+volume(tinted,705,85,.95))
# Coordinate transformation: every pixel rectangle doubles its x coordinate.
content=grid(duck,30,25,24,24)+text(30,225,'(x, y)',28)
content+=text(340,120,'→',52)
content+=grid(duck,440,25,48,24)+text(440,225,'(2x, y)',28)
save('duck-transform.svg',1000,250,content)
print('Saved six exact array diagrams')

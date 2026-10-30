#!/usr/bin/env python3
"""Prepara las fotos de una sesión para la web de Pelos y Señales.
Uso: python3 scripts/preparar-fotos.py foto.jpg nombre-del-perro [--main]
Genera en ./web/: <id>.jpg (1200 px lado mayor, calidad 86, sin metadatos) y <id>-sq.jpg (1000×1000, recorte centrado
en el tercio superior, para tarjetas). Con --main, también <id>-hero.jpg (1600×900). Comprueba que el fondo sea de la marca.
"""
import sys, os
from PIL import Image, ImageOps
BRAND={'mostaza':(242,169,59),'coral':(232,115,74),'lima':(201,207,88),'crema':(244,236,220)}
def near(c): 
    d={k:sum((a-b)**2 for a,b in zip(c,v))**.5 for k,v in BRAND.items()}; k=min(d,key=d.get); return k,d[k]
src,name=sys.argv[1],sys.argv[2]; main='--main' in sys.argv
os.makedirs('web',exist_ok=True)
im=ImageOps.exif_transpose(Image.open(src)).convert('RGB')
W,H=im.size; k,dist=near(im.getpixel((8,8)))
print(f'{name}: {W}×{H} · fondo {k} (distancia {dist:.0f}; <60 es correcto)')
a=im.copy(); a.thumbnail((1200,1200),Image.LANCZOS); a.save(f'web/{name}.jpg',quality=86,optimize=True)
s=min(W,H); left=(W-s)//2; top=max(0,int((H-s)*0.25)); sq=im.crop((left,top,left+s,top+s)).resize((1000,1000),Image.LANCZOS); sq.save(f'web/{name}-sq.jpg',quality=86,optimize=True)
if main:
    r=16/9; 
    if W/H>r: nw=int(H*r); hero=im.crop(((W-nw)//2,0,(W-nw)//2+nw,H))
    else: nh=int(W/r); top=max(0,int((H-nh)*0.3)); hero=im.crop((0,top,W,top+nh))
    hero.resize((1600,900),Image.LANCZOS).save(f'web/{name}-hero.jpg',quality=86,optimize=True)
print('→ web/'+name+'*.jpg')
